// src/app/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import CalculadoraDUM from "@/components/CalculadoraDUM";
import CalculadoraUltrassom from "@/components/CalculadoraUltrassom";

// --- ILUSTRAÇÃO FINAL E CORRIGIDA ---
const FetusIllustration = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 300 300"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    {/* Barriga da mãe (silhueta externa) */}
    <path
      d="M150 50 
       C220 70, 260 140, 240 200 
       C220 260, 150 280, 90 250 
       C40 220, 40 140, 100 90 
       C120 70, 130 60, 150 50Z"
      fill="#FFE6E6"
      stroke="#FFB6B6"
    />

    {/* Círculo interno representando o útero */}
    <circle cx="150" cy="160" r="70" fill="#FFF5F5" stroke="#FF9999" />

    {/* Feto estilizado */}
    <g transform="translate(150, 160)">
      {/* Cabeça */}
      <circle cx="0" cy="-25" r="20" fill="#FFB6B6" />

      {/* Corpo curvado */}
      <path
        d="M0,-5 
         C-20,10, -20,40, 0,45 
         C20,40, 20,10, 0,-5Z"
        fill="#FFB6B6"
      />

      {/* Braço */}
      <path
        d="M-15,-10 
         C-30,0, -20,15, -5,10"
        stroke="#FF9999"
        strokeWidth="3"
        fill="none"
      />

      {/* Perna */}
      <path
        d="M10,30 
         C20,40, 10,55, -5,50"
        stroke="#FF9999"
        strokeWidth="3"
        fill="none"
      />
    </g>
  </svg>
);

// Ícone de check para a lista de benefícios
const CheckIcon = () => (
  <svg
    className="w-5 h-5 text-rose-500 flex-shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCalculator, setActiveCalculator] = useState("dum");

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
        <p className="text-lg text-rose-500 dark:text-rose-400">
          Carregando...
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center flex-grow p-4">
      {!user ? (
        <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden animate-fade-in">
          {/* Lado Esquerdo: Ilustração */}
          <div className="w-full md:w-1/2 bg-rose-50 dark:bg-slate-900/50 p-8 flex-col gap-4 items-center justify-center hidden md:flex">
            <h1 className="text-5xl font-bold text-rose-500 dark:text-rose-400 text-center">
              GestaHub
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg text-center">
              Sua jornada da maternidade, semana a semana.
            </p>
            <FetusIllustration className="w-64 h-64 text-rose-300 dark:text-rose-500 opacity-80 dark:opacity-60" />
          </div>

          {/* Lado Direito: Informações e Ação */}
          <div className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
              Bem-vinda!
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Acompanhe sua gravidez com ferramentas feitas para você.
            </p>

            <ul className="mt-6 space-y-3 text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-3">
                <CheckIcon />{" "}
                <span>Calculadoras precisas (DUM e Ultrassom)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon />{" "}
                <span>Contador de Movimentos com histórico salvo</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon /> <span>Cronograma de exames importantes</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon />{" "}
                <span>Informações semanais sobre você e seu bebê</span>
              </li>
            </ul>

            {error && (
              <p className="text-red-500 text-sm my-4 text-center">{error}</p>
            )}

            <button
              onClick={handleSignIn}
              className="mt-8 w-full bg-rose-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-rose-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-rose-300 dark:focus:ring-rose-800 flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
              </svg>
              Entrar com Google
            </button>
          </div>
        </div>
      ) : (
        // --- PAINEL PRINCIPAL (LOGADO) ---
        <div className="w-full max-w-3xl">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
            <div className="mb-6 flex border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveCalculator("dum")}
                className={`py-2 px-4 text-lg font-semibold transition-colors ${
                  activeCalculator === "dum"
                    ? "border-b-2 border-rose-500 text-rose-500 dark:text-rose-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-rose-500"
                }`}
              >
                Calculadora DUM
              </button>
              <button
                onClick={() => setActiveCalculator("ultrassom")}
                className={`py-2 px-4 text-lg font-semibold transition-colors ${
                  activeCalculator === "ultrassom"
                    ? "border-b-2 border-rose-500 text-rose-500 dark:text-rose-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-rose-500"
                }`}
              >
                Calculadora Ultrassom
              </button>
            </div>
            {activeCalculator === "dum" ? (
              <CalculadoraDUM user={user} />
            ) : (
              <CalculadoraUltrassom user={user} />
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link
              href="/contador-de-movimentos"
              className="block bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow text-center"
            >
              <h3 className="text-xl font-semibold text-rose-500 dark:text-rose-400">
                Contador de Movimentos
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Monitore os movimentos do seu bebê.
              </p>
            </Link>
            <Link
              href="/artigos"
              className="block bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow text-center"
            >
              <h3 className="text-xl font-semibold text-rose-500 dark:text-rose-400">
                Artigos e Dicas
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Leia informações úteis sobre a gestação.
              </p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
