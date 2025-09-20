// src/components/InfoTooltip.js
'use client';

import { useState } from 'react';

const InfoIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

export default function InfoTooltip({ text }) {
  const [show, setShow] = useState(false);

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {/* COR ALTERADA AQUI para um tom de anil (índigo) */}
      <InfoIcon className="text-indigo-400 dark:text-indigo-500 cursor-pointer" />
      
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-700 dark:bg-slate-800 text-white text-xs rounded-lg shadow-lg z-10 transition-opacity duration-300">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-700 dark:border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
}