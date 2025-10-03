// src/components/MedicationDashboard.js
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { useMedication } from "@/hooks/useMedication";
import { getTodayString } from "@/lib/dateUtils";
import PillIcon from "./icons/PillIcon";
import SkeletonLoader from "./SkeletonLoader";
import MedicationItem from "./MedicationItem";

const parseDateStringAsLocal = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const isMedicationActiveOnDate = (med, targetDate) => {
  if (!med || !med.startDate) {
    return false;
  }
  const target = parseDateStringAsLocal(targetDate);
  const start = parseDateStringAsLocal(med.startDate);

  if (target < start) return false;
  if (med.durationType === "CONTINUOUS") {
    return true;
  }
  if (med.durationType === "DAYS") {
    const endDate = new Date(start);
    endDate.setDate(start.getDate() + Number(med.durationValue || 0));
    return target < endDate;
  }
  return true;
};

export default function MedicationDashboard() {
  const { user, loading: userLoading } = useUser();
  const {
    medications,
    history,
    loading: medsLoading,
    onToggleDose,
  } = useMedication(user);
  const loading = userLoading || medsLoading;

  const todayString = getTodayString();
  const todaysHistory = history[todayString] || {};

  const activeMedicationsToday = useMemo(() => {
    return medications
      .filter((med) => isMedicationActiveOnDate(med, todayString))
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
          ) {
            return { ...med, dosesForToday: [] };
          }

          const medStartDateTime = parseDateStringAsLocal(med.startDate);
          const [startHours, startMinutes] = med.doses[0]
            .split(":")
            .map(Number);
          medStartDateTime.setHours(startHours, startMinutes);

          const targetDayStart = parseDateStringAsLocal(todayString);
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
  }, [medications, todayString]);

  const pendingDoses = useMemo(() => {
    return activeMedicationsToday.reduce((acc, med) => {
      const takenDosesIndices = todaysHistory[med.id] || [];
      const pending = med.dosesForToday.filter(
        (dose) => !takenDosesIndices.includes(dose.originalIndex)
      );
      if (pending.length > 0) {
        acc.push({ ...med, pendingDoses: pending });
      }
      return acc;
    }, []);
  }, [activeMedicationsToday, todaysHistory]);

  if (loading) {
    return <SkeletonLoader type="card" />;
  }

  if (!user || activeMedicationsToday.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <PillIcon className="w-7 h-7 text-green-500" />
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            Medicamentos e Vitaminas de Hoje
          </h2>
        </div>
        <Link
          href="/medicamentos"
          className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Ver detalhes
        </Link>
      </div>

      {pendingDoses.length > 0 ? (
        <div className="space-y-3">
          {pendingDoses.map((med) => (
            <MedicationItem
              key={med.id}
              med={med}
              todayString={todayString}
              onToggleDose={onToggleDose}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-green-600 dark:text-green-400 font-semibold">
            🎉 Você já tomou todos os seus medicamentos e vitaminas de hoje!
          </p>
        </div>
      )}
    </div>
  );
}
