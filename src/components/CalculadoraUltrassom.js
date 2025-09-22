// src/components/CalculadoraUltrassom.js
'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';
import { parseDateString, formatDateForDisplay, formatDateForInput } from '@/lib/dateUtils';

export default function CalculadoraUltrassom({ user, onSaveSuccess, onCancel }) {
  const [examDate, setExamDate] = useState('');
  const [weeksAtExam, setWeeksAtExam] = useState('');
  const [daysAtExam, setDaysAtExam] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(isMobileDevice);

    if (user) {
      const fetchExamData = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        // MODIFICADO: Busca os dados de ultrassom de dentro do gestationalProfile
        if (docSnap.exists() && docSnap.data().gestationalProfile?.ultrasound) {
          const { examDate, weeksAtExam, daysAtExam } = docSnap.data().gestationalProfile.ultrasound;
          const displayDate = formatDateForDisplay(examDate);
          setExamDate(displayDate);
          setWeeksAtExam(weeksAtExam);
          setDaysAtExam(daysAtExam || '');
        }
      };
      fetchExamData();
    }
  }, [user]);

  const handleSave = async () => {
    const examDateObj = parseDateString(examDate);
    const weeksValue = parseInt(weeksAtExam, 10);
    const daysValue = parseInt(daysAtExam, 10) || 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!examDateObj || !weeksAtExam) {
      toast.warn("Preencha a data e as semanas do ultrassom.");
      return;
    }
    if (examDateObj.getTime() > today.getTime()) {
        toast.warn("A data do exame não pode ser no futuro.");
        return;
    }
    if (weeksValue < 0 || weeksValue > 42) {
      toast.warn("O número de semanas deve ser entre 0 e 42.");
      return;
    }
    if (daysValue < 0 || daysValue > 6) {
      toast.warn("O número de dias deve ser entre 0 e 6.");
      return;
    }

    const daysSinceExam = Math.floor((today.getTime() - examDateObj.getTime()) / (1000 * 60 * 60 * 24));
    const currentGestationalAgeInDays = (weeksValue * 7) + daysValue + daysSinceExam;

    if (currentGestationalAgeInDays > 294) { // 42 semanas
        toast.warn("A data do exame informada, somada aos dias atuais, ultrapassa 42 semanas de gestação.");
        return;
    }
    
    if (user && examDateObj) {
      try {
        const ultrasoundData = {
          examDate: examDateObj.toISOString().split('T')[0],
          weeksAtExam,
          daysAtExam: daysAtExam || '0',
        };
        // MODIFICADO: Salva os dados de ultrassom dentro de gestationalProfile
        const data = { gestationalProfile: { ultrasound: ultrasoundData } };
        await setDoc(doc(db, 'users', user.uid), data, { merge: true });
        toast.success("Dados do ultrassom salvos!");
        if (onSaveSuccess) onSaveSuccess();
      } catch (error) {
        console.error("Erro ao salvar dados do ultrassom:", error);
        toast.error("Não foi possível salvar os dados.");
      }
    }
  };

  const handleDateMask = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length > 4) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    } else if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setExamDate(value);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="examDate" className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2">
          Data do Ultrassom
        </label>
        {isMobile ? ( <input type="date" id="examDate" value={formatDateForInput(examDate)} onChange={(e) => setExamDate(formatDateForDisplay(e.target.value))} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-transparent dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500" /> ) : ( <input type="text" id="examDate" value={examDate} onChange={handleDateMask} placeholder="DD/MM/AAAA" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-transparent dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500" /> )}
      </div>
      <div>
        <label className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2">
          Idade Gestacional no dia do exame
        </label>
        <div className="flex items-center gap-4">
          <input type="number" placeholder="Semanas" value={weeksAtExam} onChange={(e) => setWeeksAtExam(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-transparent dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500" />
          <span className="text-slate-500 dark:text-slate-400">e</span>
          <input type="number" placeholder="Dias" value={daysAtExam} onChange={(e) => setDaysAtExam(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-transparent dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-200 dark:border-slate-700 pt-4">
        <button onClick={onCancel} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
            Cancelar
        </button>
        <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">
            Salvar
        </button>
      </div>
    </div>
  );
}