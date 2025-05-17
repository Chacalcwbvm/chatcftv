// backend/api/usuarios.php
<?php
// Permite acesso do frontend rodando em localhost:3000 (ajuste se precisar)
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Se for uma requisição OPTIONS (preflight), retorne direto sem processar mais nada
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Seu código PHP abaixo para responder a requisição

header('Content-Type: application/json');
require 'connection.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query('SELECT id, nome, email, nivel, criado_em FROM usuarios');
    $usuarios = $stmt->fetchAll();
    echo json_encode($usuarios);
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['nome'], $data['email'], $data['senha'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Campos obrigatórios faltando']);
        exit;
    }
    $senha_hash = password_hash($data['senha'], PASSWORD_DEFAULT);
    $sql = "INSERT INTO usuarios (nome, email, senha_hash, nivel) VALUES (?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    try {
        $stmt->execute([$data['nome'], $data['email'], $senha_hash, $data['nivel'] ?? 'tecnico']);
        echo json_encode(['message' => 'Usuário criado', 'id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao criar usuário']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método não suportado']);
}
