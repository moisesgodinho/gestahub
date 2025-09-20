// src/components/CompletionCelebration.js
'use client';

import React, { useMemo } from 'react'; // Importe o useMemo

// Componente para um único confete
const ConfettiPiece = ({ style }) => (
  <div className="absolute w-2 h-4" style={style}></div>
);

export default function CompletionCelebration({ onClose }) {
  // useMemo garante que os confetes sejam gerados apenas uma vez
  const confetti = useMemo(() => 
    Array.from({ length: 100 }).map((_, i) => {
      const style = {
        left: `${Math.random() * 100}%`,
        backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
        animation: `fall ${3 + Math.random() * 4}s ${Math.random() * 2}s linear forwards, rotate ${0.5 + Math.random()}s ${Math.random() * 2}s infinite ease-in-out`,
        opacity: 0,
      };
      return <ConfettiPiece key={i} style={style} />;
    }), 
  []); // O array vazio [] significa que isso só será executado na primeira renderização

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in-fast">
      <div className="absolute inset-0 overflow-hidden">
        {confetti}
      </div>
      
      <div className="relative bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-sm m-4 text-center transform animate-pop-in">
        <h3 className="text-3xl font-bold text-rose-500 dark:text-rose-400">
          Parabéns!
        </h3>
        <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg">
          Você concluiu o cronograma de ultrassons importantes. Uma grande etapa vencida na sua jornada!
        </p>
        <button
          onClick={onClose}
          className="mt-8 px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}