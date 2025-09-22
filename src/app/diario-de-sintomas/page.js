// src/app/diario-de-sintomas/page.js
'use client';

import { useState } from 'react';
import AppNavigation from '@/components/AppNavigation';
import JournalEntry from '@/components/JournalEntry';
import JournalHistory from '@/components/JournalHistory';
import SymptomChart from '@/components/SymptomChart';
import { useUser } from '@/context/UserContext';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import SkeletonLoader from '@/components/SkeletonLoader'; // 1. Importe o componente

export default function JournalPage() {
  const { user, loading: userLoading } = useUser();
  const { entries, loading: entriesLoading } = useJournalEntries(user);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    window.scrollTo(0, 0);
  };

  const handleFinishEditing = () => {
    setSelectedEntry(null);
  };

  const loading = userLoading || entriesLoading;

  // 2. Substitua o texto pelo SkeletonLoader
  if (loading) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <SkeletonLoader type="fullPage" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center flex-grow p-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400 mb-6 text-center">
          Diário de Sintomas e Humor
        </h1>
        
        <JournalEntry 
          user={user} 
          entry={selectedEntry} 
          onSave={handleFinishEditing} 
          onCancel={handleFinishEditing}
          allEntries={entries} 
        />

        {entries.length > 0 && <SymptomChart entries={entries} />}

        <JournalHistory entries={entries} onEdit={handleEdit} user={user} />
        
        <AppNavigation />
      </div>
    </div>
  );
}