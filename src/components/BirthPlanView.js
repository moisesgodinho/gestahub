// src/components/BirthPlanView.js
"use client";

import Card from "@/components/Card";
import { birthPlanData } from "@/data/birthPlanData";
import PrintIcon from "./icons/PrintIcon";

export default function BirthPlanView({ planStructure, answers }) {

  const hasAnswers = Object.values(answers).some(answer => {
    if (Array.isArray(answer)) return answer.length > 0;
    return !!answer;
  });

  return (
    <Card>
      {!hasAnswers ? (
        <p className="text-center text-slate-500 dark:text-slate-400">
          Você ainda não preencheu seu plano de parto. Clique em "Editar Plano" para começar.
        </p>
      ) : (
        <div className="printable-content space-y-6">
          {planStructure.map(section => {
            const answeredQuestions = section.questions.filter(q => {
              const answer = answers[q.id];
              return answer && (Array.isArray(answer) ? answer.length > 0 : true);
            });

            if (answeredQuestions.length === 0) return null;

            return (
              <div key={section.id} className="break-inside-avoid">
                <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                  {section.title}
                </h3>
                <div className="space-y-4">
                  {answeredQuestions.map(q => {
                    const answer = answers[q.id];
                    return (
                      <div key={q.id}>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{q.text}</p>
                        {Array.isArray(answer) ? (
                          <ul className="list-disc list-inside pl-2">
                            {answer.map(item => (
                              <li key={item} className="text-slate-600 dark:text-slate-400">{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-600 dark:text-slate-400 pl-2">{answer}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}