// src/components/JournalViewModal.js
'use client';

import { moodOptions } from '@/data/journalData';

const getMoodLabel = (moodValue) => {
    const mood = moodOptions.find(m => m.value === moodValue);
    return mood ? mood.label : moodValue;
};

export default function JournalViewModal({ isOpen, onClose, onEdit, onDelete, entry }) {
    if (!isOpen || !entry) {
        return null;
    }

    const formattedDate = new Date(entry.date).toLocaleDateString('pt-BR', {
        timeZone: 'UTC',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in-fast">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-md m-4 animate-pop-in">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-3">
                    Registro de <span className="text-rose-500 dark:text-rose-400">{formattedDate}</span>
                </h3>
                
                <div className="mt-4 space-y-4">
                    {entry.mood && (
                        <div>
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Humor:</p>
                            <p className="text-lg text-indigo-600 dark:text-indigo-400 font-medium">{getMoodLabel(entry.mood)}</p>
                        </div>
                    )}
                    {entry.symptoms && entry.symptoms.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Sintomas Registrados:</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {entry.symptoms.map(symptom => (
                                    <span key={symptom} className="text-sm bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 px-3 py-1 rounded-full">{symptom}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {entry.notes && (
                         <div>
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Anotações:</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md">{entry.notes}</p>
                        </div>
                    )}
                    {!entry.mood && (!entry.symptoms || entry.symptoms.length === 0) && !entry.notes && (
                        <p className="text-slate-500 dark:text-slate-400">Nenhuma informação registrada para este dia.</p>
                    )}
                </div>

                <div className="mt-6 flex justify-between items-center gap-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                    <button onClick={() => onDelete(entry)} className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900 font-semibold">
                        Excluir
                    </button>
                    <div className="flex gap-4">
                         <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                            Fechar
                        </button>
                        <button
                            onClick={() => onEdit(entry)}
                            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Editar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}