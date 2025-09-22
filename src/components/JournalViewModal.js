// src/components/JournalViewModal.js
'use client';

import { moodOptions } from '@/data/journalData';

// Ícones para os botões de ação
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

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
                <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-3">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                        Registro de <span className="text-rose-500 dark:text-rose-400">{formattedDate}</span>
                    </h3>
                    {/* --- BOTÕES DE AÇÃO ATUALIZADOS --- */}
                    <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                        <button
                            onClick={() => onEdit(entry)}
                            title="Editar"
                            className="p-2 rounded-full text-slate-500 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/50 transition-colors"
                        >
                            <EditIcon />
                        </button>
                        <button 
                            onClick={() => onDelete(entry)}
                            title="Apagar"
                            className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50 transition-colors"
                        >
                            <DeleteIcon />
                        </button>
                    </div>
                </div>
                
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

                <div className="mt-6 flex justify-end gap-4 border-t border-slate-200 dark:border-slate-700 pt-4">
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