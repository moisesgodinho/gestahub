// src/app/page.js
"use client";

import { useState, useEffect } from "react";
import Login from "@/components/Login";
import GestationalInfoDashboard from "@/components/GestationalInfoDashboard";
import CalculatorPanel from "@/components/CalculatorPanel";
import AgendaProximosPassos from "@/components/AgendaProximosPassos";
import { useUser } from "@/context/UserContext";
import { useGestationalData } from "@/hooks/useGestationalData";
import SkeletonLoader from "@/components/SkeletonLoader";

export default function Home() {
  const { user, loading: userLoading } = useUser();
  const {
    loading: dataLoading,
    estimatedLmp,
    gestationalInfo,
    countdown,
    dataSource,
    hasData,
  } = useGestationalData(user);

  // NOVO: Estado para controlar a edição manual pelo usuário
  const [isManualEditing, setIsManualEditing] = useState(false);
  const [activeCalculator, setActiveCalculator] = useState("dum");

  // Define a calculadora ativa com base na fonte de dados quando os dados são carregados
  useEffect(() => {
    if (hasData) {
      setActiveCalculator(dataSource);
    }
  }, [hasData, dataSource]);

  const handleSaveSuccess = () => {
    setIsManualEditing(false); // Desativa a edição manual ao salvar
  };

  const loading = userLoading || dataLoading;

  // Lógica de renderização mais clara e robusta
  // Mostra as calculadoras se (1) os dados não existem OU (2) o usuário clicou para editar
  const showCalculators = !loading && user && (!hasData || isManualEditing);

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <SkeletonLoader type="fullPage" />
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      {!user ? (
        <Login />
      ) : (
        <div className="w-full max-w-3xl">
          {showCalculators ? (
            <CalculatorPanel
              user={user}
              activeCalculator={activeCalculator}
              onSwitch={setActiveCalculator}
              onSaveSuccess={handleSaveSuccess}
              // Permite cancelar a edição apenas se já existirem dados para mostrar
              onCancel={() => hasData && setIsManualEditing(false)}
            />
          ) : (
            <>
              <GestationalInfoDashboard
                gestationalInfo={gestationalInfo}
                countdown={countdown}
                dataSource={dataSource}
                onSwitchToUltrasound={() => {
                  setActiveCalculator("ultrassom");
                  setIsManualEditing(true); // Ativa a edição manual
                }}
                onEdit={() => setIsManualEditing(true)} // Ativa a edição manual
              />
              <AgendaProximosPassos lmpDate={estimatedLmp} user={user} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
