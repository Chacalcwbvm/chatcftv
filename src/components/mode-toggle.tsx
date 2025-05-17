// components/mode-toggle.tsx
import React, { useState } from "react";

export const ModeToggle = () => {
  const [mode, setMode] = useState("normal");

  const toggle = () => {
    setMode(mode === "normal" ? "compact" : "normal");
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
      aria-label="Toggle Mode"
      title={`Modo: ${mode}`}
    >
      {mode === "normal" ? "N" : "C"}
    </button>
  );
};
