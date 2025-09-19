// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import CalculadoraDUM from '@/components/CalculadoraDUM';
import CalculadoraUltrassom from '@/components/CalculadoraUltrassom';
import { weeklyInfo } from '@/data/weeklyInfo';
import CronogramaUltrassom from '@/components/CronogramaUltrassom';
import Login from '@/components/Login'; // Importa o novo componente

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCalculator, setActiveCalculator] = useState('dum');
  
  const [isEditing, setIsEditing] = useState(false);
  const [gestationalInfo, setGestationalInfo] = useState(null);
  const [estimatedLmp, setEstimatedLmp] = useState(null);
  const [dataSource, setDataSource] = useState('dum');
  const [countdown, setCountdown] = useState({ weeks: 0, days: 0 });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserData(currentUser.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    let lmpDate = null;

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.ultrasound && data.ultrasound.examDate) {
        const { examDate, weeksAtExam, daysAtExam } = data.ultrasound;
        const examDateTime = new Date(examDate).getTime();
        const daysAtExamTotal = (parseInt(weeksAtExam, 10) * 7) + (parseInt(daysAtExam, 10) || 0);
        lmpDate = new Date(examDateTime);
        lmpDate.setDate(lmpDate.getUTCDate() - daysAtExamTotal);
        setActiveCalculator('ultrassom');
        setDataSource('ultrassom');
      } else if (data.lmp) {
        lmpDate = new Date(data.lmp);
        setActiveCalculator('dum');
        setDataSource('dum');
      }
    }

    if (lmpDate) {
      setEstimatedLmp(lmpDate);
      calculateGestationalInfo(lmpDate);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };
  
  const calculateGestationalInfo = (lmpDate) => {
    const lmpDateTime = lmpDate.getTime();
    const today = new Date();
    const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const gestationalAgeInMs = todayTime - lmpDateTime;
    const gestationalAgeInDays = Math.floor(gestationalAgeInMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(gestationalAgeInDays / 7);
    const days = gestationalAgeInDays % 7;
    const dueDate = new Date(lmpDateTime);
    dueDate.setDate(dueDate.getDate() + 280);

    const totalPregnancyDays = 280;
    const remainingDaysTotal = totalPregnancyDays - gestationalAgeInDays;
    setCountdown({
        weeks: Math.floor(remainingDaysTotal / 7),
        days: remainingDaysTotal % 7,
    });

    setGestationalInfo({
        weeks, days,
        dueDate: dueDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        currentWeekInfo: weeklyInfo[weeks || 1] || "Informações para esta semana ainda não disponíveis.",
    });
  };

  const handleSaveSuccess = async () => {
      if(user) {
        await fetchUserData(user.uid);
      }
      setIsEditing(false);
  };

  if (loading) {
    return ( <div className="flex items-center justify-center flex-grow"> <p className="text-lg text-rose-500 dark:text-rose-400">Carregando...</p> </div> );
  }

  return (
    <div className="flex items-center justify-center flex-grow p-4">
      {!user ? (
        <Login /> // Usa o componente de Login
      ) : (
        <div className="w-full max-w-3xl">
          {gestationalInfo && (
            <div className="mb-6 animate-fade-in">
              <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">Sua Gestação</h2>
                      {!isEditing && (
                        <div className="flex items-center gap-4">
                          {dataSource === 'dum' && (
                            <button onClick={() => { setActiveCalculator('ultrassom'); setIsEditing(true); }} className="text-sm font-semibold text-green-600 dark:text-green-400 hover:underline">
                              Calcular por Ultrassom?
                            </button>
                          )}
                          <button onClick={() => setIsEditing(true)} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Alterar Dados</button>
                        </div>
                      )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                      <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg"> <p className="text-sm text-slate-500 dark:text-slate-400">Idade Gestacional</p> <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{gestationalInfo.weeks}s {gestationalInfo.days}d</p> </div>
                      <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg"> <p className="text-sm text-slate-500 dark:text-slate-400">Data Provável do Parto</p> <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{gestationalInfo.dueDate}</p> </div>
                  </div>
                  {!isEditing && (
                    <>
                      <div className="text-center p-6 mt-6 rounded-2xl bg-gradient-to-r from-rose-400 to-orange-300 text-white shadow-lg">
                        {countdown.weeks > 0 || countdown.days > 0 ? ( <> <p className="font-bold text-4xl drop-shadow-md">{countdown.weeks}s {countdown.days}d</p> <p className="font-semibold text-lg drop-shadow-md">para o grande dia!</p> </> ) : ( <p className="font-bold text-3xl drop-shadow-md">A qualquer momento! ❤️</p> )}
                      </div>
                      <div className="mt-6 bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 p-4 rounded-lg space-y-4">
                        <h3 className="text-xl font-bold text-center border-b border-rose-200 dark:border-rose-700 pb-2"> ✨ {gestationalInfo.currentWeekInfo.title} ✨ </h3>
                        <div> <h4 className="font-semibold">Bebê:</h4> <p className="text-sm">Tamanho aproximado de um(a) <span className="font-bold">{gestationalInfo.currentWeekInfo.size}</span>.</p> <p className="mt-1">{gestationalInfo.currentWeekInfo.baby}</p> </div>
                        <div> <h4 className="font-semibold">Mamãe:</h4> <p className="mt-1">{gestationalInfo.currentWeekInfo.mom}</p> </div>
                      </div>
                      <CronogramaUltrassom lmpDate={estimatedLmp} />
                    </>
                  )}
              </div>
            </div>
          )}

          {(isEditing || !gestationalInfo) && (
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl animate-fade-in">
              <div className="mb-6 flex border-b border-slate-200 dark:border-slate-700">
                <button onClick={() => setActiveCalculator('dum')} className={`py-2 px-4 text-lg font-semibold transition-colors ${activeCalculator === 'dum' ? 'border-b-2 border-rose-500 text-rose-500 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400 hover:text-rose-500'}`}>Calculadora DUM</button>
                <button onClick={() => setActiveCalculator('ultrassom')} className={`py-2 px-4 text-lg font-semibold transition-colors ${activeCalculator === 'ultrassom' ? 'border-b-2 border-rose-500 text-rose-500 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400 hover:text-rose-500'}`}>Calculadora Ultrassom</button>
              </div>
              {activeCalculator === 'dum' ? <CalculadoraDUM user={user} onSaveSuccess={handleSaveSuccess} onCancel={() => setIsEditing(false)} /> : <CalculadoraUltrassom user={user} onSaveSuccess={handleSaveSuccess} onCancel={() => setIsEditing(false)} />}
            </div>
          )}
          
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Link href="/contador-de-movimentos" className="block bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow text-center">
                  <h3 className="text-xl font-semibold text-rose-500 dark:text-rose-400">Contador de Movimentos</h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">Monitore os movimentos do seu bebê.</p>
              </Link>
              <Link href="/acompanhamento-de-peso" className="block bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow text-center">
                  <h3 className="text-xl font-semibold text-rose-500 dark:text-rose-400">Acompanhamento de Peso</h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">Registre seu peso e veja seu progresso.</p>
              </Link>
          </div>
        </div>
      )}
    </div>
  );
}