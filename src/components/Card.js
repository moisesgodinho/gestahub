// src/components/Card.js
export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl ${className}`}>
      {title && (
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}