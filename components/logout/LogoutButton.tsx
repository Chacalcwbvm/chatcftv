import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Chame o backend para destruir a sessão, se necessário
    await fetch("http://localhost/chatcftv/backend/api/logout.php", {
      method: "POST",
      credentials: "include",
    });

    // Redirecione para login ou home após logout
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
    >
      Logout
    </button>
  );
};

export default LogoutButton;