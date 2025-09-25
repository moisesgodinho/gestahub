// src/components/BirthPlanForm.js
"use client";

import { useState, useEffect } from "react";
import { birthPlanData as defaultPlanData } from "@/data/birthPlanData";
import Card from "@/components/Card";
import InfoTooltip from "@/components/InfoTooltip";

const DeleteIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );

function AddOptionForm({ onAdd }) {
    const [text, setText] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onAdd(text.trim());
            setText("");
        }
    };
    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-3">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Outra opção..."
                className="flex-grow px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 text-sm"
            />
            <button type="submit" className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 text-sm">
                Adicionar
            </button>
        </form>
    )
}

function Section({ section, answers, onAnswerChange, onAddOption, onRemoveOption }) {

  const handleCheckboxChange = (questionId, option) => {
    const currentAnswers = answers[questionId] || [];
    const newAnswers = currentAnswers.includes(option)
      ? currentAnswers.filter((item) => item !== option)
      : [...currentAnswers, option];
    onAnswerChange(questionId, newAnswers);
  };

  return (
    <div className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 p-4">
        <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{section.title}</h3>
        <div className="space-y-6">
          {section.questions.map((q) => {
            const defaultQuestion = defaultPlanData
                .find(s => s.id === section.id)?.questions
                .find(dq => dq.id === q.id);
            const tooltipText = defaultQuestion?.tooltip;
            const defaultQuestionOptions = defaultQuestion?.options || [];

            return (
                <div key={q.id}>
                    <div className="flex items-center gap-2 mb-2">
                        <p className="block text-md font-medium text-slate-700 dark:text-slate-300">{q.text}</p>
                        {tooltipText && <InfoTooltip text={tooltipText} />}
                    </div>
                    {q.type === "radio" && q.options.map((option) => (
                    <div key={option} className="flex items-center gap-3 group">
                        <label className="flex-grow flex items-center gap-3 mb-2 cursor-pointer">
                            <input
                                type="radio"
                                name={q.id}
                                value={option}
                                checked={answers[q.id] === option}
                                onChange={(e) => onAnswerChange(q.id, e.target.value)}
                                className="sr-only peer"
                            />
                            <div className={`w-5 h-5 border-2 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${answers[q.id] === option ? 'bg-rose-500 border-rose-500' : 'border-slate-400 dark:border-slate-500'}`}>
                                <div className={`w-2.5 h-2.5 bg-white rounded-full transform transition-transform ${answers[q.id] === option ? 'scale-100' : 'scale-0'}`}></div>
                            </div>
                            <span className="text-slate-600 dark:text-slate-400">{option}</span>
                        </label>
                        {!defaultQuestionOptions.includes(option) && (
                            <button onClick={() => onRemoveOption(section.id, q.id, option)} className="p-1 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DeleteIcon />
                            </button>
                        )}
                    </div>
                    ))}
                    {q.type === "checkbox" && q.options.map((option) => (
                        <div key={option} className="flex items-center gap-3 group">
                            <label className="flex-grow flex items-center gap-3 mb-2 cursor-pointer">
                            <input
                                type="checkbox"
                                value={option}
                                checked={(answers[q.id] || []).includes(option)}
                                onChange={() => handleCheckboxChange(q.id, option)}
                                className="sr-only peer"
                            />
                            <div className={`w-5 h-5 border-2 rounded-md flex-shrink-0 flex items-center justify-center transition-colors ${(answers[q.id] || []).includes(option) ? 'bg-rose-500 border-rose-500' : 'border-slate-400 dark:border-slate-500'}`}>
                                <svg className={`w-3.5 h-3.5 text-white transform transition-transform ${(answers[q.id] || []).includes(option) ? 'scale-100' : 'scale-0'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <span className="text-slate-600 dark:text-slate-400">{option}</span>
                            </label>
                             {!defaultQuestionOptions.includes(option) && (
                                <button onClick={() => onRemoveOption(section.id, q.id, option)} className="p-1 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DeleteIcon />
                                </button>
                            )}
                        </div>
                    ))}
                    <AddOptionForm onAdd={(newOption) => onAddOption(section.id, q.id, newOption)} />
                </div>
            )})}
        </div>
    </div>
  );
}

export default function BirthPlanForm({ answers: initialAnswers, planStructure, onSave, onAddOption, onRemoveOption }) {
  const [answers, setAnswers] = useState(initialAnswers || {});

  useEffect(() => {
    setAnswers(initialAnswers || {});
  }, [initialAnswers]);

  const handleAnswerChange = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
  };

  const handleSave = () => {
    onSave(answers);
  };

  return (
    <div>
      <Card>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {planStructure.map((section) => (
            <Section
              key={section.id}
              section={section}
              answers={answers}
              onAnswerChange={handleAnswerChange}
              onAddOption={onAddOption}
              onRemoveOption={onRemoveOption}
            />
          ))}
        </div>
      </Card>
      <div className="mt-6 text-center">
        <button
          onClick={handleSave}
          className="px-8 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
        >
          Salvar Plano de Parto
        </button>
      </div>
    </div>
  );
}