// src/components/WaterTrackerDashboard.js
"use client";

import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { useWaterData } from "@/hooks/useWaterData";
import WaterIcon from "./icons/WaterIcon";
import SkeletonLoader from "./SkeletonLoader";

export default function WaterTrackerDashboard() {
  const { user, loading: userLoading } = useUser();
  const {
    waterData,
    loading: dataLoading,
    addWater,
    undoLastWater,
  } = useWaterData(user);

  const loading = userLoading || dataLoading;

  if (loading) {
    return <SkeletonLoader type="card" />;
  }

  if (!user) {
    return null;
  }

  const percentage =
    waterData.goal === 0
      ? 0
      : Math.min(100, (waterData.current / waterData.goal) * 100);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <WaterIcon className="w-7 h-7 text-blue-500" />
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            Hidratação Diária
          </h2>
        </div>
        <Link
          href="/hidratacao"
          className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Ver detalhes
        </Link>
      </div>

      <div className="text-center mb-4">
        <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
          {waterData.current} ml
        </span>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Meta: {waterData.goal}ml
        </p>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-6">
        <div
          className="bg-blue-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="flex justify-center items-center gap-4">
        <button
          onClick={() => undoLastWater(waterData.cupSize)}
          disabled={waterData.current === 0}
          className="px-5 py-2 text-sm rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Remover último
        </button>
        <button
          onClick={() => addWater(waterData.cupSize)}
          className="px-6 py-3 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 font-semibold"
        >
          +{waterData.cupSize}ml
        </button>
      </div>
    </div>
  );
}
