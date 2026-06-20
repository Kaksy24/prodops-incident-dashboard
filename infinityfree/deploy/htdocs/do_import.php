<?php
// TEMPORARY - delete after use
$cfg = include __DIR__ . '/backend/config.php';
$host = $cfg['MYSQL_HOST'];
$port = isset($cfg['MYSQL_PORT']) ? intval($cfg['MYSQL_PORT']) : 3306;
$dbName = $cfg['MYSQL_DB'];
$user = $cfg['MYSQL_USER'];
$pass = $cfg['MYSQL_PASS'];

$dbPath = __DIR__ . '/data/db.json';
$schemaPath = __DIR__ . '/data/mysql_schema_51.sql';

if (!file_exists($dbPath)) { die('db.json non trovato'); }
$data = json_decode(file_get_contents($dbPath), true);
if (!is_array($data)) { die('db.json non valido'); }

$conn = @mysqli_connect($host, $user, $pass, $dbName, $port);
if (!$conn) { die('Connessione MySQL fallita: ' . mysqli_connect_error()); }
mysqli_set_charset($conn, 'utf8');

$schemaSql = file_get_contents($schemaPath);
foreach (array_filter(array_map('trim', explode(';', $schemaSql))) as $sql) {
    @mysqli_query($conn, $sql);
}

mysqli_autocommit($conn, false);
$ok = true;
$log = array();

foreach (array("DELETE FROM app_settings","DELETE FROM incident_presets","DELETE FROM tickets","DELETE FROM incidents","DELETE FROM categories","DELETE FROM app_users") as $q) {
    if (!mysqli_query($conn, $q)) { $ok = false; $log[] = 'DELETE error: ' . mysqli_error($conn); break; }
}

if ($ok) {
    $order = 1;
    foreach ((isset($data['categories']) ? $data['categories'] : array()) as $c) {
        $id = intval($c['id']);
        $name = mysqli_real_escape_string($conn, $c['name']);
        $hidden = !empty($c['hidden']) ? 1 : 0;
        if (!mysqli_query($conn, "INSERT INTO categories (id,name,hidden,sort_order) VALUES ($id,'$name',$hidden,$order)")) { $ok = false; $log[] = 'cat error: ' . mysqli_error($conn); break; }
        $order++;
    }
    $log[] = 'Categorie: ' . (isset($data['categories']) ? count($data['categories']) : 0);
}

if ($ok) {
    $byCat = array();
    foreach ((isset($data['incidents']) ? $data['incidents'] : array()) as $i) {
        $cat = intval($i['category_id']);
        if (!isset($byCat[$cat])) $byCat[$cat] = 0;
        $byCat[$cat]++;
        $id = intval($i['id']); $name = mysqli_real_escape_string($conn, $i['name']);
        $sev = isset($i['severity_default']) ? intval($i['severity_default']) : 1;
        $mode = mysqli_real_escape_string($conn, isset($i['severity_mode']) ? $i['severity_mode'] : 'default');
        $fab = mysqli_real_escape_string($conn, isset($i['fab_default']) ? $i['fab_default'] : '');
        $hidden = !empty($i['hidden']) ? 1 : 0;
        $so = intval($byCat[$cat]);
        if (!mysqli_query($conn, "INSERT INTO incidents (id,category_id,name,hidden,severity_default,severity_mode,fab_default,sort_order) VALUES ($id,$cat,'$name',$hidden,$sev,'$mode','$fab',$so)")) { $ok = false; $log[] = 'inc error: ' . mysqli_error($conn); break; }
        foreach ((isset($i['presets']) ? $i['presets'] : array()) as $po => $p) {
            $pt = mysqli_real_escape_string($conn, $p);
            if (!mysqli_query($conn, "INSERT INTO incident_presets (incident_id,text,sort_order) VALUES ($id,'$pt',".($po+1).")")) { $ok = false; break; }
        }
        if (!$ok) break;
    }
    $log[] = 'Incidents: ' . (isset($data['incidents']) ? count($data['incidents']) : 0);
}

if ($ok) {
    $users = isset($data['users']) ? $data['users'] : array();
    foreach ($users as $u) {
        $id = intval($u['id']);
        $un = mysqli_real_escape_string($conn, $u['username']);
        $pw = mysqli_real_escape_string($conn, $u['password']);
        $rl = mysqli_real_escape_string($conn, $u['role']);
        $tm = mysqli_real_escape_string($conn, isset($u['team']) ? strtoupper(trim($u['team'])) : 'A');
        if (!mysqli_query($conn, "INSERT INTO app_users (id,username,password,role,team) VALUES ($id,'$un','$pw','$rl','$tm')")) { $ok = false; $log[] = 'user error: ' . mysqli_error($conn); break; }
    }
    $log[] = 'Utenti: ' . count($users);
}

if ($ok) {
    $incMap = array();
    foreach ((isset($data['incidents']) ? $data['incidents'] : array()) as $i) $incMap[$i['name']] = intval($i['id']);
    $tickets = isset($data['tickets']) ? $data['tickets'] : array();
    foreach ($tickets as $t) {
        $id = intval($t['id']);
        $incidentId = isset($t['incident_id']) ? intval($t['incident_id']) : 0;
        if ($incidentId <= 0 && isset($t['incident_name'])) $incidentId = isset($incMap[$t['incident_name']]) ? $incMap[$t['incident_name']] : 0;
        if ($incidentId <= 0) continue;
        $de = mysqli_real_escape_string($conn, isset($t['description']) ? $t['description'] : '');
        $fa = mysqli_real_escape_string($conn, isset($t['fab']) ? $t['fab'] : '');
        $ca = mysqli_real_escape_string($conn, isset($t['created_at']) ? $t['created_at'] : gmdate('c'));
        $se = isset($t['severity']) ? intval($t['severity']) : 1;
        $ou = (isset($t['owner_user_id']) && $t['owner_user_id'] !== null) ? intval($t['owner_user_id']) : 'NULL';
        $ot = mysqli_real_escape_string($conn, isset($t['owner_team']) ? strtoupper(trim($t['owner_team'])) : 'A');
        if (!mysqli_query($conn, "INSERT INTO tickets (id,incident_id,description,fab,created_at,severity,owner_user_id,owner_team) VALUES ($id,$incidentId,'$de','$fa','$ca',$se,$ou,'$ot')")) { $ok = false; $log[] = 'ticket error: ' . mysqli_error($conn); break; }
    }
    $log[] = 'Ticket: ' . count($tickets);
}

if ($ok) {
    mysqli_commit($conn);
    echo '<b>Import completato.</b><br>' . implode('<br>', $log);
} else {
    mysqli_rollback($conn);
    echo '<b>Import FALLITO.</b><br>' . implode('<br>', $log);
}
mysqli_close($conn);
