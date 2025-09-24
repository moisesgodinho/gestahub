// src/components/AppointmentList.js
"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import ConfirmationModal from "@/components/ConfirmationModal";
import AppointmentItem from "./AppointmentItem";

const getUTCDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

// Função para converter "HH:mm" em minutos para uma ordenação confiável
const timeStringToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return -1; // Retorna -1 para itens sem horário
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const INITIAL_VISIBLE_COUNT = 5;
const LOAD_MORE_COUNT = 5;

export default function AppointmentList({
  appointments,
  onEdit,
  user,
  lmpDate,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [visiblePastCount, setVisiblePastCount] = useState(
    INITIAL_VISIBLE_COUNT
  );

  const handleToggleDone = async (appointment) => {
    if (!user) return;

    const newDoneStatus = !appointment.done;

    if (newDoneStatus) {
      if (appointment.type === "ultrasound" && !appointment.isScheduled) {
        toast.warn(
          "Por favor, adicione uma data ao ultrassom antes de marcá-lo como concluído."
        );
        onEdit(appointment);
        return;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const appointmentDate = new Date(appointment.date + "T00:00:00Z");

      if (appointmentDate > today) {
        toast.warn(
          "Não é possível marcar como concluída uma consulta agendada para o futuro."
        );
        return;
      }
    }

    try {
      if (appointment.type === "manual") {
        const appointmentRef = doc(
          db,
          "users",
          user.uid,
          "appointments",
          appointment.id
        );
        await setDoc(appointmentRef, { done: newDoneStatus }, { merge: true });
      } else if (appointment.type === "ultrasound") {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const scheduleData =
            docSnap.data().gestationalProfile?.ultrasoundSchedule || {};
          const updatedSchedule = {
            ...scheduleData,
            [appointment.id]: {
              ...scheduleData[appointment.id],
              done: newDoneStatus,
            },
          };
          await setDoc(
            userDocRef,
            { gestationalProfile: { ultrasoundSchedule: updatedSchedule } },
            { merge: true }
          );
        }
      }
      toast.success(
        `Marcado como ${newDoneStatus ? "concluído" : "pendente"}!`
      );
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
      const appointmentRef = doc(
        db,
        "users",
        user.uid,
        "appointments",
        appointmentToDelete.id
      );
      await deleteDoc(appointmentRef);
      toast.info("Consulta removida.");
    } catch (error) {
      console.error("Erro ao apagar consulta:", error);
      toast.error("Não foi possível remover a consulta.");
    } finally {
      setIsModalOpen(false);
      setAppointmentToDelete(null);
    }
  };

  const getSortableDate = (item) => {
    if (item.date) {
      return new Date(item.date);
    }
    if (item.type === "ultrasound" && lmpDate) {
      const idealStartDate = new Date(lmpDate);
      idealStartDate.setDate(idealStartDate.getDate() + item.startWeek * 7);
      return idealStartDate;
    }
    return new Date("2999-12-31");
  };

  const upcomingAppointments = appointments
    .filter((a) => !a.done)
    .sort((a, b) => {
      const dateA = getSortableDate(a);
      const dateB = getSortableDate(b);
      const dateComparison = dateA.getTime() - dateB.getTime();
      if (dateComparison !== 0) return dateComparison;
      const timeA = timeStringToMinutes(a.time);
      const timeB = timeStringToMinutes(b.time);
      return timeA - timeB;
    });

  const pastAppointments = appointments
    .filter((a) => a.done)
    .sort((a, b) => {
      const dateB = getSortableDate(b);
      const dateA = getSortableDate(a);
      const dateComparison = dateB.getTime() - dateA.getTime();
      if (dateComparison !== 0) return dateComparison;
      const timeA = timeStringToMinutes(a.time);
      const timeB = timeStringToMinutes(b.time);
      return timeB - timeA; // CORREÇÃO: Ordem descendente para o horário também
    });

  const displayedPastAppointments = pastAppointments.slice(0, visiblePastCount);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mt-6">
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja apagar esta consulta?"
      />

      {upcomingAppointments.length > 0 || pastAppointments.length > 0 ? (
        <>
          {upcomingAppointments.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                Próximas Consultas
              </h3>
              <div className="space-y-4">
                {upcomingAppointments.map((app) => {
                  let idealWindowText = null;
                  if (app.type === "ultrasound" && lmpDate) {
                    const lmpUTCDate = getUTCDate(lmpDate);
                    if (lmpUTCDate) {
                      const startDate = new Date(lmpUTCDate.getTime());
                      startDate.setUTCDate(
                        startDate.getUTCDate() + app.startWeek * 7
                      );

                      const endDate = new Date(lmpUTCDate.getTime());
                      endDate.setUTCDate(
                        endDate.getUTCDate() + app.endWeek * 7 + 6
                      );

                      idealWindowText = `Janela ideal: ${startDate.toLocaleDateString("pt-BR", { timeZone: "UTC" })} a ${endDate.toLocaleDateString("pt-BR", { timeZone: "UTC" })}`;
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
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                Consultas Passadas
              </h3>
              <div className="space-y-4">
                {displayedPastAppointments.map((app) => (
                  <AppointmentItem
                    key={`${app.type}-${app.id}`}
                    item={app}
                    onToggleDone={handleToggleDone}
                    onEdit={onEdit}
                    onDelete={openDeleteConfirmation}
                  />
                ))}
              </div>
              {visiblePastCount < pastAppointments.length && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() =>
                      setVisiblePastCount((prev) => prev + LOAD_MORE_COUNT)
                    }
                    className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    Carregar Mais
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400">
            Nenhuma consulta registrada ainda.
          </p>
        </div>
      )}
    </div>
  );
}