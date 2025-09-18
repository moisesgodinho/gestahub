// src/app/acompanhamento-de-peso/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import ConfirmationModal from '@/components/ConfirmationModal';

// --- DADOS E FUNÇÕES AUXILIARES ---
const bmiCategories = [
  { category: 'Baixo Peso', range: '< 18.5', recommendation: '12.5 a 18 kg' },
  { category: 'Peso Adequado', range: '18.5 - 24.9', recommendation: '11.5 a 16 kg' },
  { category: 'Sobrepeso', range: '25.0 - 29.9', recommendation: '7 a 11.5 kg' },
  { category: 'Obesidade', range: '≥ 30.0', recommendation: '5 a 9 kg' },
];
const calculateBMI = (weight, height) => {
  if (!weight || !height) return 0;
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
};
const getBMICategory = (bmi) => {
  if (bmi < 18.5) return bmiCategories[0];
  if (bmi >= 18.5 && bmi <= 24.9) return bmiCategories[1];
  if (bmi >= 25 && bmi <= 29.9) return bmiCategories[2];
  if (bmi >= 30) return bmiCategories[3];
  return { range: 'N/A', category: '' };
};
const getTodayString = () => new Date().toISOString().split('T')[0];

const calculateGestationalAgeOnDate = (lmpDate, targetDate) => {
    if (!lmpDate || !targetDate) return '';
    const lmpTime = new Date(lmpDate).getTime();
    const targetTime = new Date(targetDate).getTime();
    const gestationalAgeInMs = targetTime - lmpTime;
    const gestationalAgeInDays = Math.floor(gestationalAgeInMs / (1000 * 60 * 60 * 24));
    if (gestationalAgeInDays < 0) return '';
    const weeks = Math.floor(gestationalAgeInDays / 7);
    const days = gestationalAgeInDays % 7;
    return `${weeks}s ${days}d`;
};

export default function WeightTrackerPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState('');
  const [prePregnancyWeight, setPrePregnancyWeight] = useState('');
  const [estimatedLmp, setEstimatedLmp] = useState(null);
  const [currentWeight, setCurrentWeight] = useState('');
  const [entryDate, setEntryDate] = useState(getTodayString());
  const [weightHistory, setWeightHistory] = useState([]);
  const [initialBmi, setInitialBmi] = useState(0);
  const [currentBmi, setCurrentBmi] = useState(0);
  const [currentGain, setCurrentGain] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserData(currentUser.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.ultrasound) {
        const { examDate, weeksAtExam, daysAtExam } = data.ultrasound;
        const examDateTime = new Date(examDate).getTime();
        const daysAtExamTotal = (parseInt(weeksAtExam, 10) * 7) + (parseInt(daysAtExam, 10) || 0);
        const lmp = new Date(examDateTime);
        lmp.setDate(lmp.getDate() - daysAtExamTotal);
        setEstimatedLmp(lmp);
      } else if (data.lmp) {
        setEstimatedLmp(new Date(data.lmp));
      }

      if (data.weightProfile) {
        const profile = data.weightProfile;
        const history = profile.history?.sort((a, b) => new Date(b.date) - new Date(a.date)) || [];
        setHeight(profile.height || '');
        setPrePregnancyWeight(profile.prePregnancyWeight || '');
        setWeightHistory(history);
        if (profile.height && profile.prePregnancyWeight) {
          updateCalculations(profile.prePregnancyWeight, profile.height, history);
        }
      }
    }
    setLoading(false);
  };
  
  const updateCalculations = (initialWeight, userHeight, history) => {
    const bmi = calculateBMI(initialWeight, userHeight);
    setInitialBmi(bmi);
    if (history && history.length > 0) {
      const latestEntry = [...history].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      setCurrentGain((latestEntry.weight - initialWeight).toFixed(2));
      setCurrentBmi(latestEntry.bmi);
    } else {
      setCurrentGain(0);
      setCurrentBmi(bmi);
    }
  };

  const handleSaveInitialData = async () => {
    if (!user || !height || !prePregnancyWeight) return;
    const profile = { height: parseFloat(height), prePregnancyWeight: parseFloat(prePregnancyWeight), history: [] }; // Sempre inicia com histórico vazio ao salvar dados novos
    try {
      await setDoc(doc(db, 'users', user.uid), { weightProfile: profile }, { merge: true });
      updateCalculations(profile.prePregnancyWeight, profile.height, profile.history);
      setWeightHistory([]); // Limpa o histórico local também
      alert('Dados iniciais salvos! O histórico anterior foi reiniciado.');
    } catch (error) {
      console.error("Erro ao salvar dados iniciais:", error);
    }
  };

  const handleAddWeight = async () => {
    if (!user || !currentWeight || !entryDate) return;
    const newEntry = { weight: parseFloat(currentWeight), date: entryDate, bmi: calculateBMI(currentWeight, height) };
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { weightProfile: { history: arrayUnion(newEntry) } }, { merge: true });
      const updatedHistory = [...weightHistory, newEntry];
      setWeightHistory(updatedHistory.sort((a, b) => new Date(b.date) - new Date(a.date)));
      updateCalculations(prePregnancyWeight, height, updatedHistory);
      setCurrentWeight('');
      setEntryDate(getTodayString());
    } catch (error) {
      console.error("Erro ao adicionar peso:", error);
    }
  };
  
  const openDeleteConfirmation = (entry) => {
    setEntryToDelete(entry);
    setIsModalOpen(true);
  };

  const confirmDeleteEntry = async () => {
    if (!user || !entryToDelete) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { "weightProfile.history": arrayRemove(entryToDelete) });
      const updatedHistory = weightHistory.filter(e => e.date !== entryToDelete.date || e.weight !== entryToDelete.weight);
      setWeightHistory(updatedHistory);
      updateCalculations(prePregnancyWeight, height, updatedHistory);
    } catch (error) {
      console.error("Erro ao apagar registro:", error);
      alert("Não foi possível apagar o registro. Tente novamente.");
    } finally {
      setIsModalOpen(false);
      setEntryToDelete(null);
    }
  };

  if (loading) {
    return <main className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900"><p className="text-lg text-rose-500 dark:text-rose-400">Carregando...</p></main>;
  }
  
  // A recomendação e a categoria para destaque são baseadas SEMPRE no IMC inicial.
  const recommendation = getBMICategory(initialBmi);
  const initialCategory = recommendation.category;

  return (
    <>
      <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmDeleteEntry} title="Confirmar Exclusão" message="Tem certeza que deseja apagar este registro de peso?"/>
      <main className="min-h-screen font-sans bg-gray-50 dark:bg-slate-900 p-4">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400 mb-6 text-center">Acompanhamento de Peso</h1>

          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mb-6">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Seus Dados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label htmlFor="height" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Altura (cm)</label><input type="number" id="height" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Ex: 165" className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"/></div>
              <div><label htmlFor="preWeight" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Peso Pré-Gestacional (kg)</label><input type="number" id="preWeight" value={prePregnancyWeight} onChange={(e) => setPrePregnancyWeight(e.target.value)} placeholder="Ex: 60.5" className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"/></div>
            </div>
            <button onClick={handleSaveInitialData} className="mt-4 w-full bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors">Salvar Dados Iniciais</button>
          </div>

          {prePregnancyWeight && height && (
            <>
              <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-6">
                  <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg"><p className="text-xs text-slate-500 dark:text-slate-400">IMC Inicial</p><p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{initialBmi}</p></div>
                  <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg"><p className="text-xs text-slate-500 dark:text-slate-400">IMC Atual</p><p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{currentBmi}</p></div>
                  <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg"><p className="text-xs text-slate-500 dark:text-slate-400">Ganho Total</p><p className="font-bold text-lg text-green-600 dark:text-green-400">{currentGain} kg</p></div>
                  <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg"><p className="text-xs text-slate-500 dark:text-slate-400">Meta</p><p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{recommendation.range}</p></div>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <label className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2">Adicionar novo registro de peso</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="number" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} placeholder="Peso em kg (Ex: 62.0)" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"/>
                    <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"/>
                    <button onClick={handleAddWeight} className="bg-rose-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-rose-600 transition-colors">Adicionar</button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mb-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">Recomendações de Ganho de Peso</h3>
                <div className="space-y-3">
                  {bmiCategories.map((item) => {
                    const isActive = item.category === initialCategory; // --- LÓGICA CORRIGIDA AQUI ---
                    return (
                      <div key={item.category} className={`p-4 rounded-lg transition-all ${isActive ? 'border-l-4 border-rose-500 bg-slate-100 dark:bg-slate-700/50' : 'bg-slate-50 dark:bg-slate-700/20'}`}>
                        <p className={`font-semibold ${isActive ? 'text-rose-500 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>{item.category} <span className="font-normal text-sm text-slate-500 dark:text-slate-400">(IMC {item.range})</span></p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Ganho de peso total recomendado: <strong>{item.recommendation}</strong></p>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {weightHistory.length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
                  <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">Histórico de Peso</h2>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {weightHistory.map((entry, index) => (
                      <div key={`${entry.date}-${index}`} className="flex items-center bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg">
                        <div className="flex-grow">
                          <p className="font-semibold text-slate-700 dark:text-slate-200">{new Date(entry.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                          {estimatedLmp && (<p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{calculateGestationalAgeOnDate(estimatedLmp, entry.date)}</p>)}
                        </div>
                        <div className="text-right mx-4">
                          <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{parseFloat(entry.weight).toFixed(1)} kg</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">IMC: {entry.bmi}</p>
                        </div>
                        <button onClick={() => openDeleteConfirmation(entry)} title="Apagar registro" className="p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="mt-8 text-center">
            <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Voltar para a página inicial
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}