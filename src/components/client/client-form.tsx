import React, { useState, useEffect } from "react";

type Client = {
  id: number;
  nome: string;
  endereco?: string;
  telefone?: string;
  email?: string;
};

export const ClientForm = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // Buscar clientes do backend
  const fetchClients = async () => {
    const resp = await fetch("http://localhost/chatcftv/backend/api/clientes.php", {
      method: "GET",
      credentials: "include",
    });
    if (resp.ok) {
      const data = await resp.json();
      setClients(data);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Inserir ou atualizar cliente
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nome.trim() === "") return;

    const clientData = {
      nome: nome.trim(),
      endereco: endereco.trim(),
      telefone: telefone.trim(),
      email: email.trim(),
    };

    if (editingId) {
      // Editar (PUT)
      await fetch("http://localhost/chatcftv/backend/api/clientes.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: editingId, ...clientData }),
      });
    } else {
      // Inserir (POST)
      await fetch("http://localhost/chatcftv/backend/api/clientes.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(clientData),
      });
    }
    setNome("");
    setEndereco("");
    setTelefone("");
    setEmail("");
    setEditingId(null);
    fetchClients();
  };

  // Deletar cliente
  const handleDelete = async (id: number) => {
    if (!window.confirm("Deseja realmente apagar este cliente?")) return;
    await fetch(`http://localhost/chatcftv/backend/api/clientes.php?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchClients();
  };

  // Preencher o formulário para edição
  const startEdit = (client: Client) => {
    setEditingId(client.id);
    setNome(client.nome || "");
    setEndereco(client.endereco || "");
    setTelefone(client.telefone || "");
    setEmail(client.email || "");
  };

  // Cancelar edição
  const cancelEdit = () => {
    setEditingId(null);
    setNome("");
    setEndereco("");
    setTelefone("");
    setEmail("");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{editingId ? "Editar Cliente" : "Cadastro de Clientes"}</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2 max-w-md">
        <input
          type="text"
          placeholder="Nome do cliente"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className={`px-4 py-2 rounded text-white ${editingId ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}
          >
            {editingId ? "Salvar Alterações" : "Adicionar Cliente"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <ul className="list-disc list-inside">
        {clients.map((client) => (
          <li key={client.id} className="mb-1 flex items-center gap-2">
            <span>
              <b>{client.nome}</b>
              {client.endereco && <> | {client.endereco}</>}
              {client.telefone && <> | {client.telefone}</>}
              {client.email && <> | {client.email}</>}
            </span>
            <button
              className="ml-2 text-blue-600 hover:underline"
              onClick={() => startEdit(client)}
            >
              Editar
            </button>
            <button
              className="ml-2 text-red-600 hover:underline"
              onClick={() => handleDelete(client.id)}
            >
              Apagar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};