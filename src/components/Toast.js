// src/components/Toast.js
'use client';

import { useEffect, useState } from 'react';

export default function Toast({ message, show, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        // Permite que a animação de saída termine antes de chamar onClose
        setTimeout(onClose, 300); 
      }, 2000); // A notificação some após 2 segundos

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-green-500 text-white font-semibold shadow-lg transition-all duration-300 ease-in-out
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
    >
      {message}
    </div>
  );
}