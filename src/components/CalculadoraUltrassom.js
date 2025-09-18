// src/components/CalculadoraUltrassom.js
'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { weeklyInfo } from '@/data/weeklyInfo';

// (As funções auxiliares de data permanecem as mesmas)
const parseDateString = (dateStr) => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
  const [day, month, year] = dateStr.split('/').map(Number);
  const dateObj = new Date(year, month - 1, day);
  if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
    return null;
  }
  return dateObj;
};
const formatDateForDisplay = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const year = dateObj.getUTCFullYear();
    return `${day}/${month}/${year}`;
}
const formatDateForInput = (dateStr) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return '';
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
};

export default function CalculadoraUltrassom({ user }) {
  // (O início do componente com states e useEffects permanece o mesmo)
  const [examDate, setExamDate] = useState('');
  const [weeksAtExam, setWeeksAtExam] = useState('');
  const [daysAtExam, setDaysAtExam] = useState('');
  const [gestationalInfo, setGestationalInfo] = useState(null);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(isMobileDevice);

    if (user) {
      const fetchExamData = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().ultrasound) {
          const { examDate, weeksAtExam, daysAtExam } = docSnap.data().ultrasound;
          const displayDate = formatDateForDisplay(examDate);
          setExamDate(displayDate);
          setWeeksAtExam(weeksAtExam);
          setDaysAtExam(daysAtExam || '');
          calculateFromUltrasound({ savedExamDate: parseDateString(displayDate), savedWeeks: weeksAtExam, savedDays: daysAtExam });
        }
      };
      fetchExamData();
    }
  }, [user]);

  const handleCalculateAndSave = async () => {
    const examDateObj = parseDateString(examDate);
    const result = calculateFromUltrasound({savedExamDate: examDateObj});
    
    if (result && user && examDateObj) {
      try {
        const ultrasoundData = {
          examDate: examDateObj.toISOString().split('T')[0],
          weeksAtExam,
          daysAtExam: daysAtExam || '0',
        };
        await setDoc(doc(db, 'users', user.uid), { ultrasound: ultrasoundData }, { merge: true });
      } catch (error) {
        console.error("Erro ao salvar dados do ultrassom:", error);
        setError("Não foi possível salvar os dados do exame.");
      }
    }
  };

  const calculateFromUltrasound = (savedData = {}) => {
    const dateObj = savedData.savedExamDate || parseDateString(examDate);
    const weeksValue = savedData.savedWeeks || weeksAtExam;
    const daysValue = savedData.savedDays || daysAtExam;

    if (!dateObj || !weeksValue) {
      setError('Por favor, preencha a data (DD/MM/AAAA) e as semanas.');
      setGestationalInfo(null);
      return false;
    }

    const examDateTime = dateObj.getTime();
    const today = new Date();
    const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    if (examDateTime > todayTime) {
        setError('A data do exame não pode ser no futuro.');
        setGestationalInfo(null);
        return false;
    }
    setError('');
    const weeks = parseInt(weeksValue, 10) || 0;
    const days = parseInt(daysValue, 10) || 0;
    const daysAtExamTotal = weeks * 7 + days;
    const estimatedLmp = new Date(examDateTime);
    estimatedLmp.setDate(estimatedLmp.getDate() - daysAtExamTotal);
    const estimatedLmpTime = estimatedLmp.getTime();
    const gestationalAgeInMs = todayTime - estimatedLmpTime;
    const gestationalAgeInDays = Math.floor(gestationalAgeInMs / (1000 * 60 * 60 * 24));
    const currentWeeks = Math.floor(gestationalAgeInDays / 7);
    const currentDays = gestationalAgeInDays % 7;
    const dueDate = new Date(estimatedLmpTime);
    dueDate.setDate(dueDate.getDate() + 280);

    setGestationalInfo({
        weeks: currentWeeks,
        days: currentDays,
        dueDate: dueDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        currentWeekInfo: weeklyInfo[currentWeeks || 1] || "Informações para esta semana ainda não disponíveis.",
    });
    return true;
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
  // (O restante do componente até a exibição das informações permanece o mesmo)
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="examDate" className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2">
          Data do Ultrassom
        </label>
        {isMobile ? (
          <input 
            type="date" 
            id="examDate" 
            value={formatDateForInput(examDate)}
            onChange={(e) => setExamDate(formatDateForDisplay(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-transparent dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
          />
        ) : (
          <input 
            type="text" 
            id="examDate" 
            value={examDate} 
            onChange={handleDateMask}
            placeholder="DD/MM/AAAA"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-transparent dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
          />
        )}
      </div>
      <div>
        <label className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2">
          Idade Gestacional no dia do exame
        </label>
        <div className="flex items-center gap-4">
          <input 
            type="number" 
            placeholder="Semanas"
            value={weeksAtExam}
            onChange={(e) => setWeeksAtExam(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-transparent dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <span className="text-slate-500 dark:text-slate-400">e</span>
          <input 
            type="number" 
            placeholder="Dias"
            value={daysAtExam}
            onChange={(e) => setDaysAtExam(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-transparent dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      <button 
        onClick={handleCalculateAndSave} 
        className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800"
      >
        {user ? 'Calcular e Salvar' : 'Calcular'}
      </button>
      {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

       {gestationalInfo && gestationalInfo.currentWeekInfo.title && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400">Idade Gestacional Atual</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{gestationalInfo.weeks}s {gestationalInfo.days}d</p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400">Data Provável do Parto</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{gestationalInfo.dueDate}</p>
            </div>
          </div>
          {/* --- CÓDIGO DE EXIBIÇÃO ATUALIZADO --- */}
           <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 p-4 rounded-lg space-y-4">
            <h3 className="text-xl font-bold text-center border-b border-rose-200 dark:border-rose-700 pb-2">
              ✨ {gestationalInfo.currentWeekInfo.title} ✨
            </h3>
            <div>
              <h4 className="font-semibold">Bebê:</h4>
              <p className="text-sm">Tamanho aproximado de um(a) <span className="font-bold">{gestationalInfo.currentWeekInfo.size}</span>.</p>
              <p className="mt-1">{gestationalInfo.currentWeekInfo.baby}</p>
            </div>
            <div>
              <h4 className="font-semibold">Mamãe:</h4>
              <p className="mt-1">{gestationalInfo.currentWeekInfo.mom}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}