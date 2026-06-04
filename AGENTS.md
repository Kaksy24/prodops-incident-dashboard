# ProdOps Project Instructions

## Scope
These rules apply to the entire repository.

## Project goal
- Keep the project compatible with legacy company servers:
  - PHP 5.4
  - MySQL 5.1
- Keep the code easy to inspect, deploy, and migrate between environments.
- Prefer small, targeted changes over broad rewrites.
- Treat the live InfinityFree database as the main source of truth.
- Avoid keeping an independent writable local database when it can cause drift.

## Environments
- Local dev: `http://127.0.0.1:5500`
- Live staging/hosting: `https://ticketmanager.infinityfree.io`
- Deployment mirror: `deploy/htdocs`
- Local work should be done from the repo in `C:\Users\antod\Documents\Codex\ProdOps`.
- The deploy mirror in `deploy/htdocs` must stay aligned with the source tree.

## Source of truth
- Root source files in `public/`, `backend/`, `data/`, `index.php`, `router.php`.
- `deploy/htdocs/` is the deployable mirror and must be kept in sync when live-facing files change.
- `data/db.json` is the local seed/fallback dataset.
- `data/mysql_schema_51.sql` is the MySQL 5.1 schema reference.
- Live data on InfinityFree is the production source of truth.
- When local and live drift, resync the local snapshot from live before making further changes.
- Use the admin DB export endpoint when you need to refresh the local snapshot from live.
- Prefer one writable database source only; do not let local and live evolve independently.
- All requested code changes must be applied in the Git-backed repository working tree.
- Do not use stray copies outside the repository as the primary edit target.
- Keep the repository state updated after every meaningful change so Git always reflects the current project version.

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
- Keep auth flows working both locally and on InfinityFree.

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
- Prefer testing the exact environment being affected:
  - local for development
  - live site for hosting regressions
- Before saying something is fixed, actually test it in the browser or through the relevant API.
- When a page looks empty, verify whether the issue is cache, JS loading, auth, or backend data before changing layout.
- Always run the relevant check after a change before reporting success.
- For UI changes, inspect the page in the browser.
- For backend changes, hit the relevant endpoint or DB check.
- If a fix touches both local and deploy mirror, verify both sides when practical.

## Deployment
- When updating files that affect the live site, update the deploy mirror under `deploy/htdocs` as well.
- Keep the live-hosted HTML/JS in sync with the source tree.
- Do not push to the web unless the user explicitly asks.
- Only deploy to InfinityFree when the user explicitly asks to push live.
- If a change is only local, keep it local and do not modify the live environment.
- GitHub should always be updated from the repository when the user asks for a push; live deploys are separate and only happen on request.

## Git
- Keep commits focused and descriptive.
- Do not rewrite unrelated history.
- Avoid committing temporary files or local-only experiments.
- After meaningful changes, update the app version badge consistently across pages.
- Version bumps should roughly match change size:
  - patch for small fixes
  - minor for medium feature additions
  - major only for large, breaking changes
