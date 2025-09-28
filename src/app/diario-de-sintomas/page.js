// src/app/diario-de-sintomas/page.js
"use client";

import { useState, useMemo } from "react";
import dynamic from 'next/dynamic'; // 1. Importar o dynamic
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-toastify";
import JournalEntry from "@/components/JournalEntry";
import JournalHistory from "@/components/JournalHistory";
import SymptomChart from "@/components/SymptomChart";
import JournalCalendar from "@/components/JournalCalendar";
import JournalViewModal from "@/components/JournalViewModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useUser } from "@/context/UserContext";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useGestationalData } from "@/hooks/useGestationalData"; // Importar o hook
import SkeletonLoader from "@/components/SkeletonLoader";

export default function JournalPage() {
  const { user, loading: userLoading } = useUser();
  const { entries, loading: entriesLoading } = useJournalEntries(user);
  const { estimatedLmp, loading: gestationalLoading } =
    useGestationalData(user); // Usar o hook de dados gestacionais

  const [entryToEdit, setEntryToEdit] = useState(null);
  const [entryToView, setEntryToView] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [selectedDateForNew, setSelectedDateForNew] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  // Abre o formulário de edição
  const handleEdit = (entry) => {
    setEntryToEdit(entry);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Abre o modal de visualização
  const handleView = (entry) => {
    setEntryToView(entry);
    setIsViewModalOpen(true);
  };

  // Abre o modal de confirmação para adicionar nova entrada
  const handleDateSelect = (dateString) => {
    setSelectedDateForNew(dateString);
    setIsAddEntryModalOpen(true);
  };

  // Confirma e abre o formulário para a nova entrada
  const confirmAndOpenForm = () => {
    setIsAddEntryModalOpen(false);
    setEntryToEdit({ id: selectedDateForNew });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Função para fechar o formulário (seja salvando ou cancelando)
  const handleFinishForm = () => {
    setEntryToEdit(null);
    setIsFormOpen(false);
  };

  // Abre o modal de confirmação para exclusão
  const handleDeleteRequest = (entry) => {
    setIsViewModalOpen(false); // Fecha o modal de visualização
    setEntryToDelete(entry);
    setIsDeleteModalOpen(true);
  };

  // Confirma e executa a exclusão
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
      toast.error("Não foi possível apagar a entrada.");
    } finally {
      setIsDeleteModalOpen(false);
      setEntryToDelete(null);
    }
  };

  const formattedDateForModal = useMemo(() => {
    if (!selectedDateForNew) return "";
    const date = new Date(`${selectedDateForNew}T00:00:00Z`);
    return date.toLocaleDateString("pt-BR", {
      timeZone: "UTC",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [selectedDateForNew]);

  const SymptomChart = dynamic(() => import('@/components/SymptomChart'), {
  loading: () => <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl h-80 animate-pulse"></div>,
  ssr: false
});

  const loading = userLoading || entriesLoading || gestationalLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <SkeletonLoader type="fullPage" />
      </div>
    );
  }

  return (
    <>
      <JournalViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        entry={entryToView}
        onEdit={(entry) => {
          setIsViewModalOpen(false);
          handleEdit(entry);
        }}
        onDelete={handleDeleteRequest}
      />

      <ConfirmationModal
        isOpen={isAddEntryModalOpen}
        onClose={() => setIsAddEntryModalOpen(false)}
        onConfirm={confirmAndOpenForm}
        title="Nenhum Registro no Diário"
        message={`Nenhum registro para o dia ${formattedDateForModal}. Deseja adicionar um?`}
        confirmButtonText="Adicionar Registro"
        confirmButtonClass="bg-indigo-600 hover:bg-indigo-700"
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja apagar esta entrada do diário?"
      />

      <div className="flex items-center justify-center flex-grow p-4">
        <div className="w-full max-w-3xl">
          <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400 mb-6 text-center">
            Diário de Sintomas e Humor
          </h1>

          {isFormOpen ? (
            <JournalEntry
              user={user}
              entry={entryToEdit}
              onSave={handleFinishForm}
              onCancel={handleFinishForm}
              allEntries={entries}
            />
          ) : (
            <div className="mb-6 text-center">
              <button
                onClick={() => {
                  setEntryToEdit(null);
                  setIsFormOpen(true);
                }}
                className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
              >
                Adicionar Registro do Dia
              </button>
            </div>
          )}

          <JournalCalendar
            entries={entries}
            onDateSelect={handleDateSelect}
            onEditEntry={handleView}
            lmpDate={estimatedLmp}
          />

          {entries.length > 0 && <SymptomChart entries={entries} />}

          <JournalHistory entries={entries} onEdit={handleView} user={user} />
        </div>
      </div>
    </>
  );
}
