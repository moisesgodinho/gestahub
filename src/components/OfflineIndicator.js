// src/components/OfflineIndicator.js
"use client";

import { useState, useEffect } from 'react';

// Ícone para o status offline
const WifiOffIcon = (props) => (
  <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Círculo de status */}
      <circle cx="12" cy="12" r="10" />
      {/* Linha de corte indicando offline */}
      <line x1="4" y1="4" x2="20" y2="20" />
    </svg>
);


export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    // Verifica o status inicial
    if (typeof window !== 'undefined' && !window.navigator.onLine) {
      handleOffline();
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed bottom-16 lg:bottom-0 left-0 lg:left-64 right-0 z-50 bg-amber-500 text-white text-sm font-semibold p-2 text-center flex items-center justify-center gap-2">
      <WifiOffIcon className="w-4 h-4" />
      <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
    </div>
  );
}