<?php
header('Content-Type: application/json');

// Lấy API Key từ biến môi trường
$apiKey = getenv('API_KEY');

// Kiểm tra nếu API key bị null
if (!$apiKey) {
    echo json_encode(['error' => 'API_KEY is not set in environment']);
    exit;
}

// Trả về API Key
echo json_encode(['api_key' => $apiKey]);
?>
