"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  query,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-toastify";
import Link from "next/link";
import ConfirmationModal from "@/components/ConfirmationModal";
import CompletionCelebration from "./CompletionCelebration";
import AppointmentItem from "./AppointmentItem";
import { ultrasoundSchedule } from "@/data/appointmentData";

const getUTCDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

// Função para converter "HH:mm" em minutos para uma ordenação confiável
const timeStringToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string" || !timeStr.includes(":"))
    return Infinity;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

export default function AgendaProximosPassos({ lmpDate, user }) {
  const [manualAppointments, setManualAppointments] = useState([]);
  const [ultrasoundAppointments, setUltrasoundAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingItemId, setEditingItemId] = useState(null);
  const [editDetails, setEditDetails] = useState({
    title: "",
    date: "",
    time: "",
    professional: "",
    location: "",
    notes: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const notesTextareaRef = useRef(null);

  useEffect(() => {
    if (editingItemId && notesTextareaRef.current) {
      const textarea = notesTextareaRef.current;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [editingItemId, editDetails.notes]);

  useEffect(() => {
    if (!user || !lmpDate) {
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribeUserDoc = onSnapshot(userDocRef, (docSnap) => {
      const ultrasoundItems = [];
      if (docSnap.exists()) {
        const userData = docSnap.data();
        // MODIFICADO: Acessa o ultrasoundSchedule de dentro do gestationalProfile
        const ultrasoundData =
          userData.gestationalProfile?.ultrasoundSchedule || {};

        ultrasoundSchedule.forEach((exam) => {
          const examData = ultrasoundData[exam.id] || {};
          ultrasoundItems.push({
            ...exam,
            ...examData,
            date: examData.scheduledDate || null,
            isScheduled: !!examData.scheduledDate,
          });
        });
      }
      setUltrasoundAppointments(ultrasoundItems);
    });

    const appointmentsRef = collection(db, "users", user.uid, "appointments");
    const q = query(appointmentsRef);
    const unsubscribeAppointments = onSnapshot(q, (snapshot) => {
      const manualItems = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        type: "manual",
      }));
      setManualAppointments(manualItems);
    });

    setLoading(false);

    return () => {
      unsubscribeUserDoc();
      unsubscribeAppointments();
    };
  }, [user, lmpDate]);

  const combinedAppointments = useMemo(
    () => [...manualAppointments, ...ultrasoundAppointments],
    [manualAppointments, ultrasoundAppointments],
  );

  const handleToggleDone = async (appointment) => {
    if (!user) return;
    const newDoneStatus = !appointment.done;

    if (newDoneStatus) {
      if (appointment.type === "ultrasound" && !appointment.isScheduled) {
        toast.warn(
          "Por favor, adicione uma data ao ultrassom antes de marcá-lo como concluído.",
        );
        handleStartEditing(appointment);
        return;
      }

      const today = new Date();
      const todayUTC = new Date(
        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
      );
      const appointmentDate = new Date(appointment.date + "T00:00:00Z");
      if (appointmentDate.getTime() > todayUTC.getTime()) {
        toast.warn("Não é possível marcar como concluída uma consulta futura.");
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
          appointment.id,
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
          // MODIFICADO: Salva o ultrasoundSchedule dentro de gestationalProfile
          await setDoc(
            userDocRef,
            { gestationalProfile: { ultrasoundSchedule: updatedSchedule } },
            { merge: true },
          );

          if (newDoneStatus) {
            const allUltrasoundsDone = ultrasoundSchedule.every(
              (exam) => updatedSchedule[exam.id]?.done,
            );
            if (allUltrasoundsDone) {
              setShowCelebration(true);
            }
          }
        }
      }
      toast.success(
        `Marcado como ${newDoneStatus ? "concluído" : "pendente"}!`,
      );
    } catch (error) {
      toast.error("Não foi possível atualizar o status.");
    }
  };

  const openDeleteConfirmation = (appointment) => {
    setAppointmentToDelete(appointment);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!user || !appointmentToDelete || appointmentToDelete.type !== "manual")
      return;
    try {
      const appointmentRef = doc(
        db,
        "users",
        user.uid,
        "appointments",
        appointmentToDelete.id,
      );
      await deleteDoc(appointmentRef);
      toast.info("Consulta removida.");
    } catch (error) {
      toast.error("Não foi possível remover a consulta.");
    } finally {
      setIsModalOpen(false);
      setAppointmentToDelete(null);
    }
  };

  const handleStartEditing = (item) => {
    let defaultDate = item.scheduledDate || item.date;
    if (item.type === "ultrasound" && !defaultDate && lmpDate) {
      const idealStartDate = new Date(lmpDate);
      idealStartDate.setDate(idealStartDate.getDate() + item.startWeek * 7);
      defaultDate = idealStartDate.toISOString().split("T")[0];
    }

    setEditDetails({
      title: item.title || item.name || "",
      date: defaultDate || "",
      time: item.time || "",
      professional: item.professional || "",
      location: item.location || "",
      notes: item.notes || "",
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

    if (item.type === "ultrasound" && lmpDate) {
      const lmpUTCDate = getUTCDate(lmpDate);
      const selectedDate = new Date(editDetails.date + "T00:00:00Z");
      const idealStartDate = new Date(lmpUTCDate.getTime());
      idealStartDate.setUTCDate(
        idealStartDate.getUTCDate() + item.startWeek * 7,
      );
      const idealEndDate = new Date(lmpUTCDate.getTime());
      idealEndDate.setUTCDate(idealEndDate.getUTCDate() + item.endWeek * 7 + 6);
      const toleranceStartDate = new Date(idealStartDate.getTime());
      toleranceStartDate.setUTCDate(toleranceStartDate.getUTCDate() - 14);
      const toleranceEndDate = new Date(idealEndDate.getTime());
      toleranceEndDate.setUTCDate(toleranceEndDate.getUTCDate() + 14);

      if (
        selectedDate < toleranceStartDate ||
        selectedDate > toleranceEndDate
      ) {
        toast.error(
          "A data está fora do período recomendado (tolerância de 2 semanas).",
        );
        return;
      }
    }

    try {
      if (item.type === "manual") {
        const appointmentRef = doc(
          db,
          "users",
          user.uid,
          "appointments",
          item.id,
        );
        await setDoc(appointmentRef, { ...editDetails }, { merge: true });
        toast.success("Consulta atualizada!");
      } else if (item.type === "ultrasound") {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const scheduleData =
            docSnap.data().gestationalProfile?.ultrasoundSchedule || {};
          const updatedSchedule = {
            ...scheduleData,
            [item.id]: {
              ...scheduleData[item.id],
              scheduledDate: editDetails.date,
              time: editDetails.time,
              professional: editDetails.professional,
              location: editDetails.location,
              notes: editDetails.notes,
            },
          };
          // MODIFICADO: Salva o ultrasoundSchedule dentro de gestationalProfile
          await setDoc(
            userDocRef,
            { gestationalProfile: { ultrasoundSchedule: updatedSchedule } },
            { merge: true },
          );
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
    if (item.type === "ultrasound" && lmpDate) {
      const idealStartDate = new Date(lmpDate);
      idealStartDate.setDate(idealStartDate.getDate() + item.startWeek * 7);
      return idealStartDate;
    }
    return new Date("2999-12-31");
  };

  // CORREÇÃO: Aplicando a mesma lógica de ordenação detalhada aqui.
  const upcomingEvents = combinedAppointments
    .filter((event) => !event.done)
    .sort((a, b) => {
      const dateA = getSortDate(a);
      const dateB = getSortDate(b);
      const dateComparison = dateA.getTime() - dateB.getTime();

      if (dateComparison !== 0) return dateComparison;

      // Se as datas são iguais, ordena por horário ascendente
      const timeA = timeStringToMinutes(a.time);
      const timeB = timeStringToMinutes(b.time);
      return timeA - timeB;
    });

  const handleNotesChange = (e) => {
    const textarea = e.target;
    setEditDetails({ ...editDetails, notes: textarea.value });
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  if (loading) {
    return <div className="text-center p-4">Carregando agenda...</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mb-6">
      {showCelebration && (
        <CompletionCelebration onClose={() => setShowCelebration(false)} />
      )}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja apagar esta consulta?"
      />
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">
        🗓️ Próximos Passos
      </h3>
      {upcomingEvents.length > 0 ? (
        <>
          <div className="space-y-3">
            {upcomingEvents.map((item) => {
              let idealWindowText = null;
              if (item.type === "ultrasound" && lmpDate) {
                const lmpUTCDate = getUTCDate(lmpDate);
                if (lmpUTCDate) {
                  const startDate = new Date(lmpUTCDate.getTime());
                  startDate.setUTCDate(
                    startDate.getUTCDate() + item.startWeek * 7,
                  );

                  const endDate = new Date(lmpUTCDate.getTime());
                  endDate.setUTCDate(
                    endDate.getUTCDate() + item.endWeek * 7 + 6,
                  );

                  idealWindowText = `Janela ideal: ${startDate.toLocaleDateString("pt-BR", { timeZone: "UTC" })} a ${endDate.toLocaleDateString("pt-BR", { timeZone: "UTC" })}`;
                }
              }

              return (
                <div key={`${item.type}-${item.id}`}>
                  {/* 2. SUBSTITUA O BLOCO DE RENDERIZAÇÃO PELO NOVO COMPONENTE */}
                  <AppointmentItem
                    item={item}
                    onToggleDone={handleToggleDone}
                    onEdit={handleStartEditing}
                    onDelete={openDeleteConfirmation}
                    idealWindowText={idealWindowText}
                  />

                  {editingItemId === item.id && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 space-y-2">
                      <input
                        type="text"
                        placeholder="Título da Consulta"
                        disabled={item.type === "ultrasound"}
                        value={editDetails.title}
                        onChange={(e) =>
                          setEditDetails({
                            ...editDetails,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 text-sm disabled:opacity-50"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-slate-500">
                            Data
                          </label>
                          <input
                            type="date"
                            value={editDetails.date}
                            onChange={(e) =>
                              setEditDetails({
                                ...editDetails,
                                date: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500">
                            Horário
                          </label>
                          <input
                            type="time"
                            value={editDetails.time}
                            onChange={(e) =>
                              setEditDetails({
                                ...editDetails,
                                time: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 text-sm"
                          />
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Profissional/Laboratório"
                        value={editDetails.professional}
                        onChange={(e) =>
                          setEditDetails({
                            ...editDetails,
                            professional: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Local"
                        value={editDetails.location}
                        onChange={(e) =>
                          setEditDetails({
                            ...editDetails,
                            location: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 text-sm"
                      />

                      <div>
                        <textarea
                          ref={notesTextareaRef}
                          placeholder="Anotações (dúvidas para a consulta, etc)"
                          value={editDetails.notes}
                          onChange={handleNotesChange}
                          maxLength="500"
                          className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 text-sm resize-none overflow-hidden"
                          rows="2"
                        ></textarea>
                        <div className="text-right text-xs text-slate-400 dark:text-slate-500">
                          {editDetails.notes.length} / 500
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-600 text-sm hover:bg-slate-300"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveDetails(item)}
                          className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <Link
              href="/consultas"
              className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm text-center"
            >
              Ver Histórico Completo
            </Link>
            <Link
              href="/consultas?new=true"
              className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors text-sm text-center"
            >
              Adicionar Nova Consulta
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400">
            Nenhum compromisso futuro encontrado.
          </p>
          <Link
            href="/consultas?new=true"
            className="mt-4 inline-block px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
          >
            Ver Histórico e Adicionar
          </Link>
        </div>
      )}
    </div>
  );
}