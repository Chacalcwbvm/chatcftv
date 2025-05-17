<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

session_start();
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['usuario'], $data['senha'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Usuário e senha são obrigatórios']);
    exit;
}

$usuario = $data['usuario'];
$senha = $data['senha'];

// Busca pelo campo usuario
$stmt = $pdo->prepare("SELECT id, nome, usuario, senha_hash, nivel FROM usuarios WHERE usuario = ?");
$stmt->execute([$usuario]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($senha, $user['senha_hash'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['nome'] = $user['nome'];
    $_SESSION['usuario'] = $user['usuario'];
    $_SESSION['nivel'] = $user['nivel'];
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'nome' => $user['nome'],
            'usuario' => $user['usuario'],
            'nivel' => $user['nivel']
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Usuário ou senha inválidos']);
}
?>