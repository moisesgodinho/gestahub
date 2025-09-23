// src/app/consultas/page.js
"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { getEstimatedLmp, getDueDate } from "@/lib/gestationalAge";
import AppNavigation from "@/components/AppNavigation";
import AppointmentForm from "@/components/AppointmentForm";
import AppointmentList from "@/components/AppointmentList";
import AppointmentCalendar from "@/components/AppointmentCalendar";
import AppointmentViewModal from "@/components/AppointmentViewModal";
import AppointmentMultiViewModal from "@/components/AppointmentMultiViewModal";
import SkeletonLoader from "@/components/SkeletonLoader";
import ConfirmationModal from "@/components/ConfirmationModal";
import { toast } from "react-toastify";

const ultrasoundSchedule = [
  {
    id: "transvaginal",
    name: "1º Ultrassom (Transvaginal)",
    startWeek: 8,
    endWeek: 11,
    type: "ultrasound",
  },
  {
    id: "morfologico_1",
    name: "2º Ultrassom (Morfológico 1º Trimestre)",
    startWeek: 12,
    endWeek: 14,
    type: "ultrasound",
  },
  {
    id: "morfologico_2",
    name: "3º Ultrassom (Morfológico 2º Trimestre)",
    startWeek: 22,
    endWeek: 24,
    type: "ultrasound",
  },
  {
    id: "ecocardiograma",
    name: "4º Ultrassom (Ecocardiograma Fetal)",
    startWeek: 26,
    endWeek: 28,
    type: "ultrasound",
  },
  {
    id: "doppler_3",
    name: "5º Ultrassom (3º Trimestre com Doppler)",
    startWeek: 28,
    endWeek: 36,
    type: "ultrasound",
  },
];

function AppointmentsPageContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualAppointments, setManualAppointments] = useState([]);
  const [ultrasoundAppointments, setUltrasoundAppointments] = useState([]);
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);
  const [lmpDate, setLmpDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDateForNew, setSelectedDateForNew] = useState(null);

  const [appointmentsToView, setAppointmentsToView] = useState([]);
  const [isSingleViewModalOpen, setIsSingleViewModalOpen] = useState(false);
  const [isMultiViewModalOpen, setIsMultiViewModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setIsFormOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const appointmentsRef = collection(
          db,
          "users",
          currentUser.uid,
          "appointments",
        );
        const q = query(appointmentsRef, orderBy("date", "desc"));
        const unsubscribeAppointments = onSnapshot(q, (snapshot) => {
          const fetchedAppointments = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            type: "manual",
          }));
          setManualAppointments(fetchedAppointments);
        });

        const userDocRef = doc(db, "users", currentUser.uid);
        const unsubscribeUserDoc = onSnapshot(userDocRef, (docSnap) => {
          const userData = docSnap.exists() ? docSnap.data() : {};
          const estimatedLmp = getEstimatedLmp(userData);
          setLmpDate(estimatedLmp);

          if (estimatedLmp) {
            setDueDate(getDueDate(estimatedLmp));
          }

          // MODIFICADO: Acessa o ultrasoundSchedule de dentro do gestationalProfile
          const ultrasoundData =
            userData.gestationalProfile?.ultrasoundSchedule || {};
          const scheduledUltrasounds = ultrasoundSchedule.map((exam) => {
            const examData = ultrasoundData[exam.id] || {};
            return {
              ...exam,
              ...examData,
              date: examData.scheduledDate || null,
              isScheduled: !!examData.scheduledDate,
              done: !!examData.done,
            };
          });
          setUltrasoundAppointments(scheduledUltrasounds);
          setLoading(false);
        });

        return () => {
          unsubscribeAppointments();
          unsubscribeUserDoc();
        };
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (appointmentsToView.length === 1) {
      setIsSingleViewModalOpen(true);
    } else if (appointmentsToView.length > 1) {
      setIsMultiViewModalOpen(true);
    }
  }, [appointmentsToView]);

  const combinedAppointments = useMemo(
    () => [...manualAppointments, ...ultrasoundAppointments],
    [manualAppointments, ultrasoundAppointments],
  );

  const professionalSuggestions = useMemo(() => {
    const allProfessionals = combinedAppointments
      .map((app) => app.professional)
      .filter(Boolean);
    return [...new Set(allProfessionals)];
  }, [combinedAppointments]);

  const locationSuggestions = useMemo(() => {
    const allLocations = combinedAppointments
      .map((app) => app.location)
      .filter(Boolean);
    return [...new Set(allLocations)];
  }, [combinedAppointments]);

  const handleEdit = (appointment) => {
    setIsSingleViewModalOpen(false);
    setIsMultiViewModalOpen(false);
    setAppointmentsToView([]); // <-- ADICIONE ESTA LINHA
    setAppointmentToEdit(appointment);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleView = (appointments) => {
    setAppointmentsToView(appointments);
  };

  const handleCloseViewModals = () => {
    setIsSingleViewModalOpen(false);
    setIsMultiViewModalOpen(false);
    setAppointmentsToView([]);
  };

  const handleAddNew = (dateString = null) => {
    setAppointmentToEdit(dateString ? { date: dateString } : null);
    setIsFormOpen(true);
  };

  const handleDateSelect = (dateString) => {
    setSelectedDateForNew(dateString);
    setIsAddModalOpen(true);
  };

  const confirmAndOpenForm = () => {
    setIsAddModalOpen(false);
    handleAddNew(selectedDateForNew);
  };

  const handleCloseForm = () => {
    setAppointmentToEdit(null);
    setIsFormOpen(false);
  };

  const handleDeleteRequest = (appointment) => {
    setIsSingleViewModalOpen(false);
    setIsMultiViewModalOpen(false);
    setAppointmentToDelete(appointment);
    setIsDeleteModalOpen(true);
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
      setIsDeleteModalOpen(false);
      setAppointmentToDelete(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <SkeletonLoader type="fullPage" />
      </div>
    );
  }

  return (
    <>
      <AppointmentViewModal
        isOpen={isSingleViewModalOpen}
        onClose={handleCloseViewModals}
        appointment={appointmentsToView[0]}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />
      <AppointmentMultiViewModal
        isOpen={isMultiViewModalOpen}
        onClose={handleCloseViewModals}
        appointments={appointmentsToView}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />
      <ConfirmationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={confirmAndOpenForm}
        title="Nenhum Registro Encontrado"
        message={`Nenhum evento para o dia ${formattedDateForModal}. Deseja adicionar uma nova consulta?`}
        confirmButtonText="Adicionar Consulta"
        confirmButtonClass="bg-indigo-600 hover:bg-indigo-700"
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja apagar a consulta "${appointmentToDelete?.title || ""}"?`}
      />

      <div className="flex items-center justify-center flex-grow p-4">
        <div className="w-full max-w-3xl">
          <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400 mb-6 text-center">
            Registro de Consultas e Exames
          </h1>

          {isFormOpen ? (
            <AppointmentForm
              user={user}
              appointmentToEdit={appointmentToEdit}
              onFinish={handleCloseForm}
              professionalSuggestions={professionalSuggestions}
              locationSuggestions={locationSuggestions}
              lmpDate={lmpDate}
              dueDate={dueDate}
            />
          ) : (
            <div className="mb-6 text-center">
              <button
                onClick={() => handleAddNew()}
                className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
              >
                Adicionar Nova Consulta
              </button>
            </div>
          )}

          <AppointmentCalendar
            appointments={combinedAppointments}
            lmpDate={lmpDate}
            onDateSelect={handleDateSelect}
            onViewAppointment={handleView}
          />

          <AppointmentList
            appointments={combinedAppointments}
            onEdit={handleEdit}
            user={user}
            lmpDate={lmpDate}
          />

          <AppNavigation />
        </div>
      </div>
    </>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center flex-grow">
          <p className="text-lg text-rose-500 dark:text-rose-400">
            Carregando página...
          </p>
        </div>
      }
    >
      <AppointmentsPageContent />
    </Suspense>
  );
}
