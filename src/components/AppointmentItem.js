// src/components/AppointmentItem.js
"use client";

import { useState, memo } from "react";

const formatDateDisplay = (dateString) => {
  if (!dateString) return "";
  const date = new Date(`${dateString}T00:00:00Z`);
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
};

// Renomeia o componente para ter um nome interno
const AppointmentItemComponent = ({
  item,
  onToggleDone,
  onEdit,
  onDelete,
  idealWindowText,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`p-4 rounded-lg flex items-center gap-4 transition-colors ${
        item.done
          ? "border-l-4 border-green-500"
          : item.type === "ultrasound"
          ? "border-l-4 border-rose-500"
          : "border-l-4 border-indigo-500"
      } bg-slate-100 dark:bg-slate-700/50`}
    >
      <div className="flex-shrink-0">
        <label
          className="cursor-pointer"
          title={item.done ? "Marcar como pendente" : "Marcar como concluído"}
        >
          <input
            type="checkbox"
            checked={!!item.done}
            onChange={() => onToggleDone(item)}
            className="sr-only peer"
          />
          <div
            className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-colors ${
              item.done
                ? "bg-green-500 border-green-500"
                : "border-slate-400 dark:border-slate-500"
            }`}
          >
            <svg
              className={`w-4 h-4 text-white transform transition-transform ${
                !!item.done ? "scale-100" : "scale-0"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </label>
      </div>
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          {item.title || item.name}
        </p>
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
          {item.date ? formatDateDisplay(item.date) : "Agendamento pendente"}{" "}
          {item.time && `às ${item.time}`}
        </p>
        {idealWindowText && (
          <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">
            {idealWindowText}
          </p>
        )}
        {item.professional && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Com: {item.professional}
          </p>
        )}
        {item.location && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Local: {item.location}
          </p>
        )}
        {item.notes && (
          <div className="text-xs text-slate-500 dark:text-slate-400 italic mt-1">
            <p className={!isExpanded ? "truncate" : ""}>
              Anotações: {item.notes}
            </p>
            {item.notes.length > 50 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                {isExpanded ? "Ver menos" : "Ver mais"}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(item)}
          title="Editar"
          className="p-2 rounded-full text-slate-500 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
          </svg>
        </button>
        {(item.type === "manual" ||
          (item.type === "ultrasound" && item.isScheduled)) && (
          <button
            onClick={() => onDelete(item)}
            title={
              item.type === "manual" ? "Apagar consulta" : "Apagar agendamento"
            }
            className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Envolve o componente com React.memo e exporta a versão memoizada
const AppointmentItem = memo(AppointmentItemComponent);
export default AppointmentItem;