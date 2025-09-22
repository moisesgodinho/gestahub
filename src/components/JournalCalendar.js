// src/components/JournalCalendar.js
'use client';

import { useState, useMemo } from 'react';
import { moodOptions } from '@/data/journalData';
import { getTodayString } from '@/lib/dateUtils';
import { getDueDate } from '@/lib/gestationalAge';

// Ícones para navegação
const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);


export default function JournalCalendar({ entries, onDateSelect, onEditEntry, lmpDate }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const { minDate, maxDate } = useMemo(() => {
        if (!lmpDate) return { minDate: null, maxDate: null };

        const dueDate = getDueDate(lmpDate);

        const min = new Date(lmpDate);
        min.setMonth(min.getMonth() - 1);
        min.setDate(1);

        const max = new Date(dueDate);
        max.setMonth(max.getMonth() + 1);
        max.setDate(1);

        return { minDate: min, maxDate: max };
    }, [lmpDate]);

    const entriesMap = new Map(entries.map(entry => [entry.id, entry]));
    const todayString = getTodayString();

    const changeMonth = (amount) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + amount);

            if (minDate && newDate.getFullYear() === minDate.getFullYear() && newDate.getMonth() < minDate.getMonth()) {
                return prevDate;
            }
            if (maxDate && newDate.getFullYear() === maxDate.getFullYear() && newDate.getMonth() > maxDate.getMonth()) {
                return prevDate;
            }
            return newDate;
        });
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo, 1 = Segunda...
    const totalDays = lastDayOfMonth.getDate();

    const calendarDays = [];

    const canGoBack = !minDate || currentDate.getFullYear() > minDate.getFullYear() || (currentDate.getFullYear() === minDate.getFullYear() && currentDate.getMonth() > minDate.getMonth());
    const canGoForward = !maxDate || currentDate.getFullYear() < maxDate.getFullYear() || (currentDate.getFullYear() === maxDate.getFullYear() && currentDate.getMonth() < maxDate.getMonth());


    // Adiciona dias em branco para o início do mês
    for (let i = 0; i < startDayOfWeek; i++) {
        calendarDays.push(<div key={`empty-start-${i}`} className="p-1"></div>);
    }

    // Adiciona os dias do mês
    for (let day = 1; day <= totalDays; day++) {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const entry = entriesMap.get(dateString);
        const mood = entry ? moodOptions.find(m => m.value === entry.mood) : null;
        const isToday = dateString === todayString;

        calendarDays.push(
            <div
                key={day}
                onClick={() => (entry ? onEditEntry(entry) : onDateSelect(dateString))}
                className="p-1 text-center rounded-lg transition-colors cursor-pointer flex flex-col aspect-square relative bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm self-end ${isToday ? 'bg-rose-500 text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                    {day}
                </span>

                <div className="flex-grow flex items-center justify-center -mt-2">
                    {mood ? (
                        <span className="text-2xl" title={mood.value}>{mood.label.split(' ')[0]}</span>
                    ) : entry ? (
                        // --- PONTO INDICADOR AUMENTADO ---
                        <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full" title="Registro de sintoma/nota"></div>
                    ) : (
                        // Espaço vazio para manter o alinhamento
                        <div></div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl mb-6">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} disabled={!canGoBack} className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronLeftIcon />
                </button>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                    {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => changeMonth(1)} disabled={!canGoForward} className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronRightIcon />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-sm">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="font-semibold text-center text-slate-500 dark:text-slate-400 p-2">{day}</div>
                ))}
                {calendarDays}
            </div>
        </div>
    );
}