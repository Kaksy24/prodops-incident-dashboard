# ProdOps

Gestione ticket pensata per ambienti legacy e rete chiusa.

## Dove lavora il progetto
- Repo locale: `C:\Users\antod\Documents\Codex\ProdOps`
- Locale dev: `http://127.0.0.1:5500`
- Live: `https://ticketmanager.infinityfree.io`
- Mirror deploy: `deploy/htdocs`

## Regole operative
- Il DB live su InfinityFree è la sorgente principale dei dati.
- Il locale serve per sviluppo, ma non deve divergere dal live.
- Quando cambi qualcosa di visibile online, aggiorna anche `deploy/htdocs`.
- Se un incidente ha lo stesso nome di un altro in un’altra categoria, la logica usa l’`incident_id`.

## Stack target
- PHP 5.4
- MySQL 5.1
- Niente dipendenze esterne non necessarie

## Avvio locale
```powershell
php -S 127.0.0.1:5500 router.php
```

## Struttura
- `public/` → frontend HTML/CSS/JS
- `backend/` → controller PHP e API
- `data/` → seed locale, schema e dump SQL
- `deploy/htdocs/` → copia pronta per l’hosting

## Flusso consigliato
1. Apri il locale e verifica la modifica.
2. Aggiorna i file in `deploy/htdocs`.
3. Quando vuoi pubblicare, chiedi il push live.
4. Se il DB locale e quello live divergono, riallinea dal DB live.

## Login
- Il login deve portare sempre alla pagina corretta dopo il submit.
- Se il browser o l’hosting alterano la risposta JSON, usa parsing BOM-safe.

## Admin e dashboard
- L’admin deve mantenere:
  - categorie / incident
  - utenti
  - colori grafici
  - anteprima grafici
- La dashboard deve mantenere:
  - ticket turno corrente
  - grafici
  - ricerca ticket
  - apertura corretta delle modali incident

## Dati
- `data/db.json` è il seed locale/fallback.
- `data/mysql_schema_51.sql` è lo schema MySQL 5.1.
- `data/prodops_local_dump.sql` è il dump di riferimento.

