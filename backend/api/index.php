<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

register_shutdown_function(function() {
    $err = error_get_last();
    if ($err !== null && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        if (!headers_sent()) {
            header('Content-Type: application/json', true, 500);
        }
        echo json_encode(['fatal_error' => $err]);
    }
});

// Prepare writable /tmp directories for serverless environment
$dirs = [
    "/tmp/storage",
    "/tmp/storage/framework",
    "/tmp/storage/framework/views",
    "/tmp/storage/framework/cache",
    "/tmp/storage/framework/cache/data",
    "/tmp/storage/framework/sessions",
    "/tmp/storage/logs",
];

foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

if (!file_exists(__DIR__ . '/../vendor/autoload.php')) {
    header('Content-Type: application/json', true, 500);
    echo json_encode([
        'error' => 'vendor/autoload.php not found! Composer dependencies were not bundled.'
    ]);
    exit;
}

try {
    // Forward Vercel requests to Laravel entry point
    require __DIR__ . "/../public/index.php";
} catch (\Throwable $e) {
    if (!headers_sent()) {
        header('Content-Type: application/json', true, 500);
    }
    echo json_encode([
        'exception' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
    ]);
    exit;
}
