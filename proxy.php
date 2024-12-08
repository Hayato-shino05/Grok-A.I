<?php
header('Content-Type: application/json');

// Lấy API Key từ biến môi trường
$apiKey = getenv('API_KEY');

// Endpoint và dữ liệu nhận từ client
$apiUrl = "https://api.x.ai/v1/chat/completions";
$requestData = json_decode(file_get_contents('php://input'), true);

// Kiểm tra dữ liệu đầu vào
if (!isset($requestData['messages'])) {
    echo json_encode(['error' => 'Invalid request']);
    http_response_code(400);
    exit;
}

// Cấu hình yêu cầu đến API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    "Authorization: Bearer $apiKey"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));

// Gửi yêu cầu và xử lý kết quả
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Trả về dữ liệu từ API hoặc lỗi
http_response_code($httpCode);
echo $response;
?>
