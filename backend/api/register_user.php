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

require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
if (
    !isset($data['nome'], $data['usuario'], $data['email'], $data['senha'], $data['nivel']) ||
    !in_array($data['nivel'], ['tecnico', 'administrador'])
) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados incompletos ou nível inválido.']);
    exit;
}

$nome = trim($data['nome']);
$usuario = trim($data['usuario']);
$email = trim($data['email']);
$senha = $data['senha'];
$nivel = $data['nivel'];

if (!$nome || !$usuario || !$email || !$senha) {
    http_response_code(400);
    echo json_encode(['error' => 'Todos os campos são obrigatórios.']);
    exit;
}

$senha_hash = password_hash($senha, PASSWORD_DEFAULT);

// Checa duplicidade de usuario ou email
$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ? OR email = ?");
$stmt->execute([$usuario, $email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Usuário ou email já cadastrado.']);
    exit;
}

// Insere usuário
$stmt = $pdo->prepare("INSERT INTO usuarios (nome, usuario, email, senha_hash, nivel) VALUES (?, ?, ?, ?, ?)");
try {
    $stmt->execute([$nome, $usuario, $email, $senha_hash, $nivel]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao cadastrar usuário.']);
}
?>