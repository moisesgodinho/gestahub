// src/components/CronogramaUltrassom.js
'use client';

import React from 'react';

// Dados dos exames baseados na sua imagem e em práticas comuns
const ultrasoundSchedule = [
  { name: '1º Ultrassom (Transvaginal)', startWeek: 8, note: 'A partir da 8ª semana' },
  { name: '2º Ultrassom (Morfológico 1º Trimestre)', startWeek: 12, endWeek: 14 },
  { name: '3º Ultrassom (Morfológico 2º Trimestre)', startWeek: 22, endWeek: 24 },
  { name: '4º Ultrassom (Ecocardiograma Fetal)', startWeek: 26, endWeek: 28 },
  { name: '5º Ultrassom (3º Trimestre com Doppler)', startWeek: 28, endWeek: 36 },
];

// Função para calcular a data futura e formatá-la
const getFutureDate = (startDate, daysToAdd) => {
  const futureDate = new Date(startDate.getTime());
  futureDate.setDate(futureDate.getDate() + daysToAdd);
  return futureDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

export default function CronogramaUltrassom({ lmpDate }) {
  if (!lmpDate) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">
        🗓️ Cronograma Sugerido de Ultrassons
      </h3>
      <div className="space-y-3">
        {ultrasoundSchedule.map((exam) => {
          // Calcula a data de início da janela
          const startDate = getFutureDate(lmpDate, exam.startWeek * 7);
          
          // Calcula a data de fim da janela (considerando o final da semana)
          const endDate = exam.endWeek 
            ? getFutureDate(lmpDate, (exam.endWeek * 7) + 6) 
            : null;

          return (
            <div key={exam.name} className="p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50">
              <p className="font-semibold text-slate-700 dark:text-slate-200">{exam.name}</p>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                {exam.note 
                  ? `${exam.note}: a partir de ${startDate}`
                  : `Janela ideal: ${startDate} a ${endDate}`
                }
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}