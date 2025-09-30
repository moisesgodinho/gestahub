// src/hooks/useGestationalData.js
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getEstimatedLmp, getDueDate } from "@/lib/gestationalAge";
import { weeklyInfo } from "@/data/weeklyInfo";

export function useGestationalData(user) {
  const [loading, setLoading] = useState(true);
  const [estimatedLmp, setEstimatedLmp] = useState(null);
  const [dataSource, setDataSource] = useState("dum");
  const [hasData, setHasData] = useState(false);
  const [gestationalInfo, setGestationalInfo] = useState(null);
  const [countdown, setCountdown] = useState({ weeks: 0, days: 0 });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setHasData(false);
      setGestationalInfo(null);
      setEstimatedLmp(null);
      return;
    }

    // Garante que o estado de carregamento esteja ativo ao trocar de usuário
    setLoading(true);

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        // Alteração crucial: Só prossiga se o documento existir E tiver dados.
        if (docSnap.exists() && docSnap.data()) {
          const userData = docSnap.data();
          const lmpDate = getEstimatedLmp(userData);

          if (lmpDate) {
            setEstimatedLmp(lmpDate);
            setDataSource(
              userData.gestationalProfile?.ultrasound?.examDate
                ? "ultrassom"
                : "dum"
            );
            setHasData(true);

            const lmpDateTime = lmpDate.getTime();
            const today = new Date();
            const todayTime = Date.UTC(
              today.getUTCFullYear(),
              today.getUTCMonth(),
              today.getUTCDate()
            );

            const gestationalAgeInMs = todayTime - lmpDateTime;
            const gestationalAgeInDays = Math.floor(
              gestationalAgeInMs / (1000 * 60 * 60 * 24)
            );
            const weeks = Math.floor(gestationalAgeInDays / 7);
            const days = gestationalAgeInDays % 7;

            const dueDate = getDueDate(lmpDate);
            const totalPregnancyDays = 280;
            const remainingDaysTotal =
              totalPregnancyDays - gestationalAgeInDays;

            setCountdown({
              weeks: Math.floor(remainingDaysTotal / 7),
              days: remainingDaysTotal % 7,
            });

            setGestationalInfo({
              weeks,
              days,
              dueDate: dueDate.toLocaleDateString("pt-BR", { timeZone: "UTC" }),
              currentWeekInfo: weeklyInfo[weeks] || weeklyInfo[42],
            });
          } else {
            // Se não encontrou data de gestação, define como sem dados.
            setHasData(false);
            setGestationalInfo(null);
          }
        } else {
          // Se o documento não existe, também define como sem dados.
          setHasData(false);
          setGestationalInfo(null);
        }

        // A tela de carregamento só termina depois de toda a verificação.
        setLoading(false);
      },
      (error) => {
        // Adicionado para robustez: se der erro, para de carregar.
        console.error("Erro ao buscar dados de gestação:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return {
    loading,
    estimatedLmp,
    gestationalInfo,
    countdown,
    dataSource,
    hasData,
  };
}
