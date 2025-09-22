// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import Login from '@/components/Login';
import GestationalInfoDashboard from '@/components/GestationalInfoDashboard';
import CalculatorPanel from '@/components/CalculatorPanel';
import AppNavigation from '@/components/AppNavigation';
import AgendaProximosPassos from '@/components/AgendaProximosPassos';
import { useUser } from '@/context/UserContext';
import { useGestationalData } from '@/hooks/useGestationalData';
import SkeletonLoader from '@/components/SkeletonLoader';

export default function Home() {
  const { user, loading: userLoading } = useUser();
  const { loading: dataLoading, estimatedLmp, gestationalInfo, countdown, dataSource, hasData } = useGestationalData(user);

  const [isEditing, setIsEditing] = useState(false);
  const [activeCalculator, setActiveCalculator] = useState('dum');

  useEffect(() => {
    if (!userLoading && !dataLoading) {
      setIsEditing(!hasData);
    }
    if (hasData) {
      setActiveCalculator(dataSource);
    }
  }, [userLoading, dataLoading, hasData, dataSource]);

  const handleSaveSuccess = () => {
    setIsEditing(false);
  };
  
  const loading = userLoading || dataLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <SkeletonLoader type="fullPage" />
      </div>
    );
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