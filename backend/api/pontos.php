// backend/api/pontos.php
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
    $stmt = $pdo->prepare('SELECT * FROM pontos WHERE projeto_id = ?');
    $stmt->execute([$projeto_id]);
    $pontos = $stmt->fetchAll();
    echo json_encode($pontos);
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['projeto_id'], $data['equipamento_id'], $data['pos_x'], $data['pos_y'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Campos obrigatórios faltando']);
        exit;
    }
    $sql = "INSERT INTO pontos (projeto_id, equipamento_id, pos_x, pos_y, angulo, propriedades) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    try {
        $props = isset($data['propriedades']) ? json_encode($data['propriedades']) : null;
        $stmt->execute([
            $data['projeto_id'],
            $data['equipamento_id'],
            $data['pos_x'],
            $data['pos_y'],
            $data['angulo'] ?? 0,
            $props
        ]);
        echo json_encode(['message' => 'Ponto criado', 'id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao criar ponto']);
    }
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID do ponto obrigatório']);
        exit;
    }
    $sql = "UPDATE pontos SET pos_x = ?, pos_y = ?, angulo = ?, propriedades = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    try {
        $props = isset($data['propriedades']) ? json_encode($data['propriedades']) : null;
        $stmt->execute([
            $data['pos_x'],
            $data['pos_y'],
            $data['angulo'] ?? 0,
            $props,
            $data['id']
        ]);
        echo json_encode(['message' => 'Ponto atualizado']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao atualizar ponto']);
    }
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID do ponto obrigatório']);
        exit;
    }
    $stmt = $pdo->prepare("DELETE FROM pontos WHERE id = ?");
    try {
        $stmt->execute([$id]);
        echo json_encode(['message' => 'Ponto removido']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao remover ponto']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método não suportado']);
}
