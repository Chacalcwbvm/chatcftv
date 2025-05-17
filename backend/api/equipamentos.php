// backend/api/equipamentos.php
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
    $stmt = $pdo->query('SELECT * FROM equipamentos');
    $equipamentos = $stmt->fetchAll();
    echo json_encode($equipamentos);
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['tipo'], $data['modelo'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Campos obrigatórios faltando']);
        exit;
    }
    $sql = "INSERT INTO equipamentos (tipo, modelo, especificacoes, consumo_energia_w, preco) VALUES (?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    try {
        $stmt->execute([
            $data['tipo'],
            $data['modelo'],
            $data['especificacoes'] ?? null,
            $data['consumo_energia_w'] ?? 0,
            $data['preco'] ?? 0
        ]);
        echo json_encode(['message' => 'Equipamento criado', 'id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao criar equipamento']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método não suportado']);
}
