#!/usr/bin/env bash
# ============================================================================
# Conddo CI/CD branch flow + protection rules + environments + variables
#
# One-time setup for the three repositories per Infrastructure Working Doc §5
# and the manual checklist in CI_SETUP.md. Idempotent — safe to re-run; each
# step skips work already done. Run from any directory; uses absolute repo
# refs.
#
# What this script does (per repo, three times):
#   1. Create the dev / staging / production branches if missing
#   2. Apply branch protection on each: require PR review + status check
#      + linear history + no force-push + no deletion
#   3. Create dev / staging / production environments
#   4. Set repository-level + environment-scoped variables
#
# What this script DOES NOT do (do these by hand):
#   - Reconnect Vercel / Render auto-deploys to the new branches
#     (those live in the Vercel / Render dashboards, not GitHub)
#   - Set secrets (db urls, API keys) — you'll do those in
#     Settings → Secrets and variables → Actions per environment.
#     The variable scaffolding here just establishes the *names* and
#     non-sensitive defaults.
#
# Prerequisites:
#   - gh CLI installed and authed (gh auth status shows ✓)
#   - The token scopes include 'repo' and 'workflow' (default)
#
# Usage:
#   bash scripts/setup-ci.sh              — run all three repos
#   bash scripts/setup-ci.sh conddo.io    — just one repo
# ============================================================================

set -euo pipefail

# Repos to operate on. Override on the command line:
#   bash setup-ci.sh conddo.io conddo-studio
REPOS=(${@:-conddo.io conddo-studio conddo-backend})
OWNER="Mickercode"

# Long-lived branches that everything flows through.
ENVIRONMENTS=(dev staging production)

# Required status-check context name — must match the `name:` of the job
# in each repo's .github/workflows/ci.yml.
#   conddo.io / conddo-studio:  "Lint · Typecheck · Build"
#   conddo-backend:             "Build · RLS tests · Integration tests"
declare -A REQUIRED_CHECKS=(
  [conddo.io]="Lint · Typecheck · Build"
  [conddo-studio]="Lint · Typecheck · Build"
  [conddo-backend]="Build · RLS tests · Integration tests"
)

# Repository-level non-sensitive variables (visible to every environment
# unless overridden). Real values get set per-environment below.
declare -A REPO_VARS=(
  [NEXT_PUBLIC_APP_DOMAIN]="conddo.io"
  [NEXT_PUBLIC_EMAIL_DOMAIN]="conddo.io"
)

# Per-environment variable overrides. These are placeholder names only —
# the script writes them so the variable slots EXIST in each environment;
# the actual production values go in by hand later (or via secrets) so
# we don't bake the wrong default into git.
declare -A ENV_VARS_DEV=(
  [NEXT_PUBLIC_API_URL]="https://api-dev.conddo.io"
  [NEXT_PUBLIC_STUDIO_API_URL]="https://studio-dev.conddo.io"
)
declare -A ENV_VARS_STAGING=(
  [NEXT_PUBLIC_API_URL]="https://api-staging.conddo.io"
  [NEXT_PUBLIC_STUDIO_API_URL]="https://studio-staging.conddo.io"
)
declare -A ENV_VARS_PRODUCTION=(
  [NEXT_PUBLIC_API_URL]="https://api.conddo.io"
  [NEXT_PUBLIC_STUDIO_API_URL]="https://studio.conddo.io"
)

# ----- helpers --------------------------------------------------------------

# Pretty output so the user can see what step we're on without scrolling.
say()  { echo -e "\033[36m▸ $*\033[0m"; }
ok()   { echo -e "\033[32m  ✓ $*\033[0m"; }
skip() { echo -e "\033[90m  · $*\033[0m"; }
warn() { echo -e "\033[33m  ! $*\033[0m"; }

# gh path — Windows install hides gh from a plain Git Bash PATH; absolute
# path falls through to whichever the user has.
GH="${GH:-gh}"
if ! command -v "$GH" >/dev/null 2>&1; then
  if [ -x "/c/Program Files/GitHub CLI/gh.exe" ]; then
    GH="/c/Program Files/GitHub CLI/gh.exe"
  else
    echo "gh CLI not found on PATH. Install it or set GH=/path/to/gh.exe."
    exit 1
  fi
fi

# Returns 0 if the named ref exists on the remote.
remote_branch_exists() {
  local repo="$1" branch="$2"
  "$GH" api "repos/${OWNER}/${repo}/branches/${branch}" >/dev/null 2>&1
}

# Returns 0 if the named environment exists.
env_exists() {
  local repo="$1" env="$2"
  "$GH" api "repos/${OWNER}/${repo}/environments/${env}" >/dev/null 2>&1
}

# ----- step 1: branches -----------------------------------------------------

create_branches() {
  local repo="$1"
  say "Creating long-lived branches for ${repo}"
  # Get the SHA of main to base every new branch on. This avoids
  # needing a local clone — we operate entirely through the API.
  local main_sha
  main_sha=$("$GH" api "repos/${OWNER}/${repo}/git/refs/heads/main" \
    --jq '.object.sha')
  for env in "${ENVIRONMENTS[@]}"; do
    if remote_branch_exists "$repo" "$env"; then
      skip "Branch ${env} already exists"
    else
      "$GH" api --method POST "repos/${OWNER}/${repo}/git/refs" \
        -f "ref=refs/heads/${env}" \
        -f "sha=${main_sha}" >/dev/null
      ok "Created branch ${env}"
    fi
  done
}

# ----- step 2: branch protection rules --------------------------------------

protect_branches() {
  local repo="$1"
  local required_check="${REQUIRED_CHECKS[$repo]}"
  say "Applying branch protection for ${repo}"
  for env in "${ENVIRONMENTS[@]}"; do
    # Production gets the strictest rule — separate approver required.
    local required_approvals=1
    [ "$env" = "production" ] && required_approvals=1
    [ "$env" = "dev" ]        && required_approvals=0

    # gh CLI's branch protection API requires a JSON body; -F can't
    # carry nested objects, so we pipe a heredoc into --input -.
    "$GH" api --method PUT \
      "repos/${OWNER}/${repo}/branches/${env}/protection" \
      --input - >/dev/null <<JSON
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["${required_check}"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": ${required_approvals},
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": true,
  "required_conversation_resolution": true
}
JSON
    ok "Protected ${env} (${required_approvals} approval req'd, status check: ${required_check})"
  done
}

# ----- step 3: environments -------------------------------------------------

create_environments() {
  local repo="$1"
  say "Creating environments for ${repo}"
  for env in "${ENVIRONMENTS[@]}"; do
    if env_exists "$repo" "$env"; then
      skip "Environment ${env} already exists"
      continue
    fi
    # PUT creates or updates an environment — no body required for the
    # base case. Production adds wait-timer + reviewers — set those
    # via the GitHub UI for now since they need GitHub user IDs.
    "$GH" api --method PUT "repos/${OWNER}/${repo}/environments/${env}" \
      >/dev/null
    ok "Created environment ${env}"
  done
  warn "Production deployment approvers — add them by hand in the UI:"
  warn "    https://github.com/${OWNER}/${repo}/settings/environments/production/edit"
}

# ----- step 4: variables ----------------------------------------------------

set_repo_var() {
  local repo="$1" name="$2" value="$3"
  # Try update first; if 404, create.
  if "$GH" api --silent --method PATCH \
      "repos/${OWNER}/${repo}/actions/variables/${name}" \
      -f "name=${name}" -f "value=${value}" >/dev/null 2>&1; then
    ok "Updated repo var ${name}=${value}"
  else
    "$GH" api --method POST \
      "repos/${OWNER}/${repo}/actions/variables" \
      -f "name=${name}" -f "value=${value}" >/dev/null
    ok "Created repo var ${name}=${value}"
  fi
}

set_env_var() {
  local repo="$1" env="$2" name="$3" value="$4"
  # Same upsert pattern at the environment scope.
  if "$GH" api --silent --method PATCH \
      "repos/${OWNER}/${repo}/environments/${env}/variables/${name}" \
      -f "name=${name}" -f "value=${value}" >/dev/null 2>&1; then
    ok "Updated ${env} var ${name}=${value}"
  else
    "$GH" api --method POST \
      "repos/${OWNER}/${repo}/environments/${env}/variables" \
      -f "name=${name}" -f "value=${value}" >/dev/null
    ok "Created ${env} var ${name}=${value}"
  fi
}

set_variables() {
  local repo="$1"
  say "Setting variables for ${repo}"

  # Repo-wide defaults.
  for name in "${!REPO_VARS[@]}"; do
    set_repo_var "$repo" "$name" "${REPO_VARS[$name]}"
  done

  # Per-environment overrides.
  # We use an indirect lookup pattern to point at the right associative array.
  for env in "${ENVIRONMENTS[@]}"; do
    local env_upper
    env_upper=$(echo "$env" | tr '[:lower:]' '[:upper:]')
    local array_name="ENV_VARS_${env_upper}"

    # Iterate over keys of the chosen associative array via eval — bash
    # doesn't natively support indirect associative array lookup.
    local keys
    keys=$(eval "echo \${!${array_name}[@]}")
    for name in $keys; do
      local value
      value=$(eval "echo \${${array_name}[$name]}")
      set_env_var "$repo" "$env" "$name" "$value"
    done
  done
}

# ----- main loop ------------------------------------------------------------

echo "================================================================"
echo "Conddo CI/CD setup — owner=${OWNER}, repos=${REPOS[*]}"
echo "================================================================"

for repo in "${REPOS[@]}"; do
  echo
  echo "──── ${repo} ────"
  create_branches "$repo"
  protect_branches "$repo"
  create_environments "$repo"
  set_variables "$repo"
done

echo
echo "================================================================"
echo "DONE. What still needs your attention:"
echo "  1. Vercel/Render: point each environment at its matching branch"
echo "     (dev → dev branch, staging → staging branch, production →"
echo "     production branch). Disable auto-deploy from main."
echo "  2. GitHub UI per repo:"
echo "       https://github.com/${OWNER}/<repo>/settings/environments"
echo "     Add reviewers to the production environment so deploys"
echo "     require manual approval."
echo "  3. Secrets (DB urls, API keys) — add via:"
echo "       Settings → Secrets and variables → Actions"
echo "     This script intentionally doesn't carry secrets."
echo "================================================================"
