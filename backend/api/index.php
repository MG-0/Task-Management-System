<?php

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

// Forward Vercel requests to Laravel entry point
require __DIR__ . "/../public/index.php";
