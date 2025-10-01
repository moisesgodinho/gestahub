// src/components/WaterTracker.js
"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useWaterData } from "@/hooks/useWaterData";
import Card from "@/components/Card";
import SkeletonLoader from "@/components/SkeletonLoader";
import WaterIcon from "./icons/WaterIcon";

const cupSizes = [200, 300, 500];

export default function WaterTracker() {
  const { user, loading: userLoading } = useUser();
  const { waterData, loading: dataLoading, setWaterGoal, addWater, undoLastWater } = useWaterData(user);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState("");

  const loading = userLoading || dataLoading;
  const percentage = loading || waterData.goal === 0 ? 0 : Math.min(100, (waterData.current / waterData.goal) * 100);

  const handleGoalSave = () => {
    setWaterGoal(newGoal);
    setIsEditingGoal(false);
  };

  if (loading) {
    return <SkeletonLoader type="card" />;
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
          Contador de Água
        </h2>
        {!isEditingGoal && (
          <button 
            onClick={() => { setIsEditingGoal(true); setNewGoal(waterData.goal.toString()); }} 
            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Editar Meta
          </button>
        )}
      </div>

      {isEditingGoal ? (
        <div className="space-y-3">
           <label htmlFor="goal" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Defina sua meta diária de hidratação (em ml):
            </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              id="goal"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Ex: 2000"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"
            />
          </div>
           <div className="flex items-center justify-end gap-2">
            <button onClick={() => setIsEditingGoal(false)} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-sm">Cancelar</button>
            <button onClick={handleGoalSave} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-sm">Salvar Meta</button>
          </div>
        </div>
      ) : (
        <>
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                className="text-slate-200 dark:text-slate-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                transform="rotate(-90 18 18)"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                className="text-blue-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={`${percentage}, 100`}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.5s ease" }}
                transform="rotate(-90 18 18)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <WaterIcon className="w-10 h-10 text-blue-500 mb-1" />
              <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {waterData.current}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                / {waterData.goal} ml
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="font-semibold text-lg text-slate-700 dark:text-slate-200">Adicionar consumo:</p>
            <div className="flex justify-center gap-3 mt-2">
              {cupSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => addWater(size)}
                  className="px-4 py-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 font-semibold"
                >
                  {size} ml
                </button>
              ))}
            </div>
            <button
              onClick={undoLastWater}
              disabled={!waterData.history || waterData.history.length === 0}
              className="text-sm text-slate-500 dark:text-slate-400 mt-2 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Desfazer último
            </button>
          </div>
        </>
      )}
    </Card>
  );
}