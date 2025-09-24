// src/components/ResponsiveNav.js
"use client";

import { useUser } from "@/context/UserContext";
import Sidebar from "./Sidebar";
import TabBar from "./TabBar";

export default function ResponsiveNav() {
  const { user } = useUser();

  if (!user) {
    return null; // Não renderiza nada se o usuário não estiver logado
  }

  return (
    <>
      {/* Menu Lateral para telas maiores (lg e acima) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      {/* Barra de Navegação Inferior para telas menores (abaixo de lg) */}
      <div className="lg:hidden">
        <TabBar />
      </div>
    </>
  );
}