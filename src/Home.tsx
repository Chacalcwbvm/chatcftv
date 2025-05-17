import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Importe seus componentes personalizados conforme necessário:
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Camera, Users, Settings } from "lucide-react";
import { ProjectForm } from "@/components/project/project-form";
import { CameraList } from "@/components/camera/camera-list";
import { ClientForm } from "@/components/client/client-form";
import { UserForm } from "@/components/user/user-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ModeToggle } from "@/components/theme/mode-toggle";

const Home: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>("projeto");
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("auth") === "true";
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <main className="flex flex-col h-screen w-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sistema de Mapeamento de CFTV</h1>
        <div className="flex gap-2">
          <ThemeToggle />
          <ModeToggle />
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full h-full">
        <TabsList className="grid grid-cols-4 gap-2">
          <TabsTrigger value="projeto">
            <MapPin className="mr-2 h-4 w-4" /> Projeto
          </TabsTrigger>
          <TabsTrigger value="cameras">
            <Camera className="mr-2 h-4 w-4" /> Câmeras
          </TabsTrigger>
          <TabsTrigger value="clientes">
            <Users className="mr-2 h-4 w-4" /> Clientes
          </TabsTrigger>
          <TabsTrigger value="usuarios">
            <Settings className="mr-2 h-4 w-4" /> Usuários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projeto">
          <ProjectForm />
        </TabsContent>
        <TabsContent value="cameras">
          <CameraList />
        </TabsContent>
        <TabsContent value="clientes">
          <ClientForm />
        </TabsContent>
        <TabsContent value="usuarios">
          <UserForm />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Home;