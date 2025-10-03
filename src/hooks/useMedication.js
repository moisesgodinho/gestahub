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
  limit,
  startAfter,
  getDocs
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getTodayString } from "@/lib/dateUtils";
import { toast } from "react-toastify";

export function useMedication(user) {
  const [medications, setMedications] = useState([]);
  const [futureHistory, setFutureHistory] = useState({});
  const [pastHistory, setPastHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPast, setLoadingPast] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMorePast, setHasMorePast] = useState(true);

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
    }, (error) => { setLoading(false); });
    return () => unsubscribeMeds();
  }, [user]);

  // Listener para o histórico futuro (hoje + 5 dias)
  useEffect(() => {
    if (!user) return;
    const datesToFetch = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return getTodayString(d);
    });
    const historyRef = collection(db, "users", user.uid, "medicationHistory");
    const q = query(historyRef, where("__name__", "in", datesToFetch));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const historyData = {};
        snapshot.forEach(doc => { historyData[doc.id] = doc.data(); });
        setFutureHistory(prev => ({...prev, ...historyData}));
    });
    return () => unsubscribe();
  }, [user]);

  const loadPastHistory = useCallback(async (loadMore = false) => {
    if (!user || !hasMorePast) return;
    
    setLoadingPast(true);
    const todayStr = getTodayString();
    const historyRef = collection(db, "users", user.uid, "medicationHistory");
    
    let q;
    if (loadMore && lastVisible) {
        q = query(historyRef, where("__name__", "<", todayStr), orderBy("__name__", "desc"), startAfter(lastVisible), limit(5));
    } else {
        q = query(historyRef, where("__name__", "<", todayStr), orderBy("__name__", "desc"), limit(5));
    }

    try {
        const docSnap = await getDocs(q);
        const newHistory = docSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setPastHistory(prev => loadMore ? [...prev, ...newHistory] : newHistory);
        
        const lastDoc = docSnap.docs[docSnap.docs.length - 1];
        setLastVisible(lastDoc);
        
        if (docSnap.docs.length < 5) {
            setHasMorePast(false);
        }
    } catch (error) {
        console.error("Erro ao carregar histórico passado:", error);
        toast.error("Não foi possível carregar o histórico.");
    } finally {
        setLoadingPast(false);
    }
  }, [user, hasMorePast, lastVisible]);


  // ... (funções de add, update, delete e toggle permanecem as mesmas)
  const addMedication = useCallback(async (medData) => { /* ... */ }, [user]);
  const updateMedication = useCallback(async (medId, medData) => { /* ... */ }, [user, medications]);
  const deleteMedication = useCallback(async (medId) => { /* ... */ }, [user]);
  const onToggleDose = useCallback(async (medId, dateString, doseIndex) => { /* ... */ }, [user, futureHistory, pastHistory]);

  return { medications, history: futureHistory, pastHistory, loading, loadingPast, hasMorePast, loadPastHistory, addMedication, updateMedication, deleteMedication, onToggleDose };
}