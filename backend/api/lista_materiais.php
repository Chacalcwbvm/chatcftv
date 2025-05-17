// backend/api/lista_materiais.php
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

// Geração da lista de materiais dinâmica por projeto
$projeto_id = $_GET['projeto_id'] ?? null;

if (!$projeto_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Projeto_id é obrigatório']);
    exit;
}

// Query para agrupar equipamentos usados e somar quantidade
$sql = "
    SELECT e.tipo, e.modelo, SUM(pe.quantidade) AS total, e.preco, e.especificacoes
    FROM projeto_equipamentos pe
    JOIN equipamentos e ON pe.equipamento_id = e.id
    WHERE pe.projeto_id = ?
    GROUP BY e.tipo, e.modelo
";

$stmt = $pdo->prepare($sql);
$stmt->execute([$projeto_id]);
$materiais = $stmt->fetchAll();

echo json_encode($materiais);
