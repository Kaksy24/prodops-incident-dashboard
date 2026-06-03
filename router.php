<?php

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$publicRoot = __DIR__ . DIRECTORY_SEPARATOR . 'public';
$file = $publicRoot . $path;

if ($path === '/' || $path === '/index.html' || $path === '/admin.html' || $path === '/search.html' || $path === '/login.html' || strpos($path, '/api/') === 0 || $path === '/index.php') {
    require __DIR__ . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'index.php';
    return true;
}

if ($path !== '/' && is_file($file)) {
    return false;
}

require __DIR__ . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'index.php';
