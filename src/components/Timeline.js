// src/components/Timeline.js
"use client";

import Card from "@/components/Card";

function TimelineEvent({ event }) {
  const Icon = event.icon;
  // Ajuste para usar a cor completa (texto e fundo)
  const colorClasses = `${event.color} text-opacity-80`;

  return (
    <div
      className={`p-4 rounded-lg flex items-center gap-4 ${colorClasses}`}
    >
      <Icon className="w-6 h-6 flex-shrink-0" />
      <p className="flex-grow font-medium">{event.title}</p>
      <svg
        className="w-5 h-5 opacity-50"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

export default function Timeline({ weekData }) {
  return (
    <Card>
      <div className="relative">
        <div className="absolute top-0 left-3 h-full w-0.5 bg-slate-200 dark:bg-slate-700 -z-10"></div>
        <div className="space-y-4">
          {weekData.length > 0 ? (
            weekData.map((event) => (
              <TimelineEvent key={event.id} event={event} />
            ))
          ) : (
            <div className="p-4 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                Nenhum evento importante para esta semana.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}