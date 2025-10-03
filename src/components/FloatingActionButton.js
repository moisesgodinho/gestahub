// src/components/FloatingActionButton.js
"use client";

export default function FloatingActionButton({ onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="fixed bottom-20 right-6 lg:hidden z-30 w-16 h-16 bg-rose-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-rose-600 transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-rose-300 dark:focus:ring-rose-800"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
  );
}
