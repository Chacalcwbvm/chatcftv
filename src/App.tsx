import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Auth from "./Auth";
import RegisterUser from "./RegisterUser";
import { AppProvider } from "./context/AppContext"; // <-- Importe seu provider

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/register-user" element={<RegisterUser />} />
      </Routes>
    </AppProvider>
  );
}

export default App;