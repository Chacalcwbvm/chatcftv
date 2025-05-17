// backend/api/conexoes.php
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
    $projeto_id = $_GET['projeto_id'] ?? null;
    if (!$projeto_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Projeto_id é obrigatório']);
        exit;
    }
    $stmt = $pdo->prepare('SELECT * FROM conexoes WHERE projeto_id = ?');
    $stmt->execute([$projeto_id]);
    $conexoes = $stmt->fetchAll();
    echo json_encode($conexoes);
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['projeto_id'], $data['ponto_origem_id'], $data['ponto_destino_id'], $data['tipo_cabo'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Campos obrigatórios faltando']);
        exit;
    }
    $sql = "INSERT INTO conexoes (projeto_id, ponto_origem_id, ponto_destino_id, tipo_cabo, comprimento_m) VALUES (?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    try {
        $stmt->execute([
            $data['projeto_id'],
            $data['ponto_origem_id'],
            $data['ponto_destino_id'],
            $data['tipo_cabo'],
            $data['comprimento_m'] ?? 0
        ]);
        echo json_encode(['message' => 'Conexão criada', 'id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao criar conexão']);
    }
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID da conexão obrigatório']);
        exit;
    }
    $stmt = $pdo->prepare("DELETE FROM conexoes WHERE id = ?");
    try {
        $stmt->execute([$id]);
        echo json_encode(['message' => 'Conexão removida']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao remover conexão']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método não suportado']);
}
