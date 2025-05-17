<?php
// CORS HEADERS (sempre antes de tudo, sem espaços antes do <?php)
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Pré-flight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

session_start();
require 'config.php';

// Função para checar autenticação via SESSION
function checkAuth() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Não Autorizado']);
        exit;
    }
}

$method = $_SERVER['REQUEST_METHOD'];
checkAuth();

if ($method === 'GET') {
    // Listar todos clientes
    $stmt = $pdo->query("SELECT id, nome, endereco, telefone, email, criado_em FROM clientes ORDER BY nome");
    $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($clientes);

} elseif ($method === 'POST') {
    // Criar cliente
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['nome']) || trim($data['nome']) === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Nome do cliente é obrigatório.']);
        exit;
    }
    $stmt = $pdo->prepare("INSERT INTO clientes (nome, endereco, telefone, email) VALUES (?, ?, ?, ?)");
    $stmt->execute([
        $data['nome'],
        $data['endereco'] ?? null,
        $data['telefone'] ?? null,
        $data['email'] ?? null
    ]);
    echo json_encode([
        'message' => 'Cliente criado',
        'id' => $pdo->lastInsertId()
    ]);

} elseif ($method === 'PUT') {
    // Atualizar cliente
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['id'], $data['nome']) || trim($data['nome']) === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Id ou nome do cliente não informado.']);
        exit;
    }
    $stmt = $pdo->prepare("UPDATE clientes SET nome = ?, endereco = ?, telefone = ?, email = ? WHERE id = ?");
    $stmt->execute([
        $data['nome'],
        $data['endereco'] ?? null,
        $data['telefone'] ?? null,
        $data['email'] ?? null,
        $data['id']
    ]);
    echo json_encode(['message' => 'Cliente atualizado']);

} elseif ($method === 'DELETE') {
    // Deletar cliente
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID do cliente não informado']);
        exit;
    }
    $stmt = $pdo->prepare("DELETE FROM clientes WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['message' => 'Cliente deletado']);

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
}
?>