// src/components/Header.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 1. IMPORTE O ROUTER
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

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

export default function Header() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const router = useRouter(); // 2. INICIE O ROUTER

  // Lógica de tema
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setTheme(isDarkMode ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Lógica de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // 3. ADICIONE O REDIRECIONAMENTO APÓS O LOGOUT
      router.push('/'); 
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };
  
  return (
    <header className="w-full p-4">
      <div className="container mx-auto max-w-3xl flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-rose-500 dark:text-rose-400">
          GestaHub
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-slate-700 dark:text-slate-300">
              Olá, <span className="font-semibold text-rose-500 dark:text-rose-400">{user.displayName.split(' ')[0]}</span>!
            </span>
            <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
              {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleSignOut}
              className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Sair
            </button>
          </div>
        )}

        {!user && (
           <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
              {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
        )}
      </div>
    </header>
  );
}