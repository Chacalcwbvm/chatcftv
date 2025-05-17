import React, { useState, useRef } from "react";
import { useAppContext } from "@/context/AppContext";

type CameraPoint = {
  id: number;
  x: number;
  y: number;
};

export const ProjectForm = () => {
  const { addCamera } = useAppContext();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [points, setPoints] = useState<CameraPoint[]>([]);
  const [dragId, setDragId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("Clique na planta para adicionar uma câmera.");
  const nextId = useRef(1);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Upload da planta
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setPoints([]);
      setMessage("Clique na planta para adicionar uma câmera.");
    }
  };

  // Adicionar câmera
  const handleAddCamera = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageUrl || !imageContainerRef.current) {
      setMessage("Por favor, faça upload de uma planta antes.");
      return;
    }
    // Evita adicionar ao clicar sobre um ponto já existente
    if ((e.target as HTMLElement).dataset.iscamera === "true") return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newPoint = { id: nextId.current++, x, y };
    setPoints((prev) => [...prev, newPoint]);
    addCamera(x, y); // Atualiza o estado global
    setMessage(`Câmera adicionada na posição (${Math.round(x)}, ${Math.round(y)})`);
  };

  // Iniciar arraste
  const handlePointerDown = (id: number) => {
    setDragId(id);
  };

  // Arrastar câmera
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragId === null || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints((prev) =>
      prev.map((point) =>
        point.id === dragId ? { ...point, x, y } : point
      )
    );
  };

  // Soltar arraste
  const handlePointerUp = () => {
    setDragId(null);
  };

  // Remover câmera (ex: clique duplo)
  const handleRemoveCamera = (id: number) => {
    setPoints((prev) => prev.filter((p) => p.id !== id));
    setMessage(`Câmera ${id} removida.`);
  };

  // Limpar tudo
  const handleClear = () => {
    setPoints([]);
    setMessage("Todas as câmeras foram removidas.");
  };

  // Exportar como imagem (usando html2canvas)
  const handleExport = async () => {
    if (!imageContainerRef.current) return;
    setMessage("Exportando...");
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(imageContainerRef.current, {
      backgroundColor: null,
      useCORS: true,
    });
    const link = document.createElement("a");
    link.download = "planta-projeto.png";
    link.href = canvas.toDataURL();
    link.click();
    setMessage("Exportação concluída!");
  };

  // Salvar no localStorage
  const handleSave = () => {
    if (!imageUrl) {
      setMessage("Nenhuma planta para salvar.");
      return;
    }
    localStorage.setItem("projectImageUrl", imageUrl);
    localStorage.setItem("projectCameras", JSON.stringify(points));
    setMessage("Projeto salvo!");
  };

  // Carregar do localStorage
  const handleLoad = () => {
    const img = localStorage.getItem("projectImageUrl");
    const pts = localStorage.getItem("projectCameras");
    if (img && pts) {
      setImageUrl(img);
      setPoints(JSON.parse(pts));
      setMessage("Projeto carregado!");
    } else {
      setMessage("Nenhum projeto salvo.");
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <label>
        <span className="block font-semibold mb-1">Upload da planta:</span>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </label>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleClear}
          className="bg-red-500 text-white px-3 py-1 rounded"
          type="button"
          disabled={points.length === 0}
        >
          Limpar câmeras
        </button>
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-3 py-1 rounded"
          type="button"
        >
          Salvar projeto
        </button>
        <button
          onClick={handleLoad}
          className="bg-yellow-500 text-white px-3 py-1 rounded"
          type="button"
        >
          Carregar projeto
        </button>
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-3 py-1 rounded"
          type="button"
        >
          Exportar imagem
        </button>
      </div>

      <div
        ref={imageContainerRef}
        onClick={handleAddCamera}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative border border-gray-300 rounded-md flex-grow cursor-crosshair overflow-auto bg-gray-50"
        style={{ minHeight: 300, maxWidth: 800, aspectRatio: "16/9" }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Planta do projeto"
            className="w-full h-full object-contain select-none pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Nenhuma planta carregada.
          </div>
        )}

        {points.map((point) => (
          <div
            key={point.id}
            data-iscamera="true"
            className="absolute bg-red-600 rounded-full w-7 h-7 flex items-center justify-center text-white font-bold border-2 border-white shadow cursor-move z-10 hover:bg-red-800 transition"
            style={{
              left: point.x,
              top: point.y,
              userSelect: "none",
              touchAction: "none",
            }}
            title={`Câmera ${point.id} - Clique duplo para remover`}
            onPointerDown={(e) => {
              e.stopPropagation();
              handlePointerDown(point.id);
            }}
            onDoubleClick={() => handleRemoveCamera(point.id)}
          >
            {point.id}
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-600">{message}</p>
      <p className="text-xs text-gray-400">
        Arraste a câmera para mover. Clique duplo para remover. Salve e recarregue seu projeto!
      </p>
    </div>
  );
};