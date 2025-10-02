// src/components/WaterTracker.js
"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useWaterData } from "@/hooks/useWaterData";
import Card from "@/components/Card";
import SkeletonLoader from "@/components/SkeletonLoader";
import WaterIcon from "./icons/WaterIcon";

export default function WaterTracker() {
  const { user, loading: userLoading } = useUser();
  const {
    waterData,
    loading: dataLoading,
    setWaterSettings,
    addWater,
    undoLastWater,
  } = useWaterData(user);
  const [isEditing, setIsEditing] = useState(false);

  const [newGoal, setNewGoal] = useState("");
  const [newCupSize, setNewCupSize] = useState("");

  const loading = userLoading || dataLoading;
  const percentage =
    loading || waterData.goal === 0
      ? 0
      : Math.min(100, (waterData.current / waterData.goal) * 100);

  const handleSettingsSave = () => {
    setWaterSettings(newGoal, newCupSize);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setNewGoal(waterData.goal.toString());
    setNewCupSize(waterData.cupSize.toString());
    setIsEditing(true);
  };

  if (loading) {
    return <SkeletonLoader type="card" />;
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <WaterIcon className="w-8 h-8 text-blue-500" />
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
            Hidratação Diária
          </h2>
        </div>
        {!isEditing && (
          <button
            onClick={handleEditClick}
            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Editar meta e copo
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div>
            <label
              htmlFor="goal"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Meta diária (ml)
            </label>
            <input
              type="number"
              id="goal"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Ex: 2000"
              className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"
            />
          </div>
          <div>
            <label
              htmlFor="cupSize"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Tamanho do copo (ml)
            </label>
            <input
              type="number"
              id="cupSize"
              value={newCupSize}
              onChange={(e) => setNewCupSize(e.target.value)}
              placeholder="Ex: 250"
              className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSettingsSave}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-sm"
            >
              Salvar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-100">
              <span>{waterData.current} ml</span>
              <span className="text-slate-500 dark:text-slate-400">
                {waterData.goal} ml
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center gap-4">
            <button
              onClick={() => undoLastWater(waterData.cupSize)}
              disabled={waterData.current === 0}
              className="px-4 py-2 text-sm rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              Remover último
            </button>
            <button
              onClick={() => addWater(waterData.cupSize)}
              className="w-full px-6 py-3 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 font-semibold"
            >
              Adicionar 1 copo ({waterData.cupSize} ml)
            </button>
          </div>
        </>
      )}
    </Card>
  );
}
