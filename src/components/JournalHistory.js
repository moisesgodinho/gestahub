// src/components/JournalHistory.js
'use client';

import { useState, useMemo } from 'react'; // useMemo foi importado
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';
import ConfirmationModal from './ConfirmationModal';
import { moodOptions, symptomOptions } from '@/data/journalData';

export default function JournalHistory({ entries, onEdit, user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  
  // --- NOVOS ESTADOS PARA OS FILTROS ---
  const [moodFilter, setMoodFilter] = useState('');
  const [symptomFilter, setSymptomFilter] = useState('');
  const [textFilter, setTextFilter] = useState('');

  // --- LÓGICA DE FILTRAGEM ---
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Filtro de humor
      if (moodFilter && entry.mood !== moodFilter) {
        return false;
      }
      // Filtro de sintoma
      if (symptomFilter && (!entry.symptoms || !entry.symptoms.includes(symptomFilter))) {
        return false;
      }
      // Filtro de texto (case-insensitive)
      if (textFilter && (!entry.notes || !entry.notes.toLowerCase().includes(textFilter.toLowerCase()))) {
        return false;
      }
      return true;
    });
  }, [entries, moodFilter, symptomFilter, textFilter]);

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

  const handleClearFilters = () => {
    setMoodFilter('');
    setSymptomFilter('');
    setTextFilter('');
  }

  if (!entries || entries.length === 0) {
    // ... (código para quando não há entradas permanece o mesmo)
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
        
        {/* --- SEÇÃO DE FILTROS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          {/* Filtro por Humor */}
          <div>
            <label htmlFor="moodFilter" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Filtrar por Humor</label>
            <select id="moodFilter" value={moodFilter} onChange={(e) => setMoodFilter(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200">
              <option value="">Todos</option>
              {moodOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          {/* Filtro por Sintoma */}
          <div>
            <label htmlFor="symptomFilter" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Filtrar por Sintoma</label>
            <select id="symptomFilter" value={symptomFilter} onChange={(e) => setSymptomFilter(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200">
              <option value="">Todos</option>
              {symptomOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {/* Filtro por Texto */}
          <div>
            <label htmlFor="textFilter" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Buscar nas Anotações</label>
            <input type="text" id="textFilter" placeholder="Ex: consulta, cansada..." value={textFilter} onChange={(e) => setTextFilter(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"/>
          </div>
        </div>

        <div className="space-y-4">
          {/* Renderiza a lista filtrada */}
          {filteredEntries.length > 0 ? (
            filteredEntries.map(entry => (
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
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">Nenhum registro encontrado para os filtros selecionados.</p>
              <button onClick={handleClearFilters} className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Limpar filtros</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}