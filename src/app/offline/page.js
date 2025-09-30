// src/app/offline/page.js
import Link from "next/link";

const OfflineIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.28" />
    <path d="M5 12.28c.89-1.42 2.1-2.58 3.5-3.5" />
    <path d="M12 18.28c.99 0 1.93-.24 2.76-.67" />
    <path d="M8.53 15.11a6.01 6.01 0 0 1 2.2-1.1" />
    <path d="M12 2a18.3 18.3 0 0 1 5.68 1.13" />
    <path d="M4.32 3.13A18.3 18.3 0 0 1 12 2" />
  </svg>
);

const HomeIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);


export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-gray-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full">
        <OfflineIcon className="w-16 h-16 mx-auto text-amber-500 mb-4" />
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          Você está Offline
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Parece que você perdeu a conexão. A página que você tentou acessar não está disponível no cache para uso offline.
        </p>
        <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">
          <HomeIcon className="w-5 h-5" />
          Voltar para a Página Inicial
        </Link>
      </div>
    </div>
  );
}