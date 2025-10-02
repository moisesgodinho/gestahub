// src/components/WaterHistory.js
"use client";

import { useState } from "react";
import Card from "@/components/Card";

const INITIAL_VISIBLE_COUNT = 7;
const LOAD_MORE_COUNT = 7;

export default function WaterHistory({ history }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  if (!history || history.length === 0) {
    return null;
  }

  const displayedHistory = history.slice(0, visibleCount);

  return (
    <div className="mt-8">
      <Card>
        <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">
          Histórico de Consumo
        </h3>
        <div className="space-y-2">
          {displayedHistory.map((entry) => (
            <div
              key={entry.id}
              className="flex justify-between items-center bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg"
            >
              <p className="font-semibold text-slate-700 dark:text-slate-200">
                {new Date(entry.date).toLocaleDateString("pt-BR", {
                  timeZone: "UTC",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
              <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                {entry.current} ml
              </p>
            </div>
          ))}
        </div>
        {visibleCount < history.length && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_COUNT)}
              className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Carregar Mais
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
