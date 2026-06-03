<?php

// Usage:
// php import_dbjson_to_mysql.php
// Requires MYSQL_HOST, MYSQL_PORT, MYSQL_DB, MYSQL_USER, MYSQL_PASS in .env or environment.

function load_env_file($path)
{
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) continue;
        $eqPos = strpos($line, '=');
        if ($eqPos === false) continue;
        $k = trim(substr($line, 0, $eqPos));
        $v = trim(substr($line, $eqPos + 1));
        if ($k === '') continue;
        if (getenv($k) === false) putenv($k . '=' . $v);
    }
}

load_env_file(__DIR__ . DIRECTORY_SEPARATOR . '.env');

$host = getenv('MYSQL_HOST');
$port = getenv('MYSQL_PORT') ? intval(getenv('MYSQL_PORT')) : 3306;
$dbName = getenv('MYSQL_DB');
$user = getenv('MYSQL_USER');
$pass = getenv('MYSQL_PASS') ? getenv('MYSQL_PASS') : '';

if (!$host || !$dbName || !$user) {
    fwrite(STDERR, "Missing MYSQL_HOST/MYSQL_DB/MYSQL_USER in .env\n");
    exit(1);
}

$dbPath = __DIR__ . DIRECTORY_SEPARATOR . 'db.json';
if (!file_exists($dbPath)) {
    fwrite(STDERR, "db.json not found\n");
    exit(1);
}

$dbRaw = file_get_contents($dbPath);
$data = json_decode($dbRaw, true);
if (!is_array($data)) {
    fwrite(STDERR, "Cannot parse db.json\n");
    exit(1);
}

$conn = @mysqli_connect($host, $user, $pass, $dbName, $port);
if (!$conn) {
    fwrite(STDERR, "MySQL connect error: " . mysqli_connect_error() . "\n");
    exit(1);
}
mysqli_set_charset($conn, 'utf8');

$schemaPath = __DIR__ . DIRECTORY_SEPARATOR . 'mysql_schema_51.sql';
$schemaSql = file_get_contents($schemaPath);
if ($schemaSql === false) {
    fwrite(STDERR, "Cannot read mysql_schema_51.sql\n");
    exit(1);
}

$statements = array_filter(array_map('trim', explode(';', $schemaSql)));
foreach ($statements as $sql) {
    if (!mysqli_query($conn, $sql)) {
        fwrite(STDERR, "Schema error: " . mysqli_error($conn) . "\n");
        exit(1);
    }
}

mysqli_autocommit($conn, false);
$ok = true;

$cleanup = array(
    "DELETE FROM incident_presets",
    "DELETE FROM tickets",
    "DELETE FROM incidents",
    "DELETE FROM categories",
    "DELETE FROM app_users"
);
foreach ($cleanup as $q) {
    if (!mysqli_query($conn, $q)) { $ok = false; break; }
}

if ($ok) {
    $order = 1;
    $categories = isset($data['categories']) && is_array($data['categories']) ? $data['categories'] : array();
    foreach ($categories as $c) {
        $id = intval($c['id']);
        $name = mysqli_real_escape_string($conn, isset($c['name']) ? $c['name'] : '');
        if (!mysqli_query($conn, "INSERT INTO categories (id,name,sort_order) VALUES ($id,'$name',$order)")) { $ok = false; break; }
        $order++;
    }
}

if ($ok) {
    $byCat = array();
    $incidents = isset($data['incidents']) && is_array($data['incidents']) ? $data['incidents'] : array();
    foreach ($incidents as $i) {
        $cat = intval($i['category_id']);
        if (!isset($byCat[$cat])) $byCat[$cat] = 0;
        $byCat[$cat]++;
        $id = intval($i['id']);
        $name = mysqli_real_escape_string($conn, isset($i['name']) ? $i['name'] : '');
        $sev = isset($i['severity_default']) ? intval($i['severity_default']) : 1;
        $mode = mysqli_real_escape_string($conn, isset($i['severity_mode']) ? $i['severity_mode'] : 'default');
        $fab = mysqli_real_escape_string($conn, isset($i['fab_default']) ? $i['fab_default'] : '');
        $so = intval($byCat[$cat]);
        if (!mysqli_query($conn, "INSERT INTO incidents (id,category_id,name,severity_default,severity_mode,fab_default,sort_order) VALUES ($id,$cat,'$name',$sev,'$mode','$fab',$so)")) { $ok = false; break; }
        $presets = isset($i['presets']) && is_array($i['presets']) ? $i['presets'] : array();
        $po = 1;
        foreach ($presets as $p) {
            $pt = mysqli_real_escape_string($conn, $p);
            if (!mysqli_query($conn, "INSERT INTO incident_presets (incident_id,text,sort_order) VALUES ($id,'$pt',$po)")) { $ok = false; break; }
            $po++;
        }
        if (!$ok) break;
    }
}

if ($ok) {
    $users = isset($data['users']) && is_array($data['users']) ? $data['users'] : array(
        array('id' => 1, 'username' => 'admin', 'password' => 'admin', 'role' => 'admin'),
        array('id' => 2, 'username' => 'user', 'password' => 'user', 'role' => 'user')
    );
    foreach ($users as $u) {
        $id = intval($u['id']);
        $un = mysqli_real_escape_string($conn, $u['username']);
        $pw = mysqli_real_escape_string($conn, $u['password']);
        $rl = mysqli_real_escape_string($conn, $u['role']);
        if (!mysqli_query($conn, "INSERT INTO app_users (id,username,password,role) VALUES ($id,'$un','$pw','$rl')")) { $ok = false; break; }
    }
}

if ($ok) {
    $incidentNameToId = array();
    $incidents = isset($data['incidents']) && is_array($data['incidents']) ? $data['incidents'] : array();
    foreach ($incidents as $i) {
        $incidentNameToId[isset($i['name']) ? $i['name'] : ''] = intval($i['id']);
    }

    $tickets = isset($data['tickets']) && is_array($data['tickets']) ? $data['tickets'] : array();
    foreach ($tickets as $t) {
        $id = intval($t['id']);
        $incidentId = isset($t['incident_id']) ? intval($t['incident_id']) : 0;
        if ($incidentId <= 0) {
            $incidentName = isset($t['incident_name']) ? $t['incident_name'] : '';
            $incidentId = isset($incidentNameToId[$incidentName]) ? intval($incidentNameToId[$incidentName]) : 0;
        }
        if ($incidentId <= 0) continue;
        $de = mysqli_real_escape_string($conn, isset($t['description']) ? $t['description'] : '');
        $fa = mysqli_real_escape_string($conn, isset($t['fab']) ? $t['fab'] : '');
        $ca = mysqli_real_escape_string($conn, isset($t['created_at']) ? $t['created_at'] : gmdate('c'));
        $se = isset($t['severity']) ? intval($t['severity']) : 1;
        $ou = (isset($t['owner_user_id']) && $t['owner_user_id'] !== null) ? intval($t['owner_user_id']) : 'NULL';
        if (!mysqli_query($conn, "INSERT INTO tickets (id,incident_id,description,fab,created_at,severity,owner_user_id) VALUES ($id,$incidentId,'$de','$fa','$ca',$se,$ou)")) { $ok = false; break; }
    }
}

if ($ok) {
    mysqli_commit($conn);
    echo "Import completed.\n";
} else {
    mysqli_rollback($conn);
    fwrite(STDERR, "Import failed: " . mysqli_error($conn) . "\n");
    exit(1);
}

mysqli_autocommit($conn, true);
mysqli_close($conn);
