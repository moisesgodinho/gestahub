// src/hooks/useKickCounter.js
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useKickCounter(user) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setSessions([]);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().kickSessions) {
        // Ordena as sessões da mais recente para a mais antiga
        const fetchedSessions = docSnap.data().kickSessions.sort((a, b) => b.timestamp - a.timestamp);
        setSessions(fetchedSessions);
      } else {
        setSessions([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar sessões do contador:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { sessions, loading, setSessions };
}