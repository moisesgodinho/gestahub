// src/components/CalculadoraDUM.js
'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';

// Funções auxiliares de data
const parseDateString = (dateStr) => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
  const [day, month, year] = dateStr.split('/').map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day)); // Usar UTC na criação
  if (dateObj.getUTCFullYear() !== year || dateObj.getUTCMonth() !== month - 1 || dateObj.getUTCDate() !== day) {
    return null;
  }
  return dateObj;
};

// CORREÇÃO: Padronizando a função de formatação
const formatDateForDisplay = (date) => {
    if (!date) return '';
    // Adiciona T00:00:00Z para garantir que seja interpretado como UTC
    const dateObj = new Date(date + 'T00:00:00Z');
    return dateObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

const formatDateForInput = (dateStr) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return '';
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
};

export default function CalculadoraDUM({ user, onSaveSuccess, onCancel }) {
  const [lmp, setLmp] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(isMobileDevice);

    if (user) {
      const fetchLmp = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().lmp) {
          const savedLmp = docSnap.data().lmp;
          setLmp(formatDateForDisplay(savedLmp));
        }
      };
      fetchLmp();
    }
  }, [user]);

  const handleSave = async () => {
    const dateObject = parseDateString(lmp);
    if (!dateObject) {
      toast.warn("Por favor, insira uma data válida no formato DD/MM/AAAA.");
      return;
    }
    
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    if (dateObject.getTime() > todayUTC.getTime()) {
      toast.warn('A data não pode ser no futuro.');
      return;
    }

    const gestationalAgeInDays = Math.floor((todayUTC.getTime() - dateObject.getTime()) / (1000 * 60 * 60 * 24));
    if (gestationalAgeInDays > 294) { // 42 semanas
      toast.warn('A data informada resulta em mais de 42 semanas de gestação.');
      return;
    }

    if (user && dateObject) {
      try {
        const dateToSave = dateObject.toISOString().split('T')[0];
        await setDoc(doc(db, 'users', user.uid), { lmp: dateToSave }, { merge: true });
        toast.success("Data salva com sucesso!");
        if (onSaveSuccess) onSaveSuccess();
      } catch (error) {
        console.error("Erro ao salvar DUM:", error);
        toast.error("Não foi possível salvar a data.");
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
    setLmp(value);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="lmp" className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2">
          Qual foi a data da sua Última Menstruação (DUM)?
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          {isMobile ? ( <input type="date" id="lmp" value={formatDateForInput(lmp)} onChange={(e) => { setLmp(formatDateForDisplay(e.target.value)); }} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-transparent dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500" /> ) : ( <input type="text" id="lmp" value={lmp} onChange={handleDateMask} placeholder="DD/MM/AAAA" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-transparent dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500" /> )}
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