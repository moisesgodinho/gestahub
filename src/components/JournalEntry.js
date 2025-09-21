'use client';

import { useState, useEffect, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';
import { moodOptions, symptomOptions } from '@/data/journalData';
import ConfirmationModal from './ConfirmationModal';
import { getTodayString } from '@/lib/dateUtils';

export default function JournalEntry({ user, entry, onSave, onCancel, allEntries }) {
  const [date, setDate] = useState(getTodayString());
  const [mood, setMood] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [notes, setNotes] = useState('');
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false);
  const [isExistingEntry, setIsExistingEntry] = useState(false);
  const notesTextareaRef = useRef(null); // Ref para o textarea

  useEffect(() => {
    if (entry) {
      setDate(entry.id);
      setMood(entry.mood || '');
      setSelectedSymptoms(entry.symptoms || []);
      setNotes(entry.notes || '');
      setIsExistingEntry(true);
    } else {
      const today = getTodayString();
      setDate(today);
      setMood('');
      setSelectedSymptoms([]);
      setNotes('');
      setIsExistingEntry(allEntries.some(e => e.id === today));
    }
  }, [entry, allEntries]);

  // Efeito para ajustar a altura do textarea ao carregar uma anotação existente
  useEffect(() => {
    if (notesTextareaRef.current) {
        const textarea = notesTextareaRef.current;
        textarea.style.height = 'auto'; // Reseta a altura
        textarea.style.height = `${textarea.scrollHeight}px`; // Ajusta para o conteúdo
    }
  }, [notes]);


  useEffect(() => {
    if (!entry) {
      setIsExistingEntry(allEntries.some(e => e.id === date));
    }
  }, [date, allEntries, entry]);

  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };
  
  // Função para lidar com a mudança no textarea de anotações
  const handleNotesChange = (e) => {
    const textarea = e.target;
    setNotes(textarea.value);
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const proceedWithSave = async () => {
    if (!user || !date) return;
    const entryData = { date, mood, symptoms: selectedSymptoms, notes };
    try {
      const entryRef = doc(db, 'users', user.uid, 'symptomEntries', date);
      await setDoc(entryRef, entryData, { merge: true });
      toast.success(entry ? 'Entrada atualizada com sucesso!' : 'Entrada salva com sucesso!');
      if (onSave) onSave();
    } catch (error) {
      console.error("Erro ao salvar entrada do diário:", error);
      toast.error('Não foi possível salvar a entrada.');
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para salvar.');
      return;
    }
    if (!date) {
      toast.warn('Por favor, selecione uma data.');
      return;
    }
    
    if (!mood && selectedSymptoms.length === 0 && notes.trim() === '') {
      toast.warn('Por favor, registre pelo menos um humor, sintoma ou anotação.');
      return;
    }

    if (!entry && isExistingEntry) {
      setIsOverwriteModalOpen(true);
    } else {
      await proceedWithSave();
    }
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isOverwriteModalOpen}
        onClose={() => setIsOverwriteModalOpen(false)}
        onConfirm={async () => {
          setIsOverwriteModalOpen(false);
          await proceedWithSave();
        }}
        title="Substituir Entrada?"
        message="Já existe um registro para esta data. Deseja substituí-lo com as novas informações?"
      />
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mb-6">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
          {!!entry ? `Editando o dia ${new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}` : 'Como você está se sentindo hoje?'}
        </h2>
        
        <div className="mb-4">
          <label htmlFor="entryDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data do Registro</label>
          <input 
            type="date" 
            id="entryDate" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            disabled={!!entry}
            className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 disabled:opacity-50"
          />
          {isExistingEntry && !entry && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
              Atenção: Já existe um registro para este dia. Salvar irá sobrescrevê-lo.
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Humor</label>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map(option => (
              <button key={option.value} onClick={() => setMood(option.value)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${mood === option.value ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'}`}>
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sintomas</label>
          <div className="flex flex-wrap gap-2">
            {symptomOptions.map(symptom => (
              <button key={symptom} onClick={() => handleSymptomToggle(symptom)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedSymptoms.includes(symptom) ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'}`}>
                {symptom}
              </button>
            ))}
          </div>
        </div>
        
        {/* CAMPO DE ANOTAÇÕES MODIFICADO */}
        <div className="mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Anotações Adicionais</label>
          <textarea 
            id="notes" 
            ref={notesTextareaRef}
            rows="3" 
            value={notes}
            onChange={handleNotesChange}
            maxLength="500"
            placeholder="Algum detalhe importante sobre o seu dia..."
            className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 resize-none overflow-hidden"
          ></textarea>
           <div className="text-right text-sm text-slate-400 dark:text-slate-500">
            {notes.length} / 500
          </div>
        </div>

        <div className="flex justify-end gap-4">
          {!!entry && (
              <button onClick={onCancel} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                  Cancelar Edição
              </button>
          )}
          <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">
            {!!entry ? 'Atualizar Entrada' : 'Salvar Entrada'}
          </button>
        </div>
      </div>
    </>
  );
}