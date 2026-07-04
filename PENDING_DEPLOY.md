# File da deployare in produzione

Percorso produzione: `/var/www/html/ictsupport/modules/ticket_manager/`

## In attesa di deploy

Regola operativa: ogni nuova modifica applicativa richiesta e verificata va inserita qui di default come candidata al deploy, salvo file esplicitamente locali o esclusi nella sezione `Non deployare`.

| File locale | Path produzione | Note |
|------|------|------|
| `Ufficio/public/admin.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/admin.html` | Version bump pubblico `v1.6.13` |
| `Ufficio/public/css/styles.css` | `/var/www/html/ictsupport/modules/ticket_manager/public/css/styles.css` | Modale ticket dinamica anche durante apertura dropdown preset |
| `Ufficio/public/index.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/index.html` | Version bump pubblico `v1.6.13` |
| `Ufficio/public/js/admin.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/admin.js` | Blocco duplicati case-insensitive nella creazione menu admin |
| `Ufficio/public/js/script.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/script.js` | Validazione proposta duplicati case-insensitive e crescita modale con dropdown aperto |
| `Ufficio/public/js/search.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/search.js` | Elimina ticket in modale e feedback permessi/ordinamenti ricerca |
| `Ufficio/public/js/toast.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/toast.js` | Sistema toast/confirm referenziato dalle pagine pubbliche |
| `Ufficio/public/login.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/login.html` | Version bump pubblico `v1.6.13` |
| `Ufficio/public/search.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/search.html` | Version bump pubblico `v1.6.13` |

## Gia deployato

Deploy confermato in data `2026-07-04` per i seguenti file:

| File locale | Path produzione | Note |
|------|------|------|
| `Ufficio/backend/auth.php` | `/var/www/html/ictsupport/modules/ticket_manager/backend/auth.php` | Allineamento auth supervisor |
| `Ufficio/backend/index.php` | `/var/www/html/ictsupport/modules/ticket_manager/backend/index.php` | Allineamento API/backend supervisor |
| `Ufficio/public/admin.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/admin.html` | UI admin + revisione menu |
| `Ufficio/public/css/styles.css` | `/var/www/html/ictsupport/modules/ticket_manager/public/css/styles.css` | Stili admin/search/login |
| `Ufficio/public/index.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/index.html` | Include e version bump |
| `Ufficio/public/js/admin.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/admin.js` | Gestione admin + formattazione batch menu |
| `Ufficio/public/js/script.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/script.js` | Supporto supervisor dashboard |
| `Ufficio/public/js/search.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/search.js` | Elimina ticket in modale |
| `Ufficio/public/js/toast.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/toast.js` | Nuovo sistema toast/confirm |
| `Ufficio/public/login.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/login.html` | Nuova login con nota LDAP |
| `Ufficio/public/search.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/search.html` | Include toast e update ricerca |

## Non deployare

| File locale | Motivo |
|------|--------|
| `Ufficio/backend/ldap.php` | Solo locale: contiene `dev_bypass: true` |
| `Ufficio/backend/config.php` | In produzione esiste gia la configurazione DB corretta |
| `.claude/`, `CLAUDE.md`, `Ufficio/data/sync_ts` | File locali di supporto, non applicativi |

## Note

- Da ora in poi questo file va mantenuto aggiornato a ogni change set, aggiungendo automaticamente i file deployabili ancora non passati in produzione.
- Nessuna query strutturale DB richiesta per questo deploy.
- Query utente supervisor da eseguire solo se in produzione non esiste gia il relativo utente LDAP.
