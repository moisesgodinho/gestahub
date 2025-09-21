// src/hooks/useContractions.js
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useContractions(user) {
  const [contractions, setContractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setContractions([]);
      return;
    }

    const contractionsRef = collection(db, 'users', user.uid, 'contractions');
    const q = query(contractionsRef, orderBy('startTime', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedContractions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContractions(fetchedContractions);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar contrações:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { contractions, loading };
}