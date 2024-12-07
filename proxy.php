<?php
// proxy.php

// Hàm để đọc file .env và nạp các biến môi trường
function loadEnv($filePath) {
    if (!file_exists($filePath)) {
        throw new Exception(".env file not found");
    }

    $envVars = [];
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Loại bỏ các dòng comment
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        // Phân tách theo dấu '=' để lấy biến và giá trị
        list($name, $value) = explode('=', $line, 2);

        // Loại bỏ khoảng trắng thừa và gán biến môi trường
        $name = trim($name);
        $value = trim($value);
        $envVars[$name] = $value;
    }

    return $envVars;
}

// Nạp các biến từ file .env
$env = loadEnv(__DIR__ . '/.env');

// Lấy API URL và API Key từ mảng $env
$apiUrl = $env['API_URL'];
$apiKey = $env['API_KEY'];

// Đọc dữ liệu JSON từ yêu cầu POST
$inputData = file_get_contents("php://input");

// Thiết lập yêu cầu cURL để chuyển tiếp đến API OpenAI
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $apiKey",
    "Content-Type: application/json",
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $inputData);

// Thực thi yêu cầu cURL
$response = curl_exec($ch);

// Xử lý lỗi cURL
if (curl_errno($ch)) {
    echo 'Error:' . curl_error($ch);
    exit;
}

curl_close($ch);

// Trả về phản hồi từ API OpenAI
header('Content-Type: application/json');
echo $response;
