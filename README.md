# ProdOps

Struttura del progetto:

- `public/` → pagine HTML, CSS e JavaScript del frontend
- `backend/` → controller PHP e script di import
- `data/` → `db.json` e dump/schema SQL
- `router.php` → router per `php -S` e deploy Railway
- `Dockerfile` / `Procfile` → avvio dell'app in produzione

Avvio locale:

```powershell
php -S 127.0.0.1:5500 -t public router.php
```

Note:

- Le API passano dal backend in `backend/index.php`
- I file statici sono serviti da `public/`
- Il database locale vive in `data/db.json`

Staging InfinityFree:

- Copia `backend/config.example.php` in `backend/config.php`
- Inserisci i parametri MySQL del pannello InfinityFree
- Carica `public/`, `backend/`, `data/` e `router.php` sul sito
- Importa `data/mysql_schema_51.sql` nel database del pannello
- Se vuoi partire da dati già pronti, importa anche `data/prodops_local_dump.sql`
