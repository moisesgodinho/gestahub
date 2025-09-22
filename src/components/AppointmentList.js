// src/components/AppointmentList.js
'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import ConfirmationModal from '@/components/ConfirmationModal'; // CORRIGIDO
import AppointmentItem from './AppointmentItem';

const getUTCDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

export default function AppointmentList({ appointments, onEdit, user, lmpDate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  const handleToggleDone = async (appointment) => {
    if (!user) return;

    const newDoneStatus = !appointment.done;

    if (newDoneStatus) {
      if (appointment.type === 'ultrasound' && !appointment.isScheduled) {
        toast.warn("Por favor, adicione uma data ao ultrassom antes de marcá-lo como concluído.");
        onEdit(appointment);
        return;
      }
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
          // MODIFICADO: Acessa o ultrasoundSchedule de dentro do gestationalProfile
          const scheduleData = docSnap.data().gestationalProfile?.ultrasoundSchedule || {};
          const updatedSchedule = {
            ...scheduleData,
            [appointment.id]: {
              ...scheduleData[appointment.id],
              done: newDoneStatus,
            },
          };
          // MODIFICADO: Salva o ultrasoundSchedule dentro de gestationalProfile
          await setDoc(userDocRef, { gestationalProfile: { ultrasoundSchedule: updatedSchedule } }, { merge: true });
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
  
  // LÓGICA DE ORDENAÇÃO ATUALIZADA
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

  const upcomingAppointments = appointments
    .filter(a => !a.done)
    .sort((a, b) => getSortDate(a) - getSortDate(b));
    
  const pastAppointments = appointments
    .filter(a => a.done)
    .sort((a,b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mt-6">
      <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmDelete} title="Confirmar Exclusão" message="Tem certeza que deseja apagar esta consulta?" />
      
      {(upcomingAppointments.length > 0 || pastAppointments.length > 0) ? (
        <>
        {upcomingAppointments.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Próximas Consultas</h3>
            <div className="space-y-4">
              {upcomingAppointments.map(app => {
                let idealWindowText = null;
                if (app.type === 'ultrasound' && lmpDate) {
                    const lmpUTCDate = getUTCDate(lmpDate);
                    if (lmpUTCDate) {
                        const startDate = new Date(lmpUTCDate.getTime());
                        startDate.setUTCDate(startDate.getUTCDate() + app.startWeek * 7);

                        const endDate = new Date(lmpUTCDate.getTime());
                        endDate.setUTCDate(endDate.getUTCDate() + (app.endWeek * 7) + 6);
                        
                        idealWindowText = `Janela ideal: ${startDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })} a ${endDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`;
                    }
                }
                return (
                  <AppointmentItem 
                    key={`${app.type}-${app.id}`}
                    item={app}
                    onToggleDone={handleToggleDone}
                    onEdit={onEdit}
                    onDelete={openDeleteConfirmation}
                    idealWindowText={idealWindowText}
                  />
                );
              })}
            </div>
          </div>
        )}

        {pastAppointments.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Consultas Passadas</h3>
            <div className="space-y-4">
              {pastAppointments.map(app => (
                <AppointmentItem
                  key={`${app.type}-${app.id}`}
                  item={app}
                  onToggleDone={handleToggleDone}
                  onEdit={onEdit}
                  onDelete={openDeleteConfirmation}
                />
              ))}
            </div>
          </div>
        )}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400">Nenhuma consulta registrada ainda.</p>
        </div>
      )}
    </div>
  );
}