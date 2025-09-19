// src/components/GestationalInfoDashboard.js
'use client';

import CronogramaUltrassom from '@/components/CronogramaUltrassom';

export default function GestationalInfoDashboard({ gestationalInfo, countdown, estimatedLmp, onSwitchToUltrasound, onEdit, dataSource }) {
  if (!gestationalInfo) {
    return null;
  }

  return (
    <div className="mb-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">Sua Gestação</h2>
          <div className="flex items-center gap-4">
            {dataSource === 'dum' && (
              <button onClick={onSwitchToUltrasound} className="text-sm font-semibold text-green-600 dark:text-green-400 hover:underline">
                Calcular por Ultrassom?
              </button>
            )}
            <button onClick={onEdit} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Alterar Dados</button>
          </div>
        </div>
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
        <div className="text-center p-6 mt-6 rounded-2xl bg-gradient-to-r from-rose-400 to-orange-300 text-white shadow-lg">
          {countdown.weeks > 0 || countdown.days > 0 ? (
            <>
              <p className="font-bold text-4xl drop-shadow-md">{countdown.weeks}s {countdown.days}d</p>
              <p className="font-semibold text-lg drop-shadow-md">para o grande dia!</p>
            </>
          ) : (
            <p className="font-bold text-3xl drop-shadow-md">A qualquer momento! ❤️</p>
          )}
        </div>
        {/* Alterações de cor aqui */}
        <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 p-4 rounded-lg space-y-4">
          <h3 className="text-xl font-bold text-center border-b border-indigo-200 dark:border-indigo-700 pb-2"> ✨ {gestationalInfo.currentWeekInfo.title} ✨ </h3>
          <div>
            <h4 className="font-semibold">Bebê:</h4>
            <p className="text-sm">Tamanho aproximado de um(a) <span className="font-bold">{gestationalInfo.currentWeekInfo.size}</span>.</p>
            <p className="mt-1">{gestationalInfo.currentWeekInfo.baby}</p>
          </div>
          <div>
            <h4 className="font-semibold">Mamãe:</h4>
            <p className="mt-1">{gestationalInfo.currentWeekInfo.mom}</p>
          </div>
        </div>
        <CronogramaUltrassom lmpDate={estimatedLmp} />
      </div>
    </div>
  );
}