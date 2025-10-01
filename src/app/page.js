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
    refetch,
  } = useGestationalData(user);

  const [isManualEditing, setIsManualEditing] = useState(false);
  const [activeCalculator, setActiveCalculator] = useState("dum");

  const loading = userLoading || dataLoading;

  useEffect(() => {
    // Se os dados existem, define a calculadora padrão com base na fonte de dados
    if (hasData) {
      setActiveCalculator(dataSource);
      // Garante que não fiquemos no modo de edição se os dados aparecerem
      setIsManualEditing(false);
    }
  }, [hasData, dataSource]);

  const handleSaveSuccess = () => {
    setIsManualEditing(false);
  };

  const handleEditRequest = () => {
    setIsManualEditing(true);
  };

  // Lógica de renderização
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center flex-grow p-4">
          <SkeletonLoader type="fullPage" />
        </div>
      );
    }

    if (!user) {
      return <Login />;
    }

    // Se o usuário clicou para editar, ou se não há dados, mostra as calculadoras.
    if (isManualEditing || !hasData) {
      return (
        <CalculatorPanel
          user={user}
          activeCalculator={activeCalculator}
          onSwitch={setActiveCalculator}
          onSaveSuccess={handleSaveSuccess}
          // Só permite cancelar se já existirem dados para voltar
          onCancel={() => hasData && setIsManualEditing(false)}
          onForceReload={refetch}
        />
      );
    }

    // Se chegou aqui, o usuário está logado e tem dados, mostra o painel principal.
    return (
      <>
        <GestationalInfoDashboard
          gestationalInfo={gestationalInfo}
          countdown={countdown}
          dataSource={dataSource}
          onSwitchToUltrasound={() => {
            setActiveCalculator("ultrassom");
            handleEditRequest();
          }}
          onEdit={handleEditRequest}
        />
        <AgendaProximosPassos lmpDate={estimatedLmp} user={user} />
      </>
    );
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl">{renderContent()}</div>
    </div>
  );
}
