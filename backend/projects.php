<?php
// File: backend/projects.php
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
    // Listar projetos ou obter por id
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = ?");
        $stmt->execute([$id]);
        $proj = $stmt->fetch();
        if ($proj) {
            echo json_encode($proj);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Project not found']);
        }
    } else {
        $stmt = $pdo->query("SELECT id, client_id, name, created_at FROM projects ORDER BY created_at DESC");
        $projects = $stmt->fetchAll();
        echo json_encode($projects);
    }

} elseif ($method === 'POST') {
    // Criar projeto
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['name'], $data['client_id'], $data['data_json'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing fields']);
        exit;
    }
    $stmt = $pdo->prepare("INSERT INTO projects (client_id, name, data_json, created_at) VALUES (?, ?, ?, NOW())");
    $stmt->execute([$data['client_id'], $data['name'], json_encode($data['data_json'])]);
    echo json_encode(['message' => 'Project created', 'id' => $pdo->lastInsertId()]);

} elseif ($method === 'PUT') {
    // Atualizar projeto
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['id'], $data['data_json'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing id or data_json']);
        exit;
    }
    $stmt = $pdo->prepare("UPDATE projects SET data_json = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([json_encode($data['data_json']), $data['id']]);
    echo json_encode(['message' => 'Project updated']);

} elseif ($method === 'DELETE') {
    // Deletar projeto
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing project id']);
        exit;
    }
    $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['message' => 'Project deleted']);

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
