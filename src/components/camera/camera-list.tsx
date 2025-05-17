// src/components/camera/camera-list.tsx
import React, { useState } from "react";

export const CameraList = () => {
  const [message, setMessage] = useState("Clique na planta para adicionar uma câmera.");

  const handleCanvasClick = (e: React.MouseEvent) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setMessage(`Câmera adicionada em: (${offsetX}, ${offsetY})`);
    // Aqui você adicionaria a câmera no estado do projeto
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-900 rounded-2xl shadow w-full h-full">
      <h2 className="text-xl font-semibold mb-4">Mapa de Câmeras</h2>
      <canvas
        width={800}
        height={600}
        className="border bg-gray-100 dark:bg-gray-800"
        onClick={handleCanvasClick}
      />
      <p className="mt-2">{message}</p>
    </div>
  );
};
