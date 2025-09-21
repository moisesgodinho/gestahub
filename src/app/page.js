// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import Login from '@/components/Login';
import GestationalInfoDashboard from '@/components/GestationalInfoDashboard';
import CalculatorPanel from '@/components/CalculatorPanel';
import AppNavigation from '@/components/AppNavigation';
import AgendaProximosPassos from '@/components/AgendaProximosPassos';
import { useUser } from '@/context/UserContext';
import { useGestationalData } from '@/hooks/useGestationalData'; // Importa o novo hook

export default function Home() {
  const { user, loading: userLoading } = useUser();
  const { loading: dataLoading, estimatedLmp, gestationalInfo, countdown, dataSource, hasData } = useGestationalData(user);

  const [isEditing, setIsEditing] = useState(false);
  const [activeCalculator, setActiveCalculator] = useState('dum');

  // Controla a exibição do formulário de edição
  useEffect(() => {
    // Se não estiver carregando e não tiver dados, mostra o formulário
    if (!userLoading && !dataLoading) {
      setIsEditing(!hasData);
    }
    // Se tiver dados, garante que o formulário correto seja exibido ao editar
    if (hasData) {
      setActiveCalculator(dataSource);
    }
  }, [userLoading, dataLoading, hasData, dataSource]);

  const handleSaveSuccess = () => {
    setIsEditing(false); // Apenas fecha o painel, o hook já vai atualizar os dados
  };
  
  const loading = userLoading || dataLoading;

  if (loading) {
    return ( <div className="flex items-center justify-center flex-grow"> <p className="text-lg text-rose-500 dark:text-rose-400">Carregando...</p> </div> );
  }

  return (
    <div className="flex items-center justify-center flex-grow p-4">
      {!user ? (
        <Login />
      ) : (
        <div className="w-full max-w-3xl">
          {isEditing ? (
            <CalculatorPanel
              user={user}
              activeCalculator={activeCalculator}
              onSwitch={setActiveCalculator}
              onSaveSuccess={handleSaveSuccess}
              // Só permite cancelar se já existirem dados salvos
              onCancel={() => hasData && setIsEditing(false)}
            />
          ) : (
            <>
              <GestationalInfoDashboard 
                gestationalInfo={gestationalInfo}
                countdown={countdown}
                dataSource={dataSource}
                onSwitchToUltrasound={() => {
                  setActiveCalculator('ultrassom');
                  setIsEditing(true);
                }}
                onEdit={() => setIsEditing(true)}
              />
              <AgendaProximosPassos lmpDate={estimatedLmp} user={user} />
            </>
          )}
          
          <AppNavigation />
        </div>
      )}
    </div>
  );
}