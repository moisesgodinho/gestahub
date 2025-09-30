// src/hooks/useGestationalData.js
import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getEstimatedLmp, getDueDate } from "@/lib/gestationalAge";
import { weeklyInfo } from "@/data/weeklyInfo";
import { toast } from "react-toastify";

export function useGestationalData(user) {
  const [loading, setLoading] = useState(true);
  const [estimatedLmp, setEstimatedLmp] = useState(null);
  const [dataSource, setDataSource] = useState("dum");
  const [hasData, setHasData] = useState(false);
  const [gestationalInfo, setGestationalInfo] = useState(null);
  const [countdown, setCountdown] = useState({ weeks: 0, days: 0 });

  const processUserData = (userData) => {
    const lmpDate = getEstimatedLmp(userData);

    if (lmpDate) {
      setEstimatedLmp(lmpDate);
      setDataSource(
        userData.gestationalProfile?.ultrasound?.examDate ? "ultrassom" : "dum"
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
      const remainingDaysTotal = totalPregnancyDays - gestationalAgeInDays;

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
      setHasData(false);
      setGestationalInfo(null);
    }
  };

  const refetch = useCallback(async () => {
    if (!user) return;
    toast.info("Sincronizando com a nuvem...");
    setLoading(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists() && docSnap.data()) {
        processUserData(docSnap.data());
      } else {
        setHasData(false);
        setGestationalInfo(null);
      }
      toast.success("Dados sincronizados!");
    } catch (error) {
      console.error("Erro ao forçar recarregamento:", error);
      toast.error("Falha na sincronização.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setHasData(false);
      setGestationalInfo(null);
      setEstimatedLmp(null);
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists() && docSnap.data()) {
          processUserData(docSnap.data());
        } else {
          setHasData(false);
          setGestationalInfo(null);
        }
        setLoading(false);
      },
      (error) => {
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
    refetch,
  };
}
