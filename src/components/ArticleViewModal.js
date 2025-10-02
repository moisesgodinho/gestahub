// src/components/ArticleViewModal.js
"use client";

export default function ArticleViewModal({ article, onClose }) {
  if (!article) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in-fast"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-2xl m-4 animate-pop-in max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-rose-500 dark:text-rose-400 flex-shrink-0">
          {article.title}
        </h2>
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-4 flex-shrink-0">
          {article.category}
        </p>

        <div
          className="prose prose-slate dark:prose-invert overflow-y-auto pr-4"
          dangerouslySetInnerHTML={{ __html: article.content }}
        ></div>

        <div className="mt-6 flex justify-end border-t border-slate-200 dark:border-slate-700 pt-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
