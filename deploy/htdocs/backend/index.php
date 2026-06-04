<?php

date_default_timezone_set('Europe/Rome');
if (function_exists('mysqli_report')) {
    mysqli_report(MYSQLI_REPORT_OFF);
}

define('DB_PATH', __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'db.json');
define('AUTH_COOKIE', 'prodops_auth');
define('AUTH_TTL_SECONDS', 8 * 60 * 60);

$fabs = array('M5', 'L1', 'EWS', 'WSIC', 'NRK');
$defaultUsers = array(
    array('id' => 1, 'username' => 'admin', 'password' => 'admin', 'role' => 'admin', 'team' => 'A'),
    array('id' => 2, 'username' => 'user', 'password' => 'user', 'role' => 'user', 'team' => 'B')
);

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
        if (getenv($k) === false) {
            putenv($k . '=' . $v);
            $_ENV[$k] = $v;
        }
    }
}

load_env_file(__DIR__ . DIRECTORY_SEPARATOR . '.env');

function load_runtime_config_file($path)
{
    if (!file_exists($path)) return;
    $config = include $path;
    if (!is_array($config)) return;
    foreach ($config as $key => $value) {
        $key = trim(strval($key));
        if ($key === '') continue;
        if (getenv($key) === false || getenv($key) === '') {
            putenv($key . '=' . strval($value));
            $_ENV[$key] = strval($value);
        }
    }
}

load_runtime_config_file(__DIR__ . DIRECTORY_SEPARATOR . 'config.php');
load_runtime_config_file(__DIR__ . DIRECTORY_SEPARATOR . 'config.local.php');

function is_local_dev_host()
{
    $host = isset($_SERVER['HTTP_HOST']) ? strtolower(strval($_SERVER['HTTP_HOST'])) : '';
    return strpos($host, '127.0.0.1:5500') === 0 || strpos($host, 'localhost:5500') === 0;
}

function runtime_config_values()
{
    static $config = null;
    if ($config !== null) return $config;
    $config = array();
    $paths = array(
        __DIR__ . DIRECTORY_SEPARATOR . 'config.php',
        __DIR__ . DIRECTORY_SEPARATOR . 'config.local.php'
    );
    foreach ($paths as $path) {
        if (!file_exists($path)) continue;
        $loaded = include $path;
        if (is_array($loaded)) {
            foreach ($loaded as $key => $value) {
                $key = trim(strval($key));
                if ($key !== '' && !isset($config[$key])) {
                    $config[$key] = strval($value);
                }
            }
        }
    }
    return $config;
}

function remote_api_base()
{
    $base = getenv('REMOTE_API_BASE');
    return $base ? rtrim($base, '/') : '';
}

function supabase_enabled()
{
    $url = getenv('SUPABASE_URL');
    $key = getenv('SUPABASE_SERVICE_ROLE_KEY');
    return $url && $key;
}

function env_first($keys)
{
    foreach ($keys as $key) {
        $value = getenv($key);
        if ($value !== false && $value !== '') return $value;
    }
    return false;
}

function normalize_team($team)
{
    $team = strtoupper(trim(strval($team)));
    $allowed = array('A', 'B', 'C', 'D', 'E');
    return in_array($team, $allowed, true) ? $team : 'A';
}

function default_ui_colors()
{
    return array(
        'charts' => array(
            'fabDay' => array('light' => '#0c5f8c', 'dark' => '#24a0d8'),
            'catDay' => array('light' => '#16a0b6', 'dark' => '#2ec4d6'),
            'fabYear' => array('light' => '#355a84', 'dark' => '#1fb6ff'),
            'catYear' => array('light' => '#6b4ea6', 'dark' => '#9b6cff'),
            'teamYear' => array('light' => '#d97706', 'dark' => '#f59e0b'),
            'severityYear' => array('light' => '#be185d', 'dark' => '#ec4899')
        ),
        'bars' => array(),
        'labels' => array(
            'categories' => array('light' => array(), 'dark' => array()),
            'fabs' => array('light' => array(), 'dark' => array()),
            'teams' => array('light' => array(), 'dark' => array()),
            'severities' => array('light' => array(), 'dark' => array())
        )
    );
}

function sanitize_hex_color($value)
{
    $value = trim(strval($value));
    return preg_match('/^#[0-9a-fA-F]{6}$/', $value) ? strtoupper($value) : '';
}

function normalize_ui_colors($colors)
{
    $defaults = default_ui_colors();
    if (!is_array($colors)) return $defaults;

    $out = $defaults;
    foreach ($defaults['charts'] as $key => $themeMap) {
        if (!isset($colors['charts'][$key]) || !is_array($colors['charts'][$key])) continue;
        foreach (array('light', 'dark') as $theme) {
            $color = sanitize_hex_color(isset($colors['charts'][$key][$theme]) ? $colors['charts'][$key][$theme] : '');
            if ($color !== '') $out['charts'][$key][$theme] = $color;
        }
    }

    $groupDefaults = array('categories', 'fabs', 'teams', 'severities');
    foreach ($groupDefaults as $group) {
        foreach (array('light', 'dark') as $theme) {
            if (!isset($colors['labels'][$group][$theme]) || !is_array($colors['labels'][$group][$theme])) continue;
            foreach ($colors['labels'][$group][$theme] as $label => $color) {
                $cleanLabel = trim(strval($label));
                $cleanColor = sanitize_hex_color($color);
                if ($cleanLabel !== '' && $cleanColor !== '') {
                    $out['labels'][$group][$theme][$cleanLabel] = $cleanColor;
                }
            }
        }
    }

    if (isset($colors['bars']) && is_array($colors['bars'])) {
        foreach ($colors['bars'] as $chartKey => $themeMap) {
            $cleanChartKey = trim(strval($chartKey));
            if ($cleanChartKey === '') continue;
            if (!isset($out['bars'][$cleanChartKey])) $out['bars'][$cleanChartKey] = array('light' => array(), 'dark' => array());
            if (!is_array($themeMap)) continue;
            foreach (array('light', 'dark') as $theme) {
                if (!isset($themeMap[$theme]) || !is_array($themeMap[$theme])) continue;
                foreach ($themeMap[$theme] as $label => $color) {
                    $cleanLabel = trim(strval($label));
                    $cleanColor = sanitize_hex_color($color);
                    if ($cleanLabel !== '' && $cleanColor !== '') {
                        $out['bars'][$cleanChartKey][$theme][$cleanLabel] = $cleanColor;
                    }
                }
            }
        }
    }
    return $out;
}

function user_by_id($users, $userId)
{
    $userId = intval($userId);
    foreach ($users as $user) {
        if (intval($user['id']) === $userId) return $user;
    }
    return null;
}

function supabase_base_url()
{
    return rtrim(getenv('SUPABASE_URL'), '/') . '/rest/v1';
}

function supabase_headers($extra)
{
    $key = getenv('SUPABASE_SERVICE_ROLE_KEY');
    $headers = array('Content-Type: application/json');
    // For new sb_secret keys, use Authorization header only.
    if (strpos($key, 'sb_secret_') === 0) {
        $headers[] = 'Authorization: Bearer ' . $key;
    } else {
        $headers[] = 'apikey: ' . $key;
        $headers[] = 'Authorization: Bearer ' . $key;
    }
    foreach ($extra as $h) $headers[] = $h;
    return $headers;
}

function supabase_request($method, $path, $query, $body, $headers)
{
    if (!supabase_enabled()) return array('ok' => false, 'status' => 0, 'data' => null, 'error' => 'Supabase non configurato');
    $url = supabase_base_url() . '/' . ltrim($path, '/');
    if ($query) $url .= '?' . $query;
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
        if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        curl_setopt($ch, CURLOPT_HTTPHEADER, supabase_headers($headers));
        $raw = curl_exec($ch);
        $status = intval(curl_getinfo($ch, CURLINFO_HTTP_CODE));
        $err = curl_error($ch);
        curl_close($ch);
        if ($raw === false) return array('ok' => false, 'status' => $status, 'data' => null, 'error' => $err);
    } else {
        $opts = array(
            'http' => array(
                'method' => strtoupper($method),
                'header' => implode("\r\n", supabase_headers($headers)),
                'ignore_errors' => true
            )
        );
        if ($body !== null) $opts['http']['content'] = json_encode($body);
        $ctx = stream_context_create($opts);
        $raw = @file_get_contents($url, false, $ctx);
        $status = 0;
        if (isset($http_response_header) && is_array($http_response_header) && count($http_response_header)) {
            if (preg_match('#\s(\d{3})\s#', $http_response_header[0], $m)) $status = intval($m[1]);
        }
        if ($raw === false) return array('ok' => false, 'status' => $status, 'data' => null, 'error' => 'HTTP request failed');
    }
    $decoded = json_decode($raw, true);
    $ok = $status >= 200 && $status < 300;
    if (!$ok && !is_array($decoded)) $decoded = array('message' => $raw);
    return array('ok' => $ok, 'status' => $status, 'data' => $decoded, 'error' => $ok ? null : (isset($decoded['message']) ? $decoded['message'] : 'Supabase error'));
}

function sb_select($table, $select, $filters, $order)
{
    $parts = array('select=' . rawurlencode($select));
    foreach ($filters as $f) $parts[] = $f;
    if ($order) $parts[] = 'order=' . rawurlencode($order);
    return supabase_request('GET', $table, implode('&', $parts), null, array());
}

function sb_insert($table, $payload, $single)
{
    $headers = array('Prefer: return=representation');
    if ($single) $headers[] = 'Accept: application/vnd.pgrst.object+json';
    return supabase_request('POST', $table, '', $payload, $headers);
}

function sb_update($table, $filters, $payload, $single)
{
    $query = implode('&', $filters);
    $headers = array('Prefer: return=representation');
    if ($single) $headers[] = 'Accept: application/vnd.pgrst.object+json';
    return supabase_request('PATCH', $table, $query, $payload, $headers);
}

function sb_delete($table, $filters)
{
    $query = implode('&', $filters);
    return supabase_request('DELETE', $table, $query, null, array());
}

function supabase_bootstrap_if_needed($db)
{
    static $done = false;
    if ($done || !supabase_enabled()) return;
    $done = true;

    $cats = sb_select('categories', 'id', array('limit=1'), '');
    if ($cats['ok'] && is_array($cats['data']) && count($cats['data']) === 0 && count($db['categories'])) {
        $payload = array();
        $order = 1;
        foreach ($db['categories'] as $c) {
            $payload[] = array('id' => intval($c['id']), 'name' => $c['name'], 'sort_order' => $order++);
        }
        sb_insert('categories', $payload, false);
    }

    $incs = sb_select('incidents', 'id', array('limit=1'), '');
    if ($incs['ok'] && is_array($incs['data']) && count($incs['data']) === 0 && count($db['incidents'])) {
        $payload = array();
        foreach ($db['incidents'] as $i) {
            $payload[] = array(
                'id' => intval($i['id']),
                'category_id' => intval($i['category_id']),
                'name' => $i['name'],
                'sort_order' => intval($i['id'])
            );
        }
        sb_insert('incidents', $payload, false);
    }

    $tickets = sb_select('tickets', 'id', array('limit=1'), '');
    if ($tickets['ok'] && is_array($tickets['data']) && count($tickets['data']) === 0 && count($db['tickets'])) {
        $payload = array();
        foreach ($db['tickets'] as $t) {
            $payload[] = array(
                'id' => intval($t['id']),
                'incident_name' => isset($t['incident_name']) ? $t['incident_name'] : '',
                'description' => isset($t['description']) ? $t['description'] : '',
                'fab' => isset($t['fab']) ? $t['fab'] : '',
                'created_at' => isset($t['created_at']) ? $t['created_at'] : gmdate('c'),
                'severity' => isset($t['severity']) ? intval($t['severity']) : 1,
                'owner_team' => normalize_team(isset($t['owner_team']) ? $t['owner_team'] : 'A')
            );
        }
        sb_insert('tickets', $payload, false);
    }

    $users = sb_select('app_users', 'id', array('limit=1'), '');
    if ($users['ok'] && is_array($users['data']) && count($users['data']) === 0 && count($db['users'])) {
        $payload = array();
        foreach ($db['users'] as $u) {
            $payload[] = array(
                'id' => intval($u['id']),
                'username' => $u['username'],
                'password' => $u['password'],
                'role' => $u['role'],
                'team' => normalize_team(isset($u['team']) ? $u['team'] : 'A')
            );
        }
        sb_insert('app_users', $payload, false);
    }
}

function json_response($data, $status)
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

function read_json_body()
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return array();
    }
    $parsed = json_decode($raw, true);
    return is_array($parsed) ? $parsed : array();
}

function proxy_remote_api_request($path, $method, $payload)
{
    $base = remote_api_base();
    if ($base === '') return false;

    $url = $base . $path;
    if (isset($_SERVER['QUERY_STRING']) && $_SERVER['QUERY_STRING'] !== '') {
        $url .= '?' . $_SERVER['QUERY_STRING'];
    }

    if (!function_exists('curl_init')) return false;

    $headers = array('Content-Type: application/json');
    if (isset($_COOKIE[AUTH_COOKIE]) && $_COOKIE[AUTH_COOKIE] !== '') {
        $headers[] = 'Cookie: ' . AUTH_COOKIE . '=' . $_COOKIE[AUTH_COOKIE];
    }

    $responseHeaders = array();
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    curl_setopt($ch, CURLOPT_HEADERFUNCTION, function($curl, $headerLine) use (&$responseHeaders) {
        $trimmed = trim($headerLine);
        if ($trimmed !== '') $responseHeaders[] = $trimmed;
        return strlen($headerLine);
    });
    if ($payload !== null && strtoupper($method) !== 'GET') {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $body = curl_exec($ch);
    $status = intval(curl_getinfo($ch, CURLINFO_HTTP_CODE));
    $error = curl_error($ch);
    curl_close($ch);

    if ($body === false) {
        http_response_code(502);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(array('error' => $error ? $error : 'Proxy error'));
        exit;
    }

    if ($path === '/api/login' && $status >= 200 && $status < 300) {
        $decoded = json_decode($body, true);
        if (is_array($decoded) && isset($decoded['id'])) {
            set_auth_cookie(array(
                'id' => intval($decoded['id']),
                'username' => isset($decoded['username']) ? $decoded['username'] : '',
                'role' => isset($decoded['role']) ? $decoded['role'] : 'user',
                'team' => isset($decoded['team']) ? $decoded['team'] : 'A'
            ));
        }
    }

    if ($path === '/api/logout') {
        clear_auth_cookie();
    }

    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo $body;
    exit;
}

function mysql_enabled()
{
    $cfg = runtime_config_values();
    $host = env_first(array('MYSQL_HOST', 'MYSQLHOST'));
    if ($host === false && isset($cfg['MYSQL_HOST'])) $host = $cfg['MYSQL_HOST'];
    $db = env_first(array('MYSQL_DB', 'MYSQLDATABASE'));
    if ($db === false && isset($cfg['MYSQL_DB'])) $db = $cfg['MYSQL_DB'];
    $user = env_first(array('MYSQL_USER', 'MYSQLUSER'));
    if ($user === false && isset($cfg['MYSQL_USER'])) $user = $cfg['MYSQL_USER'];
    return $host && $db && $user;
}

function mysql_conn()
{
    static $conn = null;
    if ($conn !== null) return $conn;
    if (!mysql_enabled() || !function_exists('mysqli_connect')) return null;
    $cfg = runtime_config_values();
    $host = env_first(array('MYSQL_HOST', 'MYSQLHOST'));
    if ($host === false && isset($cfg['MYSQL_HOST'])) $host = $cfg['MYSQL_HOST'];
    $portValue = env_first(array('MYSQL_PORT', 'MYSQLPORT'));
    if ($portValue === false && isset($cfg['MYSQL_PORT'])) $portValue = $cfg['MYSQL_PORT'];
    $port = intval($portValue ? $portValue : 3306);
    $user = env_first(array('MYSQL_USER', 'MYSQLUSER'));
    if ($user === false && isset($cfg['MYSQL_USER'])) $user = $cfg['MYSQL_USER'];
    $pass = env_first(array('MYSQL_PASS', 'MYSQLPASSWORD', 'MYSQL_ROOT_PASSWORD'));
    if ($pass === false && isset($cfg['MYSQL_PASS'])) $pass = $cfg['MYSQL_PASS'];
    if ($pass === false) $pass = '';
    $db = env_first(array('MYSQL_DB', 'MYSQLDATABASE'));
    if ($db === false && isset($cfg['MYSQL_DB'])) $db = $cfg['MYSQL_DB'];
    $useSsl = ($port === 443 || strpos($host, 'railway.app') !== false);
    $conn = @mysqli_init();
    if (!$conn) return null;
    @mysqli_options($conn, MYSQLI_OPT_CONNECT_TIMEOUT, 5);
    if (defined('MYSQLI_SET_CHARSET_NAME')) @mysqli_options($conn, MYSQLI_SET_CHARSET_NAME, 'utf8');
    if (defined('MYSQLI_INIT_COMMAND')) @mysqli_options($conn, MYSQLI_INIT_COMMAND, 'SET NAMES utf8');
    if ($useSsl) {
        @mysqli_ssl_set($conn, null, null, null, null, null);
    }
    $flags = $useSsl ? MYSQLI_CLIENT_SSL : 0;
    if ($useSsl && defined('MYSQLI_CLIENT_SSL_DONT_VERIFY_SERVER_CERT')) {
        $flags |= MYSQLI_CLIENT_SSL_DONT_VERIFY_SERVER_CERT;
    }
    $ok = @mysqli_real_connect($conn, $host, $user, $pass, $db, $port, null, $flags);
    if (!$ok && $db && function_exists('mysqli_connect_errno') && mysqli_connect_errno() === 1049) {
        $conn = @mysqli_init();
        if (!$conn) return null;
        @mysqli_options($conn, MYSQLI_OPT_CONNECT_TIMEOUT, 5);
        if (defined('MYSQLI_SET_CHARSET_NAME')) @mysqli_options($conn, MYSQLI_SET_CHARSET_NAME, 'utf8');
        if (defined('MYSQLI_INIT_COMMAND')) @mysqli_options($conn, MYSQLI_INIT_COMMAND, 'SET NAMES utf8');
        if ($useSsl) {
            @mysqli_ssl_set($conn, null, null, null, null, null);
        }
        $flags = $useSsl ? MYSQLI_CLIENT_SSL : 0;
        if ($useSsl && defined('MYSQLI_CLIENT_SSL_DONT_VERIFY_SERVER_CERT')) {
            $flags |= MYSQLI_CLIENT_SSL_DONT_VERIFY_SERVER_CERT;
        }
        $ok = @mysqli_real_connect($conn, $host, $user, $pass, '', $port, null, $flags);
        if ($ok) {
            @mysqli_query($conn, "CREATE DATABASE IF NOT EXISTS `" . mysql_escape($conn, $db) . "` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci");
            @mysqli_select_db($conn, $db);
        }
    }
    if (!$ok) return null;
    @mysqli_set_charset($conn, 'utf8');
    return $conn;
}

function mysql_db_snapshot($conn)
{
    $snapshot = array(
        'connected' => false,
        'server_version' => null,
        'database' => null,
        'tables' => array()
    );
    if (!$conn) return $snapshot;

    $snapshot['connected'] = true;
    if (function_exists('mysqli_get_server_info')) {
        $snapshot['server_version'] = @mysqli_get_server_info($conn);
    }
    if (function_exists('mysqli_query')) {
        $dbName = env_first(array('MYSQL_DB', 'MYSQLDATABASE'));
        $snapshot['database'] = $dbName !== false ? $dbName : null;
        $tables = array('app_users', 'app_settings', 'categories', 'incidents', 'incident_presets', 'tickets');
        foreach ($tables as $table) {
            $count = null;
            $safeTable = '`' . str_replace('`', '``', $table) . '`';
            $result = @mysqli_query($conn, "SELECT COUNT(*) AS c FROM " . $safeTable);
            if ($result) {
                $row = @mysqli_fetch_assoc($result);
                if (is_array($row) && isset($row['c'])) {
                    $count = intval($row['c']);
                }
                @mysqli_free_result($result);
            }
            $snapshot['tables'][$table] = $count;
        }
    }
    return $snapshot;
}

function mysql_ensure_schema($conn)
{
    $schemaPath = __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'mysql_schema_51.sql';
    if (!file_exists($schemaPath)) return false;
    $sql = file_get_contents($schemaPath);
    if ($sql === false || trim($sql) === '') return false;
    $parts = explode(';', $sql);
    foreach ($parts as $part) {
        $statement = trim($part);
        if ($statement === '') continue;
        if (!mysqli_query($conn, $statement)) {
            return false;
        }
    }
    $alterStatements = array(
        "CREATE TABLE IF NOT EXISTS app_settings (setting_key VARCHAR(80) NOT NULL, setting_value LONGTEXT NOT NULL, PRIMARY KEY (setting_key)) ENGINE=InnoDB DEFAULT CHARSET=utf8",
        "ALTER TABLE app_users ADD COLUMN team VARCHAR(1) NOT NULL DEFAULT 'A' AFTER role",
        "ALTER TABLE tickets ADD COLUMN owner_team VARCHAR(1) NOT NULL DEFAULT 'A' AFTER owner_user_id"
    );
    foreach ($alterStatements as $statement) {
        if (@mysqli_query($conn, $statement)) continue;
        $errno = function_exists('mysqli_errno') ? @mysqli_errno($conn) : 0;
        if ($errno !== 1060) {
            return false;
        }
    }
    return true;
}

function mysql_escape($conn, $value)
{
    return mysqli_real_escape_string($conn, strval($value));
}

function mysql_load_db($defaultUsers)
{
    $conn = mysql_conn();
    if (!$conn) return null;
    mysql_ensure_schema($conn);

    $db = array(
        'categories' => array(),
        'incidents' => array(),
        'tickets' => array(),
        'users' => array(),
        'ui_colors' => default_ui_colors(),
        'counters' => array('category' => 0, 'incident' => 0, 'ticket' => 0, 'user' => 0)
    );

    $presetsByIncident = array();
    $rp = @mysqli_query($conn, "SELECT incident_id, text FROM incident_presets ORDER BY incident_id ASC, sort_order ASC, id ASC");
    if ($rp) {
        while ($row = mysqli_fetch_assoc($rp)) {
            $iid = intval($row['incident_id']);
            if (!isset($presetsByIncident[$iid])) $presetsByIncident[$iid] = array();
            $presetsByIncident[$iid][] = $row['text'];
        }
        mysqli_free_result($rp);
    }

    $rc = @mysqli_query($conn, "SELECT id, name, sort_order FROM categories ORDER BY sort_order ASC, id ASC");
    if ($rc) {
        while ($row = mysqli_fetch_assoc($rc)) {
            $db['categories'][] = array(
                'id' => intval($row['id']),
                'name' => $row['name'],
                'sort_order' => intval($row['sort_order'])
            );
        }
        mysqli_free_result($rc);
    }

    $ri = @mysqli_query($conn, "SELECT id, category_id, name, severity_default, severity_mode, fab_default, sort_order FROM incidents ORDER BY sort_order ASC, id ASC");
    if ($ri) {
        while ($row = mysqli_fetch_assoc($ri)) {
            $iid = intval($row['id']);
            $db['incidents'][] = array(
                'id' => $iid,
                'category_id' => intval($row['category_id']),
                'name' => $row['name'],
                'severity_default' => intval($row['severity_default'] ? $row['severity_default'] : 1),
                'severity_mode' => $row['severity_mode'] ? $row['severity_mode'] : 'default',
                'fab_default' => $row['fab_default'] ? $row['fab_default'] : '',
                'sort_order' => intval($row['sort_order']),
                'presets' => isset($presetsByIncident[$iid]) ? $presetsByIncident[$iid] : array()
            );
        }
        mysqli_free_result($ri);
    }

    $incidentNameById = array();
    foreach ($db['incidents'] as $incRow) $incidentNameById[intval($incRow['id'])] = $incRow['name'];

    $rt = @mysqli_query($conn, "SELECT id, incident_id, description, fab, created_at, severity, owner_user_id, owner_team FROM tickets ORDER BY id ASC");
    if ($rt) {
        while ($row = mysqli_fetch_assoc($rt)) {
            $iid = intval($row['incident_id']);
            $db['tickets'][] = array(
                'id' => intval($row['id']),
                'incident_id' => $iid,
                'incident_name' => isset($incidentNameById[$iid]) ? $incidentNameById[$iid] : '',
                'description' => $row['description'],
                'fab' => $row['fab'],
                'created_at' => $row['created_at'],
                'severity' => intval($row['severity'] ? $row['severity'] : 1),
                'owner_user_id' => $row['owner_user_id'] !== null ? intval($row['owner_user_id']) : null,
                'owner_team' => normalize_team(isset($row['owner_team']) ? $row['owner_team'] : 'A')
            );
        }
        mysqli_free_result($rt);
    }

    $ru = @mysqli_query($conn, "SELECT id, username, password, role, team FROM app_users ORDER BY id ASC");
    if ($ru) {
        while ($row = mysqli_fetch_assoc($ru)) {
            $db['users'][] = array(
                'id' => intval($row['id']),
                'username' => $row['username'],
                'password' => $row['password'],
                'role' => $row['role'],
                'team' => normalize_team(isset($row['team']) ? $row['team'] : 'A')
            );
        }
        mysqli_free_result($ru);
    }

    $rs = @mysqli_query($conn, "SELECT setting_value FROM app_settings WHERE setting_key = 'ui_colors' LIMIT 1");
    if ($rs) {
        if ($row = mysqli_fetch_assoc($rs)) {
            $parsed = json_decode($row['setting_value'], true);
            if (is_array($parsed)) $db['ui_colors'] = normalize_ui_colors($parsed);
        }
        mysqli_free_result($rs);
    }

    if (!count($db['users'])) $db['users'] = $defaultUsers;
    $db['counters']['category'] = max_id($db['categories']);
    $db['counters']['incident'] = max_id($db['incidents']);
    $db['counters']['ticket'] = max_id($db['tickets']);
    $db['counters']['user'] = max_id($db['users']);
    if (file_exists(DB_PATH)) {
        $json = file_exists(DB_PATH) ? file_get_contents(DB_PATH) : false;
        $seed = $json ? json_decode($json, true) : null;
        if (is_array($seed) && isset($seed['categories']) && is_array($seed['categories']) && count($seed['categories']) && count($seed['categories']) > count($db['categories'])) {
            mysql_save_db($seed);
            return $seed;
        }
    }
    return $db;
}

function mysql_save_db($db)
{
    $conn = mysql_conn();
    if (!$conn) return false;
    mysqli_autocommit($conn, false);
    $ok = true;

    $queries = array(
        "DELETE FROM app_settings",
        "DELETE FROM incident_presets",
        "DELETE FROM tickets",
        "DELETE FROM incidents",
        "DELETE FROM categories",
        "DELETE FROM app_users"
    );
    foreach ($queries as $q) {
        if (!mysqli_query($conn, $q)) {
            $ok = false;
            break;
        }
    }

    if ($ok) {
        $uiColors = normalize_ui_colors(isset($db['ui_colors']) && is_array($db['ui_colors']) ? $db['ui_colors'] : default_ui_colors());
        $uiJson = mysql_escape($conn, json_encode($uiColors));
        if (!mysqli_query($conn, "INSERT INTO app_settings (setting_key, setting_value) VALUES ('ui_colors', '$uiJson')")) { $ok = false; }
    }

    if ($ok) {
        $order = 1;
        foreach ($db['categories'] as $c) {
            $id = intval($c['id']);
            $name = mysql_escape($conn, $c['name']);
            if (!mysqli_query($conn, "INSERT INTO categories (id,name,sort_order) VALUES ($id,'$name',$order)")) { $ok = false; break; }
            $order++;
        }
    }

    if ($ok) {
        $sortByCat = array();
        foreach ($db['incidents'] as $i) {
            $cat = intval($i['category_id']);
            if (!isset($sortByCat[$cat])) $sortByCat[$cat] = 0;
            $sortByCat[$cat]++;
            $id = intval($i['id']);
            $name = mysql_escape($conn, $i['name']);
            $sev = isset($i['severity_default']) ? intval($i['severity_default']) : 1;
            $mode = mysql_escape($conn, isset($i['severity_mode']) ? $i['severity_mode'] : 'default');
            $fab = mysql_escape($conn, isset($i['fab_default']) ? $i['fab_default'] : '');
            $so = intval($sortByCat[$cat]);
            if (!mysqli_query($conn, "INSERT INTO incidents (id,category_id,name,severity_default,severity_mode,fab_default,sort_order) VALUES ($id,$cat,'$name',$sev,'$mode','" . ($fab === '' ? '' : $fab) . "',$so)")) { $ok = false; break; }

            if ($ok && isset($i['presets']) && is_array($i['presets'])) {
                $po = 1;
                foreach ($i['presets'] as $p) {
                    $pt = mysql_escape($conn, $p);
                    if (!mysqli_query($conn, "INSERT INTO incident_presets (incident_id,text,sort_order) VALUES ($id,'$pt',$po)")) { $ok = false; break; }
                    $po++;
                }
            }
            if (!$ok) break;
        }
    }

    if ($ok) {
        foreach ($db['users'] as $u) {
            $id = intval($u['id']);
            $un = mysql_escape($conn, $u['username']);
            $pw = mysql_escape($conn, $u['password']);
            $rl = mysql_escape($conn, $u['role']);
            $tm = mysql_escape($conn, isset($u['team']) ? normalize_team($u['team']) : 'A');
            if (!mysqli_query($conn, "INSERT INTO app_users (id,username,password,role,team) VALUES ($id,'$un','$pw','$rl','$tm')")) { $ok = false; break; }
        }
    }

    if ($ok) {
        $incidentNameToId = array();
        foreach ($db['incidents'] as $incRow) $incidentNameToId[$incRow['name']] = intval($incRow['id']);
        foreach ($db['tickets'] as $t) {
            $id = intval($t['id']);
            $incidentId = isset($t['incident_id']) ? intval($t['incident_id']) : 0;
            if ($incidentId <= 0 && isset($t['incident_name']) && isset($incidentNameToId[$t['incident_name']])) {
                $incidentId = intval($incidentNameToId[$t['incident_name']]);
            }
            if ($incidentId <= 0) continue;
            $de = mysql_escape($conn, isset($t['description']) ? $t['description'] : '');
            $fa = mysql_escape($conn, isset($t['fab']) ? $t['fab'] : '');
            $ca = mysql_escape($conn, isset($t['created_at']) ? $t['created_at'] : gmdate('c'));
            $se = isset($t['severity']) ? intval($t['severity']) : 1;
            $ou = (isset($t['owner_user_id']) && $t['owner_user_id'] !== null) ? intval($t['owner_user_id']) : 'NULL';
            $ot = mysql_escape($conn, isset($t['owner_team']) ? normalize_team($t['owner_team']) : 'A');
            if (!mysqli_query($conn, "INSERT INTO tickets (id,incident_id,description,fab,created_at,severity,owner_user_id,owner_team) VALUES ($id,$incidentId,'$de','$fa','$ca',$se,$ou,'$ot')")) { $ok = false; break; }
        }
    }

    if ($ok) {
        mysqli_commit($conn);
    } else {
        mysqli_rollback($conn);
    }
    mysqli_autocommit($conn, true);
    return $ok;
}

function load_db($defaultUsers)
{
    $mysqlDb = mysql_load_db($defaultUsers);
    if (is_array($mysqlDb)) return $mysqlDb;

    if (!file_exists(DB_PATH)) {
        $empty = array(
            'categories' => array(),
            'incidents' => array(),
            'tickets' => array(),
            'users' => $defaultUsers,
            'counters' => array('category' => 0, 'incident' => 0, 'ticket' => 0, 'user' => 2)
        );
        file_put_contents(DB_PATH, json_encode($empty, JSON_PRETTY_PRINT));
        return $empty;
    }
    $content = file_get_contents(DB_PATH);
    $db = json_decode($content, true);
    if (!is_array($db)) {
        $db = array();
    }
    if (!isset($db['categories']) || !is_array($db['categories'])) $db['categories'] = array();
    if (!isset($db['incidents']) || !is_array($db['incidents'])) $db['incidents'] = array();
    if (!isset($db['tickets']) || !is_array($db['tickets'])) $db['tickets'] = array();
    if (!isset($db['ui_colors']) || !is_array($db['ui_colors'])) $db['ui_colors'] = default_ui_colors();
    $db['ui_colors'] = normalize_ui_colors($db['ui_colors']);
    if (!count($db['incidents'])) {
        foreach ($db['categories'] as $categoryRow) {
            $categoryId = isset($categoryRow['id']) ? intval($categoryRow['id']) : 0;
            $nestedIncidents = isset($categoryRow['incidents']) && is_array($categoryRow['incidents']) ? $categoryRow['incidents'] : array();
            foreach ($nestedIncidents as $incidentRow) {
                $incidentRow['category_id'] = $categoryId;
                $db['incidents'][] = $incidentRow;
            }
        }
    }
    $categoryOrder = 1;
    foreach ($db['categories'] as $ci => $cat) {
        if (!isset($db['categories'][$ci]['sort_order']) || intval($db['categories'][$ci]['sort_order']) <= 0) {
            $db['categories'][$ci]['sort_order'] = $categoryOrder;
        } else {
            $db['categories'][$ci]['sort_order'] = intval($db['categories'][$ci]['sort_order']);
        }
        $categoryOrder++;
    }
    $incidentOrders = array();
    foreach ($db['incidents'] as $ii => $inc) {
        $catId = isset($inc['category_id']) ? intval($inc['category_id']) : 0;
        if (!isset($incidentOrders[$catId])) $incidentOrders[$catId] = 1;
        if (!isset($db['incidents'][$ii]['sort_order']) || intval($db['incidents'][$ii]['sort_order']) <= 0) {
            $db['incidents'][$ii]['sort_order'] = $incidentOrders[$catId];
        } else {
            $db['incidents'][$ii]['sort_order'] = intval($db['incidents'][$ii]['sort_order']);
        }
        $incidentOrders[$catId]++;
    }
    $incidentNameToId = array();
    foreach ($db['incidents'] as $inc) {
        $incidentNameToId[$inc['name']] = intval($inc['id']);
    }
    for ($ti = 0; $ti < count($db['tickets']); $ti++) {
        if (!isset($db['tickets'][$ti]['incident_id']) || intval($db['tickets'][$ti]['incident_id']) <= 0) {
            $name = isset($db['tickets'][$ti]['incident_name']) ? $db['tickets'][$ti]['incident_name'] : '';
            $db['tickets'][$ti]['incident_id'] = isset($incidentNameToId[$name]) ? intval($incidentNameToId[$name]) : 0;
        }
    }
    if (!isset($db['users']) || !is_array($db['users']) || !count($db['users'])) $db['users'] = $defaultUsers;
    foreach ($db['users'] as $ui => $userRow) {
        if (!isset($db['users'][$ui]['password']) || $db['users'][$ui]['password'] === '') {
            $db['users'][$ui]['password'] = isset($userRow['username']) ? strval($userRow['username']) : '';
        }
        if (!isset($db['users'][$ui]['team'])) $db['users'][$ui]['team'] = isset($userRow['team']) ? normalize_team($userRow['team']) : 'A';
        $db['users'][$ui]['team'] = normalize_team($db['users'][$ui]['team']);
    }
    foreach ($db['tickets'] as $ti => $ticketRow) {
        if (!isset($db['tickets'][$ti]['owner_team'])) {
            $ownerUser = isset($ticketRow['owner_user_id']) ? user_by_id($db['users'], intval($ticketRow['owner_user_id'])) : null;
            $db['tickets'][$ti]['owner_team'] = $ownerUser ? normalize_team(isset($ownerUser['team']) ? $ownerUser['team'] : 'A') : 'A';
        }
        $db['tickets'][$ti]['owner_team'] = normalize_team($db['tickets'][$ti]['owner_team']);
    }
    if (!isset($db['counters']) || !is_array($db['counters'])) $db['counters'] = array();
    if (!isset($db['counters']['category'])) $db['counters']['category'] = max_id($db['categories']);
    if (!isset($db['counters']['incident'])) $db['counters']['incident'] = max_id($db['incidents']);
    if (!isset($db['counters']['ticket'])) $db['counters']['ticket'] = max_id($db['tickets']);
    if (!isset($db['counters']['user'])) $db['counters']['user'] = max_id($db['users']);
    return $db;
}

function save_db($db)
{
    if (mysql_enabled()) {
        if (mysql_save_db($db)) return true;
    }

    $fp = fopen(DB_PATH, 'c+');
    if (!$fp) {
        return false;
    }
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return false;
    }
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($db, JSON_PRETTY_PRINT));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

function max_id($list)
{
    $max = 0;
    foreach ($list as $row) {
        $id = isset($row['id']) ? intval($row['id']) : 0;
        if ($id > $max) $max = $id;
    }
    return $max;
}

function base64url_encode($data)
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data)
{
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($data, '-_', '+/'));
}

function auth_secret()
{
    $secret = getenv('AUTH_SECRET');
    if (!$secret) $secret = 'prodops-dev-secret';
    return $secret;
}

function set_auth_cookie($user)
{
    $payload = array(
        'id' => intval($user['id']),
        'username' => $user['username'],
        'role' => $user['role'],
        'team' => normalize_team(isset($user['team']) ? $user['team'] : 'A'),
        'exp' => time() + AUTH_TTL_SECONDS
    );
    $body = base64url_encode(json_encode($payload));
    $sig = base64url_encode(hash_hmac('sha256', $body, auth_secret(), true));
    $token = $body . '.' . $sig;
    setcookie(AUTH_COOKIE, $token, time() + AUTH_TTL_SECONDS, '/', '', false, true);
}

function clear_auth_cookie()
{
    setcookie(AUTH_COOKIE, '', time() - 3600, '/', '', false, true);
}

function read_auth_user()
{
    if (!isset($_COOKIE[AUTH_COOKIE])) return null;
    $token = $_COOKIE[AUTH_COOKIE];
    if (strpos($token, '.') === false) return null;
    $parts = explode('.', $token, 2);
    $body = $parts[0];
    $sig = $parts[1];
    $expected = base64url_encode(hash_hmac('sha256', $body, auth_secret(), true));
    if (!safe_hash_equals($expected, $sig)) return null;
    $payload = json_decode(base64url_decode($body), true);
    if (!is_array($payload)) return null;
    if (!isset($payload['exp']) || time() > intval($payload['exp'])) return null;
    return array(
        'id' => intval($payload['id']),
        'username' => strval($payload['username']),
        'role' => strval($payload['role']),
        'team' => normalize_team(isset($payload['team']) ? $payload['team'] : 'A')
    );
}

function safe_hash_equals($known, $user)
{
    $known = strval($known);
    $user = strval($user);
    if (strlen($known) !== strlen($user)) return false;
    $result = 0;
    $len = strlen($known);
    for ($i = 0; $i < $len; $i++) {
        $result |= ord($known[$i]) ^ ord($user[$i]);
    }
    return $result === 0;
}

function require_api_auth($role)
{
    $user = read_auth_user();
    if (!$user) json_response(array('error' => 'Login richiesta'), 401);
    if ($role === 'admin' && $user['role'] !== 'admin') json_response(array('error' => 'Accesso admin richiesto'), 403);
    return $user;
}

function require_page_auth($role)
{
    $user = read_auth_user();
    if (!$user) {
        header('Location: /login.html');
        exit;
    }
    if ($role === 'admin' && $user['role'] !== 'admin') {
        header('Location: /index.html');
        exit;
    }
    return $user;
}

function io_window($dayOffset, $hour, $minute)
{
    $dt = new DateTime('now', new DateTimeZone('Europe/Rome'));
    if ($dayOffset !== 0) $dt->modify(($dayOffset > 0 ? '+' : '') . $dayOffset . ' day');
    $dt->setTime($hour, $minute, 0);
    return $dt;
}

function current_day_bounds()
{
    $now = new DateTime('now', new DateTimeZone('Europe/Rome'));
    $todayStart = io_window(0, 6, 10);
    if ($now >= $todayStart) {
        $start = clone $todayStart;
        $end = clone $todayStart;
        $end->modify('+1 day');
    } else {
        $end = clone $todayStart;
        $start = clone $todayStart;
        $start->modify('-1 day');
    }
    return array(
        'start' => $start->setTimezone(new DateTimeZone('UTC'))->format(DateTime::ATOM),
        'end' => $end->setTimezone(new DateTimeZone('UTC'))->format(DateTime::ATOM)
    );
}

function shift_windows()
{
    $bounds = current_day_bounds();
    $startUtc = new DateTime($bounds['start'], new DateTimeZone('UTC'));
    $morningStart = clone $startUtc;
    $morningEnd = clone $startUtc;
    $morningEnd->modify('+8 hours');
    $afternoonStart = clone $startUtc;
    $afternoonStart->modify('+8 hours');
    $afternoonEnd = clone $startUtc;
    $afternoonEnd->modify('+16 hours');
    $nightStart = clone $startUtc;
    $nightStart->modify('+16 hours');
    $nightEnd = clone $startUtc;
    $nightEnd->modify('+24 hours');
    $shifts = array(
        array('key' => 'morning', 'label' => 'Turno Mattina 06:10 - 14:10', 'start' => $morningStart, 'end' => $morningEnd),
        array('key' => 'afternoon', 'label' => 'Turno Pomeriggio 14:10 - 22:10', 'start' => $afternoonStart, 'end' => $afternoonEnd),
        array('key' => 'night', 'label' => 'Turno Notte 22:10 - 06:10', 'start' => $nightStart, 'end' => $nightEnd)
    );
    $now = new DateTime('now', new DateTimeZone('UTC'));
    $currentIdx = 0;
    for ($i = 0; $i < count($shifts); $i++) {
        if ($now >= $shifts[$i]['start'] && $now < $shifts[$i]['end']) {
            $currentIdx = $i;
            break;
        }
    }
    return array($shifts, $currentIdx);
}

function in_range($iso, $startIso, $endIso)
{
    $t = strtotime($iso);
    return $t >= strtotime($startIso) && $t < strtotime($endIso);
}

function ticket_search_match($ticket, $query, $category_name = '')
{
    $query = trim(strtolower($query));
    if ($query === '') return true;
    $haystack = array(
        isset($ticket['incident_name']) ? $ticket['incident_name'] : '',
        $category_name,
        isset($ticket['description']) ? $ticket['description'] : '',
        isset($ticket['fab']) ? $ticket['fab'] : '',
        isset($ticket['created_at']) ? $ticket['created_at'] : '',
        isset($ticket['incident_id']) ? strval($ticket['incident_id']) : '',
        isset($ticket['owner_team']) ? $ticket['owner_team'] : '',
        isset($ticket['severity']) ? strval($ticket['severity']) : ''
    );
    foreach ($haystack as $value) {
        if (strpos(strtolower(strval($value)), $query) !== false) return true;
    }
    return false;
}

function ticket_with_permissions($ticket, $user)
{
    $ownerId = isset($ticket['owner_user_id']) ? intval($ticket['owner_user_id']) : 0;
    $ticket['owner_user_id'] = $ownerId > 0 ? $ownerId : null;
    $ticket['owner_team'] = normalize_team(isset($ticket['owner_team']) ? $ticket['owner_team'] : 'A');
    $ticket['can_edit'] = ($ownerId > 0 && intval($user['id']) === $ownerId);
    if (!isset($ticket['severity'])) $ticket['severity'] = 1;
    return $ticket;
}

function require_ticket_owner($ticket, $user, $action)
{
    $ownerId = isset($ticket['owner_user_id']) ? intval($ticket['owner_user_id']) : 0;
    if ($ownerId <= 0 || intval($user['id']) !== $ownerId) {
        json_response(array('error' => 'Puoi ' . $action . ' solo i ticket che hai inserito'), 403);
    }
}

function summarize_by_fab($tickets, $fabs)
{
    $out = array();
    foreach ($fabs as $fab) {
        $count = 0;
        foreach ($tickets as $t) {
            if (isset($t['fab']) && $t['fab'] === $fab) $count++;
        }
        $out[] = array('label' => $fab, 'total' => $count);
    }
    return $out;
}

function summarize_by_category($tickets, $categories, $incidents)
{
    $incidentToCatByName = array();
    $incidentToCatById = array();
    foreach ($incidents as $inc) {
        $incidentToCatByName[$inc['name']] = intval($inc['category_id']);
        $incidentToCatById[intval($inc['id'])] = intval($inc['category_id']);
    }
    $out = array();
    foreach ($categories as $cat) {
        $count = 0;
        foreach ($tickets as $t) {
            $incidentId = isset($t['incident_id']) ? intval($t['incident_id']) : 0;
            if ($incidentId > 0 && isset($incidentToCatById[$incidentId]) && $incidentToCatById[$incidentId] === intval($cat['id'])) {
                $count++;
                continue;
            }
            $in = isset($t['incident_name']) ? $t['incident_name'] : '';
            if (isset($incidentToCatByName[$in]) && $incidentToCatByName[$in] === intval($cat['id'])) $count++;
        }
        $out[] = array('label' => $cat['name'], 'total' => $count);
    }
    return $out;
}

function summarize_by_team($tickets)
{
    $teams = array('A', 'B', 'C', 'D', 'E');
    $counts = array();
    foreach ($teams as $team) $counts[$team] = 0;
    foreach ($tickets as $t) {
        $team = normalize_team(isset($t['owner_team']) ? $t['owner_team'] : 'A');
        if (!isset($counts[$team])) $counts[$team] = 0;
        $counts[$team]++;
    }
    $out = array();
    foreach ($teams as $team) $out[] = array('label' => $team, 'total' => isset($counts[$team]) ? $counts[$team] : 0);
    return $out;
}

function summarize_by_severity($tickets)
{
    $labels = array(
        1 => '1 - Low',
        2 => '2 - Medium',
        3 => '3 - High',
        4 => '4 - Extreme'
    );
    $counts = array(1 => 0, 2 => 0, 3 => 0, 4 => 0);
    foreach ($tickets as $t) {
        $severity = isset($t['severity']) ? intval($t['severity']) : 1;
        if (!isset($counts[$severity])) $counts[$severity] = 0;
        $counts[$severity]++;
    }
    $out = array();
    foreach ($labels as $severity => $label) {
        $out[] = array('label' => $label, 'total' => isset($counts[$severity]) ? $counts[$severity] : 0);
    }
    return $out;
}

function year_range_from_mode($year, $mode)
{
    $quarter = array('q1' => array(1, 1, 4, 1), 'q2' => array(4, 1, 7, 1), 'q3' => array(7, 1, 10, 1), 'q4' => array(10, 1, 1, 1));
    if (isset($quarter[$mode])) {
        $q = $quarter[$mode];
        $start = gmdate('c', gmmktime(0, 0, 0, $q[0], $q[1], $year));
        $endYear = ($mode === 'q4') ? $year + 1 : $year;
        $end = gmdate('c', gmmktime(0, 0, 0, $q[2], $q[3], $endYear));
        return array($start, $end);
    }
    $start = gmdate('c', gmmktime(0, 0, 0, 1, 1, $year));
    $end = gmdate('c', gmmktime(0, 0, 0, 1, 1, $year + 1));
    return array($start, $end);
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($path === '/' || $path === '/index.html') {
    require_page_auth('user');
    readfile(__DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'index.html');
    exit;
}
if ($path === '/admin.html') {
    require_page_auth('admin');
    readfile(__DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'admin.html');
    exit;
}
if ($path === '/search.html') {
    require_page_auth('user');
    readfile(__DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'search.html');
    exit;
}
if ($path === '/login.html') {
    $u = read_auth_user();
    if ($u) {
        header('Location: ' . ($u['role'] === 'admin' ? '/admin.html' : '/index.html'));
        exit;
    }
    readfile(__DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'login.html');
    exit;
}

if (strpos($path, '/api/') !== 0) {
    http_response_code(404);
    echo 'Not Found';
    exit;
}

$payload = read_json_body();
if (remote_api_base() !== '') {
    proxy_remote_api_request($path, $method, $payload);
}

$db = load_db($defaultUsers);
if (!mysql_enabled()) {
    supabase_bootstrap_if_needed($db);
}

if ($path === '/api/login' && $method === 'POST') {
    $contentType = isset($_SERVER['CONTENT_TYPE']) ? strtolower(strval($_SERVER['CONTENT_TYPE'])) : '';
    $isJsonRequest = strpos($contentType, 'application/json') !== false;
    $requestData = $payload;
    if (!$isJsonRequest) {
        if (!empty($_POST)) {
            $requestData = $_POST;
        } else {
            $raw = file_get_contents('php://input');
            $parsed = array();
            parse_str($raw, $parsed);
            if (is_array($parsed) && count($parsed)) $requestData = $parsed;
        }
    }
    $username = isset($requestData['username']) ? trim(strval($requestData['username'])) : '';
    $password = isset($requestData['password']) ? trim(strval($requestData['password'])) : '';
    $users = $db['users'];
    if (supabase_enabled()) {
        $resp = sb_select('app_users', 'id,username,password,role', array(), 'id.asc');
        if ($resp['ok'] && is_array($resp['data']) && count($resp['data'])) {
            $users = $resp['data'];
        }
    }
    foreach ($users as $u) {
        if (strtolower($u['username']) === strtolower($username) && strval($u['password']) === $password) {
            set_auth_cookie($u);
            $redirectTo = ($u['role'] === 'admin' ? '/admin.html' : '/index.html');
            if ($isJsonRequest) {
                json_response(array(
                    'id' => intval($u['id']),
                    'username' => $u['username'],
                    'role' => $u['role'],
                    'team' => normalize_team(isset($u['team']) ? $u['team'] : 'A'),
                    'redirectTo' => $redirectTo
                ), 200);
            }
            header('Location: ' . $redirectTo, true, 302);
            exit;
        }
    }
    // Emergency fallback: always allow built-in defaults.
    foreach ($defaultUsers as $u) {
        if (strtolower($u['username']) === strtolower($username) && strval($u['password']) === $password) {
            set_auth_cookie($u);
            $redirectTo = ($u['role'] === 'admin' ? '/admin.html' : '/index.html');
            if ($isJsonRequest) {
                json_response(array(
                    'id' => intval($u['id']),
                    'username' => $u['username'],
                    'role' => $u['role'],
                    'team' => normalize_team(isset($u['team']) ? $u['team'] : 'A'),
                    'redirectTo' => $redirectTo
                ), 200);
            }
            header('Location: ' . $redirectTo, true, 302);
            exit;
        }
    }
    if ($isJsonRequest) {
        json_response(array('error' => 'Credenziali non valide'), 401);
    }
    header('Location: /login.html?error=1', true, 302);
    exit;
}

if ($path === '/api/logout' && $method === 'POST') {
    clear_auth_cookie();
    json_response(array('ok' => true), 200);
}

$user = require_api_auth('user');

if ($path === '/api/me' && $method === 'GET') {
    $me = user_by_id($db['users'], intval($user['id']));
    if (!$me) $me = $user;
    $me['team'] = normalize_team(isset($me['team']) ? $me['team'] : 'A');
    json_response(array('user' => $me), 200);
}

if ($path === '/api/ui-colors' && $method === 'GET') {
    json_response(array('ui_colors' => normalize_ui_colors(isset($db['ui_colors']) ? $db['ui_colors'] : default_ui_colors())), 200);
}

if ($path === '/api/ui-colors' && $method === 'PUT') {
    require_api_auth('admin');
    $incoming = isset($payload['ui_colors']) ? $payload['ui_colors'] : $payload;
    $db['ui_colors'] = normalize_ui_colors($incoming);
    save_db($db);
    json_response(array('ok' => true, 'ui_colors' => $db['ui_colors']), 200);
}

if ($path === '/api/admin/db-check' && $method === 'GET') {
    require_api_auth('admin');
    $conn = mysql_conn();
    $snapshot = mysql_db_snapshot($conn);
    if (!$snapshot['connected']) {
        json_response(array('ok' => false, 'error' => 'Connessione database non disponibile', 'snapshot' => $snapshot), 200);
    }
    json_response(array('ok' => true, 'snapshot' => $snapshot), 200);
}

if ($path === '/api/admin/db-export' && $method === 'GET') {
    require_api_auth('admin');
    json_response($db, 200);
}

if ($path === '/api/users' && $method === 'GET') {
    require_api_auth('admin');
    $out = array();
    if (supabase_enabled()) {
        $resp = sb_select('app_users', 'id,username,role,team', array(), 'id.asc');
        if ($resp['ok'] && is_array($resp['data'])) {
            foreach ($resp['data'] as $u) $out[] = array('id' => intval($u['id']), 'username' => $u['username'], 'role' => $u['role'], 'team' => normalize_team(isset($u['team']) ? $u['team'] : 'A'));
            json_response($out, 200);
        }
    }
    foreach ($db['users'] as $u) $out[] = array('id' => intval($u['id']), 'username' => $u['username'], 'role' => $u['role'], 'team' => normalize_team(isset($u['team']) ? $u['team'] : 'A'));
    json_response($out, 200);
}

if ($path === '/api/users' && $method === 'POST') {
    require_api_auth('admin');
    $username = isset($payload['username']) ? trim(strval($payload['username'])) : '';
    $password = isset($payload['password']) ? trim(strval($payload['password'])) : '';
    $role = isset($payload['role']) ? strtolower(trim(strval($payload['role']))) : 'user';
    $team = normalize_team(isset($payload['team']) ? $payload['team'] : 'A');
    if ($username === '' || $password === '') json_response(array('error' => 'Username e password obbligatori'), 400);
    if ($role !== 'admin' && $role !== 'user') json_response(array('error' => 'Ruolo non valido'), 400);
    foreach ($db['users'] as $u) {
        if (strtolower($u['username']) === strtolower($username)) json_response(array('error' => 'Username gia esistente'), 409);
    }
    $db['counters']['user'] = intval($db['counters']['user']) + 1;
    $newUser = array('id' => $db['counters']['user'], 'username' => $username, 'password' => $password, 'role' => $role, 'team' => $team);
    $db['users'][] = $newUser;
    save_db($db);
    json_response(array('id' => $newUser['id'], 'username' => $username, 'role' => $role, 'team' => $team), 200);
}

if (preg_match('#^/api/users/(\d+)$#', $path, $m) && $method === 'PUT') {
    require_api_auth('admin');
    $id = intval($m[1]);
    $team = normalize_team(isset($payload['team']) ? $payload['team'] : 'A');
    $role = isset($payload['role']) ? strtolower(trim(strval($payload['role']))) : null;
    foreach ($db['users'] as &$u) {
        if (intval($u['id']) === $id) {
            $u['team'] = $team;
            if ($role !== null && $role !== '') {
                if ($role !== 'admin' && $role !== 'user') json_response(array('error' => 'Ruolo non valido'), 400);
                $u['role'] = $role;
            }
            save_db($db);
            json_response(array('ok' => true, 'user' => array('id' => $id, 'username' => $u['username'], 'role' => $u['role'], 'team' => $u['team'])), 200);
        }
    }
    json_response(array('error' => 'Utente non trovato'), 404);
}

if (preg_match('#^/api/users/(\d+)$#', $path, $m) && $method === 'DELETE') {
    require_api_auth('admin');
    $id = intval($m[1]);
    if ($id === intval($user['id'])) json_response(array('error' => 'Non puoi eliminare il tuo utente'), 400);
    $kept = array();
    $found = false;
    foreach ($db['users'] as $u) {
        if (intval($u['id']) === $id) {
            $found = true;
            continue;
        }
        $kept[] = $u;
    }
    if (!$found) json_response(array('error' => 'Utente non trovato'), 404);
    $db['users'] = $kept;
    save_db($db);
    json_response(array('ok' => true), 200);
}

if ($path === '/api/categories' && $method === 'GET') {
    if (supabase_enabled()) {
        $catsResp = sb_select('categories', 'id,name,sort_order', array(), 'sort_order.asc');
        $incResp = sb_select('incidents', 'id,category_id,name,severity_default,severity_mode,fab_default,sort_order', array(), 'sort_order.asc');
        if ($catsResp['ok'] && $incResp['ok']) {
            $cats = is_array($catsResp['data']) ? $catsResp['data'] : array();
            $incs = is_array($incResp['data']) ? $incResp['data'] : array();
            if (count($cats) === 0) {
                // Supabase reachable but currently empty: fallback to local historical data.
            } else {
            $outSb = array();
            foreach ($cats as $cat) {
                $items = array();
                foreach ($incs as $inc) {
                    if (intval($inc['category_id']) === intval($cat['id'])) {
                        if (!isset($inc['presets']) || !is_array($inc['presets'])) $inc['presets'] = array();
                        if (!isset($inc['severity_default']) || $inc['severity_default'] === null) $inc['severity_default'] = 1;
                        if (!isset($inc['severity_mode']) || !$inc['severity_mode']) $inc['severity_mode'] = 'default';
                        if (!isset($inc['fab_default']) || $inc['fab_default'] === null) $inc['fab_default'] = '';
                        $items[] = $inc;
                    }
                }
                $outSb[] = array('id' => intval($cat['id']), 'name' => $cat['name'], 'incidents' => $items);
            }
            json_response($outSb, 200);
            }
        }
    }
    usort($db['categories'], function($a, $b) {
        $ao = isset($a['sort_order']) ? intval($a['sort_order']) : 0;
        $bo = isset($b['sort_order']) ? intval($b['sort_order']) : 0;
        if ($ao !== $bo) return $ao - $bo;
        return intval($a['id']) - intval($b['id']);
    });
    $out = array();
    foreach ($db['categories'] as $cat) {
        $items = array();
        foreach ($db['incidents'] as $inc) {
            if (intval($inc['category_id']) === intval($cat['id'])) {
                if (!isset($inc['presets']) || !is_array($inc['presets'])) $inc['presets'] = array();
                if (!isset($inc['severity_default'])) $inc['severity_default'] = 1;
                if (!isset($inc['severity_mode'])) $inc['severity_mode'] = 'default';
                if (!isset($inc['fab_default'])) $inc['fab_default'] = '';
                if (!isset($inc['sort_order'])) $inc['sort_order'] = 0;
                $items[] = $inc;
            }
        }
        usort($items, function($a, $b) {
            $ao = isset($a['sort_order']) ? intval($a['sort_order']) : 0;
            $bo = isset($b['sort_order']) ? intval($b['sort_order']) : 0;
            if ($ao !== $bo) return $ao - $bo;
            return intval($a['id']) - intval($b['id']);
        });
        $out[] = array('id' => intval($cat['id']), 'name' => $cat['name'], 'incidents' => $items);
    }
    json_response($out, 200);
}

if ($path === '/api/categories' && $method === 'POST') {
    require_api_auth('admin');
    $name = isset($payload['name']) ? trim(strval($payload['name'])) : '';
    if ($name === '') json_response(array('error' => 'Nome categoria obbligatorio'), 400);
    if (supabase_enabled()) {
        $row = sb_select('categories', 'sort_order', array(), 'sort_order.desc');
        $maxOrder = 0;
        if ($row['ok'] && is_array($row['data']) && count($row['data'])) $maxOrder = intval($row['data'][0]['sort_order']);
        $ins = sb_insert('categories', array('name' => $name, 'sort_order' => $maxOrder + 1), true);
        if ($ins['ok']) json_response(array('id' => intval($ins['data']['id']), 'name' => $ins['data']['name']), 200);
    }
    $db['counters']['category'] = intval($db['counters']['category']) + 1;
    $maxOrder = 0;
    foreach ($db['categories'] as $existingCategory) {
        $currentOrder = isset($existingCategory['sort_order']) ? intval($existingCategory['sort_order']) : 0;
        if ($currentOrder > $maxOrder) $maxOrder = $currentOrder;
    }
    $cat = array('id' => $db['counters']['category'], 'name' => $name, 'sort_order' => $maxOrder + 1);
    $db['categories'][] = $cat;
    save_db($db);
    json_response($cat, 200);
}

if ($path === '/api/categories/reorder' && $method === 'PUT') {
    require_api_auth('admin');
    $orderedIds = isset($payload['orderedIds']) && is_array($payload['orderedIds']) ? $payload['orderedIds'] : array();
    if (count($orderedIds)) {
        $byId = array();
        $others = array();
        foreach ($db['categories'] as $cat) {
            $cid = intval($cat['id']);
            $byId[$cid] = $cat;
        }
        $nextOrder = 1;
        $reordered = array();
        foreach ($orderedIds as $cidRaw) {
            $cid = intval($cidRaw);
            if (!isset($byId[$cid])) continue;
            $cat = $byId[$cid];
            $cat['sort_order'] = $nextOrder++;
            $reordered[] = $cat;
            unset($byId[$cid]);
        }
        foreach ($db['categories'] as $cat) {
            $cid = intval($cat['id']);
            if (isset($byId[$cid])) {
                $cat['sort_order'] = $nextOrder++;
                $reordered[] = $cat;
                unset($byId[$cid]);
            }
        }
        $db['categories'] = $reordered;
        save_db($db);
    }
    json_response(array('ok' => true), 200);
}

if (preg_match('#^/api/categories/(\d+)$#', $path, $m)) {
    require_api_auth('admin');
    $id = intval($m[1]);
    if ($method === 'PUT') {
        $name = isset($payload['name']) ? trim(strval($payload['name'])) : '';
        if ($name === '') json_response(array('error' => 'Dati non validi'), 400);
        foreach ($db['categories'] as &$cat) {
            if (intval($cat['id']) === $id) {
                $cat['name'] = $name;
                save_db($db);
                json_response(array('ok' => true), 200);
            }
        }
        json_response(array('error' => 'Categoria non trovata'), 404);
    }
    if ($method === 'DELETE') {
        $newCategories = array();
        foreach ($db['categories'] as $cat) {
            if (intval($cat['id']) !== $id) $newCategories[] = $cat;
        }
        $keptIncidents = array();
        $removedNames = array();
        foreach ($db['incidents'] as $inc) {
            if (intval($inc['category_id']) === $id) $removedNames[] = $inc['name'];
            else $keptIncidents[] = $inc;
        }
        $keptTickets = array();
        $removedIncidentIds = array();
        foreach ($db['incidents'] as $inc) {
            if (intval($inc['category_id']) === $id) $removedIncidentIds[] = intval($inc['id']);
        }
        foreach ($db['tickets'] as $t) {
            $tid = isset($t['incident_id']) ? intval($t['incident_id']) : 0;
            if ($tid > 0) {
                if (!in_array($tid, $removedIncidentIds, true)) $keptTickets[] = $t;
            } else if (!in_array($t['incident_name'], $removedNames, true)) {
                $keptTickets[] = $t;
            }
        }
        $db['categories'] = $newCategories;
        $db['incidents'] = $keptIncidents;
        $db['tickets'] = $keptTickets;
        save_db($db);
        json_response(array('ok' => true), 200);
    }
}

if ($path === '/api/incidents' && $method === 'POST') {
    require_api_auth('admin');
    $categoryId = isset($payload['category_id']) ? intval($payload['category_id']) : 0;
    $name = isset($payload['name']) ? trim(strval($payload['name'])) : '';
    if ($categoryId <= 0 || $name === '') json_response(array('error' => 'Dati mancanti'), 400);
    $db['counters']['incident'] = intval($db['counters']['incident']) + 1;
    $maxOrder = 0;
    foreach ($db['incidents'] as $existingIncident) {
        if (intval($existingIncident['category_id']) !== $categoryId) continue;
        $currentOrder = isset($existingIncident['sort_order']) ? intval($existingIncident['sort_order']) : 0;
        if ($currentOrder > $maxOrder) $maxOrder = $currentOrder;
    }
    $db['incidents'][] = array(
        'id' => $db['counters']['incident'],
        'category_id' => $categoryId,
        'name' => $name,
        'severity_default' => 1,
        'severity_mode' => 'default',
        'fab_default' => '',
        'sort_order' => $maxOrder + 1,
        'presets' => array()
    );
    save_db($db);
    json_response(array('ok' => true), 200);
}

if ($path === '/api/incidents/reorder' && $method === 'PUT') {
    require_api_auth('admin');
    $categoryId = isset($payload['category_id']) ? intval($payload['category_id']) : 0;
    $orderedIds = isset($payload['orderedIds']) && is_array($payload['orderedIds']) ? $payload['orderedIds'] : array();
    if ($categoryId > 0 && count($orderedIds)) {
        $byId = array();
        $reordered = array();
        foreach ($db['incidents'] as $inc) {
            $iid = intval($inc['id']);
            $byId[$iid] = $inc;
        }
        $nextOrder = 1;
        foreach ($db['incidents'] as $inc) {
            if (intval($inc['category_id']) !== $categoryId) {
                $reordered[] = $inc;
            }
        }
        foreach ($orderedIds as $iidRaw) {
            $iid = intval($iidRaw);
            if (!isset($byId[$iid])) continue;
            $inc = $byId[$iid];
            if (intval($inc['category_id']) !== $categoryId) continue;
            $inc['sort_order'] = $nextOrder++;
            $reordered[] = $inc;
            unset($byId[$iid]);
        }
        foreach ($db['incidents'] as $inc) {
            $iid = intval($inc['id']);
            if (isset($byId[$iid]) && intval($inc['category_id']) === $categoryId) {
                $inc['sort_order'] = $nextOrder++;
                $reordered[] = $inc;
                unset($byId[$iid]);
            }
        }
        $db['incidents'] = $reordered;
        save_db($db);
    }
    json_response(array('ok' => true), 200);
}

if (preg_match('#^/api/incidents/(\d+)/presets$#', $path, $m) && $method === 'PUT') {
    require_api_auth('admin');
    $id = intval($m[1]);
    $presets = isset($payload['presets']) && is_array($payload['presets']) ? $payload['presets'] : array();
    $clean = array();
    foreach ($presets as $p) {
        $txt = trim(strval($p));
        if ($txt !== '') $clean[] = $txt;
    }
    foreach ($db['incidents'] as &$inc) {
        if (intval($inc['id']) === $id) {
            $inc['presets'] = $clean;
            save_db($db);
            json_response(array('ok' => true, 'presets' => $clean), 200);
        }
    }
    json_response(array('error' => 'Incident non valido'), 400);
}

if (preg_match('#^/api/incidents/(\d+)$#', $path, $m)) {
    require_api_auth('admin');
    $id = intval($m[1]);
    if ($method === 'PUT') {
        $name = isset($payload['name']) ? trim(strval($payload['name'])) : '';
        if ($name === '') json_response(array('error' => 'Dati non validi'), 400);
        foreach ($db['incidents'] as &$inc) {
            if (intval($inc['id']) === $id) {
                $inc['name'] = $name;
                $inc['severity_default'] = isset($payload['severity_default']) ? intval($payload['severity_default']) : 1;
                $inc['severity_mode'] = isset($payload['severity_mode']) ? strval($payload['severity_mode']) : 'default';
                $inc['fab_default'] = isset($payload['fab_default']) ? strtoupper(trim(strval($payload['fab_default']))) : '';
                save_db($db);
                json_response(array('ok' => true), 200);
            }
        }
        json_response(array('error' => 'Incident non trovato'), 404);
    }
    if ($method === 'DELETE') {
        $incidentName = '';
        $new = array();
        foreach ($db['incidents'] as $inc) {
            if (intval($inc['id']) === $id) {
                $incidentName = $inc['name'];
                continue;
            }
            $new[] = $inc;
        }
        $db['incidents'] = $new;
        if ($incidentName !== '') {
            $tickets = array();
            foreach ($db['tickets'] as $t) {
                $tid = isset($t['incident_id']) ? intval($t['incident_id']) : 0;
                if ($tid > 0) {
                    if ($tid !== $id) $tickets[] = $t;
                } else if ($t['incident_name'] !== $incidentName) {
                    $tickets[] = $t;
                }
            }
            $db['tickets'] = $tickets;
        }
        save_db($db);
        json_response(array('ok' => true), 200);
    }
}

if ($path === '/api/tickets' && $method === 'POST') {
    $incidentId = isset($payload['incident_id']) ? intval($payload['incident_id']) : 0;
    $desc = isset($payload['description']) ? trim(strval($payload['description'])) : '';
    $fab = isset($payload['fab']) ? strtoupper(trim(strval($payload['fab']))) : '';
    $ticketTime = isset($payload['ticket_time']) ? strval($payload['ticket_time']) : '';
    $severity = isset($payload['severity']) ? intval($payload['severity']) : 1;
    if ($incidentId <= 0 || $desc === '' || $fab === '' || $ticketTime === '') json_response(array('error' => 'Dati ticket incompleti'), 400);
    if (strtotime($ticketTime) === false) json_response(array('error' => 'Data/ora ticket non valida'), 400);
    $ownerRecord = user_by_id($db['users'], intval($user['id']));
    if (!$ownerRecord) $ownerRecord = $user;
    $incidentName = '';
    foreach ($db['incidents'] as $inc) {
        if (intval($inc['id']) === $incidentId) { $incidentName = $inc['name']; break; }
    }
    if ($incidentName === '') json_response(array('error' => 'Incident non valido'), 400);
    $ownerTeam = normalize_team(isset($ownerRecord['team']) ? $ownerRecord['team'] : 'A');
    $db['counters']['ticket'] = intval($db['counters']['ticket']) + 1;
    $ticket = array(
        'id' => $db['counters']['ticket'],
        'incident_id' => $incidentId,
        'incident_name' => $incidentName,
        'description' => $desc,
        'fab' => $fab,
        'severity' => $severity,
        'owner_user_id' => intval($user['id']),
        'owner_team' => $ownerTeam,
        'created_at' => gmdate('c', strtotime($ticketTime))
    );
    $db['tickets'][] = $ticket;
    save_db($db);
    json_response(ticket_with_permissions($ticket, $user), 200);
}

if ($path === '/api/tickets/clear' && $method === 'DELETE') {
    require_api_auth('admin');
    $deletedCount = count($db['tickets']);
    $db['tickets'] = array();
    $db['counters']['ticket'] = 0;
    save_db($db);
    json_response(array('ok' => true, 'deleted' => $deletedCount), 200);
}

if (preg_match('#^/api/tickets/(\d+)$#', $path, $m)) {
    $id = intval($m[1]);
    $idx = -1;
    for ($i = 0; $i < count($db['tickets']); $i++) {
        if (intval($db['tickets'][$i]['id']) === $id) {
            $idx = $i;
            break;
        }
    }
    if ($idx < 0) json_response(array('error' => 'Ticket non trovato'), 404);
    require_ticket_owner($db['tickets'][$idx], $user, $method === 'DELETE' ? 'eliminare' : 'modificare');
    if ($method === 'PUT') {
        $incidentId = isset($payload['incident_id']) ? intval($payload['incident_id']) : 0;
        $desc = isset($payload['description']) ? trim(strval($payload['description'])) : '';
        $fab = isset($payload['fab']) ? strtoupper(trim(strval($payload['fab']))) : '';
        $ticketTime = isset($payload['ticket_time']) ? strval($payload['ticket_time']) : '';
        $severity = isset($payload['severity']) ? intval($payload['severity']) : 1;
        if ($incidentId <= 0 || $desc === '' || $fab === '' || $ticketTime === '') json_response(array('error' => 'Dati ticket incompleti'), 400);
        if (strtotime($ticketTime) === false) json_response(array('error' => 'Data/ora ticket non valida'), 400);
        $incidentName = '';
        foreach ($db['incidents'] as $inc) {
            if (intval($inc['id']) === $incidentId) { $incidentName = $inc['name']; break; }
        }
        if ($incidentName === '') json_response(array('error' => 'Incident non valido'), 400);
        $db['tickets'][$idx]['incident_id'] = $incidentId;
        $db['tickets'][$idx]['incident_name'] = $incidentName;
        $db['tickets'][$idx]['description'] = $desc;
        $db['tickets'][$idx]['fab'] = $fab;
        $db['tickets'][$idx]['severity'] = $severity;
        $db['tickets'][$idx]['owner_team'] = normalize_team(isset($db['tickets'][$idx]['owner_team']) ? $db['tickets'][$idx]['owner_team'] : (isset($user['team']) ? $user['team'] : 'A'));
        $db['tickets'][$idx]['created_at'] = gmdate('c', strtotime($ticketTime));
        save_db($db);
        json_response(array('ok' => true, 'ticket' => ticket_with_permissions($db['tickets'][$idx], $user)), 200);
    }
    if ($method === 'DELETE') {
        array_splice($db['tickets'], $idx, 1);
        save_db($db);
        json_response(array('ok' => true), 200);
    }
}

if ($path === '/api/tickets/current-day' && $method === 'GET') {
    $bounds = current_day_bounds();
    if (supabase_enabled()) {
        $resp = sb_select('tickets', '*', array('created_at=gte.' . rawurlencode($bounds['start']), 'created_at=lt.' . rawurlencode($bounds['end'])), 'created_at.desc');
        if ($resp['ok']) {
            $ticketsSb = array();
            $rows = is_array($resp['data']) ? $resp['data'] : array();
            foreach ($rows as $t) $ticketsSb[] = ticket_with_permissions($t, $user);
            json_response(array('day' => $bounds, 'tickets' => $ticketsSb), 200);
        }
    }
    $tickets = array();
    foreach ($db['tickets'] as $t) if (in_range($t['created_at'], $bounds['start'], $bounds['end'])) $tickets[] = ticket_with_permissions($t, $user);
    usort($tickets, function($a, $b) { return strcmp($b['created_at'], $a['created_at']); });
    json_response(array('day' => $bounds, 'tickets' => $tickets), 200);
}

if ($path === '/api/tickets/current-shift' && $method === 'GET') {
    list($shifts, $idx) = shift_windows();
    $current = $shifts[$idx];
    $start = $current['start']->format(DateTime::ATOM);
    $end = $current['end']->format(DateTime::ATOM);
    $tickets = array();
    foreach ($db['tickets'] as $t) if (in_range($t['created_at'], $start, $end)) $tickets[] = ticket_with_permissions($t, $user);
    usort($tickets, function($a, $b) { return strcmp($b['created_at'], $a['created_at']); });
    json_response(array(
        'shift' => array('key' => $current['key'], 'label' => $current['label'], 'start' => $start, 'end' => $end),
        'tickets' => $tickets
    ), 200);
}

if ($path === '/api/tickets/previous-shifts' && $method === 'GET') {
    list($shifts, $idx) = shift_windows();
    $from = max(0, $idx - 2);
    $out = array();
    for ($i = $from; $i < $idx; $i++) {
        $s = $shifts[$i];
        $start = $s['start']->format(DateTime::ATOM);
        $end = $s['end']->format(DateTime::ATOM);
        $tickets = array();
        foreach ($db['tickets'] as $t) if (in_range($t['created_at'], $start, $end)) $tickets[] = ticket_with_permissions($t, $user);
        usort($tickets, function($a, $b) { return strcmp($b['created_at'], $a['created_at']); });
        $out[] = array('label' => $s['label'], 'start' => $start, 'end' => $end, 'tickets' => $tickets);
    }
    json_response(array('shifts' => $out), 200);
}

if ($path === '/api/tickets/search' && $method === 'GET') {
    $query = isset($_GET['query']) ? trim(strval($_GET['query'])) : '';
    $from = isset($_GET['from']) ? trim(strval($_GET['from'])) : '';
    $to = isset($_GET['to']) ? trim(strval($_GET['to'])) : '';
    $fromTs = $from !== '' ? strtotime($from . ' 00:00:00') : false;
    $toTs = $to !== '' ? strtotime($to . ' 23:59:59') : false;
    if ($fromTs !== false && $toTs !== false && $fromTs > $toTs) json_response(array('error' => 'Intervallo date non valido'), 400);
    $incidentCategories = array();
    foreach ($db['categories'] as $category) {
        $categoryName = isset($category['name']) ? $category['name'] : '';
        if (!isset($category['incidents']) || !is_array($category['incidents'])) continue;
        foreach ($category['incidents'] as $incident) {
            if (!isset($incident['id'])) continue;
            $incidentCategories[intval($incident['id'])] = $categoryName;
        }
    }
    $tickets = array();
    foreach ($db['tickets'] as $t) {
        $ticketTs = isset($t['created_at']) ? strtotime($t['created_at']) : false;
        if ($fromTs !== false && $ticketTs !== false && $ticketTs < $fromTs) continue;
        if ($toTs !== false && $ticketTs !== false && $ticketTs > $toTs) continue;
        $categoryName = '';
        if (isset($t['incident_id'])) {
            $incidentId = intval($t['incident_id']);
            if (isset($incidentCategories[$incidentId])) $categoryName = $incidentCategories[$incidentId];
        }
        if (!ticket_search_match($t, $query, $categoryName)) continue;
        $tickets[] = ticket_with_permissions($t, $user);
    }
    usort($tickets, function($a, $b) { return strcmp($b['created_at'], $a['created_at']); });
    json_response(array(
        'query' => $query,
        'from' => $from,
        'to' => $to,
        'count' => count($tickets),
        'tickets' => $tickets
    ), 200);
}

if ($path === '/api/stats/fab/current-day' && $method === 'GET') {
    $bounds = current_day_bounds();
    $tickets = array();
    foreach ($db['tickets'] as $t) if (in_range($t['created_at'], $bounds['start'], $bounds['end'])) $tickets[] = $t;
    json_response(array('day' => $bounds, 'stats' => summarize_by_fab($tickets, $fabs)), 200);
}

if ($path === '/api/stats/category/current-day' && $method === 'GET') {
    $bounds = current_day_bounds();
    $tickets = array();
    foreach ($db['tickets'] as $t) if (in_range($t['created_at'], $bounds['start'], $bounds['end'])) $tickets[] = $t;
    json_response(array('day' => $bounds, 'stats' => summarize_by_category($tickets, $db['categories'], $db['incidents'])), 200);
}

if ($path === '/api/stats/fab/current-year' && $method === 'GET') {
    $year = intval(gmdate('Y'));
    $mode = isset($_GET['mode']) ? strval($_GET['mode']) : 'months';
    list($start, $end) = year_range_from_mode($year, $mode);
    $tickets = array();
    foreach ($db['tickets'] as $t) if (in_range($t['created_at'], $start, $end)) $tickets[] = $t;
    json_response(array('year' => $year, 'mode' => $mode, 'stats' => summarize_by_fab($tickets, $fabs)), 200);
}

if ($path === '/api/stats/category/current-year' && $method === 'GET') {
    $year = intval(gmdate('Y'));
    $mode = isset($_GET['mode']) ? strval($_GET['mode']) : 'months';
    list($start, $end) = year_range_from_mode($year, $mode);
    $tickets = array();
    foreach ($db['tickets'] as $t) if (in_range($t['created_at'], $start, $end)) $tickets[] = $t;
    json_response(array('year' => $year, 'mode' => $mode, 'stats' => summarize_by_category($tickets, $db['categories'], $db['incidents'])), 200);
}

if ($path === '/api/stats/team/current-year' && $method === 'GET') {
    $year = intval(gmdate('Y'));
    $mode = isset($_GET['mode']) ? strval($_GET['mode']) : 'months';
    list($start, $end) = year_range_from_mode($year, $mode);
    $tickets = array();
    foreach ($db['tickets'] as $t) if (in_range($t['created_at'], $start, $end)) $tickets[] = $t;
    json_response(array('year' => $year, 'mode' => $mode, 'stats' => summarize_by_team($tickets)), 200);
}

if ($path === '/api/stats/severity/current-year' && $method === 'GET') {
    $year = intval(gmdate('Y'));
    $mode = isset($_GET['mode']) ? strval($_GET['mode']) : 'months';
    list($start, $end) = year_range_from_mode($year, $mode);
    $tickets = array();
    foreach ($db['tickets'] as $t) if (in_range($t['created_at'], $start, $end)) $tickets[] = $t;
    json_response(array('year' => $year, 'mode' => $mode, 'stats' => summarize_by_severity($tickets)), 200);
}

json_response(array('error' => 'Endpoint non trovato'), 404);
