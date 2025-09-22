// src/components/AppointmentMultiViewModal.js
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

export default function AppointmentMultiViewModal({ isOpen, onClose, onEdit, onDelete, appointments }) {
    if (!isOpen || !appointments || appointments.length === 0) {
        return null;
    }

    const date = appointments[0].date;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in-fast">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-md m-4 animate-pop-in max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-3 mb-4 flex-shrink-0">
                    Compromissos para <br />
                    <span className="text-rose-500 dark:text-rose-400">{formatDateDisplay(date)}</span>
                </h3>

                <div className="flex-grow overflow-y-auto pr-2 space-y-5">
                    {appointments.map((appointment, index) => (
                        <div key={appointment.id || index} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-b-0">
                            <div className="flex justify-between items-start">
                                <h4 className={`text-lg font-semibold mb-2 ${appointment.type === 'ultrasound' ? 'text-rose-500 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                    {appointment.title || appointment.name}
                                </h4>
                                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                                    <button
                                        onClick={() => onEdit(appointment)}
                                        className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        Editar
                                    </button>
                                    {appointment.type === 'manual' && (
                                        <button 
                                            onClick={() => onDelete(appointment)}
                                            className="text-sm font-semibold text-red-600 dark:text-red-400 hover:underline"
                                        >
                                            Excluir
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                                {appointment.time && (
                                    <p><span className="font-semibold text-slate-500 dark:text-slate-400">Horário: </span>{appointment.time}</p>
                                )}
                                {appointment.professional && (
                                    <p><span className="font-semibold text-slate-500 dark:text-slate-400">Profissional/Laboratório: </span>{appointment.professional}</p>
                                )}
                                {appointment.location && (
                                    <p><span className="font-semibold text-slate-500 dark:text-slate-400">Local: </span>{appointment.location}</p>
                                )}
                                {appointment.notes && (
                                     <div>
                                        <p className="font-semibold text-slate-500 dark:text-slate-400">Anotações:</p>
                                        <p className="text-slate-500 dark:text-slate-400 italic whitespace-pre-wrap">{appointment.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end gap-4 border-t border-slate-200 dark:border-slate-700 pt-4 flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}