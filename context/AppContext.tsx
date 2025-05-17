// context/AppContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

type Camera = { id: number; x: number; y: number };
type Client = { id: number; name: string };
type User = { id: number; name: string; email: string };

type AppContextType = {
  cameras: Camera[];
  addCamera: (x: number, y: number) => void;
  clients: Client[];
  addClient: (name: string) => void;
  users: User[];
  addUser: (name: string, email: string) => void;
  loggedUser: User | null;
  login: (email: string) => boolean;
  logout: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "Admin", email: "admin@admin.com" },
  ]);
  const [loggedUser, setLoggedUser] = useState<User | null>(null);

  const addCamera = (x: number, y: number) => {
    setCameras((prev) => [...prev, { id: prev.length + 1, x, y }]);
  };

  const addClient = (name: string) => {
    setClients((prev) => [...prev, { id: prev.length + 1, name }]);
  };

  const addUser = (name: string, email: string) => {
    setUsers((prev) => [...prev, { id: prev.length + 1, name, email }]);
  };

  const login = (email: string): boolean => {
    const user = users.find((u) => u.email === email);
    if (user) {
      setLoggedUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setLoggedUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        cameras,
        addCamera,
        clients,
        addClient,
        users,
        addUser,
        loggedUser,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
