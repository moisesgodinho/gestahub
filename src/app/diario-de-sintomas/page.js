// src/app/diario-de-sintomas/page.js
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import AppNavigation from '@/components/AppNavigation';
import JournalEntry from '@/components/JournalEntry';
import JournalHistory from '@/components/JournalHistory';
import ConfirmationModal from '@/components/ConfirmationModal'; // Importado aqui

export default function JournalPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const entriesRef = collection(db, 'users', currentUser.uid, 'symptomEntries');
        const q = query(entriesRef, orderBy('date', 'desc'));
        
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const fetchedEntries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setEntries(fetchedEntries);
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    window.scrollTo(0, 0);
  };

  const handleFinishEditing = () => {
    setSelectedEntry(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center flex-grow"><p className="text-lg text-rose-500 dark:text-rose-400">Carregando...</p></div>;
  }

  return (
    <div className="flex items-center justify-center flex-grow p-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400 mb-6 text-center">
          Diário de Sintomas e Humor
        </h1>
        
        {/* Passando a lista de 'entries' para o componente do formulário */}
        <JournalEntry 
          user={user} 
          entry={selectedEntry} 
          onSave={handleFinishEditing} 
          onCancel={handleFinishEditing}
          allEntries={entries} 
        />

        <JournalHistory entries={entries} onEdit={handleEdit} user={user} />
        
        <AppNavigation />
      </div>
    </div>
  );
}