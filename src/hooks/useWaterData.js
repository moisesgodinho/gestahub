// src/hooks/useWaterData.js
import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getTodayString } from "@/lib/dateUtils";
import { toast } from "react-toastify";

export function useWaterData(user) {
  const [waterData, setWaterData] = useState({
    goal: 2000,
    current: 0,
    history: [],
  });
  const [loading, setLoading] = useState(true);
  const today = getTodayString();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, "users", user.uid, "waterIntake", today);
    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWaterData({ ...data, history: data.history || [] });
      } else {
        // Se não existir, busca o objetivo do perfil do usuário
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        const profileGoal =
          userSnap.data()?.gestationalProfile?.waterGoal || 2000;
        setWaterData({ goal: profileGoal, current: 0, history: [] });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, today]);

  const updateWaterData = async (newData) => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid, "waterIntake", today);
      await setDoc(docRef, newData, { merge: true });
    } catch (error) {
      toast.error("Não foi possível salvar os dados.");
    }
  };

  const setWaterGoal = async (newGoal) => {
    const goal = parseInt(newGoal, 10);
    if (isNaN(goal) || goal <= 0) {
      toast.warn("Por favor, insira uma meta válida.");
      return;
    }
    // Atualiza a meta para o dia atual e também no perfil do usuário
    const newData = { ...waterData, goal };
    setWaterData(newData);
    await updateWaterData(newData);

    const userDocRef = doc(db, "users", user.uid);
    await setDoc(
      userDocRef,
      { gestationalProfile: { waterGoal: goal } },
      { merge: true }
    );

    toast.success("Meta de hidratação atualizada!");
  };

  const addWater = (amount) => {
    const newAmount = waterData.current + amount;
    const newHistory = [...(waterData.history || []), amount];
    const newData = { ...waterData, current: newAmount, history: newHistory };
    setWaterData(newData);
    updateWaterData(newData);
  };

  const undoLastWater = () => {
    if (!waterData.history || waterData.history.length === 0) {
      return;
    }
    const lastAmount = waterData.history[waterData.history.length - 1];
    const newAmount = Math.max(0, waterData.current - lastAmount);
    const newHistory = waterData.history.slice(0, -1);
    const newData = { ...waterData, current: newAmount, history: newHistory };
    setWaterData(newData);
    updateWaterData(newData);
  };

  return { waterData, loading, setWaterGoal, addWater, undoLastWater };
}
