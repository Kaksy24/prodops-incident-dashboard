# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running locally

From the `Ufficio/` directory:
```powershell
php -S 127.0.0.1:5500 router.php
```

No build step. Frontend is plain HTML/CSS/JS served statically. The app is at `http://localhost:5500`.

For local dev, `backend/ldap.php` must have:
```php
'enabled'    => false,
'dev_bypass' => true,
```
This allows login with any username without contacting LDAP. **Never deploy with `dev_bypass: true`.**

## Architecture

```
Ufficio/
├── router.php          # PHP built-in server router — serves static files or delegates to backend
├── index.php           # Apache entry point (includes backend/index.php)
├── backend/
│   ├── index.php       # All API routes (/api/*) + HTML page serving
│   ├── auth.php        # Session management, HMAC cookie (8h), role checks
│   ├── ldap.php        # LDAP auth + dev_bypass
│   └── config.php      # DB credentials (not committed — use config.example.php as template)
├── public/
│   ├── index.html      # Dashboard (current shift tickets + charts)
│   ├── admin.html      # Admin panel (incidents, users, colors)
│   ├── search.html     # Ticket history search
│   ├── login.html      # Login page
│   ├── js/
│   │   ├── script.js   # Dashboard logic (~4500 lines) — tickets, charts, modal, theme
│   │   ├── admin.js    # Admin panel logic
│   │   └── search.js   # Search page logic
│   └── css/styles.css  # All styles, dark mode via .theme-dark on body
└── data/
    ├── db.json              # Local seed / MySQL fallback
    ├── mysql_schema_51.sql  # MySQL schema (MySQL 5.1 compatible)
    └── sync_ts              # Timestamp of last MySQL sync (gitignored)
```

**Request flow:** `router.php` → if `/api/*` or a page URL → `backend/index.php` handles it. Static assets are served directly.

**Auth:** LDAP bind only — no passwords stored in DB. Session is a signed HMAC cookie. Roles: `user`, `supervisor`, `admin`. `require_api_auth()` / `require_page_auth()` are in `auth.php`; `is_supervisor()` is in `backend/index.php`.

**Role capabilities:**
- `admin` — full access including admin panel, user management, all API routes
- `supervisor` — can view/edit/delete any ticket and sees all teams in team-view; cannot insert tickets, cannot access admin panel, has no team assignment (`team = ''`), excluded from user stats
- `user` — can insert tickets, can only edit their own tickets, sees only their team in team-view

**Data layer:** `backend/index.php` tries MySQL first, falls back to `data/db.json`. All write operations go to MySQL only.

**Frontend ↔ Backend:** REST JSON API at `/api/*`. Frontend JS uses `fetchJson()` (wrapper in `script.js`/`admin.js`) that strips BOM from responses before parsing.

**Incident model:** Incidents belong to categories; tickets reference an incident by ID. Both incidents and tickets have stable numeric IDs — never key by name (names can collide).

## PHP constraints

Target: **PHP 5.3 / 5.4** (production server). Avoid all PHP 7+ syntax:

| Forbidden | Use instead |
|-----------|-------------|
| `[]` array literal | `array()` |
| `??` null coalescing | `isset($x) ? $x : $default` |
| `?->` nullsafe operator | explicit null check |
| Traits | none (refactor) |
| `match` expression | `switch` |
| Arrow functions `fn =>` | `function() use ()` |
| `finally` block | restructure try/catch |
| `ClassName::class` | `'ClassName'` string |

## Key conventions

- **Version badge:** All three HTML pages (`index.html`, `admin.html`, `search.html`) and their JS/CSS `?v=X.X.X` cache-bust params must be bumped together on every release. Version follows semver (patch for fixes, minor for features).
- **Theme:** Dark mode toggled by adding `theme-dark` class to `<body>`. The toggle button state is synced via `setThemeToggleIcon()` in `script.js`.
- **FABs:** The production FABs are `['M5', 'L1', 'EWS', 'WSIC', 'NRK']` — hardcoded in both `backend/index.php` (`$fabs`) and `public/js/script.js` (`const fabs`).
- **db.json:** Only updated via `backend/import_dbjson_to_mysql.php` sync script. Do not hand-edit it; MySQL is the source of truth.

## Deploy checklist

**Never copy to production:**
- `backend/ldap.php` (has `dev_bypass: true`)
- `backend/config.php` (production has its own DB credentials)

Files listed in `PENDING_DEPLOY.md` are staged for the next deploy to `/var/www/html/ictsupport/modules/ticket_manager/`. **Update it automatically after every applicative change** — move confirmed deploys to the "Già deployato" section with date, add new files to "In attesa di deploy".
