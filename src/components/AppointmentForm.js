"use client";

import { useState, useEffect, useRef } from "react";
// --- INÍCIO DA MUDANÇA ---
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
// --- FIM DA MUDANÇA ---
import { toast } from "react-toastify";
import { appointmentTypes } from "@/data/appointmentData";

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AppointmentForm({
  user,
  appointmentToEdit,
  onFinish,
  professionalSuggestions,
  locationSuggestions,
  lmpDate,
  dueDate,
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [professional, setProfessional] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const notesTextareaRef = useRef(null);

  useEffect(() => {
    if (appointmentToEdit) {
      setTitle(appointmentToEdit.title || appointmentToEdit.name || "");
      setDate(appointmentToEdit.date || getTodayString());
      setTime(appointmentToEdit.time || "");
      setProfessional(appointmentToEdit.professional || "");
      setLocation(appointmentToEdit.location || "");
      setNotes(appointmentToEdit.notes || "");
    } else {
      setTitle("");
      setDate(getTodayString());
      setTime("");
      setProfessional("");
      setLocation("");
      setNotes("");
    }
  }, [appointmentToEdit]);

  useEffect(() => {
    if (notesTextareaRef.current) {
      const textarea = notesTextareaRef.current;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [notes]);
  
  const handleNotesChange = (e) => {
    const textarea = e.target;
    setNotes(textarea.value);
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // --- INÍCIO DA MUDANÇA ---
  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!title || !date) {
      toast.warn("Por favor, preencha o título e a data da consulta.");
      return;
    }
    
    if (appointmentToEdit?.done && date > getTodayString()) {
      toast.error(
        "Uma consulta concluída não pode ser reagendada para o futuro.",
      );
      return;
    }
    if (lmpDate && dueDate) {
      const selectedDate = new Date(date + "T00:00:00Z");
      const extendedDueDate = new Date(dueDate.getTime());
      extendedDueDate.setUTCDate(extendedDueDate.getUTCDate() + 14);

      if (selectedDate < lmpDate || selectedDate > extendedDueDate) {
        toast.error(
          "A data da consulta deve estar dentro do período da gestação.",
        );
        return;
      }
    }

    // Fecha o formulário para uma experiência otimista
    if (onFinish) onFinish();

    try {
      if (appointmentToEdit?.type === "ultrasound") {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        const scheduleData = docSnap.data()?.gestationalProfile?.ultrasoundSchedule || {};
        const updatedSchedule = {
          ...scheduleData,
          [appointmentToEdit.id]: {
            ...scheduleData[appointmentToEdit.id],
            scheduledDate: date,
            time,
            professional,
            location,
            notes,
          },
        };
        await setDoc(userDocRef, { gestationalProfile: { ultrasoundSchedule: updatedSchedule } }, { merge: true });
        toast.success("Agendamento de ultrassom salvo!");

      } else { // Para consultas manuais (novas ou existentes)
        const dataToSave = { title, date, time, professional, location, notes, done: appointmentToEdit?.done || false };
        let docRef;
        if (appointmentToEdit?.id) { // Editando uma consulta existente
          docRef = doc(db, "users", user.uid, "appointments", appointmentToEdit.id);
          await setDoc(docRef, dataToSave, { merge: true });
        } else { // Criando uma nova consulta
          docRef = collection(db, "users", user.uid, "appointments");
          await addDoc(docRef, dataToSave);
        }
        toast.success("Consulta salva com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar consulta:", error.message);
      toast.error("Não foi possível salvar a consulta. A alteração foi desfeita.");
    }
  };
  // --- FIM DA MUDANÇA ---

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mb-6">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
        {appointmentToEdit && appointmentToEdit.id
          ? "Editar Consulta"
          : "Adicionar Nova Consulta"}
      </h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Título*
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={appointmentToEdit?.type === "ultrasound"}
            placeholder="Ex: Ultrassom Morfológico"
            className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 disabled:opacity-50"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {appointmentTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTitle(type)}
                disabled={appointmentToEdit?.type === "ultrasound"}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  title === type
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Data*
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"
            />
          </div>
          <div>
            <label
              htmlFor="time"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Horário
            </label>
            <input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="professional"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Profissional/Laboratório
          </label>
          <input
            type="text"
            id="professional"
            value={professional}
            onChange={(e) => setProfessional(e.target.value)}
            placeholder="Ex: Dr. Nome Sobrenome"
            list="professional-suggestions"
            className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"
          />
          <datalist id="professional-suggestions">
            {professionalSuggestions?.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Local
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ex: Clínica Bem Nascer, Sala 10"
            list="location-suggestions"
            className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"
          />
          <datalist id="location-suggestions">
            {locationSuggestions?.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Anotações
          </label>
          <textarea
            id="notes"
            ref={notesTextareaRef}
            rows="3"
            value={notes}
            onChange={handleNotesChange}
            maxLength="500"
            placeholder="Dúvidas para perguntar, resultados de exames..."
            className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 resize-none overflow-hidden"
          ></textarea>
          <div className="text-right text-sm text-slate-400 dark:text-slate-500">
            {notes.length} / 500
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onFinish}
            className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          >
            {appointmentToEdit && appointmentToEdit.id ? "Atualizar" : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}