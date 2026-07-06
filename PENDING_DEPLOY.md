# File da deployare in produzione

Percorso produzione: `/var/www/html/ictsupport/modules/ticket_manager/`

## In attesa di deploy

Regola operativa: ogni nuova modifica applicativa richiesta e verificata va inserita qui di default come candidata al deploy, salvo file esplicitamente locali o esclusi nella sezione `Non deployare`.

| File locale | Path produzione | Note |
|------|------|------|
| _Nessuno_ |  |  |

## Gia deployato

Deploy confermato in data `2026-07-06` (v1.9.12 — anti-flash tema, wizard aggiungi grafico, compattazione a tendina, fix resize grafici, pill responsive) per i seguenti file:

| File locale | Path produzione | Note |
|------|------|------|
| `Ufficio/public/css/styles.css` | `/var/www/html/ictsupport/modules/ticket_manager/public/css/styles.css` | Pill utente nella sidebar resa responsive alla risoluzione/larghezza disponibile: dimensioni fluide per contenitore, padding, icona e metadati; layout convertito a griglia `avatar + contenuto` cosi il nome resta visibile per intero e la riga `Team / ruolo` non puo sovrapporsi all'avatar ne uscire dalla pill; fix responsive dei resize chart: nel breakpoint `<1400px` la griglia passa a 4 colonne reali e gli span `3/6/9/12` vengono rimappati a `1/2/3/4`, cosi i pulsanti ◀/▶ continuano a cambiare visibilmente la larghezza anche a `1024x804`; in modalita `Modifica grafici` l'intera card diventa trascinabile con lieve oscillazione visuale e icona penna accanto ai titoli rinominabili; il toggle `Compatta` diventa menu a tendina con modalita `Per categoria`, `Per incident`, `Per FAB`; il pulsante `Modifica grafici` usa testo nero/colore primario del tema invece di un grigio da stato disattivato; sopra i due filtri compaiono le etichette `Compatta` e `Ordina` poi rimosse su richiesta; i filtri del turno corrente vengono riallineati e la freccia asc/desc viene inglobata visivamente nel riquadro `Ordina`; i select `Compatta` e `Ordina` condividono ora lo stesso stile/font e viene ridotto lo spazio morto nella parte alta del pannello turno corrente; la modale `Aggiungi grafico` diventa un wizard step-by-step con scelta iniziale `Crea`/`Ripristina`, avanzamento a step e riepilogo finale; regola `theme-sync-pending`: durante il bootstrap del tema il `body` resta nascosto, cosi non compare per un attimo una palette stale da cache locale |
| `Ufficio/public/js/script.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/script.js` | Fix runtime resize grafici: rimosse le chiamate residue a `renderCharts()` (funzione non definita) che bloccavano i pulsanti ◀/▶ e generavano errori console a `1024x804`; rimosso il bootstrap immediato del tema da `localStorage` (ora palette/dark mode letti da `/api/user-charts`, cache locale sincronizzata, pagina mostrata solo a tema corretto); modalita `Modifica grafici` con drag&drop sull'intero pannello (esclusi i controlli), affordance spostamento/rinomina anche sui grafici custom; compattazione ticket configurabile da menu a tendina (categoria/incident/FAB); modale `Aggiungi grafico` riscritta come wizard a step (`Crea` / `Ripristina`, Indietro/Avanti, review finale) |
| `Ufficio/public/index.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/index.html` | Bootstrap anti-flash tema: pagina nascosta finche non arriva la preferenza utente autorevole dal server; cache-busting asset `v1.9.12`; `Compatta` sostituito con menu a tendina per il criterio di compattazione, opzione iniziale `Non compattare`, tendina a sinistra del menu ordinamento |
| `Ufficio/public/search.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/search.html` | Bootstrap anti-flash tema; cache-busting asset `v1.9.12` |
| `Ufficio/public/admin.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/admin.html` | Bootstrap anti-flash tema; cache-busting asset `v1.9.12` |
| `Ufficio/public/login.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/login.html` | Cache-busting CSS e badge versione `v1.9.12` |
| `Ufficio/public/js/search.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/search.js` | Cerca ticket: rimosso il bootstrap immediato del tema da `localStorage`; ora applica palette/dark mode letti da `/api/user-charts`, sincronizza la cache locale e mostra la pagina solo a tema corretto |
| `Ufficio/public/js/admin.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/admin.js` | Admin: rimosso il bootstrap immediato del tema da `localStorage`; ora applica palette/dark mode letti da `/api/user-charts`, sincronizza la cache locale e mostra la pagina solo a tema corretto |

Deploy confermato in data `2026-07-06` (ruolo moderatore + avatar sincronizzati + dashboard responsive) per i seguenti file:

| File locale | Path produzione | Note |
|------|------|------|
| `Ufficio/backend/auth.php` | `/var/www/html/ictsupport/modules/ticket_manager/backend/auth.php` | Nuovo ruolo `moderator`: `require_api_auth('moderator')` (admin+moderator) e `require_page_auth` consente al moderatore l'accesso a admin.html |
| `Ufficio/backend/index.php` | `/var/www/html/ictsupport/modules/ticket_manager/backend/index.php` | Nuovi endpoint avatar `PUT /api/me/avatar` e `GET /api/user-avatars` (preferenza avatar persistita per utente, campo `avatar` creato on-demand, nessuna migrazione DB); endpoint catalogo/incident e revisione preset aperti al ruolo `moderator`; `POST/PUT /api/users` accettano ruolo `moderator` |
| `Ufficio/public/index.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/index.html` | Pill utente ristrutturata (nome / separatore / team · ruolo, wrap avatar); **version bump v1.9.1** |
| `Ufficio/public/admin.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/admin.html` | Opzione ruolo `moderator` nei select filtro/creazione utente; **version bump v1.9.1** |
| `Ufficio/public/search.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/search.html` | **version bump v1.9.1** (per cache-busting CSS/JS aggiornati) |
| `Ufficio/public/login.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/login.html` | **version bump v1.9.1** (per cache-busting CSS/JS aggiornati) |
| `Ufficio/public/css/styles.css` | `/var/www/html/ictsupport/modules/ticket_manager/public/css/styles.css` | Dashboard responsive: ≥1400px griglia a 12 colonne con larghezze fisse (pulsanti di ridimensionamento span 3/6/9/12 funzionanti); <1400px griglia auto-fit fluida (i grafici non si schiacciano né si tagliano, sidebar più stretta); pannelli grafico ad altezza flessibile (crescono col contenuto, niente tagli) con donut basati sulla larghezza (cqi); toolbar turno corrente che va a capo; stili pill/avatar picker/badge avatar nei ticket |
| `Ufficio/public/js/script.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/script.js` | Avatar utente: picker 20 emoji sulla pill, badge avatar accanto allo username nei ticket, preferenza letta/salvata lato server con cache locale; pill con team/ruolo; drill-down grafici apre la ricerca filtrata in nuova scheda; pulsante Admin visibile anche al moderatore |
| `Ufficio/public/js/admin.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/admin.js` | Per il ruolo `moderator`: nasconde i tab `Utenti` e `Grafici/colori`, mostra solo Categorie/Incident e Revisione; opzione `moderator` nelle select ruolo |
| `Ufficio/public/js/search.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/search.js` | Badge avatar accanto allo username nei risultati e nella modale; idratazione avatar dal server |

Deploy confermato in data `2026-07-06` per i seguenti file:

| File locale | Path produzione | Note |
|------|------|------|
| `Ufficio/backend/index.php` | `/var/www/html/ictsupport/modules/ticket_manager/backend/index.php` | Preferenze utente salvate lato server in `user_charts`; merge sicuro nel `PUT /api/user-charts` senza azzerare preferenze non presenti nella richiesta |
| `Ufficio/public/js/script.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/script.js` | Dashboard allineata alle preferenze server-side; badge ticket pinnati; link preset in nuova scheda; fix composer preset dinamici; conferma rimozione PIN; ritorno al logo dashboard in Cerca ticket; rimozione dei tipi grafico `Torta` e `Linea`; affinamenti layout/overflow/scroll dei pannelli grafico e della legenda/ciambella |
| `Ufficio/public/css/styles.css` | `/var/www/html/ictsupport/modules/ticket_manager/public/css/styles.css` | Stili ticket pinnati; footer/paginazione utenti admin; layout responsive dei grafici a ciambella; vincoli di overflow dei pannelli grafico con scroll interno e dimensionamento della ciambella legato al pannello |
| `Ufficio/public/js/search.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/search.js` | Ricerca allineata alle preferenze server-side; link descrizioni ticket in nuova scheda |
| `Ufficio/public/js/admin.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/admin.js` | Admin allineato alle preferenze server-side; data table utenti paginata da 5 righe; rimozione dei tipi grafico `Torta` e `Linea` dalle preview |
| `Ufficio/public/index.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/index.html` | **version bump v1.9.0** su CSS/JS e badge versione |
| `Ufficio/public/admin.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/admin.html` | **version bump v1.9.0** su CSS/JS, asset logo e badge versione |
| `Ufficio/public/search.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/search.html` | **version bump v1.9.0** su CSS/JS, asset logo e badge versione; logo Ticket Manager riporta alla Dashboard |
| `Ufficio/public/login.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/login.html` | **version bump v1.9.0** su CSS/JS, asset logo e badge versione |

Deploy confermato in data `2026-07-05` per i seguenti file:

| File locale | Path produzione | Note |
|------|------|------|
| `Ufficio/backend/auth.php` | `/var/www/html/ictsupport/modules/ticket_manager/backend/auth.php` | Supervisor rimosso da `require_api_auth('admin')`: le API admin restituiscono ora 403 per il ruolo supervisor |
| `Ufficio/backend/index.php` | `/var/www/html/ictsupport/modules/ticket_manager/backend/index.php` | Supervisor non può inserire ticket (403 su `POST /api/tickets`); escluso da `summarize_by_user` (grafici e stats utenti); `POST /api/users` e `PUT /api/users/:id` accettano ora il ruolo `supervisor` e forzano `team=''`; `load_db` non normalizza il team dei supervisor; `GET /api/me` restituisce `team=''` per supervisor |
| `Ufficio/public/index.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/index.html` | `#userPill` convertito da `div` a `button`; aggiunto modal `#userSettingsModal` con selezione tema (5 swatches: Cappuccino, Bordeaux, Verde, Blu, Giallo); checkbox PIN (📌 PIN) + datepicker in `#ticketModal .modal-header`; bottone `#importantTicketsBtn` in `.previous-shifts-header`; modale `#importantTicketsModal` con lista ticket pinnati; **version bump v1.8.0** su tutti i tag script/link |
| `Ufficio/public/admin.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/admin.html` | `#newUserGroup` da `<input type=text>` a `<select>`; aggiunto `#newUserGroupCustom` input per nuovo gruppo; **version bump v1.8.0** |
| `Ufficio/public/search.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/search.html` | **version bump v1.8.0** |
| `Ufficio/public/login.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/login.html` | **version bump v1.8.0** |
| `Ufficio/public/css/styles.css` | `/var/www/html/ictsupport/modules/ticket_manager/public/css/styles.css` | Sostituiti i 4 vecchi temi con 5 palette luce + dark adattivo; stili PIN (`.ticket-pin-wrap`, `.ticket-pin-label`, `.ticket-pin-date`); stili bottone Ticket Importanti (`.important-tickets-btn`); stili modale e card (`.important-tickets-panel`, `.important-ticket-card`, `.itc-*`); badge 📌 sulle card pinnate (`.ticket-pin-badge`, `.ticket-row.ticket-pinned`) |
| `Ufficio/public/js/admin.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/admin.js` | `applyTheme` ora applica anche la palette (`localStorage.palette`) oltre al dark mode; toggle usa chiave `dark-mode` invece di `theme`; `renderUsers`: colonna gruppo ora `<select>` con lista gruppi esistenti + opzione "Nuovo gruppo…" + input custom; colonna "Protezioni" → "Stato" con `user-disable-check` toggle (chiama `PUT /api/users/:id {disabled}` in tempo reale); `openUserCreateModal` popola il select gruppo da `adminUsersCache`; submit crea utente legge gruppo dal select |
| `Ufficio/public/js/script.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/script.js` | `THEMES` rinnovato con 5 palette luce; `applyTheme(paletteId, darkMode)` separa palette da dark mode; toggle commuta solo dark/light; settings mostra 5 swatches; storage: `palette` + `dark-mode`; PIN ticket globale via API (`/api/pinned-tickets`): `updatePinUi`, checkbox IIFE usa `fetchJson DELETE/POST`, modale Ticket Importanti con render API-based, unpin via API, badge contatore; `sanitizePinText` fix mojibake descrizioni; PIN visibile anche in fase creazione ticket; `updatePinUi` confronto id con `Number()` (fix type mismatch string vs number che impediva di vedere la spunta su ticket già pinnati da altri utenti); `decoratePinnedTickets` + badge 📌 su card pinnate nel turno corrente |
| `Ufficio/public/js/search.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/search.js` | `applyTheme` allineato: applica palette + dark mode; toggle usa chiave `dark-mode` |
| `Ufficio/backend/index.php` | `/var/www/html/ictsupport/modules/ticket_manager/backend/index.php` | `load_db`/`mysql_save_db` gestiscono `pinned_tickets` e `disabled_users` in `app_settings`; login blocca utenti disabilitati (403); `GET /api/users` include campo `disabled`; `PUT /api/users/:id` accetta payload `{disabled}` per aggiornare lista `disabled_users`; nuovi endpoint `GET/POST /api/pinned-tickets` e `DELETE /api/pinned-tickets/:id` |
| `Ufficio/backend/index.php` | `/var/www/html/ictsupport/modules/ticket_manager/backend/index.php` | `?month=1..12` su `/api/stats/personal/current-year` (drill-down giornaliero) + endpoint `GET /api/tickets/lookup` (ticket per dimensione+valore o intervallo, per il click sui grafici) + guard `PRODOPS_LIB_ONLY` per riuso helper da `extensions/export.php` + `GET /api/preset-options` ora restituisce anche `pending` (proposte non ancora approvate ma create da meno di 48h, cosi da poterle usare subito nel menu a tendina) + formato automatico per menu preset persistito lato server (nuovo setting `preset_option_formats` in `app_settings`, nessuna migrazione di schema richiesta) applicato a ogni inserimento/modifica (proposta utente, aggiunta/modifica admin) tramite nuovo endpoint `PUT /api/admin/preset-option-format` + endpoint `current-year` di fab/categoria/team/severity/utenti ora accettano `?start=YYYY-MM-DD&end=YYYY-MM-DD` come alternativa a `mode` (periodo personalizzato) + `GET`/`PUT /api/user-charts` salvano anche `chart_custom_ranges` (persistenza del range scelto per ciascun grafico) |
| `Ufficio/extensions/export.php` | `/var/www/html/ictsupport/modules/ticket_manager/extensions/export.php` | Export ticket per TinyMCE altro sito: senza `submit` mostra un form che chiede start/end/formato (csv/json/html); dopo submit accetta `?submit=1&format=html|json|csv&start&end` (raggruppati CATEGORIA-FAB, dedup `[N]`, endpoint pubblico senza autenticazione) |
| `Ufficio/public/admin.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/admin.html` | Version bump pubblico `v1.7.0` |
| `Ufficio/public/css/styles.css` | `/var/www/html/ictsupport/modules/ticket_manager/public/css/styles.css` | Modale ticket dinamica con dropdown preset + stili pila ticket duplicati (`.ticket-dup-stack`) + drill-down mensile grafici personali (back button/caption/label cliccabili) + elementi grafico cliccabili (`.chart-clickable`) + sostituiti i chip radio del "Formato lista" (admin, Revisione menu) con un menu a tendina (`.preset-option-format-select`) + stile pulsante calendario e popover per la selezione del periodo personalizzato nei grafici dashboard (`.range-calendar-wrap`, `.range-calendar-btn`, `.range-calendar-popover`) + fix: popover calendario grafici si apriva a priori invece che solo al click (aggiunta regola `.range-calendar-popover[hidden] { display: none; }` che mancava e veniva sovrascritta da `display: flex`) + popover calendario apre verso l'interno del box grafico (`left: 0` invece di `right: 0`) + fix: con modale ticket aperta i ticket raggruppati risultavano interagibili/illuminati (aggiunto `z-index: 1000` alla `.modal` e `body.modal-open main { pointer-events: none }`) |
| `Ufficio/public/index.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/index.html` | Version bump pubblico `v1.7.0` + aggiunto pulsante calendario con popover Da/A in ciascuno dei 5 grafici dashboard (FAB, categoria, team, severity, utenti) per il periodo personalizzato |
| `Ufficio/public/js/admin.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/admin.js` | Blocco duplicati case-insensitive nella creazione menu admin; "Formato lista" nella scheda "Opzioni approvate" e' ora un menu a tendina (`<select>`) invece di chip radio; il formato scelto e' salvato lato server (endpoint `preset-option-format`) invece che in `localStorage`, cosi si applica a tutti gli utenti e a ogni nuovo elemento inserito (anche dagli utenti normali via "Proponi nuovo elemento") |
| `Ufficio/public/js/script.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/script.js` | Grafici: nascondi valori 0 (min 4 colonne) + asse tondo grafici personali; dedup ticket identici in pila con badge; drill-down mensile grafici personali/gruppo (click mese → giorno per giorno + torna all'anno); asse grafico gruppo con scaglioni minimi da 250; click su elemento grafico → apre i ticket filtrati nella pagina Cerca ticket (tutti i grafici, inclusi custom e personali per periodo); validazione duplicati e crescita modale; nuovi elementi proposti nel menu a tendina dei preset restano selezionabili subito (etichetta "(in revisione)") per 48h in attesa dell'approvazione admin; corretta l'etichetta del menu a tendina custom che restava bloccata su "+ Proponi nuovo elemento" invece di mostrare il valore appena proposto; il valore proposto da un utente viene ora auto-formattato dal server secondo il formato impostato dall'admin per quel menu (es. "TM03" -> "tm03" se il formato e' "tutto minuscolo") e mostrato gia formattato nel menu; aggiunto un pulsante calendario in ciascun grafico dashboard (FAB, categoria, team, severity, utenti) che apre un popover con date "Da"/"A" per scegliere un periodo personalizzato al posto di Anno/Q1-Q4/24h, persistito per utente |
| `Ufficio/public/js/search.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/search.js` | Elimina ticket in modale e feedback permessi/ordinamenti ricerca; apertura risultati dal click sui grafici (param dimensione/periodo → `/api/tickets/lookup`); filtro Incident dipendente dalla Categoria (attivo solo con categoria scelta, popolato con i soli incident di quella categoria) |
| `Ufficio/public/js/toast.js` | `/var/www/html/ictsupport/modules/ticket_manager/public/js/toast.js` | Sistema toast/confirm referenziato dalle pagine pubbliche |
| `Ufficio/public/login.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/login.html` | Version bump pubblico `v1.7.0` |
| `Ufficio/public/search.html` | `/var/www/html/ictsupport/modules/ticket_manager/public/search.html` | Version bump pubblico `v1.7.0` |

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
| `Ufficio/data/db.json` | Dati locali di test; in produzione il DB reale non va sovrascritto (il campo `avatar` viene creato on-demand dal backend, nessuna migrazione) |
| `.claude/`, `CLAUDE.md`, `Ufficio/data/sync_ts` | File locali di supporto, non applicativi |

## Note

- Da ora in poi questo file va mantenuto aggiornato a ogni change set, aggiungendo automaticamente i file deployabili ancora non passati in produzione.
- Nessuna query strutturale DB richiesta per questo deploy.
