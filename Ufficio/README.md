# ProdOps

Gestione ticket pensata per ambienti aziendali con autenticazione LDAP.

## Struttura
- `public/` → frontend HTML/CSS/JS
- `backend/` → controller PHP e API
- `data/` → seed locale, schema e dump SQL

## Stack
- PHP 7.x+
- MySQL 5.x+
- Estensione PHP `ldap` richiesta
- Apache con `mod_rewrite`

---

## Deploy in produzione

### 1. Copia i file
Copia l'intera cartella `Ufficio/` sul server. Puoi omettere `data/sync_ts`.

### 2. Database MySQL
Crea il database e importa lo schema:
```sql
CREATE DATABASE prodops CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
```bash
mysql -u utente -p prodops < data/mysql_schema_51.sql
```

Configura le credenziali in `backend/config.php`:
```php
return array(
  'MYSQL_HOST' => 'indirizzo-db',
  'MYSQL_PORT' => '3306',
  'MYSQL_DB'   => 'prodops',
  'MYSQL_USER' => 'utente-db',
  'MYSQL_PASS' => 'password-db'
);
```

### 3. Utenti
Non ci sono utenti di default. Inseriscili direttamente nel DB:
```sql
INSERT INTO app_users (username, password, role, team, group_name)
VALUES ('mario.rossi', '', 'user', 'A', 'ProdOps'),
       ('giuseppe.verdi', '', 'admin', 'A', 'ProdOps');
```
Lo `username` deve corrispondere a quello che LDAP riconosce come `sn`, `cn`, `mail` o `uid`.

### 4. LDAP — `backend/ldap.php`
Inserisci gli indirizzi dei server LDAP aziendali:
```php
$LDAP_SERVERS = array(
    array('host' => '10.0.0.1', 'port' => 389),
    array('host' => '10.0.0.2', 'port' => 389),
    array('host' => '10.0.0.3', 'port' => 389),
);
```

Verifica il Base DN con il tuo amministratore LDAP:
```php
define('LDAP_BASE_DN', 'ou=people,dc=st,dc=com');
```

Abilita LDAP e disabilita il bypass di sviluppo:
```php
$LDAP_CONFIG = array(
    'enabled'    => true,   // false solo in sviluppo locale
    'dev_bypass' => false,  // *** DEVE essere false in produzione ***
    ...
);
```

### 5. Apache
Assicurati che:
- `mod_rewrite` sia abilitato
- La directory del progetto abbia `AllowOverride All` (serve per `.htaccess`)
- L'estensione PHP `ldap` sia abilitata:
```bash
php -m | grep ldap
```

### 6. Permessi
Il processo PHP deve poter scrivere su `data/db.json`:
```bash
chmod 664 data/db.json
chown www-data:www-data data/db.json
```

### Checklist finale
- [ ] `backend/config.php` con credenziali MySQL reali
- [ ] Schema DB importato
- [ ] Utenti inseriti in `app_users`
- [ ] Server LDAP inseriti in `backend/ldap.php`
- [ ] `dev_bypass => false` e `enabled => true` in `backend/ldap.php`
- [ ] `mod_rewrite` abilitato e `AllowOverride All` configurato
- [ ] Estensione PHP `ldap` abilitata
- [ ] Permessi scrittura su `data/db.json`

---

## Sviluppo locale

```powershell
php -S 127.0.0.1:5500 router.php
```

In `backend/ldap.php` imposta:
```php
'enabled'    => false,
'dev_bypass' => true,
```
Questo permette di loggare con qualsiasi username senza contattare LDAP.

## Login
- Tutti gli utenti (admin e user) si autenticano tramite LDAP
- Nessuna password è salvata nel DB
- Il token di sessione è un cookie firmato HMAC con scadenza 8h

## Admin e dashboard
- L'admin gestisce: categorie / incident / utenti / colori grafici
- La dashboard mostra: ticket turno corrente / grafici / ricerca ticket

## Dati
- `data/db.json` è il seed locale/fallback quando MySQL non è disponibile
- `data/mysql_schema_51.sql` è lo schema MySQL
- `data/prodops_local_dump.sql` è il dump di riferimento
