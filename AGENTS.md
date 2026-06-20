# ProdOps Project Instructions

## Scope
These rules apply to the entire repository.

## Project goal
- Keep the project compatible with legacy company servers:
  - PHP 5.4
  - MySQL 5.1
- Keep the code easy to inspect, deploy, and migrate between environments.
- Prefer small, targeted changes over broad rewrites.

## Environments
- Local dev: `http://localhost:5500`
- Local PHP server: `php -S localhost:5500 router.php`

## Source of truth
- Root source files in `public/`, `backend/`, `data/`, `index.php`, `router.php`.
- `data/db.json` is the local seed/fallback dataset (used when MySQL is not available).
- `data/mysql_schema_51.sql` is the MySQL schema reference.
- All requested code changes must be applied in the Git-backed repository working tree.
- Keep the repository state updated after every meaningful change.

## Coding rules
- Keep backend code compatible with PHP 5.4.
- Avoid PHP 7+ syntax and features.
- Avoid external runtime dependencies unless already present.
- Keep frontend changes minimal and deterministic.
- Do not remove features unless the user explicitly asks.
- If you move or rename UI blocks, verify you did not hide any existing admin/dashboard functionality.
- When entities can share the same display name, key lookups by stable IDs instead of names.
- Keep search, ticket rendering, and modal opening logic aligned with ticket/incident IDs to avoid collisions.

## Login and auth
- Login must redirect reliably to the correct page after submit.
- Do not assume JSON parsing is safe on all hosts; preserve BOM-safe parsing where needed.
- Auth logic lives in `backend/auth.php` and is included by `backend/index.php`.

## Admin page
- The admin page must keep these sections visible and functional:
  - category/incident management
  - user management
  - chart preview and color editing
- If you change admin layout, verify the page still renders all sections and actions.
- Keep color editing, chart previews, and theme toggles together in a single, easy-to-find area.
- Do not delete admin sections unless the user explicitly asks.

## Dashboard
- Preserve the current shift ticket list and charts.
- Any chart-related change must keep dashboard and admin color mappings aligned.
- When changing tickets or incidents, keep the current-shift list auto-refresh behavior intact.
- The dashboard must continue to show ticket timestamps, categories, FABs, and edit actions correctly.

## Testing
- Always verify changes in the browser when UI or login behavior changes.
- Check the relevant API endpoints after backend changes.
- Before saying something is fixed, actually test it in the browser or through the relevant API.
- When a page looks empty, verify whether the issue is cache, JS loading, auth, or backend data before changing layout.
- Always run the relevant check after a change before reporting success.
- For UI changes, inspect the page in the browser.
- For backend changes, hit the relevant endpoint or DB check.

## Git
- Keep commits focused and descriptive.
- Do not rewrite unrelated history.
- Avoid committing temporary files or local-only experiments.
- After meaningful changes, update the app version badge consistently across pages.
- Version bumps should roughly match change size:
  - patch for small fixes
  - minor for medium feature additions
  - major only for large, breaking changes
