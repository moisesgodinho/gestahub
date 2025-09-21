// src/components/Header.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';

// Ícones SVG como componentes
const SunIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const UserIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default function Header() {
  const { user, userProfile } = useUser();
  const [theme, setTheme] = useState('light');

  // Lógica para inicializar e alternar o tema
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setTheme(isDarkMode ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  // Função para obter o primeiro nome a ser exibido
  const getDisplayName = () => {
    if (!user) return '';
    const name = userProfile?.displayName || user.displayName;
    return name ? name.split(' ')[0] : '';
  };

  return (
    <header className="w-full p-4">
      <div className={`container mx-auto max-w-3xl flex items-center ${user ? 'justify-between' : 'justify-end'}`}>
        {user && (
            <Link href="/" className="text-2xl font-bold text-rose-500 dark:text-rose-400">
                GestaHub
            </Link>
        )}

        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden sm:block text-slate-700 dark:text-slate-300">
              Olá, <span className="font-semibold text-rose-500 dark:text-rose-400">{getDisplayName()}</span>!
            </span>
          )}
          <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
          </button>
          {user && (
            <Link href="/perfil" title="Meu Perfil" className="p-2 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
              <UserIcon className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}