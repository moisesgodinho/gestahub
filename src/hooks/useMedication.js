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
  addDoc,
  where,
  getDocs,
  startAfter,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getTodayString } from "@/lib/dateUtils";
import { toast } from "react-toastify";

export function useMedication(user) {
  const [medications, setMedications] = useState([]);
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(true);

  // Listener para a lista de medicamentos
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setMedications([]);
      setHistory({});
      return;
    }
    setLoading(true);
    const medsRef = collection(db, "users", user.uid, "medications");
    const q = query(medsRef, orderBy("name"));
    const unsubscribeMeds = onSnapshot(q, (snapshot) => {
      const medsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMedications(medsList);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar medicamentos:", error);
      setLoading(false);
    });

    const historyRef = collection(db, "users", user.uid, "medicationHistory");
    const unsubscribeHistory = onSnapshot(historyRef, (snapshot) => {
        const historyData = {};
        snapshot.forEach(doc => {
            historyData[doc.id] = doc.data();
        });
        setHistory(historyData);
    });


    return () => {
        unsubscribeMeds();
        unsubscribeHistory();
    };
  }, [user]);


  const addMedication = useCallback(async (medData) => {
    if (!user) return;
    try {
        const medsRef = collection(db, "users", user.uid, "medications");
        await addDoc(medsRef, {
            ...medData,
            createdAt: new Date()
        });
        toast.success("Medicamento adicionado com sucesso!");
    } catch (error) {
        console.error("Erro ao adicionar medicamento:", error);
        toast.error("Não foi possível adicionar o medicamento.");
    }
   }, [user]);

  const updateMedication = useCallback(async (medId, medData) => {
    if (!user) return;
    try {
        const medRef = doc(db, "users", user.uid, "medications", medId);
        await setDoc(medRef, medData, { merge: true });
        toast.success("Medicamento atualizado com sucesso!");
    } catch (error) {
        console.error("Erro ao atualizar medicamento:", error);
        toast.error("Não foi possível atualizar o medicamento.");
    }
   }, [user]);

  const deleteMedication = useCallback(async (medId) => {
    if (!user) return;
    try {
        const medRef = doc(db, "users", user.uid, "medications", medId);
        await deleteDoc(medRef);
        toast.info("Medicamento removido.");
    } catch (error) {
        console.error("Erro ao remover medicamento:", error);
        toast.error("Não foi possível remover o medicamento.");
    }
  }, [user]);

  const onToggleDose = useCallback(async (medId, dateString, doseIndex) => {
    if (!user) return;

    const historyRef = doc(db, "users", user.uid, "medicationHistory", dateString);

    try {
      const docSnap = await getDoc(historyRef);
      const currentData = docSnap.exists() ? docSnap.data() : {};
      const takenDoses = currentData[medId] || [];

      if (takenDoses.includes(doseIndex)) {
        // Se a dose já foi tomada, remove
        await setDoc(historyRef, { [medId]: arrayRemove(doseIndex) }, { merge: true });
      } else {
        // Se a dose não foi tomada, adiciona
        await setDoc(historyRef, { [medId]: arrayUnion(doseIndex) }, { merge: true });
      }
    } catch (error) {
      console.error("Erro ao atualizar a dose:", error);
      toast.error("Não foi possível atualizar o status da dose.");
    }
  }, [user]);

  return { medications, history, loading, addMedication, updateMedication, deleteMedication, onToggleDose };
}