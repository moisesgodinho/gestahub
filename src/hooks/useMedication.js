// src/hooks/useMedication.js
import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getTodayString } from "@/lib/dateUtils";
import { toast } from "react-toastify";

export function useMedication(user, gestationalWeek) {
  const [medications, setMedications] = useState([]);
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(true);

  // Listener para a lista de medicamentos
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const medsRef = collection(db, "users", user.uid, "medications");
    const q = query(medsRef, orderBy("name"));
    const unsubscribeMeds = onSnapshot(q, (snapshot) => {
      const medsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMedications(medsList);
      setLoading(false);
    });
    return () => unsubscribeMeds();
  }, [user]);

  // Listener para o histórico dos próximos 6 dias
  useEffect(() => {
    if (!user) return;
    
    const datesToFetch = [];
    for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        datesToFetch.push(getTodayString(date));
    }

    const historyRef = collection(db, "users", user.uid, "medicationHistory");
    const q = query(historyRef, where("__name__", "in", datesToFetch));
    
    const unsubscribeHistory = onSnapshot(q, (snapshot) => {
      const historyData = {};
      snapshot.forEach(doc => {
        historyData[doc.id] = doc.data();
      });
      // Preenche os dias que não retornaram dados para evitar problemas de UI
      datesToFetch.forEach(date => {
          if (!historyData[date]) {
              historyData[date] = {};
          }
      });
      setHistory(historyData);
    });
    return () => unsubscribeHistory();
  }, [user]);

  const addMedication = useCallback(async (medData) => {
    if (!user) return;
    try {
      const newMedRef = doc(collection(db, "users", user.uid, "medications"));
      const finalMedData = { 
        ...medData, 
        id: newMedRef.id,
        startDate: getTodayString(), // Salva a data de início
      };
      await setDoc(newMedRef, finalMedData);
      toast.success("Medicamento adicionado com sucesso!");
    } catch (error) {
      toast.error("Não foi possível adicionar o medicamento.");
    }
  }, [user]);

  const updateMedication = useCallback(async (medId, medData) => {
    if (!user) return;
    try {
      const medRef = doc(db, "users", user.uid, "medications", medId);
      // Mantém a data de início original se não for alterada
      const originalMed = medications.find(m => m.id === medId);
      const finalMedData = {
          ...medData,
          startDate: medData.startDate || originalMed.startDate || getTodayString(),
      };
      await setDoc(medRef, finalMedData, { merge: true });
      toast.success("Medicamento atualizado!");
    } catch (error) {
      toast.error("Não foi possível atualizar o medicamento.");
    }
  }, [user, medications]);
  
  const deleteMedication = useCallback(async (medId) => {
    if (!user) return;
    try {
      const medRef = doc(db, "users", user.uid, "medications", medId);
      await deleteDoc(medRef);
      toast.info("Medicamento removido.");
    } catch (error) {
      toast.error("Não foi possível remover o medicamento.");
    }
  }, [user]);

  const onToggleDose = useCallback(async (medId, dateString, doseIndex) => {
    if (!user) return;
    const historyDocRef = doc(db, "users", user.uid, "medicationHistory", dateString);
    const dayHistory = history[dateString]?.[medId] || [];
    const wasTaken = dayHistory.includes(doseIndex);
    
    try {
        const docSnap = await getDoc(historyDocRef);
        const updateData = {
            [`${medId}`]: wasTaken ? arrayRemove(doseIndex) : arrayUnion(doseIndex)
        };

        if (docSnap.exists()) {
            await updateDoc(historyDocRef, updateData);
        } else {
            await setDoc(historyDocRef, updateData);
        }
    } catch (error) {
        console.error("Erro ao atualizar dose:", error);
        toast.error("Não foi possível atualizar o status.");
    }
  }, [user, history]);

  return { medications, history, loading, addMedication, updateMedication, deleteMedication, onToggleDose };
}