// src/app/consultas/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { getEstimatedLmp } from '@/lib/gestationalAge';
import AppNavigation from '@/components/AppNavigation';
import AppointmentForm from '@/components/AppointmentForm';
import AppointmentList from '@/components/AppointmentList';

const ultrasoundSchedule = [
  { id: 'transvaginal', name: '1º Ultrassom (Transvaginal)', startWeek: 8, endWeek: 11, type: 'ultrasound' },
  { id: 'morfologico_1', name: '2º Ultrassom (Morfológico 1º Trimestre)', startWeek: 12, endWeek: 14, type: 'ultrasound' },
  { id: 'morfologico_2', name: '3º Ultrassom (Morfológico 2º Trimestre)', startWeek: 22, endWeek: 24, type: 'ultrasound' },
  { id: 'ecocardiograma', name: '4º Ultrassom (Ecocardiograma Fetal)', startWeek: 26, endWeek: 28, type: 'ultrasound' },
  { id: 'doppler_3', name: '5º Ultrassom (3º Trimestre com Doppler)', startWeek: 28, endWeek: 36, type: 'ultrasound' },
];

export default function AppointmentsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualAppointments, setManualAppointments] = useState([]);
  const [ultrasoundAppointments, setUltrasoundAppointments] = useState([]);
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);
  const [lmpDate, setLmpDate] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Listener para consultas manuais
        const appointmentsRef = collection(db, 'users', currentUser.uid, 'appointments');
        const q = query(appointmentsRef, orderBy('date', 'desc'));
        const unsubscribeAppointments = onSnapshot(q, (snapshot) => {
          const fetchedAppointments = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'manual' }));
          setManualAppointments(fetchedAppointments);
        });

        // Listener para o documento do usuário (para ultrassons)
        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubscribeUserDoc = onSnapshot(userDocRef, (docSnap) => {
          const userData = docSnap.exists() ? docSnap.data() : {};
          const estimatedLmp = getEstimatedLmp(userData);
          setLmpDate(estimatedLmp);
          const ultrasoundData = userData.ultrasoundSchedule || {};

          // CORREÇÃO: Gera a lista de ultrassons mesmo sem DUM
          const scheduledUltrasounds = ultrasoundSchedule.map(exam => {
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

  const combinedAppointments = useMemo(() => [...manualAppointments, ...ultrasoundAppointments], [manualAppointments, ultrasoundAppointments]);

  const professionalSuggestions = useMemo(() => {
    const allProfessionals = combinedAppointments.map(app => app.professional).filter(Boolean);
    return [...new Set(allProfessionals)];
  }, [combinedAppointments]);

  const locationSuggestions = useMemo(() => {
    const allLocations = combinedAppointments.map(app => app.location).filter(Boolean);
    return [...new Set(allLocations)];
  }, [combinedAppointments]);

  const handleEdit = (appointment) => {
    setAppointmentToEdit(appointment);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishEditing = () => {
    setAppointmentToEdit(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center flex-grow"><p className="text-lg text-rose-500 dark:text-rose-400">Carregando...</p></div>;
  }

  return (
    <div className="flex items-center justify-center flex-grow p-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400 mb-6 text-center">
          Registro de Consultas e Exames
        </h1>
        
        <AppointmentForm 
          user={user}
          appointmentToEdit={appointmentToEdit}
          onSave={handleFinishEditing}
          professionalSuggestions={professionalSuggestions}
          locationSuggestions={locationSuggestions}
          lmpDate={lmpDate}
        />
        
        <AppointmentList 
          appointments={combinedAppointments}
          onEdit={handleEdit}
          user={user}
        />
        
        <AppNavigation />
      </div>
    </div>
  );
}