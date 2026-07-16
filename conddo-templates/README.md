# conddo-templates

The Conddo website template catalogue.

Lives alongside `conddo-app` while the section count is small; can be extracted
to its own npm package later without touching import paths because callers go
through the `SECTION_MAP` in `components/website/WebsiteRenderer.tsx`, not
individual imports.

## Structure

- `types/` — Shared TypeScript types (`TenantBrand`, `SectionProps`, `SectionManifest`, `VerticalPreset`).
- `sections/` — Individual section components grouped by category (`hero/`, `products/`, `contact/`, …).
- `presets/` — Per-vertical default configurations (which sections, in what order).
- `themes/` — Named colour + font token bundles (`bold-modern`, `warm-earth`, `clean-minimal`).

## Rules

1. **AI selects from this catalogue. AI never adds to it.** New sections land via PR.
2. Every section folder MUST contain `component.tsx` and `manifest.json`. `preview.png` is nice-to-have and can land in a follow-up.
3. Every component receives `variables` and `brand` as props only. **No hardcoded colours. No hardcoded logo URLs.** The lint rule to enforce this is on the follow-up list.
4. Manifests drive discovery. If it's not in the manifest, it doesn't exist to the AI.

## Adding a new section

1. Create `sections/{category}/{section-id}/`.
2. Write `component.tsx` using `SectionProps` from `types/index.ts`.
3. Write `manifest.json` following the `SectionManifest` schema.
4. Register the component in the `SECTION_MAP` inside
   `components/website/WebsiteRenderer.tsx`.
5. Optional: add `preview.png` (800×600 screenshot).
6. Open a PR.
