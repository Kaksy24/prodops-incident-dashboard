# ProdOps Deploy

## Live Target
- Site/domain: `https://ticketmanager.infinityfree.io`
- Hosting: InfinityFree
- FTP host: `ftpupload.net`
- FTP username: `if0_42089952`
- FTP port: `21`
- Remote folder: `/htdocs`
- Local deploy source: `C:\Users\antod\Documents\Codex\ProdOps\deploy\htdocs`

## Secret Handling
- Do not commit FTP passwords, database passwords, or hosting tokens.
- Local FTP password file, if present:
  - `C:\Users\antod\Documents\Codex\ProdOps\.codex-local\infinityfree-ftp.md`
- `.codex-local/` is ignored by Git.
- On a new PC, recreate `.codex-local\infinityfree-ftp.md` manually with the FTP password from the InfinityFree panel.

Suggested local secret file format:

```md
# Local InfinityFree FTP Credentials

- Site/domain: `ticketmanager.infinityfree.io`
- FTP host: `ftpupload.net`
- FTP username: `if0_42089952`
- FTP password: `<paste FTP password here>`
- FTP port: `21`
- Remote folder: `/htdocs`
- Local deploy source: `C:\Users\antod\Documents\Codex\ProdOps\deploy\htdocs`
```

## Deploy Rules
- Deploy live only when explicitly requested by the user.
- Before live deploy, make sure `deploy/htdocs` is aligned with source files.
- Upload the contents of `deploy/htdocs` into remote `/htdocs`.
- Do not upload unrelated local files, logs, `.vs/`, `.git/`, or `.codex-local/`.
- GitHub push and InfinityFree deploy are separate actions.

## Expected FTP Upload
Upload these deploy mirror paths to remote `/htdocs`:
- `.htaccess`
- `index.php`
- `router.php`
- `backend/`
- `public/`
- `data/`

## Post-Deploy Checks
- Open `https://ticketmanager.infinityfree.io/login.html`.
- Confirm login page loads with current version badge.
- Log in and verify dashboard loads.
- Create one test ticket only if the user approves touching live data.
- Verify admin page still shows:
  - category/incident management
  - user management
  - chart preview and color editing
