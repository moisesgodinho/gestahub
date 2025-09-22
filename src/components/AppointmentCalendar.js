// src/components/AppointmentCalendar.js
'use client';

import { useState, useMemo } from 'react';
import { getTodayString } from '@/lib/dateUtils';

// Ícones
const ChevronLeftIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>);
const ChevronRightIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>);

// Paleta de cores definida para modo claro e escuro
const ultrasoundSchedule = [
  { id: 'transvaginal', name: '1º Ultrassom (Transvaginal)', startWeek: 8, endWeek: 11, type: 'ultrasound', color: 'blue', darkColor: 'sky' },
  { id: 'morfologico_1', name: 'Morfológico 1º Trimestre', startWeek: 12, endWeek: 14, type: 'ultrasound', color: 'green', darkColor: 'emerald' },
  { id: 'morfologico_2', name: 'Morfológico 2º Trimestre', startWeek: 22, endWeek: 24, type: 'ultrasound', color: 'yellow', darkColor: 'amber' },
  { id: 'ecocardiograma', name: 'Ecocardiograma Fetal', startWeek: 26, endWeek: 28, type: 'ultrasound', color: 'purple', darkColor: 'violet' },
  { id: 'doppler_3', name: '3º Trimestre com Doppler', startWeek: 28, endWeek: 36, type: 'ultrasound', color: 'teal', darkColor: 'cyan' },
];

export default function AppointmentCalendar({ appointments, lmpDate, onDateSelect, onViewAppointment }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const todayString = getTodayString();

    const appointmentsByDate = useMemo(() => {
        const map = new Map();
        appointments.forEach(app => {
            if (app.date) {
                if (!map.has(app.date)) map.set(app.date, []);
                map.get(app.date).push(app);
            }
        });
        return map;
    }, [appointments]);

    const ultrasoundWindows = useMemo(() => {
        if (!lmpDate) return new Map();
        const windows = new Map();
        ultrasoundSchedule.forEach(exam => {
            const startDate = new Date(lmpDate.getTime());
            startDate.setUTCDate(startDate.getUTCDate() + exam.startWeek * 7);
            const endDate = new Date(lmpDate.getTime());
            endDate.setUTCDate(endDate.getUTCDate() + (exam.endWeek * 7) + 6);
            
            for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                windows.set(dateStr, exam);
            }
        });
        return windows;
    }, [lmpDate]);

    const changeMonth = (amount) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();
    const calendarDays = [];

    for (let i = 0; i < startDayOfWeek; i++) {
        calendarDays.push(<div key={`empty-start-${i}`} className="p-1"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayAppointments = appointmentsByDate.get(dateString) || [];
        const isToday = dateString === todayString;
        const windowExam = ultrasoundWindows.get(dateString);

        // CORREÇÃO: Usando cores sólidas e escuras para o modo escuro
        const windowBgClass = windowExam ? `bg-${windowExam.color}-50 dark:bg-${windowExam.darkColor}-900` : '';

        calendarDays.push(
            <div
                key={day}
                onClick={() => dayAppointments.length > 0 ? onViewAppointment(dayAppointments[0]) : onDateSelect(dateString)}
                className={`p-1 text-center rounded-lg transition-colors cursor-pointer min-h-[6rem] flex flex-col relative group
                    ${windowBgClass}
                    hover:bg-slate-100 dark:hover:bg-slate-700
                `}
                title={windowExam ? `Janela ideal para: ${windowExam.name}`: ''}
            >
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm self-end
                    ${isToday ? 'bg-rose-500 text-white' : 'text-slate-700 dark:text-slate-300'}
                `}>
                    {day}
                </span>
                <div className="flex-grow space-y-1 mt-1 overflow-hidden">
                    {dayAppointments.map(app => (
                        <div key={app.id} className={`w-full text-xs p-1 rounded truncate
                            ${app.type === 'ultrasound' ? 'bg-rose-200 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200' : 'bg-indigo-200 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200'}`}
                        >
                            {app.title || app.name}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl mb-6">
             <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><ChevronLeftIcon /></button>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                    {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><ChevronRightIcon /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-sm">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="font-semibold text-center text-slate-500 dark:text-slate-400 p-2">{day}</div>
                ))}
                {calendarDays}
            </div>
            {lmpDate && (
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">Legenda das Janelas Ideais:</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {ultrasoundSchedule.map(exam => (
                            <div key={exam.id} className="flex items-center gap-2">
                                {/* Legenda também usa cores mais vibrantes no modo escuro */}
                                <span className={`w-4 h-4 rounded-full bg-${exam.color}-200 dark:bg-${exam.darkColor}-400`}></span>
                                <span className="text-sm text-slate-600 dark:text-slate-400">{exam.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}