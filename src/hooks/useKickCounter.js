// src/hooks/useKickCounter.js
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"; // Import 'collection', 'query', 'orderBy'
import { db } from "@/lib/firebase";

export function useKickCounter(user) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setSessions([]);
      return;
    }

    // NOVO: Referência para a subcoleção
    const sessionsRef = collection(db, "users", user.uid, "kickSessions");
    const q = query(sessionsRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedSessions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSessions(fetchedSessions);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao buscar sessões do contador:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  return { sessions, loading, setSessions };
}
