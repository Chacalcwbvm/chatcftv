// src/components/Projetos.jsx
import { useEffect, useState } from 'react';
import { getProjetos, criarProjeto } from '../hooks/useApi';

function Projetos() {
  const [projetos, setProjetos] = useState([]);
  const [novoNome, setNovoNome] = useState('');

  useEffect(() => {
    getProjetos().then(setProjetos);
  }, []);

  const adicionarProjeto = async () => {
    if (!novoNome) return;
    const novo = await criarProjeto({
      nome: novoNome,
      descricao: '',
      cliente_id: 1,
      usuario_id: 1,
    });
    setProjetos([...projetos, { ...novo, nome: novoNome }]);
    setNovoNome('');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Projetos</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Novo projeto"
          className="border px-2 py-1 rounded"
        />
        <button onClick={adicionarProjeto} className="bg-blue-600 text-white px-4 py-1 rounded">
          Adicionar
        </button>
      </div>
      <ul className="space-y-1">
        {projetos.map((p) => (
          <li key={p.id} className="bg-white p-2 border rounded shadow-sm">
            {p.nome}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Projetos;
