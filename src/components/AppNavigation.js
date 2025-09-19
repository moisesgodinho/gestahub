// src/components/AppNavigation.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', title: 'Página Inicial', description: 'Veja o resumo da sua gestação.' },
  { href: '/contador-de-movimentos', title: 'Contador de Movimentos', description: 'Monitore os movimentos do seu bebê.' },
  { href: '/acompanhamento-de-peso', title: 'Acompanhamento de Peso', description: 'Registre seu peso e veja seu progresso.' },
  { href: '/diario-de-sintomas', title: 'Diário de Sintomas', description: 'Registre seu humor e sintomas diários.' },
  { href: '/cronometro-de-contracoes', title: 'Cronômetro de Contrações', description: 'Monitore a duração e frequência das contrações.' }
];

export default function AppNavigation() {
  const pathname = usePathname();
  const filteredLinks = navLinks.filter(link => link.href !== pathname);

  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
      {filteredLinks.map(link => (
        <Link key={link.href} href={link.href} className="block bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow text-center">
          <h3 className="text-xl font-semibold text-rose-500 dark:text-rose-400">{link.title}</h3>
          <p className="text-slate-600 dark:text-slate-400 mt-2">{link.description}</p>
        </Link>
      ))}
    </div>
  );
}