<?php

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$publicRoot = __DIR__ . DIRECTORY_SEPARATOR . 'public';
$file = $publicRoot . $path;

if ($path === '/' || $path === '/index.html' || $path === '/admin.html' || $path === '/search.html' || $path === '/login.html' || strpos($path, '/api/') === 0 || $path === '/index.php') {
    require __DIR__ . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'index.php';
    return true;
}

if ($path !== '/' && is_file($file)) {
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $mimeMap = array(
        'css' => 'text/css; charset=utf-8',
        'js' => 'application/javascript; charset=utf-8',
        'html' => 'text/html; charset=utf-8',
        'json' => 'application/json; charset=utf-8',
        'svg' => 'image/svg+xml',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'ico' => 'image/x-icon',
        'map' => 'application/json; charset=utf-8'
    );
    if (isset($mimeMap[$ext])) {
        header('Content-Type: ' . $mimeMap[$ext]);
    }
    readfile($file);
    return true;
}

require __DIR__ . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'index.php';
