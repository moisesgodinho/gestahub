// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { weeklyInfo } from '../data/weeklyInfo';

// Componentes de Ícone para o botão de tema
const SunIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lmp, setLmp] = useState('');
  const [gestationalInfo, setGestationalInfo] = useState(null);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('light');

  // Lógica para gerir o tema claro/escuro
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Lógica de Autenticação e Dados do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchLmp = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().lmp) {
          const savedLmp = docSnap.data().lmp;
          setLmp(savedLmp);
          calculateGestationalInfo(savedLmp);
        }
      };
      fetchLmp();
    } else {
      setLmp('');
      setGestationalInfo(null);
    }
  }, [user]);
  
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setError("Falha no login. Tente novamente.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setLmp('');
      setGestationalInfo(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };
  
  const calculateGestationalInfo = (lmpDate) => {
    if (!lmpDate) {
        setError('Por favor, insira uma data válida.');
        setGestationalInfo(null);
        return;
    }
    const lmpDateTime = new Date(lmpDate).getTime();
    const today = new Date();
    const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    
    if (lmpDateTime > todayTime) {
        setError('A data da última menstruação não pode ser no futuro.');
        setGestationalInfo(null);
        return;
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
  };

  const handleSaveLmp = async () => {
    if (user && lmp) {
      try {
        await setDoc(doc(db, 'users', user.uid), { lmp: lmp }, { merge: true });
        calculateGestationalInfo(lmp);
      } catch (error) {
        console.error("Erro ao salvar DUM:", error);
        setError("Não foi possível salvar a data.");
      }
    } else {
      calculateGestationalInfo(lmp);
    }
  };


  if (loading) {
    return (
        <main className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
          <p className="text-lg text-rose-500 dark:text-rose-400">Carregando...</p>
        </main>
    );
  }

  return (
    <main className="min-h-screen font-sans transition-colors duration-300 bg-gray-50 dark:bg-slate-900">
      <div className="absolute top-4 right-4">
        <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
          {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        {!user ? (
          // --- TELA DE LOGIN ---
          <div className="w-full max-w-md p-8 sm:p-10 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl text-center">
              <h1 className="text-5xl font-bold text-rose-500 dark:text-rose-400">GestaHub</h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">Sua jornada da maternidade, semana a semana.</p>
              <button
                onClick={handleSignIn}
                className="w-full bg-rose-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-rose-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-rose-300 dark:focus:ring-rose-800"
              >
                Entrar com Google
              </button>
          </div>
        ) : (
          // --- PAINEL PRINCIPAL (LOGADO) ---
          <div className="w-full max-w-3xl">
            <header className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
                Olá, <span className="text-rose-500 dark:text-rose-400">{user.displayName.split(' ')[0]}</span>!
              </h2>
              <button
                onClick={handleSignOut}
                className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Sair
              </button>
            </header>
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
              <div className="space-y-4">
                <div>
                  <label htmlFor="lmp" className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Qual foi a data da sua Última Menstruação (DUM)?
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="date" 
                      id="lmp" 
                      value={lmp} 
                      onChange={(e) => setLmp(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-transparent dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button 
                      onClick={handleSaveLmp} 
                      className="w-full sm:w-auto bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800"
                    >
                      Calcular
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
            </div>
          </div>
        )}
      </div>
    </main>
  );
}