// src/app/acompanhamento-de-peso/page.js
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import ConfirmationModal from '@/components/ConfirmationModal';
import { toast } from 'react-toastify';
import AppNavigation from '@/components/AppNavigation';
import WeightChart from '@/components/WeightChart';
import { getEstimatedLmp, getDueDate } from '@/lib/gestationalAge';
import { getTodayString, calculateGestationalAgeOnDate } from '@/lib/dateUtils';

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
  return { range: 'N/A', category: '', recommendation: 'N/A' };
};

export default function WeightTrackerPage() {
  // --- (Estados existentes) ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState('');
  const [prePregnancyWeight, setPrePregnancyWeight] = useState('');
  const [estimatedLmp, setEstimatedLmp] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [currentWeight, setCurrentWeight] = useState('');
  const [entryDate, setEntryDate] = useState(getTodayString());
  const [weightHistory, setWeightHistory] = useState([]);
  const [initialBmi, setInitialBmi] = useState(0);
  const [currentBmi, setCurrentBmi] = useState(0);
  const [currentGain, setCurrentGain] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false);

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
      const userData = docSnap.data();
      const lmpDate = getEstimatedLmp(userData); // Usa a função central

      if (lmpDate) {
        setEstimatedLmp(lmpDate);
        setDueDate(getDueDate(lmpDate)); // Usa a função central
      }

      if (userData.weightProfile) {
        const profile = userData.weightProfile;
        if (profile.height && profile.prePregnancyWeight) {
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
        const history = profile.history?.sort((a, b) => new Date(b.date) - new Date(a.date)) || [];
        setHeight(profile.height || '');
        setPrePregnancyWeight(profile.prePregnancyWeight || '');
        setWeightHistory(history);
        if (profile.height && profile.prePregnancyWeight) {
          updateCalculations(profile.prePregnancyWeight, profile.height, history);
        }
      } else {
        setIsEditing(true);
      }
    } else {
        setIsEditing(true);
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

  // NOVA FUNÇÃO handleWeightInput
  const handleWeightInput = (setter) => (e) => {
    // 1. Remove tudo que não for número
    let value = e.target.value.replace(/[^0-9]/g, '');

    // 2. Limita o total de dígitos a 5
    if (value.length > 5) {
        value = value.slice(0, 5);
    }

    let formattedValue = value;

    // 3. Aplica a formatação com ponto decimal baseada no tamanho
    if (value.length === 3) {
        // Ex: 655 -> 65.5
        formattedValue = value.slice(0, 2) + '.' + value.slice(2);
    } else if (value.length === 4) {
        // Ex: 6551 -> 65.51
        formattedValue = value.slice(0, 2) + '.' + value.slice(2);
    } else if (value.length === 5) {
        // Ex: 10255 -> 102.55
        formattedValue = value.slice(0, 3) + '.' + value.slice(3);
    }
    
    // 4. Atualiza o estado com o valor formatado
    setter(formattedValue);
  };


  const handleSaveInitialData = async () => {
    const parsedHeight = parseFloat(height);
    const parsedWeight = parseFloat(prePregnancyWeight);
    if (!user || !parsedHeight || !parsedWeight) { toast.warn('Preencha a altura e o peso corretamente.'); return; }
    if (parsedHeight <= 0 || parsedWeight <= 0) { toast.warn('Altura e peso devem ser valores positivos.'); return; }
    if (parsedHeight < 100 || parsedHeight > 250) { toast.warn('Por favor, insira uma altura realista (entre 100 e 250 cm).'); return; }
    if (parsedWeight < 30 || parsedWeight > 300) { toast.warn('Por favor, insira um peso realista (entre 30 e 300 kg).'); return; }

    const dataToUpdate = { height: parsedHeight, prePregnancyWeight: parsedWeight };
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { weightProfile: dataToUpdate }, { merge: true });
      updateCalculations(parsedWeight, parsedHeight, weightHistory);
      toast.success('Dados iniciais salvos com sucesso!');
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao salvar dados iniciais:", error);
      toast.error('Erro ao salvar dados.');
    }
  };

  const proceedWithSave = async () => {
    const parsedCurrentWeight = parseFloat(currentWeight);
    const newEntry = { weight: parsedCurrentWeight, date: entryDate, bmi: calculateBMI(parsedCurrentWeight, height) };
    
    const oldEntry = weightHistory.find(entry => entry.date === entryDate);
    const historyWithoutOldEntry = oldEntry ? weightHistory.filter(entry => entry.date !== entryDate) : weightHistory;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { weightProfile: { history: [...historyWithoutOldEntry, newEntry] } }, { merge: true });

      const updatedHistory = [...historyWithoutOldEntry, newEntry];
      setWeightHistory(updatedHistory.sort((a, b) => new Date(b.date) - new Date(a.date)));
      updateCalculations(prePregnancyWeight, height, updatedHistory);
      setCurrentWeight('');
      setEntryDate(getTodayString());
      toast.success(oldEntry ? "Registro de peso atualizado!" : "Peso adicionado ao histórico!");
    } catch (error) {
      console.error("Erro ao adicionar/atualizar peso:", error);
      toast.error("Erro ao salvar o registro.");
    }
  };

  const handleAddWeight = async () => {
    const parsedCurrentWeight = parseFloat(currentWeight);
    if (!user || !parsedCurrentWeight || !entryDate) { toast.warn("Preencha o peso e a data do registro."); return; }
    if (parsedCurrentWeight <= 0) { toast.warn('O peso deve ser um valor positivo.'); return; }
     if (parsedCurrentWeight < 30 || parsedCurrentWeight > 300) { toast.warn('Por favor, insira um peso realista (entre 30 e 300 kg).'); return; }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const selectedDate = new Date(entryDate + 'T00:00:00Z');

    if (selectedDate > today) {
      toast.warn("A data do registro não pode ser no futuro.");
      return;
    }

    if (estimatedLmp && selectedDate < estimatedLmp) {
      toast.warn("A data do registro não pode ser anterior ao início da gestação.");
      return;
    }
    
    if (weightHistory.some(entry => entry.date === entryDate)) {
      setIsOverwriteModalOpen(true);
      return;
    }

    await proceedWithSave();
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
      toast.info("Registro de peso removido.");
    } catch (error) {
      console.error("Erro ao apagar registro:", error);
      toast.error("Não foi possível apagar o registro.");
    } finally {
      setIsModalOpen(false);
      setEntryToDelete(null);
    }
  };

  if (loading) {
    return <main className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900"><p className="text-lg text-rose-500 dark:text-rose-400">Carregando...</p></main>;
  }
  
  const recommendation = getBMICategory(initialBmi);
  const initialCategory = recommendation.category;

  return (
    <>
      <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmDeleteEntry} title="Confirmar Exclusão" message="Tem certeza que deseja apagar este registro de peso?"/>
      
      <ConfirmationModal 
        isOpen={isOverwriteModalOpen} 
        onClose={() => setIsOverwriteModalOpen(false)} 
        onConfirm={async () => {
          setIsOverwriteModalOpen(false);
          await proceedWithSave();
        }}
        title="Substituir Registro?" 
        message="Já existe um registro para esta data. Deseja substituí-lo com o novo peso?"
        confirmButtonText="Substituir"
        confirmButtonClass="bg-indigo-600 hover:bg-indigo-700"
      />
      
      <div className="flex items-center justify-center flex-grow p-4">
        {/* ... (O restante do JSX da página permanece o mesmo) ... */}
        <div className="w-full max-w-3xl">
          <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400 mb-6 text-center">
            Acompanhamento de Peso
          </h1>

          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">Seus Dados Iniciais</h2>
              {!isEditing && prePregnancyWeight && height && (
                <button onClick={() => setIsEditing(true)} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Editar</button>
              )}
            </div>
            {isEditing ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label htmlFor="height" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Altura (cm)</label><input type="tel" id="height" value={height} onChange={(e) => setHeight(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Ex: 165" className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"/></div>
                  <div><label htmlFor="preWeight" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Peso Pré-Gestacional (kg)</label><input type="tel" id="preWeight" value={prePregnancyWeight} onChange={handleWeightInput(setPrePregnancyWeight)} placeholder="Ex: 60.50" className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"/></div>
                </div>
                <button onClick={handleSaveInitialData} className="mt-4 w-full bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors">Salvar Dados</button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg"><p className="text-xs text-slate-500 dark:text-slate-400">Altura</p><p className="font-bold text-lg text-slate-800 dark:text-slate-100">{height} cm</p></div>
                <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg"><p className="text-xs text-slate-500 dark:text-slate-400">Peso Inicial</p><p className="font-bold text-lg text-slate-800 dark:text-slate-100">{prePregnancyWeight} kg</p></div>
              </div>
            )}
          </div>

          {prePregnancyWeight && height && (
            <>
              <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-6">
                  <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg"><p className="text-xs text-slate-500 dark:text-slate-400">IMC Inicial</p><p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{initialBmi}</p></div>
                  <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg"><p className="text-xs text-slate-500 dark:text-slate-400">IMC Atual</p><p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{currentBmi}</p></div>
                  <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg"><p className="text-xs text-slate-500 dark:text-slate-400">Ganho Total</p><p className="font-bold text-lg text-green-600 dark:text-green-400">{currentGain} kg</p></div>
                  <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg"><p className="text-xs text-slate-500 dark:text-slate-400">Meta de Ganho</p><p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{recommendation.recommendation}</p></div>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <label className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2">Adicionar novo registro de peso</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="tel" value={currentWeight} onChange={handleWeightInput(setCurrentWeight)} placeholder="Peso em kg (Ex: 62.50)" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"/>
                    <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"/>
                    <button onClick={handleAddWeight} className="bg-rose-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-rose-600 transition-colors">Adicionar</button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mb-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2 text-center">Recomendações de Ganho de Peso</h3>
                <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-4">A meta de ganho de peso é baseada no seu IMC pré-gestacional.</p>
                <div className="space-y-3">
                  {bmiCategories.map((item) => {
                    const isActive = item.category === initialCategory;
                    return (
                      <div key={item.category} className={`p-4 rounded-lg transition-all ${isActive ? 'border-l-4 border-rose-500 bg-slate-100 dark:bg-slate-700/50' : 'bg-slate-50 dark:bg-slate-700/20'}`}>
                        <p className={`font-semibold ${isActive ? 'text-rose-500 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>{item.category} <span className="font-normal text-sm text-slate-500 dark:text-slate-400">(IMC {item.range})</span></p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Ganho de peso total recomendado: <strong>{item.recommendation}</strong></p>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {prePregnancyWeight && weightHistory.length > 0 && (
                <WeightChart 
                  history={weightHistory} 
                  prePregnancyWeight={prePregnancyWeight} 
                  dueDate={dueDate}
                />
              )}

              {weightHistory.length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
                  <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">Histórico de Peso</h2>
                  <div className="space-y-2">
                    {weightHistory.map((entry, index) => (
                      <div key={`${entry.date}-${index}`} className="flex items-center bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg">
                        <div className="flex-grow">
                          <p className="font-semibold text-slate-700 dark:text-slate-200">{new Date(entry.date + 'T00:00:00Z').toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
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
            <AppNavigation />
          </div>
        </div>
      </div>
    </>
  );
}