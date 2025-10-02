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
    goal: 2000,
    current: 0,
    cupSize: 250,
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
      const profileGoal = profile.waterGoal || 2000;
      const profileCupSize = profile.waterCupSize || 250;

      if (todayEntry) {
        setWaterData({
          ...todayEntry,
          goal: todayEntry.goal || profileGoal,
          cupSize: todayEntry.cupSize || profileCupSize,
        });
      } else {
        setWaterData({
          goal: profileGoal,
          cupSize: profileCupSize,
          current: 0,
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
    const newData = { ...waterData, current: newAmount };
    setWaterData(newData);
    updateWaterData(newData);
  };

  const undoLastWater = (amount) => {
    if (waterData.current === 0) return;
    const newAmount = Math.max(0, waterData.current - amount);
    const newData = { ...waterData, current: newAmount };
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
