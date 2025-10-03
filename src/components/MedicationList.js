// src/components/MedicationList.js
"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Card from "@/components/Card";
import { getTodayString } from "@/lib/dateUtils";

const EditIcon = () => (
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
);

const DeleteIcon = () => (
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
);

const ChevronLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);
const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const parseDateStringAsLocal = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const isMedicationActiveOnDate = (med, targetDate) => {
  if (!med) return false;

  // Todos os medicamentos agora precisam de uma data de início.
  if (!med.startDate) {
    return false;
  }

  const target = parseDateStringAsLocal(targetDate);
  const start = parseDateStringAsLocal(med.startDate);

  // O medicamento não pode estar ativo antes de sua data de início.
  if (target < start) return false;

  // Se for de uso contínuo, e já passou da data de início, está ativo.
  if (med.durationType === "CONTINUOUS") {
    return true;
  }

  // Se for por um período de dias, verifica se a data de fim já passou.
  if (med.durationType === "DAYS") {
    const endDate = new Date(start);
    endDate.setDate(start.getDate() + Number(med.durationValue || 0));
    return target < endDate;
  }

  return true;
};

const getDurationText = (med, date) => {
  const targetDate = parseDateStringAsLocal(date);
  if (med.durationType === "DAYS") {
    if (!med.startDate || !med.durationValue) return null;
    const start = parseDateStringAsLocal(med.startDate);
    const endDate = new Date(start);
    endDate.setDate(start.getDate() + Number(med.durationValue));
    const diffTime = endDate.getTime() - targetDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return null;
    if (diffDays === 1) return "Último dia";
    return `Restam ${diffDays} dias`;
  }
  return null;
};

function DayMedicationList({
  date,
  medications,
  history,
  onToggleDose,
  onEdit,
  onDelete,
  isHistory = false,
}) {
  const takenOnDate = history[date] || {};
  const todayString = getTodayString();
  const isToday = date === todayString;
  const isFutureDate = date > todayString;

  const activeMedications = useMemo(() => {
    return medications
      .filter((med) => isMedicationActiveOnDate(med, date))
      .map((med) => {
        let dosesForToday = [];
        if (
          med.scheduleType === "FLEXIBLE" ||
          med.scheduleType === "FIXED_TIMES"
        ) {
          dosesForToday = (med.doses || []).map((time, index) => ({
            time,
            originalIndex: index,
          }));
        } else if (med.scheduleType === "INTERVAL") {
          if (
            !med.startDate ||
            !med.doses ||
            !med.doses[0] ||
            !med.intervalHours
          )
            return { ...med, dosesForToday: [] };

          const medStartDateTime = parseDateStringAsLocal(med.startDate);
          const [startHours, startMinutes] = med.doses[0]
            .split(":")
            .map(Number);
          medStartDateTime.setHours(startHours, startMinutes);

          const targetDayStart = parseDateStringAsLocal(date);
          const targetDayEnd = new Date(targetDayStart);
          targetDayEnd.setDate(targetDayEnd.getDate() + 1);

          let currentDoseTime = new Date(medStartDateTime);
          let doseIndex = 0;

          while (currentDoseTime < targetDayEnd) {
            if (currentDoseTime >= targetDayStart) {
              dosesForToday.push({
                time: currentDoseTime.toTimeString().slice(0, 5),
                originalIndex: doseIndex,
              });
            }
            currentDoseTime.setHours(
              currentDoseTime.getHours() + Number(med.intervalHours)
            );
            doseIndex++;
          }
        }
        return { ...med, dosesForToday };
      })
      .filter((med) => med.dosesForToday.length > 0);
  }, [date, medications]);

  if (activeMedications.length === 0) return null;

  const correctDate = parseDateStringAsLocal(date);
  const formattedDate = correctDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });

  return (
    <div
      className={`p-4 rounded-lg bg-white dark:bg-slate-800 shadow-lg ${
        isHistory ? "border-l-4 border-green-500" : ""
      }`}
    >
      <h3 className="font-bold text-lg capitalize text-rose-500 dark:text-rose-400 flex items-center gap-2 mb-2">
        {isToday && (
          <span className="text-sm px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300">
            Hoje
          </span>
        )}
        <span>{formattedDate}</span>
      </h3>
      <div className="space-y-4">
        {activeMedications.map((med) => {
          const takenDosesIndices = takenOnDate[med.id] || [];
          const allDosesTaken =
            med.dosesForToday.length > 0 &&
            med.dosesForToday.every((dose) =>
              takenDosesIndices.includes(dose.originalIndex)
            );
          const durationText = getDurationText(med, date);

          return (
            <div
              key={med.id}
              className={`p-3 rounded-lg flex flex-col gap-3 transition-colors ${
                allDosesTaken
                  ? "bg-green-50 dark:bg-green-900/30"
                  : "bg-slate-100 dark:bg-slate-700/50"
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p
                      className={`font-semibold text-slate-700 dark:text-slate-200 ${
                        allDosesTaken ? "line-through" : ""
                      }`}
                    >
                      {med.name}
                    </p>
                    {med.durationType === "CONTINUOUS" && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        Uso Contínuo
                      </span>
                    )}
                    {durationText && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {durationText}
                      </span>
                    )}
                  </div>
                  {med.dosage && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {med.dosage}
                    </p>
                  )}
                </div>
                {isToday && (
                  <div className="flex-shrink-0 flex items-center">
                    <button
                      onClick={() => onEdit(med)}
                      title="Editar"
                      className="p-2 rounded-full text-slate-500 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/50"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => onDelete(med.id)}
                      title="Apagar"
                      className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                )}
              </div>

              {med.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
                  {med.notes}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                {med.dosesForToday.map((dose) => {
                  const isTaken = takenDosesIndices.includes(dose.originalIndex);
                  return (
                    <label
                      key={`${med.id}-${dose.originalIndex}`}
                      className={`flex items-center gap-2 ${
                        isFutureDate || (isHistory && isTaken)
                          ? "cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isTaken}
                        onChange={() =>
                          onToggleDose(med.id, date, dose.originalIndex)
                        }
                        className="sr-only peer"
                        disabled={isFutureDate || (isHistory && isTaken)}
                      />
                      <div
                        className={`w-5 h-5 border-2 rounded-md flex-shrink-0 flex items-center justify-center ${
                          isTaken
                            ? "bg-green-500 border-green-500"
                            : isFutureDate || isHistory
                            ? "bg-slate-200 dark:bg-slate-600 border-slate-300 dark:border-slate-500"
                            : "border-slate-400 dark:border-slate-500"
                        }`}
                      >
                        <svg
                          className={`w-3.5 h-3.5 text-white transform transition-transform ${
                            isTaken ? "scale-100" : "scale-0"
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
                      <span
                        className={`text-sm font-medium ${
                          isTaken
                            ? "line-through text-slate-500 dark:text-slate-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {dose.time}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MedicationList({
  medications,
  history,
  onToggleDose,
  onEdit,
  onDelete,
  dueDate,
}) {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

  useEffect(() => {
    const today = new Date();
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
  }, []);

  const changeMonth = (amount) => {
    setCurrentMonthDate((prev) => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() + amount, 1);
      return newDate;
    });
  };

  const hasMedicationInMonth = useCallback(
    (date) => {
      if (!medications || medications.length === 0) return false;

      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      for (
        let d = new Date(firstDay);
        d <= lastDay;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = `${d.getFullYear()}-${String(
          d.getMonth() + 1
        ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        for (const med of medications) {
          if (isMedicationActiveOnDate(med, dateStr)) {
            return true;
          }
        }
      }
      return false;
    },
    [medications]
  );

  const previousMonth = new Date(
    currentMonthDate.getFullYear(),
    currentMonthDate.getMonth() - 1,
    1
  );

  const canGoBack = hasMedicationInMonth(previousMonth);
  const nextMonth = new Date(
    currentMonthDate.getFullYear(),
    currentMonthDate.getMonth() + 1,
    1
  );

  const canGoForward = useMemo(() => {
    if (dueDate) {
      const limitDate = new Date(dueDate);
      limitDate.setMonth(limitDate.getMonth() + 3, 1);
      limitDate.setHours(0, 0, 0, 0);

      if (nextMonth >= limitDate) {
        return false;
      }
    }
    return hasMedicationInMonth(nextMonth);
  }, [currentMonthDate, dueDate, hasMedicationInMonth, nextMonth]);

  const { pastDays, upcomingDays } = useMemo(() => {
    const todayString = getTodayString();
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const past = [];
    const upcoming = [];

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      if (dateStr < todayString) {
        past.push(dateStr);
      } else {
        upcoming.push(dateStr);
      }
    }
    return {
      pastDays: past.sort((a, b) => b.localeCompare(a)),
      upcomingDays: upcoming,
    };
  }, [currentMonthDate]);

  const hasAnyActiveMedicationForCurrentMonth =
    hasMedicationInMonth(currentMonthDate);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl flex justify-between items-center sticky top-2 z-10">
        <button
          onClick={() => changeMonth(-1)}
          disabled={!canGoBack}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon />
        </button>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 capitalize">
          {currentMonthDate.toLocaleString("pt-BR", {
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          })}
        </h2>
        <button
          onClick={() => changeMonth(1)}
          disabled={!canGoForward}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRightIcon />
        </button>
      </div>

      {medications.length === 0 && (
        <Card>
          <p className="text-center text-slate-500 dark:text-slate-400">
            Você ainda não adicionou nenhum medicamento ou vitamina.
          </p>
        </Card>
      )}

      {medications.length > 0 && !hasAnyActiveMedicationForCurrentMonth && (
        <Card>
          <p className="text-center text-slate-500 dark:text-slate-400">
            Nenhum medicamento ativo para este mês.
          </p>
        </Card>
      )}

      {hasAnyActiveMedicationForCurrentMonth &&
        upcomingDays.map((date) => (
          <DayMedicationList
            key={date}
            date={date}
            medications={medications}
            history={history}
            onToggleDose={onToggleDose}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

      {hasAnyActiveMedicationForCurrentMonth && pastDays.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 pl-2">
            Histórico do Mês
          </h3>
          <div className="space-y-4">
            {pastDays.map((date) => (
              <DayMedicationList
                key={date}
                date={date}
                medications={medications}
                history={history}
                onToggleDose={onToggleDose}
                onEdit={onEdit}
                onDelete={onDelete}
                isHistory={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}