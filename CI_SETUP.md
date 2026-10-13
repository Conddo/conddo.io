# Conddo CI/CD Setup Guide

*Working checklist — tick boxes as you complete steps. Everything in code
is already in place (see "Already shipped" below); the rest of this doc
is the GitHub-UI clicks that aren't representable in code.*

---

## Branch flow

```
feature/<short-name>  ─┐
                      ├─►  dev  ─►  staging  ─►  production
feature/<short-name>  ─┘
```

| Branch | Purpose | Deploys to | Trigger |
|---|---|---|---|
| `feature/<name>` | WIP — every dev cuts these off `dev` | nothing (CI quality gate only) | every push |
| `dev` | Integration of merged features | Dev environment | merge to `dev` |
| `staging` | Pre-release rehearsal — mirrors prod config | Staging environment | merge to `staging` |
| `production` | Live | Production environment | merge to `production`, gated by PR review |

This applies identically to `conddo-app` and `conddo-backend`. The two
repos ship in lock-step on a release — a `dev` → `staging` promotion on
one is meaningless without the other moving with it. (Once the FastAPI
services land per the architecture addendum, they slot into the same
flow.)

---

## Already shipped (in code)

| What | Where |
|---|---|
| FE quality gate (lint + typecheck + build) | `conddo-app/.github/workflows/ci.yml` |
| FE ESLint config | `conddo-app/.eslintrc.json` |
| BE quality gate (Maven verify) | `conddo-backend/.github/workflows/ci.yml` |

All workflows fire on every push to `main`/`dev`/`staging`/
`production` AND every PR. `concurrency` is set so a fresh push
cancels the in-flight run for the same branch — keeps the
2,000-min/month GitHub Actions free tier honest.

---

## Manual setup checklist — per repo

Do this once per repo (`conddo-app`, `conddo-backend`). Click through
every box.

### 1. Create the long-lived branches

From your local checkout:

```bash
# (current shipping is on main — bootstrap the rest from it)
git checkout main && git pull
git checkout -b dev && git push -u origin dev
git checkout -b staging && git push -u origin staging
git checkout -b production && git push -u origin production
git checkout main
```

You now have four long-lived branches per repo. `main` stays as the
historical line but new work should target `dev`.

- [ ] `conddo-app` — dev / staging / production pushed
- [ ] `conddo-backend` — dev / staging / production pushed

### 2. Branch protection rules

GitHub → repo → **Settings → Branches → Add rule** for EACH of
`dev`, `staging`, `production`:

| Setting | dev | staging | production |
|---|---|---|---|
| Require a pull request before merging | ✓ | ✓ | ✓ |
| Require approvals | 0 (or 1) | 1 | **1** |
| Require status checks: `Lint · Typecheck · Build` (FE) / `Build · RLS tests` (BE) | ✓ | ✓ | ✓ |
| Require branches to be up to date | optional | ✓ | ✓ |
| Restrict who can push | — | — | restrict to release owner |
| Do NOT allow force pushes | ✓ | ✓ | ✓ |
| Do NOT allow deletions | ✓ | ✓ | ✓ |

Production should additionally require a separate approver from the
PR author. Self-approval on production is how a Friday-evening tired
push becomes a Saturday-morning outage.

- [ ] `conddo-app` — three protection rules applied
- [ ] `conddo-backend` — three protection rules applied

### 3. GitHub Actions variables + secrets

Variables are non-sensitive (visible to all collaborators). Secrets
are sensitive (masked in logs).

GitHub → repo → **Settings → Secrets and variables → Actions**.

**Repository variables (visible to all environments):**

| Name | Purpose | Default if unset |
|---|---|---|
| `NEXT_PUBLIC_APP_DOMAIN` | Tenant subdomain root, e.g. `conddo.io` or `getconddo.com` | `conddo.io` |
| `NEXT_PUBLIC_EMAIL_DOMAIN` | Outgoing email domain | falls back to `NEXT_PUBLIC_APP_DOMAIN` |

**Environment-specific variables (different per environment):**

Create three environments — `dev`, `staging`, `production` —
under **Settings → Environments**. For each, set the variables
that should differ per environment. Typically:

| Name | Set per environment | Example values |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | dev: `https://api-dev.conddo.io` · staging: `https://api-staging.conddo.io` · prod: `https://api.conddo.io` |
| `NEXT_PUBLIC_PAYMENTS_API_URL` | yes | as above for the payments backend |
| `CONDDO_DB_URL` | yes (BE only — **secret**) | one DB per environment, never share |

Environments also let you require manual approval before a deploy
runs — turn this on for `production`.

- [ ] `conddo-app` — variables + environments configured
- [ ] `conddo-backend` — variables + environments configured

### 4. Deploy workflows (not yet shipped)

The current CI workflows verify quality but don't deploy. The deploy
side depends on what runs where:

| Repo | Current deploy target | Future |
|---|---|---|
| `conddo-app` | Vercel (auto on `main` push) | Vercel |
| `conddo-backend` | Render (auto on `main` push) | Railway |

Concrete deploy workflows go in `.github/workflows/deploy.yml` per
repo once the Railway migration lands. Until then:

- Disconnect Vercel/Render auto-deploy from `main`
- Reconnect each environment to its corresponding long-lived branch
  (`dev` → dev deploy, `staging` → staging deploy, `production` →
  prod deploy)
- The branch-level webhook is set up in the Vercel/Render UI, not
  in this repo

Manual UI clicks:
- [ ] Vercel — point conddo-app project to `dev` for the
      Preview env, `staging` for Staging, `production` for Production
- [ ] Render — point each service to its matching branch
- [ ] Note in this doc which environment URLs map to which branch
      once configured

---

## Releasing a change

Once the above is set up, the flow for any change is:

```
1.  git checkout dev && git pull
2.  git checkout -b feature/payments-refund-flow
3.  ...do work, commit, push to feature/...
4.  Open PR: feature/* → dev      [CI runs, no deploy]
5.  Merge → dev                    [Dev env redeploys]
6.  Verify in Dev. Open PR: dev → staging
7.  Merge → staging                [Staging env redeploys]
8.  Smoke test. Open PR: staging → production  [needs approval]
9.  Merge → production             [Prod redeploys]
```

Hotfixes for production cut directly off `production`, get cherry-
picked back into `staging` and `dev` once merged.

---

## Quick checks (run anytime)

```bash
# Did anyone commit a secret? Rough check, run before pushing.
git log --all -p | grep -Ei "api_key|secret|password" | head

# Are dev / staging / production in sync? Anything in prod that
# isn't in dev means a hotfix was applied but never propagated.
git fetch --all
git log --oneline production ^dev   # should be empty in steady state
```

---

## Free-tier budget reminder

Infra Doc §7 caps:
- **GitHub Actions**: 2,000 free min/month (Free plan), more on Pro.
  The `concurrency` directive in every workflow file cancels stale
  in-flight runs to keep minute consumption honest. Two repos
  running ~5-min CI on every push + every PR is comfortably inside
  this budget unless you're pushing several hundred commits a week.

If a CI run starts blowing through minutes, the usual culprits are:
- Tests that hang (timeout-minutes on every job catches this)
- Missing cache (`cache: npm`/`cache: maven` are essential)
- A workflow accidentally running on every branch + every PR with no
  `concurrency` gate

All three are mitigated in the shipped workflows; ratchet the
timeout-minutes down if a run consistently finishes faster.
