<?php

ini_set('display_errors', 0);
error_reporting(0);

date_default_timezone_set('Europe/Rome');
if (function_exists('mysqli_report')) {
    mysqli_report(MYSQLI_REPORT_OFF);
}

define('DB_PATH', dirname(__FILE__) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'db.json');
define('SYNC_TS_PATH', dirname(__FILE__) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'sync_ts');
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'auth.php';
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'ldap.php';

$fabs = array('M5', 'L1', 'EWS', 'WSIC', 'NRK');
$defaultUsers = array();

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

load_env_file(dirname(__FILE__) . DIRECTORY_SEPARATOR . '.env');

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

load_runtime_config_file(dirname(__FILE__) . DIRECTORY_SEPARATOR . 'config.php');
load_runtime_config_file(dirname(__FILE__) . DIRECTORY_SEPARATOR . 'config.local.php');

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
        dirname(__FILE__) . DIRECTORY_SEPARATOR . 'config.php',
        dirname(__FILE__) . DIRECTORY_SEPARATOR . 'config.local.php'
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

function is_supervisor($user)
{
    return isset($user['role']) && $user['role'] === 'supervisor';
}

function normalize_preset_field_key($value)
{
    $value = strtolower(trim(strval($value)));
    $value = preg_replace('/[^a-z0-9_-]+/', '_', $value);
    return trim($value, '_');
}

function normalize_preset_format_mode($mode)
{
    $mode = strtolower(trim(strval($mode)));
    if ($mode === 'lower' || $mode === 'upper' || $mode === 'capitalize') return $mode;
    return 'none';
}

function apply_preset_format_mode($value, $mode)
{
    $text = trim(strval($value));
    if ($text === '') return '';
    $mode = normalize_preset_format_mode($mode);
    if ($mode === 'lower') return function_exists('mb_strtolower') ? mb_strtolower($text, 'UTF-8') : strtolower($text);
    if ($mode === 'upper') return function_exists('mb_strtoupper') ? mb_strtoupper($text, 'UTF-8') : strtoupper($text);
    if ($mode === 'capitalize') {
        $lower = function_exists('mb_strtolower') ? mb_strtolower($text, 'UTF-8') : strtolower($text);
        return preg_replace_callback('/(^|[^a-z\x{e0}-\x{f6}\x{f8}-\x{ff}0-9_])([a-z\x{e0}-\x{f6}\x{f8}-\x{ff}])/u', function($m) {
            return $m[1] . (function_exists('mb_strtoupper') ? mb_strtoupper($m[2], 'UTF-8') : strtoupper($m[2]));
        }, $lower);
    }
    return $text;
}

function get_preset_format_mode($db, $fieldKey)
{
    if (!isset($db['preset_option_formats']) || !is_array($db['preset_option_formats'])) return 'none';
    return normalize_preset_format_mode(isset($db['preset_option_formats'][$fieldKey]) ? $db['preset_option_formats'][$fieldKey] : 'none');
}

function normalize_personal_target($value)
{
    $target = intval($value);
    if ($target < 1) $target = 20;
    return $target;
}

function normalize_group_target($value)
{
    return normalize_personal_target($value);
}

function normalize_group_name($value)
{
    $name = trim(strval($value));
    return $name !== '' ? $name : 'ProdOps';
}

function normalize_group_targets($groupTargets, $users)
{
    $normalized = array();
    if (is_array($groupTargets)) {
        foreach ($groupTargets as $groupName => $config) {
            $name = normalize_group_name($groupName);
            $row = is_array($config) ? $config : array();
            $normalized[$name] = array(
                'group_name' => $name,
                'personal_target_monthly' => normalize_personal_target(isset($row['personal_target_monthly']) ? $row['personal_target_monthly'] : (isset($row['personal_target']) ? $row['personal_target'] : 20)),
                'personal_target_annual' => normalize_personal_target(isset($row['personal_target_annual']) ? $row['personal_target_annual'] : (isset($row['personal_target']) ? ($row['personal_target'] * 12) : 240)),
                'group_target_monthly' => normalize_group_target(isset($row['group_target_monthly']) ? $row['group_target_monthly'] : (isset($row['group_target']) ? $row['group_target'] : 20)),
                'group_target_annual' => normalize_group_target(isset($row['group_target_annual']) ? $row['group_target_annual'] : (isset($row['group_target']) ? ($row['group_target'] * 12) : 240)),
                'personal_target' => normalize_personal_target(isset($row['personal_target_monthly']) ? $row['personal_target_monthly'] : (isset($row['personal_target']) ? $row['personal_target'] : 20)),
                'group_target' => normalize_group_target(isset($row['group_target_monthly']) ? $row['group_target_monthly'] : (isset($row['group_target']) ? $row['group_target'] : 20))
            );
        }
    }
    if (is_array($users)) {
        foreach ($users as $user) {
            $name = normalize_group_name(isset($user['group_name']) ? $user['group_name'] : 'ProdOps');
            if (!isset($normalized[$name])) {
                $normalized[$name] = array(
                    'group_name' => $name,
                    'personal_target_monthly' => normalize_personal_target(isset($user['personal_target']) ? $user['personal_target'] : 20),
                    'personal_target_annual' => normalize_personal_target((isset($user['personal_target']) ? $user['personal_target'] : 20) * 12),
                    'group_target_monthly' => normalize_group_target(isset($user['group_target']) ? $user['group_target'] : 20),
                    'group_target_annual' => normalize_group_target((isset($user['group_target']) ? $user['group_target'] : 20) * 12),
                    'personal_target' => normalize_personal_target(isset($user['personal_target']) ? $user['personal_target'] : 20),
                    'group_target' => normalize_group_target(isset($user['group_target']) ? $user['group_target'] : 20)
                );
            }
        }
    }
    ksort($normalized, SORT_NATURAL | SORT_FLAG_CASE);
    return $normalized;
}

function resolve_ticket_incident_name($db, $incidentId, $customIncidentName)
{
    $baseIncidentName = '';
    foreach ($db['incidents'] as $inc) {
        if (intval($inc['id']) === intval($incidentId)) {
            $baseIncidentName = isset($inc['name']) ? trim(strval($inc['name'])) : '';
            break;
        }
    }
    if ($baseIncidentName === '') return '';
    if (strtolower($baseIncidentName) !== 'generic') return $baseIncidentName;
    $custom = trim(strval($customIncidentName));
    if ($custom === '') return '';
    return $custom;
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
        ),
        'titles' => array(
            'personalMineChart' => 'Ticket personali',
            'personalGroupChart' => 'Ticket gruppo',
            'fabYear' => 'Ticket per FAB',
            'catYear' => 'Ticket per categoria',
            'teamYear' => 'Ticket per Team',
            'severityYear' => 'Severity Ticket'
        ),
        'settings' => array(
            'personal_axis_max' => 0,
            'personal_axis_max_mine' => 0,
            'personal_axis_max_group' => 0
        )
    );
}

function sanitize_hex_color($value)
{
    $value = trim(strval($value));
    return preg_match('/^#[0-9a-fA-F]{6}$/', $value) ? strtoupper($value) : '';
}

function normalize_axis_max_setting($value)
{
    $num = intval($value);
    if ($num < 0) $num = 0;
    return $num;
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
    if (isset($colors['titles']) && is_array($colors['titles'])) {
        foreach ($defaults['titles'] as $key => $defaultTitle) {
            if (!isset($colors['titles'][$key])) continue;
            $title = trim(strval($colors['titles'][$key]));
            if ($title !== '') $out['titles'][$key] = $title;
        }
    }
    if (isset($colors['settings']) && is_array($colors['settings'])) {
        $legacyAxisMax = normalize_axis_max_setting(isset($colors['settings']['personal_axis_max']) ? $colors['settings']['personal_axis_max'] : 0);
        $out['settings']['personal_axis_max'] = $legacyAxisMax;
        $out['settings']['personal_axis_max_mine'] = isset($colors['settings']['personal_axis_max_mine'])
            ? normalize_axis_max_setting($colors['settings']['personal_axis_max_mine'])
            : 0;
        $out['settings']['personal_axis_max_group'] = isset($colors['settings']['personal_axis_max_group'])
            ? normalize_axis_max_setting($colors['settings']['personal_axis_max_group'])
            : 0;
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
                'team' => normalize_team(isset($u['team']) ? $u['team'] : 'A'),
                'group_name' => isset($u['group_name']) ? strval($u['group_name']) : 'ProdOps'
            );
        }
        sb_insert('app_users', $payload, false);
    }
}

function json_response($data, $status)
{
    header(' ', true, $status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('Pragma: no-cache');
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
        header(' ', true, 502);
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

    header(' ', true, $status);
    header('Content-Type: application/json; charset=utf-8');
    echo $body;
    exit;
}

function mysql_enabled()
{
    if (!function_exists('mysqli_connect')) return false;
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
    if ($conn !== null) {
        if ((is_object($conn) && $conn instanceof mysqli) || is_resource($conn)) return $conn;
        $conn = null;
    }
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
    $useSsl = ($port === 443);
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
    if (!$ok) {
        $conn = null;
        return null;
    }
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
    $schemaPath = dirname(__FILE__) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'mysql_schema_51.sql';
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
        "ALTER TABLE app_users ADD COLUMN group_name VARCHAR(80) NOT NULL DEFAULT 'ProdOps' AFTER team",
        "ALTER TABLE app_users ADD COLUMN personal_target SMALLINT UNSIGNED NOT NULL DEFAULT 20 AFTER group_name",
        "ALTER TABLE app_users ADD COLUMN group_target SMALLINT UNSIGNED NOT NULL DEFAULT 20 AFTER personal_target",
        "ALTER TABLE tickets ADD COLUMN incident_name VARCHAR(180) NOT NULL DEFAULT '' AFTER incident_id",
        "ALTER TABLE tickets ADD COLUMN owner_team VARCHAR(1) NOT NULL DEFAULT 'A' AFTER owner_user_id",
        "ALTER TABLE categories ADD COLUMN hidden TINYINT(1) NOT NULL DEFAULT 0 AFTER name",
        "ALTER TABLE incidents ADD COLUMN hidden TINYINT(1) NOT NULL DEFAULT 0 AFTER name",
        "ALTER TABLE incidents ADD COLUMN name_mode VARCHAR(10) NOT NULL DEFAULT 'default' AFTER fab_default"
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
        'group_targets' => array(),
        'ui_colors' => default_ui_colors(),
        'user_charts' => array(),
        'preset_options' => array(),
        'preset_option_requests' => array(),
        'preset_option_formats' => array(),
        'counters' => array('category' => 0, 'incident' => 0, 'ticket' => 0, 'user' => 0, 'preset_option_request' => 0)
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

    $rc = @mysqli_query($conn, "SELECT id, name, hidden, sort_order FROM categories ORDER BY sort_order ASC, id ASC");
    if ($rc) {
        while ($row = mysqli_fetch_assoc($rc)) {
            $db['categories'][] = array(
                'id' => intval($row['id']),
                'name' => $row['name'],
                'hidden' => !empty($row['hidden']),
                'sort_order' => intval($row['sort_order'])
            );
        }
        mysqli_free_result($rc);
    }

    $ri = @mysqli_query($conn, "SELECT id, category_id, name, hidden, severity_default, severity_mode, fab_default, name_mode, sort_order FROM incidents ORDER BY sort_order ASC, id ASC");
    if ($ri) {
        while ($row = mysqli_fetch_assoc($ri)) {
            $iid = intval($row['id']);
            $db['incidents'][] = array(
                'id' => $iid,
                'category_id' => intval($row['category_id']),
                'name' => $row['name'],
                'hidden' => !empty($row['hidden']),
                'severity_default' => intval($row['severity_default'] ? $row['severity_default'] : 1),
                'severity_mode' => $row['severity_mode'] ? $row['severity_mode'] : 'default',
                'fab_default' => $row['fab_default'] ? $row['fab_default'] : '',
                'name_mode' => isset($row['name_mode']) && $row['name_mode'] === 'custom' ? 'custom' : 'default',
                'sort_order' => intval($row['sort_order']),
                'presets' => isset($presetsByIncident[$iid]) ? $presetsByIncident[$iid] : array()
            );
        }
        mysqli_free_result($ri);
    }

    $incidentNameById = array();
    foreach ($db['incidents'] as $incRow) $incidentNameById[intval($incRow['id'])] = $incRow['name'];

    $rt = @mysqli_query($conn, "SELECT id, incident_id, incident_name, description, fab, created_at, severity, owner_user_id, owner_team FROM tickets ORDER BY id ASC");
    if ($rt) {
        while ($row = mysqli_fetch_assoc($rt)) {
            $iid = intval($row['incident_id']);
            $db['tickets'][] = array(
                'id' => intval($row['id']),
                'incident_id' => $iid,
                'incident_name' => isset($row['incident_name']) && trim(strval($row['incident_name'])) !== '' ? $row['incident_name'] : (isset($incidentNameById[$iid]) ? $incidentNameById[$iid] : ''),
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

    $ru = @mysqli_query($conn, "SELECT id, username, password, role, team, group_name, personal_target, group_target FROM app_users ORDER BY id ASC");
    if ($ru) {
        while ($row = mysqli_fetch_assoc($ru)) {
            $db['users'][] = array(
                'id' => intval($row['id']),
                'username' => $row['username'],
                'password' => $row['password'],
                'role' => $row['role'],
                'team' => normalize_team(isset($row['team']) ? $row['team'] : 'A'),
                'group_name' => isset($row['group_name']) ? strval($row['group_name']) : 'ProdOps',
                'personal_target' => normalize_personal_target(isset($row['personal_target']) ? $row['personal_target'] : 20),
                'group_target' => normalize_group_target(isset($row['group_target']) ? $row['group_target'] : 20)
            );
        }
        mysqli_free_result($ru);
    }

    $rs = @mysqli_query($conn, "SELECT setting_key, setting_value FROM app_settings WHERE setting_key IN ('ui_colors','preset_option_requests','preset_option_formats','group_targets','user_charts','pinned_tickets','disabled_users')");
    if ($rs) {
        while ($row = mysqli_fetch_assoc($rs)) {
            $parsed = json_decode($row['setting_value'], true);
            if (!is_array($parsed)) continue;
            if ($row['setting_key'] === 'ui_colors') $db['ui_colors'] = normalize_ui_colors($parsed);
            if ($row['setting_key'] === 'preset_option_requests') $db['preset_option_requests'] = $parsed;
            if ($row['setting_key'] === 'preset_option_formats') $db['preset_option_formats'] = $parsed;
            if ($row['setting_key'] === 'group_targets') $db['group_targets'] = $parsed;
            if ($row['setting_key'] === 'user_charts') $db['user_charts'] = $parsed;
            if ($row['setting_key'] === 'pinned_tickets') $db['pinned_tickets'] = $parsed;
            if ($row['setting_key'] === 'disabled_users') $db['disabled_users'] = $parsed;
        }
        mysqli_free_result($rs);
    }

    $rpo = @mysqli_query($conn, "SELECT field_key, value FROM preset_options ORDER BY field_key ASC, sort_order ASC, id ASC");
    if ($rpo) {
        while ($row = mysqli_fetch_assoc($rpo)) {
            $fk = $row['field_key'];
            if (!isset($db['preset_options'][$fk])) $db['preset_options'][$fk] = array();
            $db['preset_options'][$fk][] = $row['value'];
        }
        mysqli_free_result($rpo);
    }

    if (!count($db['users'])) $db['users'] = $defaultUsers;
    $db['group_targets'] = normalize_group_targets(isset($db['group_targets']) ? $db['group_targets'] : array(), $db['users']);
    $db['counters']['category'] = max_id($db['categories']);
    $db['counters']['incident'] = max_id($db['incidents']);
    $db['counters']['ticket'] = max_id($db['tickets']);
    $db['counters']['user'] = max_id($db['users']);
    $db['counters']['preset_option_request'] = max_id($db['preset_option_requests']);
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
        "DELETE FROM preset_options",
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
        $presetRequestsJson = mysql_escape($conn, json_encode(isset($db['preset_option_requests']) && is_array($db['preset_option_requests']) ? $db['preset_option_requests'] : array()));
        if ($ok && !mysqli_query($conn, "INSERT INTO app_settings (setting_key, setting_value) VALUES ('preset_option_requests', '$presetRequestsJson')")) { $ok = false; }
        $presetFormatsJson = mysql_escape($conn, json_encode(isset($db['preset_option_formats']) && is_array($db['preset_option_formats']) ? $db['preset_option_formats'] : array()));
        if ($ok && !mysqli_query($conn, "INSERT INTO app_settings (setting_key, setting_value) VALUES ('preset_option_formats', '$presetFormatsJson')")) { $ok = false; }
        $groupTargetsJson = mysql_escape($conn, json_encode(normalize_group_targets(isset($db['group_targets']) ? $db['group_targets'] : array(), isset($db['users']) ? $db['users'] : array())));
        if ($ok && !mysqli_query($conn, "INSERT INTO app_settings (setting_key, setting_value) VALUES ('group_targets', '$groupTargetsJson')")) { $ok = false; }
        $userChartsJson = mysql_escape($conn, json_encode(isset($db['user_charts']) && is_array($db['user_charts']) ? $db['user_charts'] : array()));
        if ($ok && !mysqli_query($conn, "INSERT INTO app_settings (setting_key, setting_value) VALUES ('user_charts', '$userChartsJson')")) { $ok = false; }
        $pinnedJson = mysql_escape($conn, json_encode(isset($db['pinned_tickets']) && is_array($db['pinned_tickets']) ? $db['pinned_tickets'] : array()));
        if ($ok && !mysqli_query($conn, "INSERT INTO app_settings (setting_key, setting_value) VALUES ('pinned_tickets', '$pinnedJson')")) { $ok = false; }
        $disabledJson = mysql_escape($conn, json_encode(isset($db['disabled_users']) && is_array($db['disabled_users']) ? $db['disabled_users'] : array()));
        if ($ok && !mysqli_query($conn, "INSERT INTO app_settings (setting_key, setting_value) VALUES ('disabled_users', '$disabledJson')")) { $ok = false; }
    }

    if ($ok && isset($db['preset_options']) && is_array($db['preset_options'])) {
        $poOrder = array();
        foreach ($db['preset_options'] as $fk => $opts) {
            if (!is_array($opts)) continue;
            $fkEsc = mysql_escape($conn, $fk);
            if (!isset($poOrder[$fk])) $poOrder[$fk] = 0;
            foreach ($opts as $opt) {
                $poOrder[$fk]++;
                $optEsc = mysql_escape($conn, $opt);
                if (!mysqli_query($conn, "INSERT IGNORE INTO preset_options (field_key, value, sort_order) VALUES ('$fkEsc', '$optEsc', {$poOrder[$fk]})")) { $ok = false; break 2; }
            }
        }
    }

    if ($ok) {
        $order = 1;
        foreach ($db['categories'] as $c) {
            $id = intval($c['id']);
            $name = mysql_escape($conn, $c['name']);
            $hidden = !empty($c['hidden']) ? 1 : 0;
            if (!mysqli_query($conn, "INSERT INTO categories (id,name,hidden,sort_order) VALUES ($id,'$name',$hidden,$order)")) { $ok = false; break; }
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
            $hidden = !empty($i['hidden']) ? 1 : 0;
            $sev = isset($i['severity_default']) ? intval($i['severity_default']) : 1;
            $mode = mysql_escape($conn, isset($i['severity_mode']) ? $i['severity_mode'] : 'default');
            $fab = mysql_escape($conn, isset($i['fab_default']) ? $i['fab_default'] : '');
            $nm = (isset($i['name_mode']) && $i['name_mode'] === 'custom') ? 'custom' : 'default';
            $so = intval($sortByCat[$cat]);
            if (!mysqli_query($conn, "INSERT INTO incidents (id,category_id,name,hidden,severity_default,severity_mode,fab_default,name_mode,sort_order) VALUES ($id,$cat,'$name',$hidden,$sev,'$mode','$fab','$nm',$so)")) { $ok = false; break; }

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
            $gn = mysql_escape($conn, isset($u['group_name']) ? strval($u['group_name']) : 'ProdOps');
            $pt = normalize_personal_target(isset($u['personal_target']) ? $u['personal_target'] : 20);
            $gt = normalize_group_target(isset($u['group_target']) ? $u['group_target'] : 20);
            if (!mysqli_query($conn, "INSERT INTO app_users (id,username,password,role,team,group_name,personal_target,group_target) VALUES ($id,'$un','$pw','$rl','$tm','$gn',$pt,$gt)")) { $ok = false; break; }
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
            $in = mysql_escape($conn, isset($t['incident_name']) ? $t['incident_name'] : '');
            $de = mysql_escape($conn, isset($t['description']) ? $t['description'] : '');
            $fa = mysql_escape($conn, isset($t['fab']) ? $t['fab'] : '');
            $ca = mysql_escape($conn, isset($t['created_at']) ? $t['created_at'] : gmdate('c'));
            $se = isset($t['severity']) ? intval($t['severity']) : 1;
            $ou = (isset($t['owner_user_id']) && $t['owner_user_id'] !== null) ? intval($t['owner_user_id']) : 'NULL';
            $ot = mysql_escape($conn, isset($t['owner_team']) ? normalize_team($t['owner_team']) : 'A');
            if (!mysqli_query($conn, "INSERT INTO tickets (id,incident_id,incident_name,description,fab,created_at,severity,owner_user_id,owner_team) VALUES ($id,$incidentId,'$in','$de','$fa','$ca',$se,$ou,'$ot')")) { $ok = false; break; }
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

function mysql_insert_ticket_direct($incidentId, $incidentName, $desc, $fab, $createdAt, $severity, $ownerUserId, $ownerTeam)
{
    $conn = mysql_conn();
    if (!$conn) return null;
    $lr = @mysqli_query($conn, "SELECT GET_LOCK('prodops_ticket_insert', 10)");
    if (!$lr) return null;
    $lrow = mysqli_fetch_row($lr);
    mysqli_free_result($lr);
    if (!$lrow || !$lrow[0]) return null;
    $r = @mysqli_query($conn, 'SELECT COALESCE(MAX(id),0)+1 AS next_id FROM tickets');
    if (!$r) { @mysqli_query($conn, "SELECT RELEASE_LOCK('prodops_ticket_insert')"); return null; }
    $row = mysqli_fetch_row($r);
    $newId = intval($row[0]);
    mysqli_free_result($r);
    $in = mysql_escape($conn, $incidentName);
    $de = mysql_escape($conn, $desc);
    $fa = mysql_escape($conn, $fab);
    $ca = mysql_escape($conn, $createdAt);
    $ou = ($ownerUserId !== null && $ownerUserId > 0) ? intval($ownerUserId) : 'NULL';
    $ot = mysql_escape($conn, $ownerTeam);
    $q = "INSERT INTO tickets (id,incident_id,incident_name,description,fab,created_at,severity,owner_user_id,owner_team) VALUES ($newId,$incidentId,'$in','$de','$fa','$ca',$severity,$ou,'$ot')";
    $ok = @mysqli_query($conn, $q);
    @mysqli_query($conn, "SELECT RELEASE_LOCK('prodops_ticket_insert')");
    if (!$ok) return null;
    touch_sync_ts();
    return $newId;
}

function set_active_storage_backend($source)
{
    $GLOBALS['_prodops_active_storage_backend'] = $source;
}

function get_active_storage_backend()
{
    return isset($GLOBALS['_prodops_active_storage_backend']) ? $GLOBALS['_prodops_active_storage_backend'] : null;
}

function db_richness_score($db)
{
    if (!is_array($db)) return -1;
    $ticketCount = isset($db['tickets']) && is_array($db['tickets']) ? count($db['tickets']) : 0;
    $userCount = isset($db['users']) && is_array($db['users']) ? count($db['users']) : 0;
    $incidentCount = isset($db['incidents']) && is_array($db['incidents']) ? count($db['incidents']) : 0;
    $categoryCount = isset($db['categories']) && is_array($db['categories']) ? count($db['categories']) : 0;
    $pinnedCount = isset($db['pinned_tickets']) && is_array($db['pinned_tickets']) ? count($db['pinned_tickets']) : 0;
    $requestCount = isset($db['preset_option_requests']) && is_array($db['preset_option_requests']) ? count($db['preset_option_requests']) : 0;
    return ($ticketCount * 1000000) + ($userCount * 10000) + ($incidentCount * 100) + $categoryCount + ($pinnedCount * 10) + $requestCount;
}

function load_json_db($defaultUsers)
{
    if (!file_exists(DB_PATH)) {
        $empty = array(
            'categories' => array(),
            'incidents' => array(),
            'tickets' => array(),
            'users' => $defaultUsers,
            'group_targets' => array(),
            'preset_options' => array(),
            'preset_option_requests' => array(),
            'preset_option_formats' => array(),
            'counters' => array('category' => 0, 'incident' => 0, 'ticket' => 0, 'user' => 2, 'preset_option_request' => 0)
        );
        file_put_contents(DB_PATH, json_encode($empty, JSON_PRETTY_PRINT));
        return $empty;
    }
    $content = file_get_contents(DB_PATH);
    if (substr($content, 0, 3) === "\xEF\xBB\xBF") $content = substr($content, 3);
    $db = json_decode($content, true);
    if (!is_array($db)) {
        $db = array();
    }
    if (!isset($db['categories']) || !is_array($db['categories'])) $db['categories'] = array();
    if (!isset($db['incidents']) || !is_array($db['incidents'])) $db['incidents'] = array();
    if (!isset($db['tickets']) || !is_array($db['tickets'])) $db['tickets'] = array();
    if (!isset($db['preset_options']) || !is_array($db['preset_options'])) $db['preset_options'] = array();
    if (!isset($db['preset_option_requests']) || !is_array($db['preset_option_requests'])) $db['preset_option_requests'] = array();
    if (!isset($db['preset_option_formats']) || !is_array($db['preset_option_formats'])) $db['preset_option_formats'] = array();
    if (!isset($db['group_targets']) || !is_array($db['group_targets'])) $db['group_targets'] = array();
    if (!isset($db['user_charts']) || !is_array($db['user_charts'])) $db['user_charts'] = array();
    if (!isset($db['ui_colors']) || !is_array($db['ui_colors'])) $db['ui_colors'] = default_ui_colors();
    $db['ui_colors'] = normalize_ui_colors($db['ui_colors']);
    $existingIncidentIds = array();
    foreach ($db['incidents'] as $incRow) {
        $existingIncidentIds[intval($incRow['id'])] = true;
    }
    foreach ($db['categories'] as $categoryRow) {
        $categoryId = isset($categoryRow['id']) ? intval($categoryRow['id']) : 0;
        $nestedIncidents = isset($categoryRow['incidents']) && is_array($categoryRow['incidents']) ? $categoryRow['incidents'] : array();
        foreach ($nestedIncidents as $incidentRow) {
            $incidentId = isset($incidentRow['id']) ? intval($incidentRow['id']) : 0;
            if ($incidentId > 0 && !isset($existingIncidentIds[$incidentId])) {
                $incidentRow['category_id'] = $categoryId;
                $db['incidents'][] = $incidentRow;
                $existingIncidentIds[$incidentId] = true;
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
        if (isset($db['users'][$ui]['role']) && $db['users'][$ui]['role'] === 'supervisor') {
            $db['users'][$ui]['team'] = '';
        } else {
            if (!isset($db['users'][$ui]['team'])) $db['users'][$ui]['team'] = isset($userRow['team']) ? normalize_team($userRow['team']) : 'A';
            $db['users'][$ui]['team'] = normalize_team($db['users'][$ui]['team']);
        }
        if (!isset($db['users'][$ui]['group_name']) || $db['users'][$ui]['group_name'] === '') $db['users'][$ui]['group_name'] = 'ProdOps';
        if (!isset($db['users'][$ui]['personal_target'])) $db['users'][$ui]['personal_target'] = 20;
        if (!isset($db['users'][$ui]['group_target'])) $db['users'][$ui]['group_target'] = 20;
        $db['users'][$ui]['personal_target'] = normalize_personal_target($db['users'][$ui]['personal_target']);
        $db['users'][$ui]['group_target'] = normalize_group_target($db['users'][$ui]['group_target']);
    }
    $db['group_targets'] = normalize_group_targets($db['group_targets'], $db['users']);
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
    if (!isset($db['counters']['preset_option_request'])) $db['counters']['preset_option_request'] = max_id($db['preset_option_requests']);
    return $db;
}

function load_db($defaultUsers)
{
    $jsonDb = load_json_db($defaultUsers);
    $mysqlDb = mysql_load_db($defaultUsers);

    if (is_local_dev_host()) {
        $selected = 'json';
        if (is_array($mysqlDb) && db_richness_score($mysqlDb) > db_richness_score($jsonDb)) {
            $selected = 'mysql';
        }
        set_active_storage_backend($selected);
        return $selected === 'mysql' ? $mysqlDb : $jsonDb;
    }

    if (is_array($mysqlDb)) {
        set_active_storage_backend('mysql');
        return $mysqlDb;
    }

    set_active_storage_backend('json');
    return $jsonDb;
}

function touch_sync_ts()
{
    @file_put_contents(SYNC_TS_PATH, sprintf('%.6f', microtime(true)));
}

function save_db($db)
{
    $activeStorage = get_active_storage_backend();
    if ($activeStorage === 'mysql') {
        if (mysql_save_db($db)) { touch_sync_ts(); return true; }
        return false;
    }

    if ($activeStorage !== 'json' && mysql_enabled()) {
        if (mysql_save_db($db)) { touch_sync_ts(); return true; }
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
    touch_sync_ts();
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

function ticket_with_permissions($ticket, $user, $users = null)
{
    $ownerId = isset($ticket['owner_user_id']) ? intval($ticket['owner_user_id']) : 0;
    $ticket['owner_user_id'] = $ownerId > 0 ? $ownerId : null;
    $ticket['owner_team'] = normalize_team(isset($ticket['owner_team']) ? $ticket['owner_team'] : 'A');
    $isAdmin = isset($user['role']) && ($user['role'] === 'admin' || $user['role'] === 'supervisor');
    $ticket['can_edit'] = $isAdmin || ($ownerId > 0 && intval($user['id']) === $ownerId);
    if (!isset($ticket['severity'])) $ticket['severity'] = 1;
    $ticket['owner_username'] = '';
    if ($ownerId > 0 && is_array($users)) {
        $ownerUser = user_by_id($users, $ownerId);
        if ($ownerUser) $ticket['owner_username'] = isset($ownerUser['username']) ? strval($ownerUser['username']) : '';
    }
    return $ticket;
}

function require_ticket_owner($ticket, $user, $action)
{
    if (isset($user['role']) && ($user['role'] === 'admin' || $user['role'] === 'supervisor')) return;
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

function summarize_by_incident($tickets, $incidents)
{
    $nameById = array();
    foreach ($incidents as $inc) $nameById[intval($inc['id'])] = strval($inc['name']);
    $counts = array();
    $order = array();
    foreach ($tickets as $t) {
        $incidentId = isset($t['incident_id']) ? intval($t['incident_id']) : 0;
        $name = ($incidentId > 0 && isset($nameById[$incidentId]))
            ? $nameById[$incidentId]
            : (isset($t['incident_name']) ? strval($t['incident_name']) : '');
        if ($name === '') $name = 'N/D';
        if (!isset($counts[$name])) { $counts[$name] = 0; $order[] = $name; }
        $counts[$name]++;
    }
    $out = array();
    foreach ($order as $name) $out[] = array('label' => $name, 'total' => $counts[$name]);
    usort($out, function ($a, $b) { return $b['total'] - $a['total']; });
    return $out;
}

function custom_ticket_category_name($ticket, $categories, $incidents)
{
    $incidentToCatByName = array();
    $incidentToCatById = array();
    $categoryNameById = array();
    foreach ($categories as $cat) $categoryNameById[intval($cat['id'])] = strval($cat['name']);
    foreach ($incidents as $inc) {
        $incidentToCatByName[strval($inc['name'])] = intval($inc['category_id']);
        $incidentToCatById[intval($inc['id'])] = intval($inc['category_id']);
    }
    $incidentId = isset($ticket['incident_id']) ? intval($ticket['incident_id']) : 0;
    if ($incidentId > 0 && isset($incidentToCatById[$incidentId])) {
        $catId = $incidentToCatById[$incidentId];
        return isset($categoryNameById[$catId]) ? $categoryNameById[$catId] : '';
    }
    $incidentName = isset($ticket['incident_name']) ? strval($ticket['incident_name']) : '';
    if ($incidentName !== '' && isset($incidentToCatByName[$incidentName])) {
        $catId = $incidentToCatByName[$incidentName];
        return isset($categoryNameById[$catId]) ? $categoryNameById[$catId] : '';
    }
    return '';
}

function custom_ticket_severity_label($ticket)
{
    $severity = isset($ticket['severity']) ? intval($ticket['severity']) : 1;
    if ($severity === 2) return '2 - Medium';
    if ($severity === 3) return '3 - High';
    if ($severity === 4) return '4 - Extreme';
    return '1 - Low';
}

function filter_custom_tickets($tickets, $filterMap, $categories, $incidents)
{
    if (!is_array($filterMap) || !count($filterMap)) return $tickets;
    return array_values(array_filter($tickets, function($ticket) use ($filterMap, $categories, $incidents) {
        if (isset($filterMap['fab']) && count($filterMap['fab'])) {
            $fab = isset($ticket['fab']) ? strval($ticket['fab']) : '';
            if (!in_array($fab, $filterMap['fab'], true)) return false;
        }
        if (isset($filterMap['team']) && count($filterMap['team'])) {
            $team = normalize_team(isset($ticket['owner_team']) ? $ticket['owner_team'] : 'A');
            if (!in_array($team, $filterMap['team'], true)) return false;
        }
        if (isset($filterMap['severity']) && count($filterMap['severity'])) {
            $severityLabel = custom_ticket_severity_label($ticket);
            if (!in_array($severityLabel, $filterMap['severity'], true)) return false;
        }
        if (isset($filterMap['incident']) && count($filterMap['incident'])) {
            $incidentName = isset($ticket['incident_name']) ? strval($ticket['incident_name']) : '';
            if (!in_array($incidentName, $filterMap['incident'], true)) return false;
        }
        if (isset($filterMap['category']) && count($filterMap['category'])) {
            $categoryName = custom_ticket_category_name($ticket, $categories, $incidents);
            if (!in_array($categoryName, $filterMap['category'], true)) return false;
        }
        return true;
    }));
}

function custom_range_from_request()
{
    $start = isset($_GET['start']) ? trim(strval($_GET['start'])) : '';
    $end = isset($_GET['end']) ? trim(strval($_GET['end'])) : '';
    if ($start === '' || $end === '') return null;
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $start) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $end)) return null;
    $startTs = strtotime($start . 'T00:00:00+00:00');
    $endTs = strtotime($end . 'T00:00:00+00:00');
    if ($startTs === false || $endTs === false || $endTs < $startTs) return null;
    $endTs += 86400;
    return array(gmdate('c', $startTs), gmdate('c', $endTs));
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

// Consente ad altri script (es. extensions/export.php) di includere questo file
// per riusarne le funzioni helper senza eseguire il router delle API.
if (defined('PRODOPS_LIB_ONLY')) return;

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$basePath = app_base_path();
if ($basePath !== '' && ($path === $basePath || strpos($path, $basePath . '/') === 0)) {
    $path = substr($path, strlen($basePath));
    if ($path === '') $path = '/';
}

if ($path === '/' || $path === '/index.html') {
    require_page_auth('user');
    readfile(dirname(__FILE__) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'index.html');
    exit;
}
if ($path === '/admin.html') {
    require_page_auth('admin');
    readfile(dirname(__FILE__) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'admin.html');
    exit;
}
if ($path === '/search.html') {
    require_page_auth('user');
    readfile(dirname(__FILE__) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'search.html');
    exit;
}
if ($path === '/login.html') {
    $u = read_auth_user();
    if ($u) {
        header('Location: ' . app_url('/index.html'));
        exit;
    }
    readfile(dirname(__FILE__) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'login.html');
    exit;
}

if (strpos($path, '/api/') !== 0) {
    header(' ', true, 404);
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
        if (strtolower($u['username']) !== strtolower($username)) continue;
        $disabledList = isset($db['disabled_users']) && is_array($db['disabled_users']) ? $db['disabled_users'] : array();
        if (in_array(intval($u['id']), $disabledList)) {
            if ($isJsonRequest) json_response(array('error' => 'Account disabilitato. Contatta l\'amministratore.'), 403);
            header('Location: ' . app_url('/login.html?error=disabled'), true, 302);
            exit;
        }
        $role = isset($u['role']) ? strval($u['role']) : 'user';
        $authenticated = ldap_auth_user($username, $password);
        if ($authenticated) {
            // Aggiorna last_login e last_login_ip se le colonne esistono
            if (isset($conn) && $conn) {
                $ip = isset($_SERVER['REMOTE_ADDR']) ? @mysqli_real_escape_string($conn, $_SERVER['REMOTE_ADDR']) : '';
                @mysqli_query($conn, "UPDATE app_users SET last_login=NOW(), last_login_ip='" . $ip . "' WHERE id=" . intval($u['id']));
            }
            set_auth_cookie($u);
            $redirectTo = app_url('/index.html');
            if ($isJsonRequest) {
                json_response(array(
                    'id' => intval($u['id']),
                    'username' => $u['username'],
                    'role' => $role,
                    'team' => normalize_team(isset($u['team']) ? $u['team'] : 'A'),
                    'redirectTo' => $redirectTo
                ), 200);
            }
            header('Location: ' . $redirectTo, true, 302);
            exit;
        }
        break;
    }
    if ($isJsonRequest) {
        json_response(array('error' => 'Credenziali non valide'), 401);
    }
    header('Location: ' . app_url('/login.html?error=1'), true, 302);
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
    if (!isset($me['role']) || $me['role'] !== 'supervisor') {
        $me['team'] = normalize_team(isset($me['team']) ? $me['team'] : 'A');
    } else {
        $me['team'] = '';
    }
    json_response(array('user' => $me), 200);
}


function allowed_avatars() {
    return array('🦁','🐯','🐻','🦊','🐼','🐨','🐸','🐱','🐶','🐺','🦝','🦅','🦉','🐙','🦋','🐲','🤖','👽','🥷','🦸');
}

if ($path === '/api/user-avatars' && $method === 'GET') {
    $map = array();
    foreach ($db['users'] as $u) {
        if (isset($u['avatar']) && $u['avatar'] !== '' && isset($u['username'])) {
            $map[$u['username']] = $u['avatar'];
        }
    }
    json_response(array('avatars' => (object)$map), 200);
}

if ($path === '/api/me/avatar' && $method === 'PUT') {
    $avatar = array_key_exists('avatar', $payload) ? strval($payload['avatar']) : '';
    if ($avatar !== '' && !in_array($avatar, allowed_avatars(), true)) {
        json_response(array('error' => 'Avatar non valido'), 400);
    }
    $found = false;
    foreach ($db['users'] as &$u) {
        if (intval($u['id']) === intval($user['id'])) {
            if ($avatar === '') { unset($u['avatar']); } else { $u['avatar'] = $avatar; }
            $found = true;
            break;
        }
    }
    unset($u);
    if (!$found) json_response(array('error' => 'Utente non trovato'), 404);
    save_db($db);
    json_response(array('ok' => true, 'avatar' => $avatar), 200);
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

if ($path === '/api/group-targets' && $method === 'GET') {
    require_api_auth('admin');
    $groupTargets = normalize_group_targets(isset($db['group_targets']) ? $db['group_targets'] : array(), $db['users']);
    json_response(array_values($groupTargets), 200);
}

if ($path === '/api/group-targets' && $method === 'PUT') {
    require_api_auth('admin');
    $groupName = normalize_group_name(isset($payload['group_name']) ? $payload['group_name'] : '');
    $db['group_targets'] = normalize_group_targets(isset($db['group_targets']) ? $db['group_targets'] : array(), $db['users']);
    $db['group_targets'][$groupName] = array(
        'group_name' => $groupName,
        'personal_target_monthly' => normalize_personal_target(isset($payload['personal_target_monthly']) ? $payload['personal_target_monthly'] : (isset($payload['personal_target']) ? $payload['personal_target'] : 20)),
        'personal_target_annual' => normalize_personal_target(isset($payload['personal_target_annual']) ? $payload['personal_target_annual'] : 240),
        'group_target_monthly' => normalize_group_target(isset($payload['group_target_monthly']) ? $payload['group_target_monthly'] : (isset($payload['group_target']) ? $payload['group_target'] : 20)),
        'group_target_annual' => normalize_group_target(isset($payload['group_target_annual']) ? $payload['group_target_annual'] : 240),
        'personal_target' => normalize_personal_target(isset($payload['personal_target_monthly']) ? $payload['personal_target_monthly'] : (isset($payload['personal_target']) ? $payload['personal_target'] : 20)),
        'group_target' => normalize_group_target(isset($payload['group_target_monthly']) ? $payload['group_target_monthly'] : (isset($payload['group_target']) ? $payload['group_target'] : 20))
    );
    $db['group_targets'] = normalize_group_targets($db['group_targets'], $db['users']);
    save_db($db);
    json_response(array('ok' => true, 'group_target' => $db['group_targets'][$groupName]), 200);
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
    $disabledList = isset($db['disabled_users']) && is_array($db['disabled_users']) ? $db['disabled_users'] : array();
    $out = array();
    if (supabase_enabled()) {
        $resp = sb_select('app_users', 'id,username,role,team,group_name,personal_target,group_target', array(), 'id.asc');
        if ($resp['ok'] && is_array($resp['data'])) {
            foreach ($resp['data'] as $u) $out[] = array('id' => intval($u['id']), 'username' => $u['username'], 'role' => $u['role'], 'team' => normalize_team(isset($u['team']) ? $u['team'] : 'A'), 'group_name' => isset($u['group_name']) ? strval($u['group_name']) : 'ProdOps', 'personal_target' => normalize_personal_target(isset($u['personal_target']) ? $u['personal_target'] : 20), 'group_target' => normalize_group_target(isset($u['group_target']) ? $u['group_target'] : 20), 'disabled' => in_array(intval($u['id']), $disabledList));
            json_response($out, 200);
        }
    }
    foreach ($db['users'] as $u) $out[] = array('id' => intval($u['id']), 'username' => $u['username'], 'role' => $u['role'], 'team' => normalize_team(isset($u['team']) ? $u['team'] : 'A'), 'group_name' => isset($u['group_name']) ? strval($u['group_name']) : 'ProdOps', 'personal_target' => normalize_personal_target(isset($u['personal_target']) ? $u['personal_target'] : 20), 'group_target' => normalize_group_target(isset($u['group_target']) ? $u['group_target'] : 20), 'disabled' => in_array(intval($u['id']), $disabledList));
    json_response($out, 200);
}

if ($path === '/api/users' && $method === 'POST') {
    require_api_auth('admin');
    $username = isset($payload['username']) ? trim(strval($payload['username'])) : '';
    $password = isset($payload['password']) ? trim(strval($payload['password'])) : '';
    $role = isset($payload['role']) ? strtolower(trim(strval($payload['role']))) : 'user';
    $team = $role === 'supervisor' ? '' : normalize_team(isset($payload['team']) ? $payload['team'] : 'A');
    $group_name = normalize_group_name(isset($payload['group_name']) ? $payload['group_name'] : 'ProdOps');
    $personal_target = normalize_personal_target(isset($payload['personal_target']) ? $payload['personal_target'] : 20);
    $group_target = normalize_group_target(isset($payload['group_target']) ? $payload['group_target'] : 20);
    if ($username === '') json_response(array('error' => 'Username obbligatorio'), 400);
    if ($role !== 'admin' && $role !== 'user' && $role !== 'supervisor' && $role !== 'moderator') json_response(array('error' => 'Ruolo non valido'), 400);
    foreach ($db['users'] as $u) {
        if (strtolower($u['username']) === strtolower($username)) json_response(array('error' => 'Username gia esistente'), 409);
    }
    $db['counters']['user'] = intval($db['counters']['user']) + 1;
    $newUser = array('id' => $db['counters']['user'], 'username' => $username, 'password' => '', 'role' => $role, 'team' => $team, 'group_name' => $group_name, 'personal_target' => $personal_target, 'group_target' => $group_target);
    $db['users'][] = $newUser;
    $db['group_targets'] = normalize_group_targets(isset($db['group_targets']) ? $db['group_targets'] : array(), $db['users']);
    save_db($db);
    json_response(array('id' => $newUser['id'], 'username' => $username, 'role' => $role, 'team' => $team, 'group_name' => $group_name, 'personal_target' => $personal_target, 'group_target' => $group_target), 200);
}

if (preg_match('#^/api/users/(\d+)$#', $path, $m) && $method === 'PUT') {
    require_api_auth('admin');
    $id = intval($m[1]);
    $disableAction = array_key_exists('disabled', $payload) ? (bool)$payload['disabled'] : null;
    if ($disableAction !== null && count($payload) === 1) {
        if ($id === intval($user['id']) && $disableAction) json_response(array('error' => 'Non puoi disabilitare il tuo account'), 400);
        $found = false;
        foreach ($db['users'] as $u) { if (intval($u['id']) === $id) { $found = true; break; } }
        if (!$found) json_response(array('error' => 'Utente non trovato'), 404);
        $disabledList = isset($db['disabled_users']) && is_array($db['disabled_users']) ? $db['disabled_users'] : array();
        if ($disableAction) {
            if (!in_array($id, $disabledList)) $disabledList[] = $id;
        } else {
            $disabledList = array_values(array_filter($disabledList, function($uid) use ($id) { return intval($uid) !== $id; }));
        }
        $db['disabled_users'] = $disabledList;
        save_db($db);
        json_response(array('ok' => true, 'disabled' => in_array($id, $disabledList)), 200);
    }
    $team = normalize_team(isset($payload['team']) ? $payload['team'] : 'A');
    $role = isset($payload['role']) ? strtolower(trim(strval($payload['role']))) : null;
    $password = array_key_exists('password', $payload) ? trim(strval($payload['password'])) : null;
    $group_name = array_key_exists('group_name', $payload) ? normalize_group_name(isset($payload['group_name']) ? $payload['group_name'] : 'ProdOps') : null;
    $personal_target = isset($payload['personal_target']) ? normalize_personal_target($payload['personal_target']) : null;
    $group_target = isset($payload['group_target']) ? normalize_group_target($payload['group_target']) : null;
    $adminCount = 0;
    foreach ($db['users'] as $adminUser) {
        if (isset($adminUser['role']) && $adminUser['role'] === 'admin') $adminCount++;
    }
    foreach ($db['users'] as &$u) {
        if (intval($u['id']) === $id) {
            if ($group_name !== null) $u['group_name'] = $group_name;
            if ($personal_target !== null) $u['personal_target'] = $personal_target;
            if ($group_target !== null) $u['group_target'] = $group_target;
            if ($role !== null && $role !== '') {
                if ($role !== 'admin' && $role !== 'user' && $role !== 'supervisor' && $role !== 'moderator') json_response(array('error' => 'Ruolo non valido'), 400);
                if ($id === intval($user['id']) && $role !== $u['role']) json_response(array('error' => 'Non puoi modificare il ruolo del tuo utente'), 400);
                if ($u['role'] === 'admin' && $role !== 'admin' && $adminCount <= 1) json_response(array('error' => 'Deve restare almeno un amministratore'), 400);
                $u['role'] = $role;
            }
            $u['team'] = $u['role'] === 'supervisor' ? '' : $team;
            $u['password'] = '';
            $db['group_targets'] = normalize_group_targets(isset($db['group_targets']) ? $db['group_targets'] : array(), $db['users']);
            save_db($db);
            json_response(array('ok' => true, 'user' => array('id' => $id, 'username' => $u['username'], 'role' => $u['role'], 'team' => $u['team'], 'group_name' => isset($u['group_name']) ? $u['group_name'] : 'ProdOps', 'personal_target' => normalize_personal_target(isset($u['personal_target']) ? $u['personal_target'] : 20), 'group_target' => normalize_group_target(isset($u['group_target']) ? $u['group_target'] : 20))), 200);
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
    $adminCount = 0;
    foreach ($db['users'] as $adminUser) {
        if (isset($adminUser['role']) && $adminUser['role'] === 'admin') $adminCount++;
    }
    foreach ($db['users'] as $u) {
        if (intval($u['id']) === $id) {
            if ($u['role'] === 'admin' && $adminCount <= 1) json_response(array('error' => 'Deve restare almeno un amministratore'), 400);
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

if ($path === '/api/pinned-tickets' && $method === 'GET') {
    $pins = isset($db['pinned_tickets']) && is_array($db['pinned_tickets']) ? $db['pinned_tickets'] : array();
    $today = date('Y-m-d');
    $active = array();
    foreach ($pins as $p) {
        if (isset($p['pinUntil']) && strval($p['pinUntil']) >= $today) $active[] = $p;
    }
    if (count($active) !== count($pins)) { $db['pinned_tickets'] = $active; save_db($db); }
    json_response($active, 200);
}

if ($path === '/api/pinned-tickets' && $method === 'POST') {
    $id = isset($payload['id']) ? intval($payload['id']) : 0;
    $pinUntil = isset($payload['pinUntil']) ? preg_replace('/[^0-9-]/', '', strval($payload['pinUntil'])) : '';
    if (!$id || !$pinUntil) json_response(array('error' => 'id e pinUntil obbligatori'), 400);
    $newPin = array(
        'id' => $id,
        'incidentId' => isset($payload['incidentId']) ? intval($payload['incidentId']) : 0,
        'incidentName' => isset($payload['incidentName']) ? strval($payload['incidentName']) : '',
        'description' => isset($payload['description']) ? strval($payload['description']) : '',
        'fab' => isset($payload['fab']) ? strval($payload['fab']) : '',
        'createdAt' => isset($payload['createdAt']) ? strval($payload['createdAt']) : '',
        'severity' => isset($payload['severity']) ? intval($payload['severity']) : 1,
        'category' => isset($payload['category']) ? strval($payload['category']) : '',
        'pinUntil' => $pinUntil
    );
    $pins = isset($db['pinned_tickets']) && is_array($db['pinned_tickets']) ? $db['pinned_tickets'] : array();
    $kept = array();
    foreach ($pins as $p) { if (intval($p['id']) !== $id) $kept[] = $p; }
    $kept[] = $newPin;
    $db['pinned_tickets'] = $kept;
    save_db($db);
    json_response(array('ok' => true), 200);
}

if (preg_match('#^/api/pinned-tickets/(\d+)$#', $path, $m) && $method === 'DELETE') {
    $id = intval($m[1]);
    $pins = isset($db['pinned_tickets']) && is_array($db['pinned_tickets']) ? $db['pinned_tickets'] : array();
    $kept = array();
    foreach ($pins as $p) { if (intval($p['id']) !== $id) $kept[] = $p; }
    $db['pinned_tickets'] = $kept;
    save_db($db);
    json_response(array('ok' => true), 200);
}

if ($path === '/api/preset-options' && $method === 'GET') {
    $fieldKey = normalize_preset_field_key(isset($_GET['field_key']) ? $_GET['field_key'] : '');
    if ($fieldKey === '') json_response(array('error' => 'Campo non valido'), 400);
    $options = isset($db['preset_options'][$fieldKey]) && is_array($db['preset_options'][$fieldKey]) ? $db['preset_options'][$fieldKey] : array();
    natcasesort($options);
    $pending = array();
    $now = time();
    foreach ($db['preset_option_requests'] as $request) {
        if (!isset($request['status']) || $request['status'] !== 'pending') continue;
        if (!isset($request['field_key']) || $request['field_key'] !== $fieldKey) continue;
        $createdAt = isset($request['created_at']) ? strtotime($request['created_at']) : false;
        if ($createdAt === false || ($now - $createdAt) > 48 * 3600) continue;
        $pending[] = $request['value'];
    }
    natcasesort($pending);
    json_response(array('field_key' => $fieldKey, 'options' => array_values($options), 'pending' => array_values($pending), 'format_mode' => get_preset_format_mode($db, $fieldKey)), 200);
}

if ($path === '/api/preset-option-requests' && $method === 'POST') {
    $fieldLabel = isset($payload['field_label']) ? trim(strval($payload['field_label'])) : '';
    $fieldKey = normalize_preset_field_key(isset($payload['field_key']) ? $payload['field_key'] : $fieldLabel);
    $value = isset($payload['value']) ? trim(strval($payload['value'])) : '';
    $incidentId = isset($payload['incident_id']) ? intval($payload['incident_id']) : 0;
    if ($fieldKey === '' || $value === '') json_response(array('error' => 'Campo e valore obbligatori'), 400);
    $value = apply_preset_format_mode($value, get_preset_format_mode($db, $fieldKey));
    $approved = isset($db['preset_options'][$fieldKey]) && is_array($db['preset_options'][$fieldKey]) ? $db['preset_options'][$fieldKey] : array();
    foreach ($approved as $option) {
        if (strtolower($option) === strtolower($value)) json_response(array('ok' => true, 'already_approved' => true), 200);
    }
    foreach ($db['preset_option_requests'] as $request) {
        if ($request['status'] === 'pending' && $request['field_key'] === $fieldKey && strtolower($request['value']) === strtolower($value)) {
            json_response(array('ok' => true, 'already_pending' => true, 'request' => $request), 200);
        }
    }
    $db['counters']['preset_option_request'] = intval($db['counters']['preset_option_request']) + 1;
    $request = array(
        'id' => $db['counters']['preset_option_request'],
        'field_key' => $fieldKey,
        'field_label' => $fieldLabel !== '' ? $fieldLabel : $fieldKey,
        'value' => $value,
        'incident_id' => $incidentId,
        'requested_by_user_id' => intval($user['id']),
        'requested_by_username' => isset($user['username']) ? $user['username'] : '',
        'status' => 'pending',
        'created_at' => gmdate('c')
    );
    $db['preset_option_requests'][] = $request;
    save_db($db);
    json_response(array('ok' => true, 'request' => $request), 200);
}

if ($path === '/api/admin/preset-option-requests' && $method === 'GET') {
    require_api_auth('moderator');
    $pending = array();
    foreach ($db['preset_option_requests'] as $request) {
        if (isset($request['status']) && $request['status'] === 'pending') $pending[] = $request;
    }
    usort($pending, function($a, $b) { return strcmp($b['created_at'], $a['created_at']); });
    json_response($pending, 200);
}

if (preg_match('#^/api/admin/preset-option-requests/(\d+)$#', $path, $m) && $method === 'PUT') {
    require_api_auth('moderator');
    $id = intval($m[1]);
    $action = isset($payload['action']) ? strtolower(trim(strval($payload['action']))) : '';
    if ($action !== 'approve' && $action !== 'reject') json_response(array('error' => 'Azione non valida'), 400);
    foreach ($db['preset_option_requests'] as &$request) {
        if (intval($request['id']) !== $id) continue;
        if ($request['status'] !== 'pending') json_response(array('error' => 'Richiesta gia revisionata'), 409);
        $request['status'] = $action === 'approve' ? 'approved' : 'rejected';
        $request['reviewed_by_user_id'] = intval($user['id']);
        $request['reviewed_at'] = gmdate('c');
        if ($action === 'approve') {
            $fieldKey = $request['field_key'];
            if (!isset($db['preset_options'][$fieldKey]) || !is_array($db['preset_options'][$fieldKey])) $db['preset_options'][$fieldKey] = array();
            $exists = false;
            foreach ($db['preset_options'][$fieldKey] as $option) {
                if (strtolower($option) === strtolower($request['value'])) { $exists = true; break; }
            }
            if (!$exists) $db['preset_options'][$fieldKey][] = $request['value'];
        }
        save_db($db);
        json_response(array('ok' => true, 'request' => $request), 200);
    }
    json_response(array('error' => 'Richiesta non trovata'), 404);
}

if ($path === '/api/admin/preset-options' && $method === 'GET') {
    require_api_auth('moderator');
    $out = array();
    foreach ($db['preset_options'] as $fieldKey => $options) {
        if (!is_array($options)) $options = array();
        $label = '';
        foreach ($db['preset_option_requests'] as $request) {
            if (
                isset($request['field_key']) &&
                $request['field_key'] === $fieldKey &&
                isset($request['field_label']) &&
                trim(strval($request['field_label'])) !== ''
            ) {
                $label = trim(strval($request['field_label']));
                break;
            }
        }
        if ($label === '') $label = ucwords(str_replace('_', ' ', $fieldKey));
        natcasesort($options);
        $out[] = array(
            'field_key' => $fieldKey,
            'field_label' => $label,
            'options' => array_values($options),
            'format_mode' => get_preset_format_mode($db, $fieldKey)
        );
    }
    usort($out, function($a, $b) {
        return strcasecmp(isset($a['field_label']) ? $a['field_label'] : '', isset($b['field_label']) ? $b['field_label'] : '');
    });
    json_response($out, 200);
}

if ($path === '/api/admin/preset-options' && $method === 'POST') {
    require_api_auth('moderator');
    $fieldLabel = isset($payload['field_label']) ? trim(strval($payload['field_label'])) : '';
    $fieldKey = normalize_preset_field_key(isset($payload['field_key']) ? $payload['field_key'] : $fieldLabel);
    $value = isset($payload['value']) ? trim(strval($payload['value'])) : '';
    if ($fieldKey === '' || $value === '') json_response(array('error' => 'Campo e valore obbligatori'), 400);
    $value = apply_preset_format_mode($value, get_preset_format_mode($db, $fieldKey));
    if (!isset($db['preset_options'][$fieldKey]) || !is_array($db['preset_options'][$fieldKey])) $db['preset_options'][$fieldKey] = array();
    foreach ($db['preset_options'][$fieldKey] as $option) {
        if (strtolower($option) === strtolower($value)) json_response(array('error' => 'Elemento gia presente'), 409);
    }
    $db['preset_options'][$fieldKey][] = $value;
    natcasesort($db['preset_options'][$fieldKey]);
    $db['preset_options'][$fieldKey] = array_values($db['preset_options'][$fieldKey]);
    save_db($db);
    json_response(array('ok' => true, 'field_key' => $fieldKey, 'value' => $value), 200);
}

if ($path === '/api/admin/preset-options' && $method === 'PUT') {
    require_api_auth('moderator');
    $fieldKey = normalize_preset_field_key(isset($payload['field_key']) ? $payload['field_key'] : '');
    $originalValue = isset($payload['original_value']) ? trim(strval($payload['original_value'])) : '';
    $value = isset($payload['value']) ? trim(strval($payload['value'])) : '';
    if ($fieldKey === '' || $originalValue === '' || $value === '') json_response(array('error' => 'Campo, valore originale e nuovo valore obbligatori'), 400);
    $value = apply_preset_format_mode($value, get_preset_format_mode($db, $fieldKey));
    if (!isset($db['preset_options'][$fieldKey]) || !is_array($db['preset_options'][$fieldKey])) json_response(array('error' => 'Menu non trovato'), 404);
    $foundIndex = -1;
    foreach ($db['preset_options'][$fieldKey] as $idx => $option) {
        if (strtolower($option) === strtolower($value) && strtolower($option) !== strtolower($originalValue)) {
            json_response(array('error' => 'Esiste gia un elemento con questo nome'), 409);
        }
        if (strtolower($option) === strtolower($originalValue)) $foundIndex = $idx;
    }
    if ($foundIndex < 0) json_response(array('error' => 'Elemento non trovato'), 404);
    $db['preset_options'][$fieldKey][$foundIndex] = $value;
    natcasesort($db['preset_options'][$fieldKey]);
    $db['preset_options'][$fieldKey] = array_values($db['preset_options'][$fieldKey]);
    save_db($db);
    json_response(array('ok' => true, 'field_key' => $fieldKey, 'original_value' => $originalValue, 'value' => $value), 200);
}

if ($path === '/api/admin/preset-options' && $method === 'DELETE') {
    require_api_auth('moderator');
    $fieldKey = normalize_preset_field_key(isset($payload['field_key']) ? $payload['field_key'] : '');
    $value = isset($payload['value']) ? trim(strval($payload['value'])) : '';
    if ($fieldKey === '' || $value === '') json_response(array('error' => 'Campo e valore obbligatori'), 400);
    if (!isset($db['preset_options'][$fieldKey]) || !is_array($db['preset_options'][$fieldKey])) json_response(array('error' => 'Menu non trovato'), 404);
    $kept = array();
    $found = false;
    foreach ($db['preset_options'][$fieldKey] as $option) {
        if (strtolower($option) === strtolower($value)) {
            $found = true;
            continue;
        }
        $kept[] = $option;
    }
    if (!$found) json_response(array('error' => 'Elemento non trovato'), 404);
    $db['preset_options'][$fieldKey] = array_values($kept);
    save_db($db);
    json_response(array('ok' => true), 200);
}

if ($path === '/api/admin/preset-option-format' && $method === 'PUT') {
    require_api_auth('moderator');
    $fieldKey = normalize_preset_field_key(isset($payload['field_key']) ? $payload['field_key'] : '');
    if ($fieldKey === '') json_response(array('error' => 'Campo non valido'), 400);
    $mode = normalize_preset_format_mode(isset($payload['mode']) ? $payload['mode'] : 'none');
    if (!isset($db['preset_option_formats']) || !is_array($db['preset_option_formats'])) $db['preset_option_formats'] = array();
    if ($mode === 'none') unset($db['preset_option_formats'][$fieldKey]);
    else $db['preset_option_formats'][$fieldKey] = $mode;
    save_db($db);
    json_response(array('ok' => true, 'field_key' => $fieldKey, 'mode' => $mode), 200);
}

if ($path === '/api/categories' && $method === 'GET') {
    if (supabase_enabled()) {
        $catsResp = sb_select('categories', 'id,name,hidden,sort_order', array(), 'sort_order.asc');
        $incResp = sb_select('incidents', 'id,category_id,name,hidden,severity_default,severity_mode,fab_default,name_mode,sort_order', array(), 'sort_order.asc');
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
                        if (!isset($inc['hidden'])) $inc['hidden'] = false;
                        if (!isset($inc['severity_default']) || $inc['severity_default'] === null) $inc['severity_default'] = 1;
                        if (!isset($inc['severity_mode']) || !$inc['severity_mode']) $inc['severity_mode'] = 'default';
                        if (!isset($inc['fab_default']) || $inc['fab_default'] === null) $inc['fab_default'] = '';
                        if (!isset($inc['name_mode']) || !$inc['name_mode']) $inc['name_mode'] = 'default';
                        $items[] = $inc;
                    }
                }
                $outSb[] = array('id' => intval($cat['id']), 'name' => $cat['name'], 'hidden' => !empty($cat['hidden']), 'incidents' => $items);
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
                if (!isset($inc['hidden'])) $inc['hidden'] = false;
                if (!isset($inc['severity_default'])) $inc['severity_default'] = 1;
                if (!isset($inc['severity_mode'])) $inc['severity_mode'] = 'default';
                if (!isset($inc['fab_default'])) $inc['fab_default'] = '';
                if (!isset($inc['name_mode'])) $inc['name_mode'] = 'default';
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
        $out[] = array('id' => intval($cat['id']), 'name' => $cat['name'], 'hidden' => !empty($cat['hidden']), 'incidents' => $items);
    }
    json_response($out, 200);
}

if ($path === '/api/categories' && $method === 'POST') {
    require_api_auth('moderator');
    $name = isset($payload['name']) ? trim(strval($payload['name'])) : '';
    if ($name === '') json_response(array('error' => 'Nome categoria obbligatorio'), 400);
    if (supabase_enabled()) {
        $row = sb_select('categories', 'sort_order', array(), 'sort_order.desc');
        $maxOrder = 0;
        if ($row['ok'] && is_array($row['data']) && count($row['data'])) $maxOrder = intval($row['data'][0]['sort_order']);
        $ins = sb_insert('categories', array('name' => $name, 'hidden' => 0, 'sort_order' => $maxOrder + 1), true);
        if ($ins['ok']) json_response(array('id' => intval($ins['data']['id']), 'name' => $ins['data']['name']), 200);
    }
    $db['counters']['category'] = intval($db['counters']['category']) + 1;
    $maxOrder = 0;
    foreach ($db['categories'] as $existingCategory) {
        $currentOrder = isset($existingCategory['sort_order']) ? intval($existingCategory['sort_order']) : 0;
        if ($currentOrder > $maxOrder) $maxOrder = $currentOrder;
    }
    $cat = array('id' => $db['counters']['category'], 'name' => $name, 'hidden' => false, 'sort_order' => $maxOrder + 1);
    $db['categories'][] = $cat;
    save_db($db);
    json_response($cat, 200);
}

if ($path === '/api/categories/reorder' && $method === 'PUT') {
    require_api_auth('moderator');
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
    require_api_auth('moderator');
    $id = intval($m[1]);
    if ($method === 'PUT') {
        $name = isset($payload['name']) ? trim(strval($payload['name'])) : '';
        $hidden = isset($payload['hidden']) ? !!$payload['hidden'] : null;
        if ($name === '' && $hidden === null) json_response(array('error' => 'Dati non validi'), 400);
        foreach ($db['categories'] as &$cat) {
            if (intval($cat['id']) === $id) {
                if ($name !== '') $cat['name'] = $name;
                if ($hidden !== null) $cat['hidden'] = $hidden;
                save_db($db);
                json_response(array('ok' => true), 200);
            }
        }
        json_response(array('error' => 'Categoria non trovata'), 404);
    }
    if ($method === 'DELETE') {
        $removedNames = array();
        $removedIncidentIds = array();
        foreach ($db['incidents'] as $inc) {
            if (intval($inc['category_id']) === $id) {
                $removedNames[] = $inc['name'];
                $removedIncidentIds[] = intval($inc['id']);
            }
        }
        $ticketCount = 0;
        foreach ($db['tickets'] as $t) {
            $tid = isset($t['incident_id']) ? intval($t['incident_id']) : 0;
            if ($tid > 0) {
                if (in_array($tid, $removedIncidentIds, true)) $ticketCount++;
            } else if (in_array(isset($t['incident_name']) ? $t['incident_name'] : '', $removedNames, true)) {
                $ticketCount++;
            }
        }
        if ($ticketCount > 0) {
            json_response(array('error' => 'Categoria con ticket collegati', 'ticket_count' => $ticketCount), 409);
        }
        $newCategories = array();
        foreach ($db['categories'] as $cat) {
            if (intval($cat['id']) !== $id) $newCategories[] = $cat;
        }
        $keptIncidents = array();
        foreach ($db['incidents'] as $inc) {
            if (intval($inc['category_id']) !== $id) $keptIncidents[] = $inc;
        }
        $db['categories'] = $newCategories;
        $db['incidents'] = $keptIncidents;
        save_db($db);
        json_response(array('ok' => true), 200);
    }
}

if ($path === '/api/incidents' && $method === 'POST') {
    require_api_auth('moderator');
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
        'hidden' => false,
        'severity_default' => 1,
        'severity_mode' => 'default',
        'fab_default' => '',
        'name_mode' => 'default',
        'sort_order' => $maxOrder + 1,
        'presets' => array()
    );
    save_db($db);
    json_response(array('ok' => true), 200);
}

if ($path === '/api/incidents/reorder' && $method === 'PUT') {
    require_api_auth('moderator');
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
    require_api_auth('moderator');
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
    require_api_auth('moderator');
    $id = intval($m[1]);
    if ($method === 'PUT') {
        $name = isset($payload['name']) ? trim(strval($payload['name'])) : '';
        $hidden = isset($payload['hidden']) ? !!$payload['hidden'] : null;
        if ($name === '' && $hidden === null) json_response(array('error' => 'Dati non validi'), 400);
        foreach ($db['incidents'] as &$inc) {
            if (intval($inc['id']) === $id) {
                if ($name !== '') $inc['name'] = $name;
                if ($hidden !== null) $inc['hidden'] = $hidden;
                if (isset($payload['severity_default'])) $inc['severity_default'] = intval($payload['severity_default']);
                if (isset($payload['severity_mode'])) $inc['severity_mode'] = strval($payload['severity_mode']);
                if (isset($payload['fab_default'])) $inc['fab_default'] = strtoupper(trim(strval($payload['fab_default'])));
                if (isset($payload['name_mode'])) $inc['name_mode'] = $payload['name_mode'] === 'custom' ? 'custom' : 'default';
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
    if (isset($user['role']) && $user['role'] === 'supervisor') json_response(array('error' => 'Il supervisor non può inserire ticket'), 403);
    $incidentId = isset($payload['incident_id']) ? intval($payload['incident_id']) : 0;
    $customIncidentName = isset($payload['incident_name']) ? trim(strval($payload['incident_name'])) : '';
    $desc = isset($payload['description']) ? trim(strval($payload['description'])) : '';
    $fab = isset($payload['fab']) ? strtoupper(trim(strval($payload['fab']))) : '';
    $ticketTime = isset($payload['ticket_time']) ? strval($payload['ticket_time']) : '';
    $severity = isset($payload['severity']) ? intval($payload['severity']) : 1;
    if ($incidentId <= 0 || $desc === '' || $fab === '' || $ticketTime === '') json_response(array('error' => 'Dati ticket incompleti'), 400);
    if (strtotime($ticketTime) === false) json_response(array('error' => 'Data/ora ticket non valida'), 400);
    $ownerRecord = user_by_id($db['users'], intval($user['id']));
    if (!$ownerRecord) $ownerRecord = $user;
    $incidentName = '';
    $incidentHidden = false;
    $categoryHidden = false;
    $categoryIdByIncident = 0;
    foreach ($db['incidents'] as $inc) {
        if (intval($inc['id']) === $incidentId) {
            $incidentName = $inc['name'];
            $incidentHidden = !empty($inc['hidden']);
            $categoryIdByIncident = intval(isset($inc['category_id']) ? $inc['category_id'] : 0);
            break;
        }
    }
    if ($incidentName === '') json_response(array('error' => 'Incident non valido'), 400);
    $incidentName = resolve_ticket_incident_name($db, $incidentId, $customIncidentName);
    if ($incidentName === '') json_response(array('error' => 'Per gli incident Generic il nome personalizzato e obbligatorio'), 400);
    foreach ($db['categories'] as $cat) {
        if (intval($cat['id']) === $categoryIdByIncident) {
            $categoryHidden = !empty($cat['hidden']);
            break;
        }
    }
    if ($incidentHidden || $categoryHidden) json_response(array('error' => 'Incident nascosto e non selezionabile'), 409);
    $ownerTeam = normalize_team(isset($ownerRecord['team']) ? $ownerRecord['team'] : 'A');
    $createdAt = gmdate('c', strtotime($ticketTime));
    if (mysql_enabled()) {
        $newId = mysql_insert_ticket_direct($incidentId, $incidentName, $desc, $fab, $createdAt, $severity, intval($user['id']), $ownerTeam);
        if ($newId === null) json_response(array('error' => 'Errore inserimento ticket nel database'), 500);
        $ticket = array(
            'id' => $newId,
            'incident_id' => $incidentId,
            'incident_name' => $incidentName,
            'description' => $desc,
            'fab' => $fab,
            'severity' => $severity,
            'owner_user_id' => intval($user['id']),
            'owner_team' => $ownerTeam,
            'created_at' => $createdAt
        );
        json_response(ticket_with_permissions($ticket, $user), 200);
    }
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
        'created_at' => $createdAt
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
        $customIncidentName = isset($payload['incident_name']) ? trim(strval($payload['incident_name'])) : '';
        $desc = isset($payload['description']) ? trim(strval($payload['description'])) : '';
        $fab = isset($payload['fab']) ? strtoupper(trim(strval($payload['fab']))) : '';
        $ticketTime = isset($payload['ticket_time']) ? strval($payload['ticket_time']) : '';
        $severity = isset($payload['severity']) ? intval($payload['severity']) : 1;
        if ($incidentId <= 0 || $desc === '' || $fab === '' || $ticketTime === '') json_response(array('error' => 'Dati ticket incompleti'), 400);
        if (strtotime($ticketTime) === false) json_response(array('error' => 'Data/ora ticket non valida'), 400);
        $incidentName = resolve_ticket_incident_name($db, $incidentId, $customIncidentName);
        if ($incidentName === '') json_response(array('error' => 'Per gli incident Generic il nome personalizzato e obbligatorio'), 400);
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
    foreach ($db['tickets'] as $t) if (in_range($t['created_at'], $start, $end)) $tickets[] = ticket_with_permissions($t, $user, $db['users']);
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
        $tickets[] = ticket_with_permissions($t, $user, $db['users']);
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

if ($path === '/api/tickets/lookup' && $method === 'GET') {
    // Ritorna i ticket filtrati per una dimensione+valore (click su un elemento
    // di un grafico) o per un intervallo start/end esplicito (click su un punto
    // di un grafico a linea), nella finestra temporale e ambito indicati.
    $window = isset($_GET['window']) ? strval($_GET['window']) : 'months';
    $scope  = isset($_GET['scope'])  ? strval($_GET['scope'])  : 'all';
    $dimension = isset($_GET['dimension']) ? strval($_GET['dimension']) : '';
    $value = isset($_GET['value']) ? strval($_GET['value']) : '';
    $rawStart = isset($_GET['start']) ? strval($_GET['start']) : '';
    $rawEnd   = isset($_GET['end'])   ? strval($_GET['end'])   : '';

    if ($rawStart !== '' && $rawEnd !== '') {
        $tsStart = strtotime($rawStart);
        $tsEnd   = strtotime($rawEnd);
        if ($tsStart === false || $tsEnd === false || $tsStart >= $tsEnd) json_response(array('error' => 'Range date non valido'), 400);
        $start = gmdate('c', $tsStart);
        $end   = gmdate('c', $tsEnd);
    } elseif ($window === 'day') {
        $bounds = current_day_bounds();
        $start = $bounds['start']; $end = $bounds['end'];
    } elseif ($window === 'month') {
        $year = intval(gmdate('Y')); $month = intval(gmdate('n'));
        $start = gmdate('c', gmmktime(0, 0, 0, $month, 1, $year));
        $end   = gmdate('c', gmmktime(0, 0, 0, $month + 1, 1, $year));
    } else {
        $year = intval(gmdate('Y'));
        list($start, $end) = year_range_from_mode($year, $window);
    }

    // Filtri per-dimensione opzionali (come i grafici custom)
    $filterMap = array();
    foreach (array('category','incident','fab','team','severity') as $fdim) {
        $key = 'filter_' . $fdim;
        if (isset($_GET[$key]) && is_array($_GET[$key])) $filterMap[$fdim] = array_map('strval', $_GET[$key]);
    }

    $userId = intval($user['id']);
    $userGroup = isset($user['group_name']) && strval($user['group_name']) !== '' ? strval($user['group_name']) : 'ProdOps';
    $userGroupMap = array();
    $userNameById = array();
    foreach ($db['users'] as $u) {
        $userGroupMap[intval($u['id'])] = isset($u['group_name']) && strval($u['group_name']) !== '' ? strval($u['group_name']) : 'ProdOps';
        $userNameById[intval($u['id'])] = trim(strval(isset($u['display_name']) && strval($u['display_name']) !== '' ? $u['display_name'] : $u['username']));
    }
    $incidentNameById = array();
    foreach ($db['incidents'] as $inc) $incidentNameById[intval($inc['id'])] = strval($inc['name']);

    $matched = array();
    foreach ($db['tickets'] as $t) {
        if (!in_range(isset($t['created_at']) ? $t['created_at'] : '', $start, $end)) continue;
        $ownerId = isset($t['owner_user_id']) ? intval($t['owner_user_id']) : 0;
        if ($scope === 'mine') { if ($ownerId !== $userId) continue; }
        elseif ($scope === 'group') {
            if ($ownerId <= 0) continue;
            $og = isset($userGroupMap[$ownerId]) ? $userGroupMap[$ownerId] : '';
            if ($og !== $userGroup) continue;
        }
        if ($dimension !== '' && $value !== '') {
            $match = false;
            switch ($dimension) {
                case 'fab': $match = (isset($t['fab']) ? strval($t['fab']) : '') === $value; break;
                case 'category': $match = custom_ticket_category_name($t, $db['categories'], $db['incidents']) === $value; break;
                case 'team': $match = normalize_team(isset($t['owner_team']) ? $t['owner_team'] : 'A') === $value; break;
                case 'severity': $match = custom_ticket_severity_label($t) === $value; break;
                case 'incident':
                    $iid = isset($t['incident_id']) ? intval($t['incident_id']) : 0;
                    $nm = ($iid > 0 && isset($incidentNameById[$iid])) ? $incidentNameById[$iid] : (isset($t['incident_name']) ? strval($t['incident_name']) : '');
                    if ($nm === '') $nm = 'N/D';
                    $match = $nm === $value; break;
                case 'user':
                    $nm = isset($userNameById[$ownerId]) ? $userNameById[$ownerId] : ('Utente ' . $ownerId);
                    $match = $nm === $value; break;
            }
            if (!$match) continue;
        }
        $matched[] = $t;
    }
    $matched = filter_custom_tickets($matched, $filterMap, $db['categories'], $db['incidents']);

    $out = array();
    foreach ($matched as $t) {
        $iid = isset($t['incident_id']) ? intval($t['incident_id']) : 0;
        $ownerId = isset($t['owner_user_id']) ? intval($t['owner_user_id']) : 0;
        $out[] = array(
            'id' => isset($t['id']) ? intval($t['id']) : 0,
            'created_at' => isset($t['created_at']) ? $t['created_at'] : '',
            'incident_id' => $iid,
            'incident_name' => isset($t['incident_name']) ? $t['incident_name'] : (isset($incidentNameById[$iid]) ? $incidentNameById[$iid] : ''),
            'category' => custom_ticket_category_name($t, $db['categories'], $db['incidents']),
            'fab' => isset($t['fab']) ? $t['fab'] : '',
            'description' => isset($t['description']) ? $t['description'] : '',
            'severity' => isset($t['severity']) ? intval($t['severity']) : 0,
            'owner_user_id' => $ownerId,
            'owner_team' => normalize_team(isset($t['owner_team']) ? $t['owner_team'] : 'A'),
            'owner_username' => isset($userNameById[$ownerId]) ? $userNameById[$ownerId] : ''
        );
    }
    usort($out, function ($a, $b) { return strcmp($b['created_at'], $a['created_at']); });
    json_response(array(
        'dimension' => $dimension,
        'value' => $value,
        'count' => count($out),
        'tickets' => $out
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
    $customRange = custom_range_from_request();
    if ($customRange) { list($start, $end) = $customRange; $mode = 'custom'; }
    else list($start, $end) = year_range_from_mode($year, $mode);
    $tickets = array();
    foreach ($db['tickets'] as $t) if (in_range($t['created_at'], $start, $end)) $tickets[] = $t;
    json_response(array('year' => $year, 'mode' => $mode, 'stats' => summarize_by_fab($tickets, $fabs)), 200);
}

if ($path === '/api/stats/category/current-year' && $method === 'GET') {
    $year = intval(gmdate('Y'));
    $mode = isset($_GET['mode']) ? strval($_GET['mode']) : 'months';
    $customRange = custom_range_from_request();
    if ($customRange) { list($start, $end) = $customRange; $mode = 'custom'; }
    else list($start, $end) = year_range_from_mode($year, $mode);
    $tickets = array();
    foreach ($db['tickets'] as $t) if (in_range($t['created_at'], $start, $end)) $tickets[] = $t;
    json_response(array('year' => $year, 'mode' => $mode, 'stats' => summarize_by_category($tickets, $db['categories'], $db['incidents'])), 200);
}

if ($path === '/api/stats/team/current-day' && $method === 'GET') {
    $bounds = current_day_bounds();
    $tickets = array();
    foreach ($db['tickets'] as $t) if (in_range($t['created_at'], $bounds['start'], $bounds['end'])) $tickets[] = $t;
    json_response(array('day' => $bounds, 'stats' => summarize_by_team($tickets)), 200);
}

if ($path === '/api/stats/team/current-year' && $method === 'GET') {
    $year = intval(gmdate('Y'));
    $mode = isset($_GET['mode']) ? strval($_GET['mode']) : 'months';
    $customRange = custom_range_from_request();
    if ($customRange) { list($start, $end) = $customRange; $mode = 'custom'; }
    else list($start, $end) = year_range_from_mode($year, $mode);
    $tickets = array();
    foreach ($db['tickets'] as $t) if (in_range($t['created_at'], $start, $end)) $tickets[] = $t;
    json_response(array('year' => $year, 'mode' => $mode, 'stats' => summarize_by_team($tickets)), 200);
}

if ($path === '/api/stats/severity/current-day' && $method === 'GET') {
    $bounds = current_day_bounds();
    $tickets = array();
    foreach ($db['tickets'] as $t) if (in_range($t['created_at'], $bounds['start'], $bounds['end'])) $tickets[] = $t;
    json_response(array('day' => $bounds, 'stats' => summarize_by_severity($tickets)), 200);
}

if ($path === '/api/stats/severity/current-year' && $method === 'GET') {
    $year = intval(gmdate('Y'));
    $mode = isset($_GET['mode']) ? strval($_GET['mode']) : 'months';
    $customRange = custom_range_from_request();
    if ($customRange) { list($start, $end) = $customRange; $mode = 'custom'; }
    else list($start, $end) = year_range_from_mode($year, $mode);
    $tickets = array();
    foreach ($db['tickets'] as $t) if (in_range($t['created_at'], $start, $end)) $tickets[] = $t;
    json_response(array('year' => $year, 'mode' => $mode, 'stats' => summarize_by_severity($tickets)), 200);
}

function summarize_by_user($tickets, $users)
{
    $nameById = array();
    $supervisorIds = array();
    foreach ($users as $u) {
        $uid = intval($u['id']);
        if (isset($u['role']) && $u['role'] === 'supervisor') { $supervisorIds[$uid] = true; continue; }
        $nameById[$uid] = trim(strval(isset($u['display_name']) && strval($u['display_name']) !== '' ? $u['display_name'] : $u['username']));
    }
    $counts = array();
    foreach ($tickets as $t) {
        $uid = isset($t['owner_user_id']) ? intval($t['owner_user_id']) : 0;
        if (isset($supervisorIds[$uid])) continue;
        $name = isset($nameById[$uid]) ? $nameById[$uid] : ('Utente ' . $uid);
        if (!isset($counts[$name])) $counts[$name] = 0;
        $counts[$name]++;
    }
    arsort($counts);
    $out = array();
    foreach ($counts as $name => $total) $out[] = array('label' => $name, 'total' => $total);
    return $out;
}

if ($path === '/api/stats/user/current-day' && $method === 'GET') {
    $bounds = current_day_bounds();
    $tickets = array();
    foreach ($db['tickets'] as $t) if (in_range($t['created_at'], $bounds['start'], $bounds['end'])) $tickets[] = $t;
    json_response(array('day' => $bounds, 'stats' => summarize_by_user($tickets, $db['users'])), 200);
}

if ($path === '/api/stats/user/current-year' && $method === 'GET') {
    $year = intval(gmdate('Y'));
    $mode = isset($_GET['mode']) ? strval($_GET['mode']) : 'months';
    $customRange = custom_range_from_request();
    if ($customRange) { list($start, $end) = $customRange; $mode = 'custom'; }
    else list($start, $end) = year_range_from_mode($year, $mode);
    $tickets = array();
    foreach ($db['tickets'] as $t) if (in_range($t['created_at'], $start, $end)) $tickets[] = $t;
    json_response(array('year' => $year, 'mode' => $mode, 'stats' => summarize_by_user($tickets, $db['users'])), 200);
}

if ($path === '/api/stats/personal/current-year' && $method === 'GET') {
    $year = intval(gmdate('Y'));
    $userId = intval($user['id']);
    $userGroup = isset($user['group_name']) && strval($user['group_name']) !== '' ? strval($user['group_name']) : 'ProdOps';
    $view = isset($_GET['view']) ? strval($_GET['view']) : 'mine';
    $monthLabels = array('Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic');
    $counts = array(0,0,0,0,0,0,0,0,0,0,0,0);
    $userGroupMap = array();
    foreach ($db['users'] as $u) {
        $userGroupMap[intval($u['id'])] = isset($u['group_name']) && strval($u['group_name']) !== '' ? strval($u['group_name']) : 'ProdOps';
    }

    // Drill-down: se e' passato ?month=1..12 restituisce i conteggi giorno
    // per giorno di quel mese (dell'anno corrente) invece dei 12 mesi.
    $month = isset($_GET['month']) ? intval($_GET['month']) : 0;
    if ($month >= 1 && $month <= 12) {
        $daysInMonth = intval(gmdate('t', gmmktime(0, 0, 0, $month, 1, $year)));
        $dayCounts = array();
        for ($d = 0; $d < $daysInMonth; $d++) $dayCounts[$d] = 0;
        foreach ($db['tickets'] as $t) {
            $ownerId = isset($t['owner_user_id']) ? intval($t['owner_user_id']) : 0;
            if ($view === 'team') {
                if ($ownerId <= 0) continue;
                if (!is_supervisor($user)) {
                    $ownerGroup = isset($userGroupMap[$ownerId]) ? $userGroupMap[$ownerId] : '';
                    if ($ownerGroup !== $userGroup) continue;
                }
            } else {
                if ($ownerId !== $userId) continue;
            }
            $ts = isset($t['created_at']) ? strtotime($t['created_at']) : false;
            if ($ts === false) continue;
            if (intval(gmdate('Y', $ts)) !== $year) continue;
            if (intval(gmdate('n', $ts)) !== $month) continue;
            $d = intval(gmdate('j', $ts)) - 1;
            if ($d >= 0 && $d < $daysInMonth) $dayCounts[$d] += 1;
        }
        $dstats = array();
        for ($d = 0; $d < $daysInMonth; $d++) {
            $dstats[] = array('label' => strval($d + 1), 'total' => $dayCounts[$d]);
        }
        json_response(array(
            'year' => $year,
            'view' => $view,
            'month' => $month,
            'month_label' => $monthLabels[$month - 1],
            'username' => ($view === 'team' ? $userGroup : strval($user['username'])),
            'stats' => $dstats
        ), 200);
    }

    foreach ($db['tickets'] as $t) {
        $ownerId = isset($t['owner_user_id']) ? intval($t['owner_user_id']) : 0;
        if ($view === 'team') {
            if ($ownerId <= 0) continue;
            if (!is_supervisor($user)) {
                $ownerGroup = isset($userGroupMap[$ownerId]) ? $userGroupMap[$ownerId] : '';
                if ($ownerGroup !== $userGroup) continue;
            }
        } else {
            if ($ownerId !== $userId) continue;
        }
        $ts = isset($t['created_at']) ? strtotime($t['created_at']) : false;
        if ($ts === false) continue;
        if (intval(gmdate('Y', $ts)) !== $year) continue;
        $m = intval(gmdate('n', $ts)) - 1;
        $counts[$m] += 1;
    }
    $stats = array();
    for ($i = 0; $i < 12; $i++) {
        $stats[] = array('label' => $monthLabels[$i], 'total' => $counts[$i]);
    }
    $label = $view === 'team' ? $userGroup : strval($user['username']);
    $personalTarget = 20;
    $groupTarget = 20;
    $groupTargets = normalize_group_targets(isset($db['group_targets']) ? $db['group_targets'] : array(), $db['users']);
    if (isset($groupTargets[$userGroup])) {
        $personalTarget = normalize_personal_target(isset($groupTargets[$userGroup]['personal_target_monthly']) ? $groupTargets[$userGroup]['personal_target_monthly'] : 20);
        $groupTarget = normalize_group_target(isset($groupTargets[$userGroup]['group_target_monthly']) ? $groupTargets[$userGroup]['group_target_monthly'] : 20);
        $personalTargetAnnual = normalize_personal_target(isset($groupTargets[$userGroup]['personal_target_annual']) ? $groupTargets[$userGroup]['personal_target_annual'] : ($personalTarget * 12));
        $groupTargetAnnual = normalize_group_target(isset($groupTargets[$userGroup]['group_target_annual']) ? $groupTargets[$userGroup]['group_target_annual'] : ($groupTarget * 12));
    } else {
        $personalTargetAnnual = $personalTarget * 12;
        $groupTargetAnnual = $groupTarget * 12;
        foreach ($db['users'] as $u) {
            if (intval($u['id']) === $userId) {
                $personalTarget = normalize_personal_target(isset($u['personal_target']) ? $u['personal_target'] : 20);
                $groupTarget = normalize_group_target(isset($u['group_target']) ? $u['group_target'] : 20);
                $personalTargetAnnual = $personalTarget * 12;
                $groupTargetAnnual = $groupTarget * 12;
                break;
            }
        }
    }
    json_response(array(
        'year' => $year,
        'view' => $view,
        'username' => $label,
        'target' => $view === 'team' ? $groupTarget : $personalTarget,
        'personal_target' => $personalTarget,
        'group_target' => $groupTarget,
        'personal_target_monthly' => $personalTarget,
        'personal_target_annual' => $personalTargetAnnual,
        'group_target_monthly' => $groupTarget,
        'group_target_annual' => $groupTargetAnnual,
        'stats' => $stats
    ), 200);
}

if ($path === '/api/stats/meta' && $method === 'GET') {
    $cats = array();
    foreach ($db['categories'] as $c) {
        if (!empty($c['hidden'])) continue;
        $cats[] = array('id' => intval($c['id']), 'name' => strval($c['name']));
    }
    $catNameById = array();
    foreach ($db['categories'] as $c) $catNameById[intval($c['id'])] = strval($c['name']);
    $incs = array();
    foreach ($db['incidents'] as $i) {
        if (!empty($i['hidden'])) continue;
        if (strtolower(trim(strval($i['name']))) === 'generic') continue;
        $cid = intval($i['category_id']);
        $incs[] = array('id' => intval($i['id']), 'name' => strval($i['name']), 'category_id' => $cid, 'category_name' => isset($catNameById[$cid]) ? $catNameById[$cid] : '', 'fab_default' => strtoupper(strval(isset($i['fab_default']) ? $i['fab_default'] : '')));
    }
    $severities = array(
        array('value' => '1', 'label' => '1 - Low'),
        array('value' => '2', 'label' => '2 - Medium'),
        array('value' => '3', 'label' => '3 - High'),
        array('value' => '4', 'label' => '4 - Extreme')
    );
    $teams = array('A', 'B', 'C', 'D', 'E');
    json_response(array(
        'categories' => $cats,
        'incidents'  => $incs,
        'fabs'       => $fabs,
        'teams'      => $teams,
        'severities' => $severities
    ), 200);
}

if ($path === '/api/stats/custom' && $method === 'GET') {
    // Supporta sia ?dimension=X (legacy) sia ?dimensions[]=X&dimensions[]=Y
    $allowedDimensions = array('fab', 'category', 'incident', 'team', 'severity');
    if (isset($_GET['dimensions']) && is_array($_GET['dimensions'])) {
        $dimensions = array_values(array_filter(array_map('strval', $_GET['dimensions']), function($d) use ($allowedDimensions) { return in_array($d, $allowedDimensions, true); }));
    } else {
        $dim = isset($_GET['dimension']) ? strval($_GET['dimension']) : '';
        $dimensions = in_array($dim, $allowedDimensions, true) ? array($dim) : array();
    }
    if (!count($dimensions)) json_response(array('error' => 'Dimensione non valida'), 400);

    $window = isset($_GET['window']) ? strval($_GET['window']) : 'months';
    $scope  = isset($_GET['scope'])  ? strval($_GET['scope'])  : 'all';

    // Filtri per-dimensione (opzionali): ?filter_category[]=Hardware&filter_severity[]=1
    $filterMap = array();
    foreach (array('category','incident','fab','team','severity') as $dim) {
        $key = 'filter_' . $dim;
        if (isset($_GET[$key]) && is_array($_GET[$key])) {
            $filterMap[$dim] = array_map('strval', $_GET[$key]);
        }
    }

    // Finestra temporale
    if ($window === 'custom') {
        $rawStart = isset($_GET['start']) ? strval($_GET['start']) : '';
        $rawEnd   = isset($_GET['end'])   ? strval($_GET['end'])   : '';
        $tsStart = strtotime($rawStart);
        $tsEnd   = strtotime($rawEnd);
        if ($tsStart === false || $tsEnd === false || $tsStart >= $tsEnd) {
            json_response(array('error' => 'Range date non valido'), 400);
        }
        $start = gmdate('c', $tsStart);
        $end   = gmdate('c', $tsEnd + 86400);
    } elseif ($window === 'day') {
        $bounds = current_day_bounds();
        $start = $bounds['start'];
        $end   = $bounds['end'];
    } elseif ($window === 'month') {
        $year  = intval(gmdate('Y'));
        $month = intval(gmdate('n'));
        $start = gmdate('c', gmmktime(0, 0, 0, $month, 1, $year));
        $end   = gmdate('c', gmmktime(23, 59, 59, $month, (int)gmdate('t'), $year));
    } else {
        $year = intval(gmdate('Y'));
        list($start, $end) = year_range_from_mode($year, $window);
    }

    // Ambito
    $userId   = intval($user['id']);
    $userGroup = isset($user['group_name']) && strval($user['group_name']) !== '' ? strval($user['group_name']) : 'ProdOps';
    $userGroupMap = array();
    foreach ($db['users'] as $u) {
        $userGroupMap[intval($u['id'])] = isset($u['group_name']) && strval($u['group_name']) !== '' ? strval($u['group_name']) : 'ProdOps';
    }
    $tickets = array();
    foreach ($db['tickets'] as $t) {
        if (!in_range(isset($t['created_at']) ? $t['created_at'] : '', $start, $end)) continue;
        $ownerId = isset($t['owner_user_id']) ? intval($t['owner_user_id']) : 0;
        if ($scope === 'mine') {
            if ($ownerId !== $userId) continue;
        } elseif ($scope === 'group') {
            if ($ownerId <= 0) continue;
            $ownerGroup = isset($userGroupMap[$ownerId]) ? $userGroupMap[$ownerId] : '';
            if ($ownerGroup !== $userGroup) continue;
        }
        $tickets[] = $t;
    }
    $tickets = filter_custom_tickets($tickets, $filterMap, $db['categories'], $db['incidents']);

    // Calcola stats per ogni dimensione e filtra gli item se richiesto
    $stats = array();
    foreach ($dimensions as $dim) {
        switch ($dim) {
            case 'fab':      $dimStats = summarize_by_fab($tickets, $fabs); break;
            case 'category': $dimStats = summarize_by_category($tickets, $db['categories'], $db['incidents']); break;
            case 'incident': $dimStats = summarize_by_incident($tickets, $db['incidents']); break;
            case 'team':     $dimStats = summarize_by_team($tickets); break;
            case 'severity': $dimStats = summarize_by_severity($tickets); break;
            default:         $dimStats = array(); break;
        }
        // Applica filtro item se presente
        if (isset($filterMap[$dim]) && count($filterMap[$dim])) {
            $allowed = $filterMap[$dim];
            $dimStats = array_values(array_filter($dimStats, function($s) use ($allowed) {
                return in_array($s['label'], $allowed, true);
            }));
        }
        // Aggiunge annotazione dim_type solo se multi-dimensione
        if (count($dimensions) > 1) {
            foreach ($dimStats as &$s) { $s['dim_type'] = $dim; }
            unset($s);
        }
        $stats = array_merge($stats, $dimStats);
    }

    json_response(array(
        'dimensions' => $dimensions,
        'window'     => $window,
        'scope'      => $scope,
        'stats'      => $stats
    ), 200);
}

if ($path === '/api/user-charts' && $method === 'GET') {
    if (!isset($db['user_charts']) || !is_array($db['user_charts'])) $db['user_charts'] = array();
    $key = strval(intval($user['id']));
    $userData = isset($db['user_charts'][$key]) && is_array($db['user_charts'][$key]) ? $db['user_charts'][$key] : array();
    $charts = isset($userData['charts']) && is_array($userData['charts']) ? array_values($userData['charts']) : (is_array($userData) && isset($userData[0]) ? array_values($userData) : array());
    $hiddenPanels = isset($userData['hidden_panels']) && is_array($userData['hidden_panels']) ? array_values($userData['hidden_panels']) : array();
    $panelOrder = isset($userData['panel_order']) && is_array($userData['panel_order']) ? array_values($userData['panel_order']) : array();
    $panelTitles = isset($userData['panel_titles']) && is_array($userData['panel_titles']) ? $userData['panel_titles'] : array();
    $chartModes = isset($userData['chart_modes']) && is_array($userData['chart_modes']) ? $userData['chart_modes'] : array();
    $chartCustomRanges = isset($userData['chart_custom_ranges']) && is_array($userData['chart_custom_ranges']) ? $userData['chart_custom_ranges'] : array();
    $chartSpans = isset($userData['chart_spans']) && is_array($userData['chart_spans']) ? $userData['chart_spans'] : array();
    $chartTypes = isset($userData['chart_types']) && is_array($userData['chart_types']) ? $userData['chart_types'] : array();
    $palette = isset($userData['palette']) ? strval($userData['palette']) : 'blu';
    $darkMode = !empty($userData['dark_mode']);
    json_response(array('charts' => $charts, 'hidden_panels' => $hiddenPanels, 'panel_order' => $panelOrder, 'panel_titles' => $panelTitles, 'chart_modes' => $chartModes, 'chart_custom_ranges' => $chartCustomRanges, 'chart_spans' => $chartSpans, 'chart_types' => $chartTypes, 'palette' => $palette, 'dark_mode' => $darkMode), 200);
}

if ($path === '/api/user-charts' && $method === 'PUT') {
    if (!isset($db['user_charts']) || !is_array($db['user_charts'])) $db['user_charts'] = array();
    $userKey = strval(intval($user['id']));
    $existingUserData = isset($db['user_charts'][$userKey]) && is_array($db['user_charts'][$userKey]) ? $db['user_charts'][$userKey] : array();
    $incoming = isset($payload['charts']) && is_array($payload['charts']) ? $payload['charts'] : (isset($existingUserData['charts']) && is_array($existingUserData['charts']) ? $existingUserData['charts'] : array());
    $incomingHidden = isset($payload['hidden_panels']) && is_array($payload['hidden_panels']) ? $payload['hidden_panels'] : (isset($existingUserData['hidden_panels']) && is_array($existingUserData['hidden_panels']) ? $existingUserData['hidden_panels'] : array());
    $allowedDimensions = array('fab', 'category', 'incident', 'team', 'severity');
    $allowedWindows = array('day', 'month', 'months', 'q1', 'q2', 'q3', 'q4');
    $allowedScopes = array('all', 'mine', 'group');
    $allowedTypes = array('column', 'bar', 'pie', 'donut', 'line');
    $allowedFilterModes = array('fab', 'team');
    $allowedDefaultPanels = array('chartPanelPersonalMine','chartPanelPersonalGroup','chartPanelFab','chartPanelCat','chartPanelTeam','chartPanelSeverity','chartPanelUser');
    $clean = array();
    foreach ($incoming as $c) {
        if (!is_array($c)) continue;
        $scope = isset($c['scope']) ? strval($c['scope']) : 'all';
        $type  = isset($c['type'])  ? strval($c['type'])  : 'column';
        if (!in_array($scope, $allowedScopes, true)) $scope = 'all';
        if (!in_array($type,  $allowedTypes,  true)) $type  = 'column';
        $id = isset($c['id']) && strval($c['id']) !== '' ? preg_replace('/[^A-Za-z0-9_-]/', '', strval($c['id'])) : ('c' . substr(md5(uniqid('', true)), 0, 10));
        $title = isset($c['title']) ? trim(strval($c['title'])) : '';
        if ($title === '') $title = 'Grafico personalizzato';
        if (strlen($title) > 80) $title = substr($title, 0, 80);
        // Normalizza windows
        $rawWindows = isset($c['windows']) && is_array($c['windows']) ? $c['windows'] : (isset($c['window']) ? array(strval($c['window'])) : array('months'));
        $cleanWindows = array();
        foreach ($rawWindows as $w) {
            if (is_array($w)) {
                $wLabel = isset($w['label']) ? substr(trim(strval($w['label'])), 0, 60) : 'Personalizzato';
                $wStart = isset($w['start']) ? strval($w['start']) : '';
                $wEnd   = isset($w['end'])   ? strval($w['end'])   : '';
                if (strtotime($wStart) && strtotime($wEnd) && strtotime($wStart) < strtotime($wEnd))
                    $cleanWindows[] = array('label' => $wLabel, 'start' => $wStart, 'end' => $wEnd);
            } elseif (in_array(strval($w), $allowedWindows, true)) {
                $cleanWindows[] = strval($w);
            }
        }
        if (!count($cleanWindows)) continue;
        // Normalizza dimensions (nuovo) o dimension (legacy)
        $rawDims = isset($c['dimensions']) && is_array($c['dimensions']) ? $c['dimensions']
                 : (isset($c['dimension']) && in_array(strval($c['dimension']), $allowedDimensions, true)
                    ? array(array('type' => strval($c['dimension']), 'items' => null))
                    : array());
        $cleanDims = array();
        foreach ($rawDims as $d) {
            $dimType = is_array($d) ? (isset($d['type']) ? strval($d['type']) : '') : strval($d);
            if (!in_array($dimType, $allowedDimensions, true)) continue;
            $rawItems = is_array($d) && isset($d['items']) && is_array($d['items']) ? $d['items'] : null;
            $cleanItems = null;
            if ($rawItems !== null) {
                $cleanItems = array_values(array_unique(array_filter(array_map(function($i) { return substr(trim(strval($i)), 0, 80); }, $rawItems), 'strlen')));
                if (!count($cleanItems)) $cleanItems = null;
            }
            $cleanDims[] = array('type' => $dimType, 'items' => $cleanItems);
        }
        if (!count($cleanDims)) continue;
        $cleanFilters = array();
        if (isset($c['filters']) && is_array($c['filters'])) {
            foreach ($allowedFilterModes as $filterKey) {
                if (isset($c['filters'][$filterKey]) && $c['filters'][$filterKey]) $cleanFilters[$filterKey] = true;
            }
        }
        $clean[] = array('id' => $id, 'title' => $title, 'dimensions' => $cleanDims, 'windows' => $cleanWindows, 'scope' => $scope, 'type' => $type, 'filters' => $cleanFilters);
        if (count($clean) >= 24) break;
    }
    $cleanHidden = array();
    foreach ($incomingHidden as $pid) {
        $pid = strval($pid);
        if (in_array($pid, $allowedDefaultPanels, true)) $cleanHidden[] = $pid;
    }
    $incomingOrder = isset($payload['panel_order']) && is_array($payload['panel_order']) ? $payload['panel_order'] : (isset($existingUserData['panel_order']) && is_array($existingUserData['panel_order']) ? $existingUserData['panel_order'] : array());
    $cleanOrder = array();
    foreach ($incomingOrder as $pid) {
        $pid = preg_replace('/[^A-Za-z0-9_-]/', '', strval($pid));
        if ($pid !== '') $cleanOrder[] = $pid;
    }
    $cleanOrder = array_slice(array_unique($cleanOrder), 0, 48);
    $incomingTitles = isset($payload['panel_titles']) && is_array($payload['panel_titles']) ? $payload['panel_titles'] : (isset($existingUserData['panel_titles']) && is_array($existingUserData['panel_titles']) ? $existingUserData['panel_titles'] : array());
    $allowedTitlePanels = array('chartPanelPersonalMine','chartPanelPersonalGroup','chartPanelFab','chartPanelCat','chartPanelTeam','chartPanelSeverity','chartPanelUser');
    $cleanTitles = array();
    foreach ($incomingTitles as $pid => $ptitle) {
        $pid = strval($pid);
        if (!in_array($pid, $allowedTitlePanels, true)) continue;
        $ptitle = trim(strval($ptitle));
        if ($ptitle !== '') $cleanTitles[$pid] = substr($ptitle, 0, 80);
    }
    $allowedChartModeTargets = array('fabYear', 'catYear', 'teamYear', 'severityYear', 'userYear');
    $allowedChartModeValues = array('day', 'months', 'q1', 'q2', 'q3', 'q4', 'custom');
    $allowedPaletteValues = array('cappuccino', 'bordeaux', 'verde', 'blu', 'giallo');
    $allowedChartSpanPanels = array('chartPanelPersonal', 'chartPanelPersonalMine', 'chartPanelPersonalGroup', 'chartPanelFab', 'chartPanelCat', 'chartPanelTeam', 'chartPanelSeverity', 'chartPanelUser');
    $allowedChartSpanValues = array(3, 6, 9, 12);
    $allowedChartTypeTargets = array('fabDay', 'catDay', 'fabYear', 'catYear', 'personalMineChart', 'personalGroupChart', 'teamYear', 'severityYear');
    $allowedChartTypeValues = array('column', 'bar', 'donut');
    $incomingModes = isset($payload['chart_modes']) && is_array($payload['chart_modes']) ? $payload['chart_modes'] : (isset($existingUserData['chart_modes']) && is_array($existingUserData['chart_modes']) ? $existingUserData['chart_modes'] : array());
    $cleanModes = array();
    foreach ($allowedChartModeTargets as $t) {
        if (isset($incomingModes[$t]) && in_array(strval($incomingModes[$t]), $allowedChartModeValues, true)) {
            $cleanModes[$t] = strval($incomingModes[$t]);
        }
    }
    $incomingRanges = isset($payload['chart_custom_ranges']) && is_array($payload['chart_custom_ranges']) ? $payload['chart_custom_ranges'] : (isset($existingUserData['chart_custom_ranges']) && is_array($existingUserData['chart_custom_ranges']) ? $existingUserData['chart_custom_ranges'] : array());
    $cleanRanges = array();
    foreach ($allowedChartModeTargets as $t) {
        if (!isset($incomingRanges[$t]) || !is_array($incomingRanges[$t])) continue;
        $rStart = isset($incomingRanges[$t]['start']) ? strval($incomingRanges[$t]['start']) : '';
        $rEnd = isset($incomingRanges[$t]['end']) ? strval($incomingRanges[$t]['end']) : '';
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $rStart) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $rEnd) && strtotime($rStart) && strtotime($rEnd) && strtotime($rStart) <= strtotime($rEnd)) {
            $cleanRanges[$t] = array('start' => $rStart, 'end' => $rEnd);
        }
    }
    $incomingSpans = isset($payload['chart_spans']) && is_array($payload['chart_spans']) ? $payload['chart_spans'] : (isset($existingUserData['chart_spans']) && is_array($existingUserData['chart_spans']) ? $existingUserData['chart_spans'] : array());
    $cleanSpans = array();
    foreach ($allowedChartSpanPanels as $panelId) {
        if (!isset($incomingSpans[$panelId])) continue;
        $spanValue = intval($incomingSpans[$panelId]);
        if (in_array($spanValue, $allowedChartSpanValues, true)) $cleanSpans[$panelId] = $spanValue;
    }
    $incomingTypes = isset($payload['chart_types']) && is_array($payload['chart_types']) ? $payload['chart_types'] : (isset($existingUserData['chart_types']) && is_array($existingUserData['chart_types']) ? $existingUserData['chart_types'] : array());
    $cleanTypes = array();
    foreach ($allowedChartTypeTargets as $chartKey) {
        if (!isset($incomingTypes[$chartKey])) continue;
        $typeValue = strval($incomingTypes[$chartKey]);
        if (in_array($typeValue, $allowedChartTypeValues, true)) $cleanTypes[$chartKey] = $typeValue;
    }
    $palette = isset($payload['palette']) ? strtolower(trim(strval($payload['palette']))) : (isset($existingUserData['palette']) ? strtolower(trim(strval($existingUserData['palette']))) : 'blu');
    if (!in_array($palette, $allowedPaletteValues, true)) $palette = 'blu';
    $darkMode = isset($payload['dark_mode']) ? !empty($payload['dark_mode']) : !empty($existingUserData['dark_mode']);
    $db['user_charts'][$userKey] = array('charts' => $clean, 'hidden_panels' => $cleanHidden, 'panel_order' => $cleanOrder, 'panel_titles' => $cleanTitles, 'chart_modes' => $cleanModes, 'chart_custom_ranges' => $cleanRanges, 'chart_spans' => $cleanSpans, 'chart_types' => $cleanTypes, 'palette' => $palette, 'dark_mode' => $darkMode);
    save_db($db);
    json_response(array('ok' => true, 'charts' => $clean, 'hidden_panels' => $cleanHidden, 'panel_order' => $cleanOrder, 'panel_titles' => $cleanTitles, 'chart_modes' => $cleanModes, 'chart_custom_ranges' => $cleanRanges, 'chart_spans' => $cleanSpans, 'chart_types' => $cleanTypes, 'palette' => $palette, 'dark_mode' => $darkMode), 200);
}

if ($path === '/api/ping' && $method === 'GET') {
    $ts = file_exists(SYNC_TS_PATH) ? floatval(file_get_contents(SYNC_TS_PATH)) : 0;
    json_response(array('ts' => $ts), 200);
}

json_response(array('error' => 'Endpoint non trovato'), 404);
