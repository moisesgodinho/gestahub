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
      {/* Linha de "sem conexão" */}
      <line x1="1" y1="1" x2="23" y2="23" />

      {/* Arcos do WiFi */}
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.28" />
      <path d="M5 12.28c.89-1.42 2.1-2.58 3.5-3.5" />
      <path d="M12 18.28c.99 0 1.93-.24 2.76-.67" />
      <path d="M8.53 15.11a6.01 6.01 0 0 1 2.2-1.1" />

      {/* Ajuste do círculo central (ponto do WiFi) */}
      <circle cx="12" cy="20" r="1" />
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