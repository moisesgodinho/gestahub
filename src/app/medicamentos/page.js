// src/app/medicamentos/page.js
"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useGestationalData } from "@/hooks/useGestationalData";
import { useMedication } from "@/hooks/useMedication";
import MedicationForm from "@/components/MedicationForm";
import MedicationList from "@/components/MedicationList";
import SkeletonLoader from "@/components/SkeletonLoader";
import ConfirmationModal from "@/components/ConfirmationModal";
import { getDueDate } from "@/lib/gestationalAge";

export default function MedicationsPage() {
  const { user, loading: userLoading } = useUser();
  const { gestationalInfo, estimatedLmp, loading: gestationalLoading } =
    useGestationalData(user);
  const dueDate = estimatedLmp ? getDueDate(estimatedLmp) : null;

  const {
    medications,
    history,
    loading: medsLoading,
    addMedication,
    updateMedication,
    deleteMedication,
    onToggleDose,
  } = useMedication(user);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [medicationToEdit, setMedicationToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [medicationIdToDelete, setMedicationIdToDelete] = useState(null);

  const loading = userLoading || medsLoading || gestationalLoading;

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
            <MedicationForm
              onSave={handleSave}
              onCancel={handleCancel}
              medicationToEdit={medicationToEdit}
            />
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
            medications={medications}
            history={history}
            gestationalInfo={gestationalInfo}
            onToggleDose={onToggleDose}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            dueDate={dueDate}
          />
        </div>
      </div>
    </>
  );
}