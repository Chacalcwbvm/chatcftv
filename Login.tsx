import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const resp = await fetch("http://localhost/chatcftv/backend/api/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ usuario, senha }),
      });
      const data = await resp.json();

      if (resp.ok && data.success) {
        navigate("/");
      } else {
        setErro(data.error || "Usuário ou senha inválidos");
      }
    } catch (err) {
      setErro("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md w-80"
      >
        <h2 className="text-2xl mb-6 text-center font-semibold">
          Login do Sistema
        </h2>
        <label className="block mb-2 font-medium" htmlFor="usuario">
          Usuário
        </label>
        <input
          id="usuario"
          type="text"
          placeholder="Usuário"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          required
        />
        <label className="block mb-2 font-medium" htmlFor="senha">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full mb-6 p-2 border border-gray-300 rounded"
          required
        />
        {erro && <div className="text-red-600 mb-3 text-center">{erro}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <p className="mt-4 text-center">
          <a href="/register-user" className="text-blue-600 hover:underline">
            Criar conta de usuário
          </a>
        </p>
      </form>
    </div>
  );
};

export default Login;