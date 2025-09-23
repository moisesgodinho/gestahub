// src/hooks/useWeightData.js
import { useState, useEffect } from "react";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getEstimatedLmp, getDueDate } from "@/lib/gestationalAge";

const calculateBMI = (weight, height) => {
  if (!weight || !height) return 0;
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
};

export function useWeightData(user) {
  const [loading, setLoading] = useState(true);
  const [weightProfile, setWeightProfile] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [calculations, setCalculations] = useState({
    initialBmi: 0,
    currentBmi: 0,
    currentGain: 0,
  });
  const [estimatedLmp, setEstimatedLmp] = useState(null);
  const [dueDate, setDueDate] = useState(null);

  // Efeito 1: Lida com os dados do documento principal do usuário.
  // Roda apenas quando o 'user' muda.
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribeUserDoc = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const lmpDate = getEstimatedLmp(userData);

        if (lmpDate) {
          setEstimatedLmp(lmpDate);
          setDueDate(getDueDate(lmpDate));
        }

        // MODIFICADO: Acessa o weightProfile dentro de gestationalProfile
        const profile = userData.gestationalProfile?.weightProfile;
        if (profile) {
          setWeightProfile(profile);
          if (profile.height && profile.prePregnancyWeight) {
            const initialBmi = calculateBMI(
              profile.prePregnancyWeight,
              profile.height,
            );
            setCalculations((prev) => ({ ...prev, initialBmi }));
          }
        }
      }
      // O 'loading' será controlado pelo segundo efeito para garantir que ambos os dados chegaram.
    });

    return () => unsubscribeUserDoc();
  }, [user]);

  // Efeito 2: Lida com a subcoleção de histórico de peso.
  // Roda quando 'user' ou 'weightProfile' mudam.
  useEffect(() => {
    if (!user || !weightProfile) {
      // Se não houver perfil, não há nada a calcular, então paramos o carregamento.
      if (!loading) {
        setLoading(false);
      }
      return;
    }

    const weightHistoryRef = collection(db, "users", user.uid, "weightHistory");
    const q = query(weightHistoryRef, orderBy("date", "desc"));

    const unsubscribeHistory = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWeightHistory(history);

      // Atualiza os cálculos com base no histórico mais recente
      let currentBmi = calculateBMI(
        weightProfile.prePregnancyWeight,
        weightProfile.height,
      );
      let currentGain = 0;

      if (history.length > 0) {
        const latestEntry = history[0];
        currentGain = (
          latestEntry.weight - weightProfile.prePregnancyWeight
        ).toFixed(2);
        currentBmi = latestEntry.bmi;
      }
      setCalculations((prev) => ({ ...prev, currentBmi, currentGain }));
      setLoading(false);
    });

    return () => unsubscribeHistory();
  }, [user, weightProfile]);

  return {
    loading,
    weightProfile,
    weightHistory,
    calculations,
    estimatedLmp,
    dueDate,
    setWeightHistory,
  };
}
