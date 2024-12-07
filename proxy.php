<?php
header('Content-Type: application/json');

// Lấy API Key từ biến môi trường
$apiKey = getenv('API_KEY');

// Trả về API Key (cẩn thận bảo mật trong môi trường thực tế)
echo json_encode(['api_key' => $apiKey]);
?>