// src/hooks/useJournalEntries.js
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useJournalEntries(user) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setEntries([]); // Limpa as entradas se o usuário fizer logout
      return;
    }

    const entriesRef = collection(db, 'users', user.uid, 'symptomEntries');
    const q = query(entriesRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEntries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEntries(fetchedEntries);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar entradas do diário:", error);
      setLoading(false);
    });

    // Função de limpeza para cancelar a inscrição ao desmontar o componente
    return () => unsubscribe();
  }, [user]);

  return { entries, loading };
}