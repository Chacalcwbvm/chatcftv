import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";

export const UserForm = () => {
  const { users, addUser } = useAppContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === "" || email.trim() === "") return;
    addUser(name.trim(), email.trim());
    setName("");
    setEmail("");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Cadastro de Usuários</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-3 max-w-md">
        <input
          type="text"
          placeholder="Nome do usuário"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
        >
          Adicionar Usuário
        </button>
      </form>

      <ul className="list-disc list-inside">
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};