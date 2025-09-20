// src/components/SymptomChart.js
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { moodOptions } from '@/data/journalData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SymptomChart({ entries }) {
  const [activeTab, setActiveTab] = useState('mood'); // 'mood' ou 'symptoms'
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const chartData = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEntries = entries.filter(entry => new Date(entry.date) >= thirtyDaysAgo);

    if (recentEntries.length === 0) {
      return null;
    }

    // Processamento para o gráfico de Humor
    const moodCounts = moodOptions.reduce((acc, mood) => {
      acc[mood.value] = { count: 0, label: mood.label };
      return acc;
    }, {});

    recentEntries.forEach(entry => {
      if (entry.mood && moodCounts[entry.mood]) {
        moodCounts[entry.mood].count++;
      }
    });

    const sortedMoods = Object.entries(moodCounts)
      .map(([value, { count, label }]) => ({ value, count, label }))
      .filter(m => m.count > 0)
      .sort((a, b) => b.count - a.count);

    const moodChart = {
      labels: sortedMoods.map(m => m.label),
      datasets: [{
        label: 'Frequência de Humor',
        data: sortedMoods.map(m => m.count),
        backgroundColor: 'rgba(79, 70, 229, 0.6)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
      }],
    };

    // Processamento para o gráfico de Sintomas
    const symptomCounts = {};
    recentEntries.forEach(entry => {
      entry.symptoms?.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });

    const sortedSymptoms = Object.entries(symptomCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10); // Mostra os 10 sintomas mais frequentes

    const symptomChart = {
      labels: sortedSymptoms.map(([symptom]) => symptom),
      datasets: [{
        label: 'Frequência de Sintomas',
        data: sortedSymptoms.map(([, count]) => count),
        backgroundColor: 'rgba(219, 39, 119, 0.6)',
        borderColor: 'rgba(219, 39, 119, 1)',
        borderWidth: 1,
      }],
    };

    return { moodChart, symptomChart };
  }, [entries]);

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Registros dos Últimos 30 Dias`,
        color: isDarkMode ? '#e2e8f0' : '#1e293b',
        font: { size: 18 },
        padding: { bottom: 20 }
      },
    },
    scales: {
      x: {
        ticks: { color: isDarkMode ? '#94a3b8' : '#64748b', stepSize: 1 },
        grid: { color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
      },
      y: {
        ticks: { color: isDarkMode ? '#94a3b8' : '#64748b' },
        grid: { color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
      }
    }
  };
  
  if (!chartData) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mb-6 text-center">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          Resumo Gráfico
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          Adicione registros ao seu diário por alguns dias para ver um resumo gráfico do seu humor e sintomas.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl mb-6">
      <div className="mb-4 flex border-b border-slate-200 dark:border-slate-700">
        <button onClick={() => setActiveTab('mood')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'mood' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500'}`}>
          Resumo de Humor
        </button>
        <button onClick={() => setActiveTab('symptoms')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'symptoms' ? 'border-b-2 border-rose-500 text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400 hover:text-rose-500'}`}>
          Resumo de Sintomas
        </button>
      </div>
      <div className="relative h-80">
        {activeTab === 'mood' ? (
          <Bar options={options} data={chartData.moodChart} />
        ) : (
          <Bar options={options} data={chartData.symptomChart} />
        )}
      </div>
    </div>
  );
}