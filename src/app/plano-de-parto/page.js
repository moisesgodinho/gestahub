// src/app/plano-de-parto/page.js
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useBirthPlan } from "@/hooks/useBirthPlan";
import BirthPlanForm from "@/components/BirthPlanForm";
import BirthPlanView from "@/components/BirthPlanView";
import SkeletonLoader from "@/components/SkeletonLoader";
import PrintIcon from "@/components/icons/PrintIcon";
import Card from "@/components/Card";

export default function BirthPlanPage() {
  const { user, loading: userLoading } = useUser();
  const {
    answers,
    planStructure,
    loading: planLoading,
    saveAnswers,
    addCustomOption,
    removeCustomOption
  } = useBirthPlan(user);

  const [isEditing, setIsEditing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const loading = userLoading || planLoading;

  // Roda apenas uma vez para decidir o estado inicial
  useEffect(() => {
    if (!planLoading && initialLoad) {
      const hasAnswers = Object.values(answers).some(answer =>
        (Array.isArray(answer) ? answer.length > 0 : !!answer)
      );
      setIsEditing(!hasAnswers);
      setInitialLoad(false); // Impede que rode novamente
    }
  }, [planLoading, answers, initialLoad]);

  const handleSave = async (newAnswers) => {
    await saveAnswers(newAnswers);
    setIsEditing(false); // Muda para o modo de visualização após salvar
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <SkeletonLoader type="fullPage" />
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center flex-grow p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400">
            Meu Plano de Parto
          </h1>
          {!isEditing && (
            <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
              Este é um resumo das suas preferências. Você pode imprimir ou gerar um PDF para compartilhar com sua equipe médica.
            </p>
          )}
        </div>

        {/* --- Bloco de Botões --- */}
        {!isEditing && (
            <div className="flex justify-center gap-4 mb-6">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                    <PrintIcon className="w-5 h-5" />
                    Imprimir / Gerar PDF
                </button>
                <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                >
                    Editar Plano
                </button>
            </div>
        )}

        {/* --- Aviso Importante --- */}
        <Card className="mb-6 border-l-4 border-amber-500">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Atenção</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Este plano de parto é uma ferramenta para guiar suas conversas e expressar suas preferências. Ele não substitui o conselho e a orientação da sua equipe médica. A segurança e o bem-estar da mãe e do bebê são sempre a prioridade máxima durante o parto.
          </p>
        </Card>

        {isEditing ? (
          <BirthPlanForm
            answers={answers}
            planStructure={planStructure}
            onSave={handleSave}
            onAddOption={addCustomOption}
            onRemoveOption={removeCustomOption}
          />
        ) : (
          <BirthPlanView
            planStructure={planStructure}
            answers={answers}
          />
        )}
      </div>
    </div>
  );
}