// src/components/AgendaProximosPassos.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import { doc, getDoc, onSnapshot, collection, query, where, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';
import Link from 'next/link';
import ConfirmationModal from './ConfirmationModal';
import CompletionCelebration from './CompletionCelebration';

const ultrasoundSchedule = [
  { id: 'transvaginal', name: '1º Ultrassom (Transvaginal)', startWeek: 8, endWeek: 11, type: 'ultrasound' },
  { id: 'morfologico_1', name: '2º Ultrassom (Morfológico 1º Trimestre)', startWeek: 12, endWeek: 14, type: 'ultrasound' },
  { id: 'morfologico_2', name: '3º Ultrassom (Morfológico 2º Trimestre)', startWeek: 22, endWeek: 24, type: 'ultrasound' },
  { id: 'ecocardiograma', name: '4º Ultrassom (Ecocardiograma Fetal)', startWeek: 26, endWeek: 28, type: 'ultrasound' },
  { id: 'doppler_3', name: '5º Ultrassom (3º Trimestre com Doppler)', startWeek: 28, endWeek: 36, type: 'ultrasound' },
];

const getUTCDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(`${dateString}T00:00:00Z`);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

export default function AgendaProximosPassos({ lmpDate, user }) {
  const [manualAppointments, setManualAppointments] = useState([]);
  const [ultrasoundAppointments, setUltrasoundAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editingItemId, setEditingItemId] = useState(null);
  const [editDetails, setEditDetails] = useState({ title: '', date: '', time: '', professional: '', location: '', notes: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [expandedNotesId, setExpandedNotesId] = useState(null);

  useEffect(() => {
    if (!user || !lmpDate) {
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUserDoc = onSnapshot(userDocRef, (docSnap) => {
      const ultrasoundItems = [];
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const ultrasoundData = userData.ultrasoundSchedule || {};
        
        ultrasoundSchedule.forEach(exam => {
          const examData = ultrasoundData[exam.id] || {};
          ultrasoundItems.push({ 
            ...exam, 
            ...examData, 
            date: examData.scheduledDate || null, 
            isScheduled: !!examData.scheduledDate 
          });
        });
      }
      setUltrasoundAppointments(ultrasoundItems);
    });

    const appointmentsRef = collection(db, 'users', user.uid, 'appointments');
    const q = query(appointmentsRef);
    const unsubscribeAppointments = onSnapshot(q, (snapshot) => {
      const manualItems = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'manual' }));
      setManualAppointments(manualItems);
    });
    
    setLoading(false);

    return () => {
      unsubscribeUserDoc();
      unsubscribeAppointments();
    };
  }, [user, lmpDate]);

  const combinedAppointments = useMemo(() => [...manualAppointments, ...ultrasoundAppointments], [manualAppointments, ultrasoundAppointments]);

  const handleToggleDone = async (appointment) => {
    if (!user) return;
    const newDoneStatus = !appointment.done;

    if (newDoneStatus) {
      if (appointment.type === 'ultrasound' && !appointment.isScheduled) {
        toast.warn("Por favor, adicione uma data ao ultrassom antes de marcá-lo como concluído.");
        handleStartEditing(appointment);
        return;
      }
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const appointmentDate = new Date(appointment.date + 'T00:00:00Z');
      if (appointmentDate > today) {
        toast.warn("Não é possível marcar como concluída uma consulta futura.");
        return;
      }
    }

    try {
      if (appointment.type === 'manual') {
        const appointmentRef = doc(db, 'users', user.uid, 'appointments', appointment.id);
        await setDoc(appointmentRef, { done: newDoneStatus }, { merge: true });
      } else if (appointment.type === 'ultrasound') {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const scheduleData = docSnap.data().ultrasoundSchedule || {};
          const updatedSchedule = { ...scheduleData, [appointment.id]: { ...scheduleData[appointment.id], done: newDoneStatus } };
          await setDoc(userDocRef, { ultrasoundSchedule: updatedSchedule }, { merge: true });

          if (newDoneStatus) {
            const allUltrasoundsDone = ultrasoundSchedule.every(exam => updatedSchedule[exam.id]?.done);
            if (allUltrasoundsDone) {
              setShowCelebration(true);
            }
          }
        }
      }
      toast.success(`Marcado como ${newDoneStatus ? 'concluído' : 'pendente'}!`);
    } catch (error) {
      toast.error("Não foi possível atualizar o status.");
    }
  };

  const openDeleteConfirmation = (appointment) => {
    setAppointmentToDelete(appointment);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!user || !appointmentToDelete || appointmentToDelete.type !== 'manual') return;
    try {
      const appointmentRef = doc(db, 'users', user.uid, 'appointments', appointmentToDelete.id);
      await deleteDoc(appointmentRef);
      toast.info('Consulta removida.');
    } catch (error) {
      toast.error('Não foi possível remover a consulta.');
    } finally {
      setIsModalOpen(false);
      setAppointmentToDelete(null);
    }
  };

  const handleStartEditing = (item) => {
    let defaultDate = item.scheduledDate || item.date;
    if (item.type === 'ultrasound' && !defaultDate && lmpDate) {
      const idealStartDate = new Date(lmpDate);
      idealStartDate.setDate(idealStartDate.getDate() + item.startWeek * 7);
      defaultDate = idealStartDate.toISOString().split('T')[0];
    }

    setEditDetails({
      title: item.title || item.name || '',
      date: defaultDate || '',
      time: item.time || '',
      professional: item.professional || '',
      location: item.location || '',
      notes: item.notes || '',
    });
    setEditingItemId(item.id);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };
  
  const handleSaveDetails = async (item) => {
    if (!user || !editDetails.date) {
      toast.warn("Por favor, insira uma data.");
      return;
    }
    
    if (item.type === 'ultrasound' && lmpDate) {
      const lmpUTCDate = getUTCDate(lmpDate);
      const selectedDate = new Date(editDetails.date + 'T00:00:00Z');
      const idealStartDate = new Date(lmpUTCDate.getTime());
      idealStartDate.setUTCDate(idealStartDate.getUTCDate() + item.startWeek * 7);
      const idealEndDate = new Date(lmpUTCDate.getTime());
      idealEndDate.setUTCDate(idealEndDate.getUTCDate() + (item.endWeek * 7) + 6);
      const toleranceStartDate = new Date(idealStartDate.getTime());
      toleranceStartDate.setUTCDate(toleranceStartDate.getUTCDate() - 14);
      const toleranceEndDate = new Date(idealEndDate.getTime());
      toleranceEndDate.setUTCDate(toleranceEndDate.getUTCDate() + 14);

      if (selectedDate < toleranceStartDate || selectedDate > toleranceEndDate) {
        toast.error("A data está fora do período recomendado (tolerância de 2 semanas).");
        return;
      }
    }
    
    try {
      if (item.type === 'manual') {
        const appointmentRef = doc(db, 'users', user.uid, 'appointments', item.id);
        await setDoc(appointmentRef, { ...editDetails }, { merge: true });
        toast.success("Consulta atualizada!");
      } else if (item.type === 'ultrasound') {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const scheduleData = docSnap.data().ultrasoundSchedule || {};
          const updatedSchedule = {
            ...scheduleData,
            [item.id]: {
              ...scheduleData[item.id],
              scheduledDate: editDetails.date,
              time: editDetails.time,
              professional: editDetails.professional,
              location: editDetails.location,
              notes: editDetails.notes,
            }
          };
          await setDoc(userDocRef, { ultrasoundSchedule: updatedSchedule }, { merge: true });
          toast.success("Detalhes do ultrassom salvos!");
        }
      }
      setEditingItemId(null);
    } catch (error) {
        console.error("Erro ao salvar detalhes:", error);
        toast.error("Não foi possível salvar os detalhes.");
    }
  };

  const getSortDate = (item) => {
    if (item.date) {
      return new Date(item.date);
    }
    if (item.type === 'ultrasound' && lmpDate) {
      const idealStartDate = new Date(lmpDate);
      idealStartDate.setDate(idealStartDate.getDate() + item.startWeek * 7);
      return idealStartDate;
    }
    return new Date('2999-12-31');
  };

  const upcomingEvents = combinedAppointments
    .filter(event => !event.done)
    .sort((a, b) => getSortDate(a) - getSortDate(b));
    
  const toggleNotes = (id) => {
    setExpandedNotesId(expandedNotesId === id ? null : id);
  };

  if (loading) {
    return <div className="text-center p-4">Carregando agenda...</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mb-6">
      {showCelebration && <CompletionCelebration onClose={() => setShowCelebration(false)} />}
      <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmDelete} title="Confirmar Exclusão" message="Tem certeza que deseja apagar esta consulta?" />
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">
        🗓️ Próximos Passos
      </h3>
      {upcomingEvents.length > 0 ? (
        <>
          <div className="space-y-3">
            {upcomingEvents.map((item) => {
              let idealWindowText = null;
              if (item.type === 'ultrasound' && lmpDate) {
                  const lmpUTCDate = getUTCDate(lmpDate);
                  if (lmpUTCDate) {
                      const startDate = new Date(lmpUTCDate.getTime());
                      startDate.setUTCDate(startDate.getUTCDate() + item.startWeek * 7);

                      const endDate = new Date(lmpUTCDate.getTime());
                      endDate.setUTCDate(endDate.getUTCDate() + (item.endWeek * 7) + 6);
                      
                      idealWindowText = `Janela ideal: ${startDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })} a ${endDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`;
                  }
              }

              const isExpanded = expandedNotesId === item.id;

              return (
                <div key={`${item.type}-${item.id}`}>
                  <div className={`p-4 rounded-lg flex items-center gap-4 transition-colors ${item.type === 'ultrasound' ? 'border-l-4 border-rose-500' : 'border-l-4 border-indigo-500'} bg-slate-100 dark:bg-slate-700/50`}>
                    <div className="flex-shrink-0">
                      <label className="cursor-pointer" title={item.done ? "Marcar como pendente" : "Marcar como concluído"}>
                          <input type="checkbox" checked={!!item.done} onChange={() => handleToggleDone(item)} className="sr-only peer" />
                          <div className="w-6 h-6 border-2 border-slate-400 dark:border-slate-500 rounded-md flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500">
                              <svg className={`w-4 h-4 text-white transform transition-transform ${!!item.done ? 'scale-100' : 'scale-0'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                      </label>
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">{item.title || item.name}</p>
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {item.date ? formatDateDisplay(item.date) : 'Agendamento pendente'} {item.time && `às ${item.time}`}
                      </p>
                      {idealWindowText && <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{idealWindowText}</p>}
                      {item.professional && <p className="text-xs text-slate-500 dark:text-slate-400">Com: {item.professional}</p>}
                      {item.location && <p className="text-xs text-slate-500 dark:text-slate-400">Local: {item.location}</p>}
                      {item.notes && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 italic mt-1">
                            <p className={!isExpanded ? 'truncate' : ''}>Anotações: {item.notes}</p>
                            {item.notes.length > 50 && (
                                <button onClick={() => toggleNotes(item.id)} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                    {isExpanded ? 'Ver menos' : 'Ver mais'}
                                </button>
                            )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleStartEditing(item)} title="Editar" className="p-2 rounded-full text-slate-500 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/50"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
                      {item.type === 'manual' && (
                        <button onClick={() => openDeleteConfirmation(item)} title="Apagar" className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                      )}
                    </div>
                  </div>
                  {editingItemId === item.id && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 space-y-2">
                        <input type="text" placeholder="Título da Consulta" disabled={item.type === 'ultrasound'} value={editDetails.title} onChange={(e) => setEditDetails({...editDetails, title: e.target.value})} className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 text-sm disabled:opacity-50" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-medium text-slate-500">Data</label>
                            <input type="date" value={editDetails.date} onChange={(e) => setEditDetails({...editDetails, date: e.target.value})} className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500">Horário</label>
                            <input type="time" value={editDetails.time} onChange={(e) => setEditDetails({...editDetails, time: e.target.value})} className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 text-sm" />
                          </div>
                        </div>
                        <input type="text" placeholder="Profissional/Laboratório" value={editDetails.professional} onChange={(e) => setEditDetails({...editDetails, professional: e.target.value})} className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 text-sm" />
                        <input type="text" placeholder="Local" value={editDetails.location} onChange={(e) => setEditDetails({...editDetails, location: e.target.value})} className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 text-sm" />
                        <textarea placeholder="Anotações (dúvidas para a consulta, etc)" value={editDetails.notes} onChange={(e) => setEditDetails({...editDetails, notes: e.target.value})} className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 text-sm" rows="2"></textarea>
                        <div className="flex gap-2 justify-end">
                          <button onClick={handleCancelEdit} className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-600 text-sm hover:bg-slate-300">Cancelar</button>
                          <button onClick={() => handleSaveDetails(item)} className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">Salvar</button>
                        </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <Link href="/consultas" className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm text-center">
              Ver Histórico Completo
            </Link>
            <Link href="/consultas?new=true" className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors text-sm text-center">
              Adicionar Nova Consulta
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400">Nenhum compromisso futuro encontrado.</p>
          <Link href="/consultas?new=true" className="mt-4 inline-block px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm">
            Ver Histórico e Adicionar
          </Link>
        </div>
      )}
    </div>
  );
}