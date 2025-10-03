// src/components/MedicationItem.js
"use client";

import PillIcon from "./icons/PillIcon";

export default function MedicationItem({ med, todayString, onToggleDose }) {
  return (
    <div
      className={`p-4 rounded-lg flex items-start gap-4 transition-colors bg-slate-100 dark:bg-slate-700/50 border-l-4 border-green-500`}
    >
      <div className="flex-shrink-0 pt-1">
        <PillIcon className="w-6 h-6 text-green-500" />
      </div>
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          {med.name}
        </p>
        {med.dosage && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {med.dosage}
          </p>
        )}
        {med.notes && (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1">
            {med.notes}
          </p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
          {med.pendingDoses.map((dose) => (
            <label
              key={dose.originalIndex}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                onChange={() =>
                  onToggleDose(med.id, todayString, dose.originalIndex)
                }
                className="sr-only peer"
              />
              <div className="w-5 h-5 border-2 rounded-md flex-shrink-0 flex items-center justify-center border-slate-400 dark:border-slate-500 peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors">
                <svg
                  className="w-3.5 h-3.5 text-white transform transition-transform scale-0 peer-checked:scale-100"
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
              <span className="text-sm text-slate-600 dark:text-slate-400 peer-checked:line-through">
                {dose.time}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
