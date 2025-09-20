// src/components/CronogramaUltrassom.js
'use client';

import React from 'react';

const ultrasoundSchedule = [
  { name: '1º Ultrassom (Transvaginal)', startWeek: 8, endWeek: 11 }, // Adicionado endWeek para lógica
  { name: '2º Ultrassom (Morfológico 1º Trimestre)', startWeek: 12, endWeek: 14 },
  { name: '3º Ultrassom (Morfológico 2º Trimestre)', startWeek: 22, endWeek: 24 },
  { name: '4º Ultrassom (Ecocardiograma Fetal)', startWeek: 26, endWeek: 28 },
  { name: '5º Ultrassom (3º Trimestre com Doppler)', startWeek: 28, endWeek: 36 },
];

const getUTCDate = (date) => {
  const d = new Date(date);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

export default function CronogramaUltrassom({ lmpDate }) {
  if (!lmpDate) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lmpUTCDate = getUTCDate(lmpDate);

  // Encontra o índice do próximo exame relevante
  // É o primeiro exame cuja data final ainda não passou
  let nextExamIndex = ultrasoundSchedule.findIndex(exam => {
    const endDate = new Date(lmpUTCDate.getTime());
    // Usa endWeek ou startWeek + 4 (para o primeiro) para definir um limite
    const endWeek = exam.endWeek || (exam.startWeek + 4); 
    endDate.setDate(endDate.getDate() + (endWeek * 7) + 6);
    return today <= endDate;
  });

  // Se todos os exames já passaram, não destaca nenhum
  if (nextExamIndex === -1) {
    nextExamIndex = null;
  }
  
  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">
        🗓️ Cronograma Sugerido de Ultrassons
      </h3>
      <div className="space-y-3">
        {ultrasoundSchedule.map((exam, index) => {
          const startDate = new Date(lmpUTCDate.getTime());
          startDate.setDate(startDate.getDate() + exam.startWeek * 7);

          const endDate = exam.endWeek 
            ? new Date(lmpUTCDate.getTime())
            : null;
          if (endDate) {
            endDate.setDate(endDate.getDate() + (exam.endWeek * 7) + 6);
          }
          
          const isActive = index === nextExamIndex;

          const containerClasses = isActive
            ? "p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 border-l-4 border-rose-500" // Estilo com borda
            : "p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50"; // Estilo padrão

          const dateTextClasses = isActive
            ? "text-sm text-rose-500 dark:text-rose-400 font-medium" // Texto da data com destaque
            : "text-sm text-indigo-600 dark:text-indigo-400 font-medium";

          return (
            <div key={exam.name} className={containerClasses}>
              <p className="font-semibold text-slate-700 dark:text-slate-200">{exam.name}</p>
              <p className={dateTextClasses}>
                {endDate
                  ? `Janela ideal: ${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}`
                  : `A partir de ${startDate.toLocaleDateString('pt-BR')}`
                }
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}