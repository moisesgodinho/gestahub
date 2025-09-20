// src/components/AppointmentList.js
'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import Link from 'next/link';
import ConfirmationModal from './ConfirmationModal';

export default function AppointmentList({ appointments, onEdit, user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  const handleToggleDone = async (appointment) => {
    if (!user) return;

    const newDoneStatus = !appointment.done;

    if (newDoneStatus) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const appointmentDate = new Date(appointment.date + 'T00:00:00Z');
      
      if (appointmentDate > today) {
        toast.warn("Não é possível marcar como concluída uma consulta agendada para o futuro.");
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
          const updatedSchedule = {
            ...scheduleData,
            [appointment.id]: {
              ...scheduleData[appointment.id],
              done: newDoneStatus,
            },
          };
          await setDoc(userDocRef, { ultrasoundSchedule: updatedSchedule }, { merge: true });
        }
      }
      toast.success(`Marcado como ${newDoneStatus ? 'concluído' : 'pendente'}!`);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Não foi possível atualizar o status.");
    }
  };

  const openDeleteConfirmation = (appointment) => {
    setAppointmentToDelete(appointment);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!user || !appointmentToDelete) return;
    try {
      const appointmentRef = doc(db, 'users', user.uid, 'appointments', appointmentToDelete.id);
      await deleteDoc(appointmentRef);
      toast.info('Consulta removida.');
    } catch (error) {
      console.error('Erro ao apagar consulta:', error);
      toast.error('Não foi possível remover a consulta.');
    } finally {
      setIsModalOpen(false);
      setAppointmentToDelete(null);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  
  const upcomingAppointments = appointments
    .filter(a => a.date >= today && !a.done)
    .sort((a,b) => new Date(a.date) - new Date(b.date));
    
  const pastAppointments = appointments
    .filter(a => a.date < today || a.done)
    .sort((a,b) => new Date(b.date) - new Date(a.date));

  const AppointmentCard = ({ app }) => (
    <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
        <div className={`flex items-start gap-4`}>
            <div className="flex-shrink-0 pt-1">
                <label className="cursor-pointer" title={app.done ? "Marcar como pendente" : "Marcar como concluído"}>
                    <input type="checkbox" checked={!!app.done} onChange={() => handleToggleDone(app)} className="sr-only peer" />
                    <div className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-colors ${app.done ? 'bg-green-500 border-green-500' : 'border-slate-400 dark:border-slate-500'}`}>
                        <svg className={`w-4 h-4 text-white transform transition-transform ${app.done ? 'scale-100' : 'scale-0'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                </label>
            </div>
            <div className="flex-grow">
                <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{app.title}</p>
                <p className={`font-semibold ${app.isScheduled ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {new Date(app.date + 'T00:00:00Z').toLocaleDateString('pt-BR', {timeZone: 'UTC'})} {app.time && `às ${app.time}`}
                    {!app.isScheduled && app.type === 'ultrasound' && <span className="text-xs font-normal"> (Data Sugerida)</span>}
                </p>
                {app.professional && <p className="text-sm text-slate-600 dark:text-slate-300">{app.professional}</p>}
                {app.location && <p className="text-sm text-slate-500 dark:text-slate-400">{app.location}</p>}
            </div>
            <div className="flex gap-2">
                {app.type === 'manual' ? (
                <>
                    <button onClick={() => onEdit(app)} title="Editar" className="p-2 rounded-full text-slate-500 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>
                    <button onClick={() => openDeleteConfirmation(app)} title="Apagar" className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </>
                ) : (
                <Link href="/" title="Gerenciar na Página Inicial" className="p-2 rounded-full text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </Link>
                )}
            </div>
        </div>
        {app.notes && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 ml-10">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Anotações:</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 italic whitespace-pre-wrap">{app.notes}</p>
            </div>
        )}
    </div>
  );

  return (
    <>
      <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmDelete} title="Confirmar Exclusão" message="Tem certeza que deseja apagar esta consulta?" />
      
      {(upcomingAppointments.length > 0 || pastAppointments.length > 0) ? (
        <>
        {upcomingAppointments.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Próximas Consultas</h3>
            <div className="space-y-4">{upcomingAppointments.map(app => <AppointmentCard key={app.id} app={app} />)}</div>
          </div>
        )}

        {pastAppointments.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Consultas Passadas</h3>
            <div className="space-y-4">{pastAppointments.map(app => <AppointmentCard key={app.id} app={app} />)}</div>
          </div>
        )}
        </>
      ) : (
        <div className="text-center py-8 bg-slate-50 dark:bg-slate-800 rounded-lg mt-6">
          <p className="text-slate-500 dark:text-slate-400">Nenhuma consulta registrada ainda.</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">Use o formulário acima para adicionar seu primeiro compromisso.</p>
        </div>
      )}
    </>
  );
}