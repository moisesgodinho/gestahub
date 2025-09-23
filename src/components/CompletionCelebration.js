// src/components/CompletionCelebration.js
"use client";

import React, { useMemo } from "react";

// Componente para um único confete
const ConfettiPiece = ({ style }) => (
  <div className="absolute w-2 h-4" style={style}></div>
);

export default function CompletionCelebration({ onClose }) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 200 }).map((_, i) => {
        const angle = Math.random() * 360;
        const distance = 150 + Math.random() * 250;

        const tx = Math.cos(angle * (Math.PI / 180)) * distance;
        const ty = Math.sin(angle * (Math.PI / 180)) * distance;

        const style = {
          top: "50%",
          left: "50%",
          backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
          "--tx": `${tx}px`,
          "--ty": `${ty}px`,
          "--r": `${Math.random() * 720 - 360}deg`,
          animation: `confetti-burst 4s cubic-bezier(0.1, 1, 0.3, 1) forwards`,
          animationDelay: `${0.3 + Math.random() * 0.2}s`,
        };
        return <ConfettiPiece key={i} style={style} />;
      }),
    [],
  );

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-60 animate-fade-in-fast"></div>
      <div className="absolute inset-0 pointer-events-none">{confetti}</div>

      <div className="relative flex items-center justify-center w-full h-full">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-sm m-4 text-center transform animate-pop-in">
          <h3 className="text-3xl font-bold text-rose-500 dark:text-rose-400">
            Parabéns!
          </h3>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg">
            Você concluiu o cronograma de ultrassons importantes. Uma grande
            etapa vencida na sua jornada!
          </p>
          <button
            onClick={onClose}
            className="mt-8 px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
