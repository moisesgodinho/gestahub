// src/components/AppointmentForm.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { appointmentTypes } from '@/data/appointmentData';

const getTodayString = () => new Date().toISOString().split('T')[0];

export default function AppointmentForm({ user, appointmentToEdit, onSave, professionalSuggestions, locationSuggestions }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [time, setTime] = useState('');
  const [professional, setProfessional] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (appointmentToEdit) {
      setTitle(appointmentToEdit.title);
      setDate(appointmentToEdit.date);
      setTime(appointmentToEdit.time || '');
      setProfessional(appointmentToEdit.professional || '');
      setLocation(appointmentToEdit.location || '');
      setNotes(appointmentToEdit.notes || '');
    }
  }, [appointmentToEdit]);

  const resetForm = () => {
    setTitle('');
    setDate(getTodayString());
    setTime('');
    setProfessional('');
    setLocation('');
    setNotes('');
    onSave();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!title || !date) {
      toast.warn('Por favor, preencha o título e a data da consulta.');
      return;
    }

    const appointmentData = { title, date, time, professional, location, notes };

    try {
      if (appointmentToEdit) {
        const appointmentRef = doc(db, 'users', user.uid, 'appointments', appointmentToEdit.id);
        await setDoc(appointmentRef, appointmentData);
        toast.success('Consulta atualizada com sucesso!');
      } else {
        const appointmentsRef = collection(db, 'users', user.uid, 'appointments');
        await addDoc(appointmentsRef, appointmentData);
        toast.success('Consulta adicionada com sucesso!');
      }
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar consulta:', error);
      toast.error('Não foi possível salvar a consulta.');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mb-6">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
        {appointmentToEdit ? 'Editar Consulta' : 'Adicionar Nova Consulta'}
      </h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Título*</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Ultrassom Morfológico" className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"/>
          <div className="flex flex-wrap gap-2 mt-2">
            {appointmentTypes.map(type => (
              <button 
                key={type} 
                type="button" 
                onClick={() => setTitle(type)} 
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  title === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data*</label>
            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"/>
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Horário</label>
            <input type="time" id="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"/>
          </div>
        </div>
        <div>
          <label htmlFor="professional" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Profissional/Laboratório</label>
          <input type="text" id="professional" value={professional} onChange={(e) => setProfessional(e.target.value)} placeholder="Ex: Dr. Nome Sobrenome" list="professional-suggestions" className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"/>
          <datalist id="professional-suggestions">
            {professionalSuggestions?.map(item => <option key={item} value={item} />)}
          </datalist>
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Local</label>
          <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: Clínica Bem Nascer, Sala 10" list="location-suggestions" className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"/>
          <datalist id="location-suggestions">
            {locationSuggestions?.map(item => <option key={item} value={item} />)}
          </datalist>
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Anotações</label>
          <textarea id="notes" rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Dúvidas para perguntar, resultados de exames..." className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"></textarea>
        </div>
        <div className="flex justify-end gap-4">
          {appointmentToEdit && (
            <button type="button" onClick={resetForm} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600">
              Cancelar Edição
            </button>
          )}
          <button type="submit" className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
            {appointmentToEdit ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}