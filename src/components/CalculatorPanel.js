// src/components/CalculatorPanel.js
"use client";

import CalculadoraDUM from "@/components/CalculadoraDUM";
import CalculadoraUltrassom from "@/components/CalculadoraUltrassom";

export default function CalculatorPanel({
  user,
  activeCalculator,
  onSaveSuccess,
  onCancel,
  onSwitch,
  onForceReload,
}) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl animate-fade-in">
      <div className="flex justify-end mb-4 -mt-2">
        <button
          onClick={onForceReload}
          className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Não carregou? Sincronizar dados
        </button>
      </div>

      <div className="mb-6 flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => onSwitch("dum")}
          className={`py-2 px-4 text-lg font-semibold transition-colors ${
            activeCalculator === "dum"
              ? "border-b-2 border-rose-500 text-rose-500 dark:text-rose-400"
              : "text-slate-500 dark:text-slate-400 hover:text-rose-500"
          }`}
        >
          Calculadora DUM
        </button>
        <button
          onClick={() => onSwitch("ultrassom")}
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
        <CalculadoraDUM
          user={user}
          onSaveSuccess={onSaveSuccess}
          onCancel={onCancel}
        />
      ) : (
        <CalculadoraUltrassom
          user={user}
          onSaveSuccess={onSaveSuccess}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}
