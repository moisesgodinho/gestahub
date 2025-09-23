"use client";

import { useState, useMemo, useEffect } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-toastify";
import ConfirmationModal from "@/components/ConfirmationModal";
import { moodOptions, symptomOptions } from "@/data/journalData";

// Ícones para navegação
const ChevronLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);
const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default function JournalHistory({ entries, onEdit, user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const [moodFilter, setMoodFilter] = useState("");
  const [symptomFilter, setSymptomFilter] = useState("");
  const [textFilter, setTextFilter] = useState("");

  // --- NOVO: Lógica de paginação por mês ---
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (moodFilter && entry.mood !== moodFilter) return false;
      if (
        symptomFilter &&
        (!entry.symptoms || !entry.symptoms.includes(symptomFilter))
      )
        return false;
      if (
        textFilter &&
        (!entry.notes ||
          !entry.notes.toLowerCase().includes(textFilter.toLowerCase()))
      )
        return false;
      return true;
    });
  }, [entries, moodFilter, symptomFilter, textFilter]);

  const entriesGroupedByMonth = useMemo(() => {
    return filteredEntries.reduce((acc, entry) => {
      const date = new Date(entry.date);
      const monthYear = date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(entry);
      return acc;
    }, {});
  }, [filteredEntries]);

  // --- NOVO: Array de meses e entradas do mês atual ---
  const availableMonths = useMemo(
    () => Object.keys(entriesGroupedByMonth),
    [entriesGroupedByMonth],
  );
  const currentMonthEntries = useMemo(
    () => entriesGroupedByMonth[availableMonths[currentMonthIndex]] || [],
    [entriesGroupedByMonth, availableMonths, currentMonthIndex],
  );

  // Resetar o índice quando os filtros mudarem
  useEffect(() => {
    setCurrentMonthIndex(0);
  }, [moodFilter, symptomFilter, textFilter]);

  const handlePreviousMonth = () => {
    setCurrentMonthIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) =>
      Math.min(availableMonths.length - 1, prev + 1),
    );
  };

  const openDeleteConfirmation = (entry) => {
    setEntryToDelete(entry);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!user || !entryToDelete) return;
    try {
      const entryRef = doc(
        db,
        "users",
        user.uid,
        "symptomEntries",
        entryToDelete.id,
      );
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
    const mood = moodOptions.find((m) => m.value === moodValue);
    return mood ? mood.label : moodValue;
  };

  const handleClearFilters = () => {
    setMoodFilter("");
    setSymptomFilter("");
    setTextFilter("");
  };

  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mt-6 text-center">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
          Histórico do Diário
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Nenhum registro encontrado ainda.
        </p>
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
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">
          Histórico do Diário
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <div>
            <label
              htmlFor="moodFilter"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Filtrar por Humor
            </label>
            <select
              id="moodFilter"
              value={moodFilter}
              onChange={(e) => setMoodFilter(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"
            >
              <option value="">Todos</option>
              {moodOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="symptomFilter"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Filtrar por Sintoma
            </label>
            <select
              id="symptomFilter"
              value={symptomFilter}
              onChange={(e) => setSymptomFilter(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"
            >
              <option value="">Todos</option>
              {symptomOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="textFilter"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Buscar nas Anotações
            </label>
            <input
              type="text"
              id="textFilter"
              placeholder="Ex: consulta, cansada..."
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"
            />
          </div>
        </div>

        {availableMonths.length > 0 ? (
          <div>
            {/* --- NOVO: Cabeçalho de navegação por mês --- */}
            <div className="flex justify-between items-center mb-4 p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50">
              <button
                onClick={handleNextMonth}
                disabled={currentMonthIndex >= availableMonths.length - 1}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon />
              </button>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 capitalize">
                {availableMonths[currentMonthIndex]}
              </h3>
              <button
                onClick={handlePreviousMonth}
                disabled={currentMonthIndex <= 0}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon />
              </button>
            </div>

            <div className="space-y-4">
              {currentMonthEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg text-slate-800 dark:text-slate-100">
                        {new Date(entry.date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          weekday: "long",
                          timeZone: "UTC",
                        })}
                      </p>
                      <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {getMoodLabel(entry.mood)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(entry)}
                        title="Visualizar/Editar"
                        className="p-2 rounded-full text-slate-500 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => openDeleteConfirmation(entry)}
                        title="Apagar"
                        className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  {entry.symptoms && entry.symptoms.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        Sintomas:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {entry.symptoms.map((symptom) => (
                          <span
                            key={symptom}
                            className="text-xs bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 px-2 py-1 rounded-full"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {entry.notes && (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        Anotações:
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 italic whitespace-pre-wrap">
                        {entry.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">
              Nenhum registro encontrado para os filtros selecionados.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </>
  );
}
