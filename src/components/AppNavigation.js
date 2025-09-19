// src/components/AppNavigation.js
'use client';

import Link from 'next/link';

export default function AppNavigation() {
  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
      <Link href="/contador-de-movimentos" className="block bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow text-center">
        <h3 className="text-xl font-semibold text-rose-500 dark:text-rose-400">Contador de Movimentos</h3>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Monitore os movimentos do seu bebê.</p>
      </Link>
      <Link href="/acompanhamento-de-peso" className="block bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow text-center">
        <h3 className="text-xl font-semibold text-rose-500 dark:text-rose-400">Acompanhamento de Peso</h3>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Registre seu peso e veja seu progresso.</p>
      </Link>
    </div>
  );
}