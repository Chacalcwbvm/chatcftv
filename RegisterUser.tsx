import React, { useState } from "react";

const RegisterUser: React.FC = () => {
  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nivel, setNivel] = useState<"administrador" | "tecnico">("tecnico");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setMensagem("");
    if (!nome || !usuario || !email || !senha) {
      setErro("Preencha todos os campos!");
      return;
    }
    try {
      const resp = await fetch("http://localhost/chatcftv/backend/api/register_user.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, usuario, email, senha, nivel }),
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setMensagem("Usuário cadastrado com sucesso!");
        setNome("");
        setUsuario("");
        setEmail("");
        setSenha("");
        setNivel("tecnico");
      } else {
        setErro(data.error || "Erro ao cadastrar usuário");
      }
    } catch (err) {
      setErro("Erro de conexão com o servidor");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h2 className="text-2xl mb-6 text-center font-semibold">
          Cadastro de Usuário
        </h2>
        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          required
        />
        <input
          type="text"
          placeholder="Usuário"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          required
        />
        <div className="mb-4">
          <label className="block mb-1 font-medium">Tipo de usuário</label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={nivel}
            onChange={e => setNivel(e.target.value as "administrador" | "tecnico")}
            required
          >
            <option value="tecnico">Técnico</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>
        {mensagem && (
          <div className="mb-2 text-green-600 text-center">{mensagem}</div>
        )}
        {erro && (
          <div className="mb-2 text-red-600 text-center">{erro}</div>
        )}
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
        >
          Cadastrar
        </button>
      </form>
    </div>
  );
};

export default RegisterUser;