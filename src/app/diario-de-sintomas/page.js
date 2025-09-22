// src/app/diario-de-sintomas/page.js
'use client';

import { useState } from 'react';
import AppNavigation from '@/components/AppNavigation';
import JournalEntry from '@/components/JournalEntry';
import JournalHistory from '@/components/JournalHistory';
import SymptomChart from '@/components/SymptomChart';
import JournalCalendar from '@/components/JournalCalendar';
import JournalViewModal from '@/components/JournalViewModal';
import { useUser } from '@/context/UserContext'; 
import { useJournalEntries } from '@/hooks/useJournalEntries';
import SkeletonLoader from '@/components/SkeletonLoader';

export default function JournalPage() {
  const { user, loading: userLoading } = useUser();
  const { entries, loading: entriesLoading } = useJournalEntries(user);
  
  const [entryToEdit, setEntryToEdit] = useState(null);
  const [entryToView, setEntryToView] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Abre o formulário de edição
  const handleEdit = (entry) => {
    setEntryToEdit(entry);
    setIsFormOpen(true); // Abre o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Abre o modal de visualização
  const handleView = (entry) => {
    setEntryToView(entry);
    setIsViewModalOpen(true);
  }

  // Abre o formulário para uma nova entrada a partir do calendário
  const handleDateSelect = (dateString) => {
    setEntryToEdit({ id: dateString }); 
    setIsFormOpen(true); // Abre o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Função para fechar o formulário (seja salvando ou cancelando)
  const handleFinishForm = () => {
    setEntryToEdit(null);
    setIsFormOpen(false);
  };

  const loading = userLoading || entriesLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <SkeletonLoader type="fullPage" />
      </div>
    );
  }

  return (
    <>
      <JournalViewModal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        entry={entryToView}
        onEdit={() => {
          setIsViewModalOpen(false);
          handleEdit(entryToView);
        }}
      />

      <div className="flex items-center justify-center flex-grow p-4">
        <div className="w-full max-w-3xl">
          <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400 mb-6 text-center">
            Diário de Sintomas e Humor
          </h1>
          
          {isFormOpen ? (
            <JournalEntry 
              user={user} 
              entry={entryToEdit} 
              onSave={handleFinishForm} 
              onCancel={handleFinishForm}
              allEntries={entries} 
            />
          ) : (
            <div className="mb-6 text-center">
                <button
                    onClick={() => {
                        setEntryToEdit(null);
                        setIsFormOpen(true);
                    }}
                    className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                >
                    Adicionar Registro do Dia
                </button>
            </div>
          )}

          <JournalCalendar 
              entries={entries}
              onDateSelect={handleDateSelect}
              onEditEntry={handleView}
          />

          {entries.length > 0 && <SymptomChart entries={entries} />}

          <JournalHistory entries={entries} onEdit={handleView} user={user} />
          
          <AppNavigation />
        </div>
      </div>
    </>
  );
}