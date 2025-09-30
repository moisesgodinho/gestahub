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

  useEffect(() => {
    if (hasData) {
      setActiveCalculator(dataSource);
    }
  }, [hasData, dataSource]);

  const handleSaveSuccess = () => {
    setIsManualEditing(false);
  };

  const loading = userLoading || dataLoading;
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
              onCancel={() => hasData && setIsManualEditing(false)}
              onForceReload={refetch}
            />
          ) : (
            <>
              <GestationalInfoDashboard
                gestationalInfo={gestationalInfo}
                countdown={countdown}
                dataSource={dataSource}
                onSwitchToUltrasound={() => {
                  setActiveCalculator("ultrassom");
                  setIsManualEditing(true);
                }}
                onEdit={() => setIsManualEditing(true)}
              />
              <AgendaProximosPassos lmpDate={estimatedLmp} user={user} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
