# File da deployare in produzione

Percorso produzione: `/var/www/html/ictsupport/modules/ticket_manager/`

## In attesa di deploy

| File | Motivo |
|------|--------|
| `Ufficio/backend/auth.php` | Ruolo supervisor: bypassa controllo admin |
| `Ufficio/backend/index.php` | Ruolo supervisor: is_supervisor(), can_edit, stats team, require_ticket_owner |
| `Ufficio/public/js/script.js` | Ruolo supervisor: Admin Panel visibile, contatore Team corretto |

> **Nota:** Copiare il file intero, non solo le sezioni modificate.
> Dopo il deploy, aggiungere l'utente supervisor con la query:
> ```sql
> INSERT INTO app_users (id, username, password, role, team, group_name, personal_target, group_target)
> VALUES (2, 'USERNAME_LDAP', '', 'supervisor', 'A', 'ProdOps', 0, 0);
> ```

## Già in produzione

| File | Note |
|------|------|
| `Ufficio/backend/config.php` | DB: ticket_manager |
| `Ufficio/backend/index.php` | Fix PHP 5.3 (parzialmente — vedi sopra) |
| `Ufficio/public/css/styles.css` | Layout responsivo laptop |
| `Ufficio/data/setup.sql` | Import one-time, non serve sul server |
