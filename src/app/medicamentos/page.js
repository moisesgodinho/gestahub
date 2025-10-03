// src/app/medicamentos/page.js
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useGestationalData } from "@/hooks/useGestationalData";
import { useMedication } from "@/hooks/useMedication";
import MedicationForm from "@/components/MedicationForm";
import MedicationList from "@/components/MedicationList";
import MedicationHistoryList from "@/components/MedicationHistoryList";
import SkeletonLoader from "@/components/SkeletonLoader";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function MedicationsPage() {
  const { user, loading: userLoading } = useUser();
  const { gestationalInfo, loading: gestationalLoading } = useGestationalData(user);
  
  const { 
    medications, 
    history, 
    pastHistory, 
    loading: medsLoading, 
    loadingPast, 
    hasMorePast, 
    loadPastHistory,
    addMedication, 
    updateMedication, 
    deleteMedication, 
    onToggleDose 
  } = useMedication(user, gestationalInfo?.weeks);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [medicationToEdit, setMedicationToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [medicationIdToDelete, setMedicationIdToDelete] = useState(null);
  const [showPast, setShowPast] = useState(false);

  const loading = userLoading || medsLoading || gestationalLoading;

  // Carrega o histórico inicial quando o usuário clica para ver
  useEffect(() => {
    if (showPast && pastHistory.length === 0 && hasMorePast) {
        loadPastHistory();
    }
  }, [showPast, pastHistory, hasMorePast, loadPastHistory]);

  const handleAddNew = () => {
    setMedicationToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (med) => {
    setMedicationToEdit(med);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setMedicationToEdit(null);
  };

  const handleSave = (medData) => {
    if (medicationToEdit) {
      updateMedication(medicationToEdit.id, medData);
    } else {
      addMedication(medData);
    }
    setIsFormOpen(false);
    setMedicationToEdit(null);
  };
  
  const handleDeleteRequest = (medId) => {
    setMedicationIdToDelete(medId);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    if (medicationIdToDelete) {
      deleteMedication(medicationIdToDelete);
    }
    setIsDeleteModalOpen(false);
    setMedicationIdToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <SkeletonLoader type="fullPage" />
      </div>
    );
  }

  return (
    <>
      <ConfirmationModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={confirmDelete} 
        title="Confirmar Exclusão" 
        message="Tem certeza que deseja remover este medicamento? Esta ação não pode ser desfeita."
      />
      <div className="flex items-start justify-center flex-grow p-4">
        <div className="w-full max-w-3xl">
          <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400 mb-6 text-center">
            Medicamentos e Vitaminas
          </h1>

          {isFormOpen ? (
            <MedicationForm onSave={handleSave} onCancel={handleCancel} medicationToEdit={medicationToEdit} />
          ) : (
            <div className="mb-6 text-center">
              <button 
                onClick={handleAddNew} 
                className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
              >
                Adicionar Medicamento
              </button>
            </div>
          )}

          <MedicationList
            viewDate={new Date()} // Sempre começa a partir de hoje
            medications={medications}
            history={history}
            gestationalWeek={gestationalInfo?.weeks}
            onToggleDose={onToggleDose}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />

          <div className="mt-8 text-center">
            {!showPast && (
                <button 
                  onClick={() => setShowPast(true)} 
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                    Ver Histórico de Dias Anteriores
                </button>
            )}
          </div>

          {showPast && (
            <MedicationHistoryList
                history={pastHistory}
                medications={medications}
                onLoadMore={() => loadPastHistory(true)}
                hasMore={hasMorePast}
                loading={loadingPast}
                gestationalWeek={gestationalInfo?.weeks}
            />
          )}
        </div>
      </div>
    </>
  );
}