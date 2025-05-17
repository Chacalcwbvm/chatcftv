// src/hooks/useApi.js
const apiUrl = import.meta.env.VITE_API_URL;

export async function getProjetos() {
  const res = await fetch(`${apiUrl}/projetos.php`);
  return await res.json();
}

export async function criarProjeto(projeto) {
  const res = await fetch(`${apiUrl}/projetos.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projeto),
  });
  return await res.json();
}

export async function deletarProjeto(id) {
  const res = await fetch(`${apiUrl}/projetos.php?id=${id}`, {
    method: "DELETE",
  });
  return await res.json();
}
