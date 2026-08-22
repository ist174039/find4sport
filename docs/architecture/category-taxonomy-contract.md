# Category taxonomy contract

## Canonical contract

All user-facing taxonomy consumers must use the same category projection:

- `id`
- `name`
- `slug`
- `parent_id`
- `icon_key`

Do not use the legacy `emoji` field for category UI.
Do not use `select('*')` followed by `unknown`/`Record<string, unknown>` to construct taxonomy options.

## Hierarchy

`parent_id` is recursive. UI components and search must support arbitrary depth, not only root + one child level.

Selecting a category in public search includes its descendants.

## UI

Category presentation uses `CategoryIcon` and `icon_key`. The taxonomy selector must preserve hierarchy, provide search context, and remain usable on mobile.

## Gate acceptance criteria

1. Supabase runtime contract exposes `categories.icon_key`.
2. `TaxonomyOption` exposes `icon_key` and does not depend on `emoji`.
3. Search, professional registration, space registration, event create/edit, and community create/manage use the canonical projection.
4. No category producer hides schema drift through `unknown`/`Record<string, unknown>` casts.
5. Public category presentation contains no hard-coded category emoji fallbacks.
6. Taxonomy selector supports recursive hierarchy.
7. Search category selection includes descendants.
8. Type-check/build is green before this gate is closed.

## Follow-up gate

Communities currently persist taxonomy through textual `sport_category`. Migrate this separately to a category foreign key with a data-preserving migration; do not combine that database migration with the build-recovery gate.
