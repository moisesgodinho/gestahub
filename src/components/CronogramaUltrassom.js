// src/components/CronogramaUltrassom.js
'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';
import CompletionCelebration from './CompletionCelebration';
import ConfirmationModal from './ConfirmationModal';

const ultrasoundSchedule = [
  { id: 'transvaginal', name: '1º Ultrassom (Transvaginal)', startWeek: 8, endWeek: 11 },
  { id: 'morfologico_1', name: '2º Ultrassom (Morfológico 1º Trimestre)', startWeek: 12, endWeek: 14 },
  { id: 'morfologico_2', name: '3º Ultrassom (Morfológico 2º Trimestre)', startWeek: 22, endWeek: 24 },
  { id: 'ecocardiograma', name: '4º Ultrassom (Ecocardiograma Fetal)', startWeek: 26, endWeek: 28 },
  { id: 'doppler_3', name: '5º Ultrassom (3º Trimestre com Doppler)', startWeek: 28, endWeek: 36 },
];

const getUTCDate = (date) => {
  const d = new Date(date);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(`${dateString}T00:00:00Z`);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const CheckIcon = () => (
    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

export default function CronogramaUltrassom({ lmpDate, user }) {
  const [examData, setExamData] = useState({});
  const [editingExamId, setEditingExamId] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [isConfirmDateModalOpen, setIsConfirmDateModalOpen] = useState(false);
  const [dateToConfirm, setDateToConfirm] = useState({ examId: null, date: '' });

  useEffect(() => {
    if (user) {
      const fetchExamData = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().ultrasoundSchedule) {
          setExamData(docSnap.data().ultrasoundSchedule);
        }
      };
      fetchExamData();
    }
  }, [user]);

  const handleSaveData = async (uid, data) => {
    try {
      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, { ultrasoundSchedule: data }, { merge: true });
      return true;
    } catch (error) {
      console.error("Erro ao salvar dados do ultrassom:", error);
      toast.error("Não foi possível salvar os dados.");
      return false;
    }
  };

  const handleToggleDone = async (examId) => {
    if (!user) return;
    const isTryingToComplete = !examData[examId]?.done;
    const examDateStr = examData[examId]?.scheduledDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isTryingToComplete) {
        if (examDateStr) {
            const examDate = new Date(`${examDateStr}T00:00:00Z`);
            if (examDate > today) {
                toast.warn("Não é possível marcar como concluído um exame agendado para o futuro.");
                return;
            }
        }

        // CORREÇÃO: Impede que o exame seja marcado como concluído se a data atual estiver muito fora da janela
        const examDetails = ultrasoundSchedule.find(e => e.id === examId);
        if (lmpDate && examDetails) {
            const idealEndDate = new Date(getUTCDate(lmpDate));
            idealEndDate.setDate(idealEndDate.getDate() + (examDetails.endWeek * 7) + 6);

            // Período de tolerância: permite marcar como concluído até 4 semanas após o fim da janela ideal
            const gracePeriodEndDate = new Date(idealEndDate);
            gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + 28); 

            if (today > gracePeriodEndDate) {
                toast.error("Não é possível marcar como concluído. A data atual está muito fora do período recomendado para este exame.");
                return;
            }
        }
    }

    const updatedData = {
      ...examData,
      [examId]: { ...examData[examId], done: !examData[examId]?.done },
    };

    if (await handleSaveData(user.uid, updatedData)) {
      setExamData(updatedData);
      toast.success(`Exame marcado como ${updatedData[examId].done ? 'concluído' : 'pendente'}!`);
      const allDone = ultrasoundSchedule.every(exam => updatedData[exam.id]?.done);
      if (allDone) {
        setShowCelebration(true);
      }
    }
  };

  const proceedWithSaveDate = async (examId, dateToSave) => {
    const updatedData = {
        ...examData,
        [examId]: { ...examData[examId], scheduledDate: dateToSave },
    };

    if (await handleSaveData(user.uid, updatedData)) {
        setExamData(updatedData);
        setEditingExamId(null);
        setScheduledDate('');
        toast.success("Data do exame salva!");
    }
  };

  const handleSetScheduledDate = async (examId) => {
    if (!user || !scheduledDate) {
      toast.warn("Por favor, insira uma data válida.");
      return;
    }
    
    const examDetails = ultrasoundSchedule.find(e => e.id === examId);
    const isDone = examData[examId]?.done;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const userDate = new Date(`${scheduledDate}T00:00:00Z`);

    if (isDone && userDate > today) {
      toast.error("A data de um exame concluído não pode ser no futuro.");
      return;
    }
    
    if (examDetails && lmpDate) {
        const dueDate = new Date(lmpDate);
        dueDate.setDate(dueDate.getDate() + 294); // 42 semanas

        if (userDate < lmpDate || userDate > dueDate) {
            toast.error("A data precisa estar dentro do período da gestação.");
            return;
        }

        const idealStartDate = new Date(lmpDate);
        idealStartDate.setDate(idealStartDate.getDate() + examDetails.startWeek * 7);
        const idealEndDate = new Date(lmpDate);
        idealEndDate.setDate(idealEndDate.getDate() + (examDetails.endWeek * 7) + 6);
        
        const extendedStartDate = new Date(idealStartDate);
        extendedStartDate.setMonth(extendedStartDate.getMonth() - 2);
        const extendedEndDate = new Date(idealEndDate);
        extendedEndDate.setMonth(extendedEndDate.getMonth() + 2);

        if (userDate < extendedStartDate || userDate > extendedEndDate) {
            toast.error("A data está muito fora do período recomendado para este exame.");
            return;
        }

        if (userDate < idealStartDate || userDate > idealEndDate) {
            setDateToConfirm({ examId, date: scheduledDate });
            setIsConfirmDateModalOpen(true);
            return;
        }
    }
    
    await proceedWithSaveDate(examId, scheduledDate);
  };
  
  const handleCancelEdit = () => {
    setEditingExamId(null);
    setScheduledDate('');
  };

  const todayUTC = new Date();
  todayUTC.setHours(0, 0, 0, 0);
  const lmpUTCDate = getUTCDate(lmpDate);

  let nextExamIndex = !lmpDate ? -1 : ultrasoundSchedule.findIndex(exam => {
    const endDate = new Date(lmpUTCDate.getTime());
    const endWeek = exam.endWeek || (exam.startWeek + 4);
    endDate.setDate(endDate.getDate() + (endWeek * 7) + 6);
    return todayUTC <= endDate && !examData[exam.id]?.done;
  });

  if (nextExamIndex === -1) {
    nextExamIndex = null;
  }

  return (
    <>
      {showCelebration && <CompletionCelebration onClose={() => setShowCelebration(false)} />}
      <ConfirmationModal
        isOpen={isConfirmDateModalOpen}
        onClose={() => setIsConfirmDateModalOpen(false)}
        onConfirm={async () => {
            await proceedWithSaveDate(dateToConfirm.examId, dateToConfirm.date);
            setIsConfirmDateModalOpen(false);
        }}
        title="Confirmar Data"
        message="Esta data está fora da janela ideal. Tem certeza que deseja agendar mesmo assim?"
        confirmButtonText="Sim, agendar"
        confirmButtonClass="bg-indigo-600 hover:bg-indigo-700"
      />
      
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">
          🗓️ Agenda de Ultrassons
        </h3>
        <div className="space-y-3">
          {ultrasoundSchedule.map((exam, index) => {
            const data = examData[exam.id] || {};
            const isDone = !!data.done;
            const currentScheduledDate = data.scheduledDate;

            const startDate = lmpDate ? new Date(lmpUTCDate.getTime()) : null;
            if (startDate) startDate.setDate(startDate.getDate() + exam.startWeek * 7);

            const endDate = lmpDate && exam.endWeek ? new Date(lmpUTCDate.getTime()) : null;
            if (endDate) endDate.setDate(endDate.getDate() + (exam.endWeek * 7) + 6);

            const isActive = index === nextExamIndex;

            const containerClasses = isDone
              ? "p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 border-l-4 border-green-500"
              : isActive
              ? "p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 border-l-4 border-rose-500"
              : "p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50";

            return (
              <div key={exam.id} className={containerClasses}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{exam.name}</p>
                    {lmpDate && (
                        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                        {endDate
                            ? `Janela ideal: ${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}`
                            : `A partir de ${startDate.toLocaleDateString('pt-BR')}`
                        }
                        </p>
                    )}
                  </div>
                  <label className="flex-shrink-0 cursor-pointer" title={isDone ? "Marcar como pendente" : "Marcar como concluído"}>
                      <input type="checkbox" checked={isDone} onChange={() => handleToggleDone(exam.id)} className="sr-only peer" />
                      <div className="w-6 h-6 border-2 border-slate-400 dark:border-slate-500 rounded-md flex items-center justify-center transition-colors duration-200 ease-in-out peer-checked:bg-green-500 peer-checked:border-green-500">
                          <div className={`transform transition-transform duration-200 ease-in-out ${isDone ? 'scale-100' : 'scale-0'}`}>
                              <CheckIcon />
                          </div>
                      </div>
                  </label>
                </div>

                {editingExamId === exam.id ? (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"
                    />
                    <button onClick={() => handleSetScheduledDate(exam.id)} className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">Salvar</button>
                    <button onClick={handleCancelEdit} className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-600 text-sm hover:bg-slate-300">Cancelar</button>
                  </div>
                ) : (
                  <div className="mt-2">
                    {currentScheduledDate ? (
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {isDone ? 'Feito em: ' : 'Agendado para: '}
                          <span className="font-bold">{formatDateDisplay(currentScheduledDate)}</span>
                        </p>
                        <button onClick={() => { setEditingExamId(exam.id); setScheduledDate(currentScheduledDate); }} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">Editar</button>
                      </div>
                    ) : (
                      isDone ? (
                        <button onClick={() => { setEditingExamId(exam.id); setScheduledDate(''); }} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                          Adicionar data
                        </button>
                      ) : (
                        <button onClick={() => { setEditingExamId(exam.id); setScheduledDate(''); }} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                          Agendar este exame
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}