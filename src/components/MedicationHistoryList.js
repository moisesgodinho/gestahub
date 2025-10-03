// src/components/MedicationHistoryList.js
"use client";

import SkeletonLoader from "./SkeletonLoader";

// Função para criar datas locais a partir de "YYYY-MM-DD"
const parseDateStringAsLocal = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

export default function MedicationHistoryList({ history, medications, onLoadMore, hasMore, loading }) {
    if (history.length === 0 && !loading) {
        return <p className="text-center text-slate-500 dark:text-slate-400 mt-4">Nenhum histórico encontrado para dias anteriores.</p>;
    }

    return (
        <div className="mt-6 space-y-4">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 text-center">
                Histórico de Dias Anteriores
            </h2>

            {history.map(entry => {
                const correctDate = parseDateStringAsLocal(entry.id);
                const formattedDate = correctDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" });

                // Filtra medicamentos que estavam ativos naquele dia
                const activeMedsForEntry = medications.filter(med => {
                    if (!med.startDate || med.startDate <= entry.id) {
                        if (!med.durationType || med.durationType === 'CONTINUOUS') return true;
                        if (med.durationType === 'DAYS') {
                            const start = parseDateStringAsLocal(med.startDate);
                            const endDate = new Date(start);
                            endDate.setDate(start.getDate() + Number(med.durationValue || 0));
                            return correctDate < endDate;
                        }
                        // Lógica de trimestre pode ser adicionada se necessário
                        return true;
                    }
                    return false;
                });
                
                return (
                    <div key={entry.id} className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow-md">
                        <h3 className="font-bold text-slate-600 dark:text-slate-300">{formattedDate}</h3>
                        <ul className="mt-2 space-y-1 text-sm">
                            {activeMedsForEntry.map(med => {
                                const takenDoses = entry[med.id] || [];
                                const totalDoses = med.doses.length;
                                if (takenDoses.length === 0) return null;

                                return (
                                    <li key={med.id} className="flex justify-between items-center">
                                        <span className="text-slate-700 dark:text-slate-300">{med.name}</span>
                                        <span className="font-semibold text-green-600 dark:text-green-400">{takenDoses.length}/{totalDoses}</span>
                                    </li>
                                )
                            })}
                             {activeMedsForEntry.every(med => (entry[med.id] || []).length === 0) && (
                                <li className="text-slate-400 italic">Nenhum registro neste dia.</li>
                             )}
                        </ul>
                    </div>
                )
            })}
            
            {loading && <SkeletonLoader type="card" count={3} />}

            {hasMore && !loading && (
                <div className="text-center">
                    <button onClick={onLoadMore} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600">
                        Carregar Mais
                    </button>
                </div>
            )}
        </div>
    );
}