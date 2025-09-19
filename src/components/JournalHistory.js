// src/components/JournalHistory.js
'use client';

import { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';
import ConfirmationModal from './ConfirmationModal';
import { moodOptions } from '@/data/journalData';

export default function JournalHistory({ entries, onEdit, user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const openDeleteConfirmation = (entry) => {
    setEntryToDelete(entry);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!user || !entryToDelete) return;
    try {
      const entryRef = doc(db, 'users', user.uid, 'symptomEntries', entryToDelete.id);
      await deleteDoc(entryRef);
      toast.info("Entrada do diário removida.");
    } catch (error) {
      console.error("Erro ao apagar entrada:", error);
      toast.error("Não foi possível apagar a entrada.");
    } finally {
      setIsModalOpen(false);
      setEntryToDelete(null);
    }
  };
  
  const getMoodLabel = (moodValue) => {
    const mood = moodOptions.find(m => m.value === moodValue);
    return mood ? mood.label : moodValue;
  };

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 dark:text-slate-400">Nenhum registro encontrado.</p>
        <p className="text-sm text-slate-400 dark:text-slate-500">Use o formulário acima para começar seu diário!</p>
      </div>
    );
  }

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja apagar esta entrada do diário?"
      />
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mt-6">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">Histórico do Diário</h2>
        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{new Date(entry.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                  <p className="font-semibold text-indigo-600 dark:text-indigo-400">{getMoodLabel(entry.mood)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(entry)} title="Editar" className="p-2 rounded-full text-slate-500 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button onClick={() => openDeleteConfirmation(entry)} title="Apagar" className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
              {entry.symptoms && entry.symptoms.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Sintomas:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {entry.symptoms.map(symptom => (
                      <span key={symptom} className="text-xs bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 px-2 py-1 rounded-full">{symptom}</span>
                    ))}
                  </div>
                </div>
              )}
              {entry.notes && (
                <div className="mt-2">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Anotações:</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">{entry.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}