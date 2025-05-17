
<?php
// File: backend/equipments.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

session_start();
require 'config.php';

header('Content-Type: application/json');
function checkAuth() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

$method = $_SERVER['REQUEST_METHOD'];
checkAuth();

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id, type, model, specs FROM equipments ORDER BY type");
    $equipments = $stmt->fetchAll();
    echo json_encode($equipments);

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['type'], $data['model'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing fields']);
        exit;
    }
    $stmt = $pdo->prepare("INSERT INTO equipments (type, model, specs) VALUES (?, ?, ?)");
    $stmt->execute([$data['type'], $data['model'], json_encode($data['specs'] ?? [])]);
    echo json_encode(['message' => 'Equipment created', 'id' => $pdo->lastInsertId()]);

} elseif ($method === 'PUT') {
    $
