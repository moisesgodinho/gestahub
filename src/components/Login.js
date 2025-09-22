// src/components/Login.js
'use client';

import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import Image from 'next/image';

// Ícone de check
const CheckIcon = () => (
  <svg className="w-5 h-5 text-rose-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default function Login() {
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setError("Falha no login. Tente novamente.");
    }
  };

  return (
    // MODIFICADO: Alterado de 'max-w-4xl' para 'max-w-3xl' para alinhar com o restante do site
    <div className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden animate-fade-in">
      <div className="w-full md:w-1/2 bg-rose-50 dark:bg-slate-900/50 p-8 flex-col gap-4 items-center justify-center flex">
         <h1 className="text-5xl font-bold text-rose-500 dark:text-rose-400 text-center">GestaHub</h1>
         <p className="text-slate-600 dark:text-slate-400 text-lg text-center">Sua jornada da maternidade semana a semana.</p>
         
         <Image
            src="/login.png"
            alt="Ilustração da jornada da maternidade"
            width={512}
            height={512}
            className="w-64 h-64 opacity-80 dark:opacity-60"
            unoptimized={true}
         />
      </div>
      <div className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200"> Bem-vinda! </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400"> Acompanhe sua gravidez com ferramentas feitas para você. </p>
        <ul className="mt-6 space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-3"><CheckIcon /> <span>Calculadoras precisas (DUM e Ultrassom)</span></li>
          <li className="flex items-start gap-3"><CheckIcon /> <span>Diário de Sintomas e Humor</span></li>
          <li className="flex items-start gap-3"><CheckIcon /> <span>Acompanhamento de Peso</span></li>
          <li className="flex items-start gap-3"><CheckIcon /> <span>Contador de Movimentos com histórico salvo</span></li>
          <li className="flex items-start gap-3"><CheckIcon /> <span>Cronômetro de Contrações</span></li>
          <li className="flex items-start gap-3"><CheckIcon /> <span>Cronograma de exames importantes</span></li>
          <li className="flex items-start gap-3"><CheckIcon /> <span>Informações semanais sobre você e seu bebê</span></li>
        </ul>
        {error && <p className="text-red-500 text-sm my-4 text-center">{error}</p>}
        <button onClick={handleSignIn} className="mt-8 w-full bg-rose-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-rose-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-rose-300 dark:focus:ring-rose-800 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"> <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/> </svg>
            Entrar com Google
        </button>
      </div>
    </div>
  );
}