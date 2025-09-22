// src/components/AppointmentViewModal.js
'use client';

const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(`${dateString}T00:00:00Z`);
    return date.toLocaleDateString('pt-BR', {
        timeZone: 'UTC',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export default function AppointmentViewModal({ isOpen, onClose, onEdit, appointment }) {
    if (!isOpen || !appointment) {
        return null;
    }

    const isUltrasound = appointment.type === 'ultrasound';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in-fast">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-md m-4 animate-pop-in">
                <h3 className={`text-xl font-semibold ${isUltrasound ? 'text-rose-500 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'} border-b border-slate-200 dark:border-slate-700 pb-3`}>
                    {appointment.title || appointment.name}
                </h3>
                
                <div className="mt-4 space-y-4">
                    <div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Data e Horário:</p>
                        <p className="text-lg text-slate-800 dark:text-slate-200">
                            {formatDateDisplay(appointment.date)} {appointment.time && `às ${appointment.time}`}
                        </p>
                    </div>

                    {appointment.professional && (
                        <div>
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Profissional/Laboratório:</p>
                            <p className="text-md text-slate-700 dark:text-slate-300">{appointment.professional}</p>
                        </div>
                    )}

                    {appointment.location && (
                        <div>
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Local:</p>
                            <p className="text-md text-slate-700 dark:text-slate-300">{appointment.location}</p>
                        </div>
                    )}

                    {appointment.notes && (
                         <div>
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Anotações:</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md whitespace-pre-wrap">{appointment.notes}</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600">
                        Fechar
                    </button>
                    <button onClick={() => onEdit(appointment)} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
                        Editar
                    </button>
                </div>
            </div>
        </div>
    );
}