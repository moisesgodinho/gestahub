// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import CalculadoraDUM from '@/components/CalculadoraDUM';
import CalculadoraUltrassom from '@/components/CalculadoraUltrassom';

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
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('light');
  const [activeCalculator, setActiveCalculator] = useState('dum'); // 'dum' ou 'ultrassom'

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
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
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
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
      {/* O botão de tema foi MOVIDO daqui para o header do usuário logado */}

      <div className="flex items-center justify-center min-h-screen p-4">
        {!user ? (
          <div className="w-full max-w-md p-8 sm:p-10 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl text-center">
              {/* Adicionamos o botão de tema aqui também para a tela de login */}
              <div className="absolute top-4 right-4">
                <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
                  {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                </button>
              </div>
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
          <div className="w-full max-w-3xl">
            {/* --- CABEÇALHO ATUALIZADO --- */}
            <header className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
                Olá, <span className="text-rose-500 dark:text-rose-400">{user.displayName.split(' ')[0]}</span>!
              </h2>
              {/* Container para os botões da direita */}
              <div className="flex items-center gap-4">
                <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
                  {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleSignOut}
                  className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Sair
                </button>
              </div>
            </header>

            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
              <div className="mb-6 flex border-b border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setActiveCalculator('dum')}
                  className={`py-2 px-4 text-lg font-semibold transition-colors ${activeCalculator === 'dum' ? 'border-b-2 border-rose-500 text-rose-500 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400 hover:text-rose-500'}`}
                >
                  Calculadora DUM
                </button>
                <button
                  onClick={() => setActiveCalculator('ultrassom')}
                  className={`py-2 px-4 text-lg font-semibold transition-colors ${activeCalculator === 'ultrassom' ? 'border-b-2 border-rose-500 text-rose-500 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400 hover:text-rose-500'}`}
                >
                  Calculadora Ultrassom
                </button>
              </div>

              {activeCalculator === 'dum' ? <CalculadoraDUM user={user} /> : <CalculadoraUltrassom user={user} />}
            </div>
            
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Link href="/contador-de-chutes" className="block bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow text-center">
                    <h3 className="text-xl font-semibold text-rose-500 dark:text-rose-400">Contador de Chutes</h3>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Monitore os movimentos do seu bebê.</p>
                </Link>
                <Link href="/artigos" className="block bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow text-center">
                    <h3 className="text-xl font-semibold text-rose-500 dark:text-rose-400">Artigos e Dicas</h3>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Leia informações úteis sobre a gestação.</p>
                </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}