
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

header("Content-Type: application/json");
require_once '../connection.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
  case 'GET':
    $stmt = $pdo->query("SELECT * FROM projetos ORDER BY id DESC");
    echo json_encode($stmt->fetchAll());
    break;

  case 'POST':
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $pdo->prepare("INSERT INTO projetos (nome, descricao, cliente_id, usuario_id) VALUES (?, ?, ?, ?)");
    $stmt->execute([
      $data['nome'],
      $data['descricao'],
      $data['cliente_id'],
      $data['usuario_id']
    ]);
    echo json_encode(['id' => $pdo->lastInsertId()]);
    break;

  case 'DELETE':
    $id = $_GET['id'] ?? null;
    if ($id) {
      $stmt = $pdo->prepare("DELETE FROM projetos WHERE id = ?");
      $stmt->execute([$id]);
      echo json_encode(['status' => 'deleted']);
    } else {
      http_response_code(400);
      echo json_encode(['error' => 'ID não fornecido']);
    }
    break;
}
