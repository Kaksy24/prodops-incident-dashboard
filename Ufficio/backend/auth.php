<?php

define('AUTH_COOKIE', 'prodops_auth');
define('AUTH_TTL_SECONDS', 8 * 60 * 60);

function app_base_path()
{
    $scriptName = isset($_SERVER['SCRIPT_NAME']) ? str_replace('\\', '/', strval($_SERVER['SCRIPT_NAME'])) : '';
    if ($scriptName === '' || strtolower(substr($scriptName, -4)) !== '.php') return '';
    $basePath = rtrim(str_replace('\\', '/', dirname($scriptName)), '/');
    return ($basePath === '' || $basePath === '.') ? '' : $basePath;
}

function app_url($path)
{
    return app_base_path() . '/' . ltrim(strval($path), '/');
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
        header('Location: ' . app_url('/login.html'));
        exit;
    }
    if ($role === 'admin' && $user['role'] !== 'admin') {
        header('Location: ' . app_url('/index.html'));
        exit;
    }
    return $user;
}
