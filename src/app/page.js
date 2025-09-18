// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import CalculadoraDUM from '@/components/CalculadoraDUM';
import CalculadoraUltrassom from '@/components/CalculadoraUltrassom';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCalculator, setActiveCalculator] = useState('dum');

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

  if (loading) {
    return (
        <div className="flex items-center justify-center flex-grow">
          <p className="text-lg text-rose-500 dark:text-rose-400">Carregando...</p>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center flex-grow p-4">
      {!user ? (
        <div className="w-full max-w-md p-8 sm:p-10 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl text-center">
            <h1 className="text-5xl font-bold text-rose-500 dark:text-rose-400">GestaHub</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Sua jornada da maternidade, semana a semana.</p>
            {error && <p className="text-red-500 text-sm my-2">{error}</p>}
            <button
              onClick={handleSignIn}
              className="w-full bg-rose-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-rose-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-rose-300 dark:focus:ring-rose-800"
            >
              Entrar com Google
            </button>
        </div>
      ) : (
        <div className="w-full max-w-3xl">
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
              {/* --- LINK ATUALIZADO AQUI --- */}
              <Link href="/contador-de-movimentos" className="block bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow text-center">
                  <h3 className="text-xl font-semibold text-rose-500 dark:text-rose-400">Contador de Movimentos</h3>
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
  );
}