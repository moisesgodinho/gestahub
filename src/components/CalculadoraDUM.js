// src/components/CalculadoraDUM.js
'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { weeklyInfo } from '@/data/weeklyInfo';

// Função para converter DD/MM/AAAA para um objeto Date
const parseDateString = (dateStr) => {
  // Verifica se o formato é DD/MM/AAAA
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;

  const [day, month, year] = dateStr.split('/').map(Number);
  // O mês no objeto Date é baseado em zero (0-11), então subtraímos 1
  const dateObj = new Date(year, month - 1, day);

  // Validação para datas inválidas como 31/02/2025
  if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
    return null;
  }

  return dateObj;
};

// Função para formatar um objeto Date ou string 'AAAA-MM-DD' para DD/MM/AAAA
const formatDateForDisplay = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    // Adiciona 1 ao mês pois getMonth() é base 0
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const year = dateObj.getUTCFullYear();
    return `${day}/${month}/${year}`;
}

export default function CalculadoraDUM({ user }) {
  const [lmp, setLmp] = useState(''); // Agora armazena no formato DD/MM/AAAA
  const [gestationalInfo, setGestationalInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      const fetchLmp = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().lmp) {
          const savedLmp = docSnap.data().lmp; // Vem como 'AAAA-MM-DD' do Firestore
          const displayDate = formatDateForDisplay(savedLmp);
          setLmp(displayDate);
          calculateGestationalInfo(parseDateString(displayDate));
        }
      };
      fetchLmp();
    }
  }, [user]);

  const calculateGestationalInfo = (lmpDateObj) => {
    if (!lmpDateObj) {
      setError('Por favor, insira uma data válida no formato DD/MM/AAAA.');
      setGestationalInfo(null);
      return false; // Indica falha
    }
    const lmpDateTime = lmpDateObj.getTime();
    const today = new Date();
    const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    
    if (lmpDateTime > todayTime) {
        setError('A data da última menstruação não pode ser no futuro.');
        setGestationalInfo(null);
        return false; // Indica falha
    }

    setError('');
    const gestationalAgeInMs = todayTime - lmpDateTime;
    const gestationalAgeInDays = Math.floor(gestationalAgeInMs / (1000 * 60 * 60 * 24));
    
    const weeks = Math.floor(gestationalAgeInDays / 7);
    const days = gestationalAgeInDays % 7;

    const dueDate = new Date(lmpDateTime);
    dueDate.setDate(dueDate.getDate() + 280);

    setGestationalInfo({
        weeks,
        days,
        dueDate: dueDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        currentWeekInfo: weeklyInfo[weeks + 1] || "Informações para esta semana ainda não disponíveis.",
    });
    return true; // Indica sucesso
  };

  const handleCalculateAndSave = async () => {
    const lmpDateObj = parseDateString(lmp);
    const success = calculateGestationalInfo(lmpDateObj);

    if (success && user && lmpDateObj) {
      try {
        // Salva a data no formato padrão 'AAAA-MM-DD' para consistência
        const dateToSave = lmpDateObj.toISOString().split('T')[0];
        await setDoc(doc(db, 'users', user.uid), { lmp: dateToSave }, { merge: true });
      } catch (error) {
        console.error("Erro ao salvar DUM:", error);
        setError("Não foi possível salvar a data.");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="lmp" className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2">
          Qual foi a data da sua Última Menstruação (DUM)?
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            id="lmp" 
            value={lmp} 
            onChange={(e) => setLmp(e.target.value)}
            placeholder="DD/MM/AAAA"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-transparent dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button 
            onClick={handleCalculateAndSave} 
            className="w-full sm:w-auto bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800"
          >
            {user ? 'Calcular e Salvar' : 'Calcular'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {gestationalInfo && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400">Idade Gestacional</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{gestationalInfo.weeks}s {gestationalInfo.days}d</p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400">Data Provável do Parto</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{gestationalInfo.dueDate}</p>
            </div>
          </div>
          <div className="bg-rose-50 dark:bg-rose-900/30 border-l-4 border-rose-500 dark:border-rose-400 text-rose-800 dark:text-rose-200 p-4 rounded-r-lg">
            <h4 className="font-bold">✨ Nesta semana:</h4>
            <p>{gestationalInfo.currentWeekInfo}</p>
          </div>
        </div>
      )}
    </div>
  );
}