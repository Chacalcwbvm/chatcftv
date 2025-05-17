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
session_start();
require 'connection.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['email'], $data['senha'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email e senha são obrigatórios']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id, nome, email, senha_hash, nivel FROM usuarios WHERE email = ?");
    $stmt->execute([$data['email']]);
    $usuario = $stmt->fetch();

    if ($usuario && password_verify($data['senha'], $usuario['senha_hash'])) {
        $_SESSION['usuario_id'] = $usuario['id'];
        $_SESSION['usuario_nome'] = $usuario['nome'];
        $_SESSION['usuario_nivel'] = $usuario['nivel'];
        echo json_encode([
            'message' => 'Login realizado',
            'usuario' => [
                'id' => $usuario['id'],
                'nome' => $usuario['nome'],
                'email' => $usuario['email'],
                'nivel' => $usuario['nivel']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Email ou senha inválidos']);
    }
} elseif ($method === 'GET') {
    // Verifica se usuário está logado
    if (isset($_SESSION['usuario_id'])) {
        echo json_encode([
            'logado' => true,
            'usuario' => [
                'id' => $_SESSION['usuario_id'],
                'nome' => $_SESSION['usuario_nome'],
                'nivel' => $_SESSION['usuario_nivel']
            ]
        ]);
    } else {
        echo json_encode(['logado' => false]);
    }
} elseif ($method === 'DELETE') {
    session_destroy();
    echo json_encode(['message' => 'Logout realizado']);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método não suportado']);
}
