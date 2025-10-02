// src/hooks/useWaterData.js
import { useState, useEffect } from "react";
import {
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getTodayString } from "@/lib/dateUtils";
import { toast } from "react-toastify";

export function useWaterData(user) {
  const [waterData, setWaterData] = useState({
    goal: 2500,
    current: 0,
    cupSize: 250,
    history: [], // Histórico de adições do dia
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = getTodayString();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "waterIntake"),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const allEntries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const todayEntry = allEntries.find((entry) => entry.id === today);

      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      const profile = userSnap.data()?.gestationalProfile || {};
      const profileGoal = profile.waterGoal || 2500;
      const profileCupSize = profile.waterCupSize || 250;

      if (todayEntry) {
        setWaterData({
          ...todayEntry,
          goal: todayEntry.goal || profileGoal,
          cupSize: todayEntry.cupSize || profileCupSize,
          history: todayEntry.history || [],
        });
      } else {
        setWaterData({
          goal: profileGoal,
          cupSize: profileCupSize,
          current: 0,
          history: [],
        });
      }

      setHistory(allEntries);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, today]);

  const updateWaterData = async (newData) => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid, "waterIntake", today);
      await setDoc(docRef, { ...newData, date: today }, { merge: true });
    } catch (error) {
      toast.error("Não foi possível salvar os dados.");
    }
  };

  const setWaterSettings = async (newGoal, newCupSize) => {
    const goal = parseInt(newGoal, 10);
    const cupSize = parseInt(newCupSize, 10);

    if (isNaN(goal) || goal <= 0) {
      toast.warn("Por favor, insira uma meta diária válida.");
      return;
    }
    if (isNaN(cupSize) || cupSize <= 0) {
      toast.warn("Por favor, insira um tamanho de copo válido.");
      return;
    }

    const newData = { ...waterData, goal, cupSize };
    setWaterData(newData);
    await updateWaterData(newData);

    const userDocRef = doc(db, "users", user.uid);
    await setDoc(
      userDocRef,
      { gestationalProfile: { waterGoal: goal, waterCupSize: cupSize } },
      { merge: true }
    );

    toast.success("Configurações de hidratação atualizadas!");
  };

  const addWater = (amount) => {
    const newAmount = waterData.current + amount;
    const newHistory = [...(waterData.history || []), amount];
    const newData = { ...waterData, current: newAmount, history: newHistory };
    setWaterData(newData);
    updateWaterData(newData);
  };

  const undoLastWater = () => {
    const history = waterData.history || [];
    if (history.length === 0) return;
    const lastAmount = history[history.length - 1];
    const newAmount = Math.max(0, waterData.current - lastAmount);
    const newHistory = history.slice(0, -1);
    const newData = { ...waterData, current: newAmount, history: newHistory };
    setWaterData(newData);
    updateWaterData(newData);
  };

  return {
    waterData,
    history,
    loading,
    setWaterSettings,
    addWater,
    undoLastWater,
  };
}
