// src/components/WeightChart.js
'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function WeightChart({ history, prePregnancyWeight, dueDate }) { // Recebe dueDate diretamente
  const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));

  const labels = [
    'Início', 
    ...sortedHistory.map(entry => new Date(entry.date).toLocaleDateString('pt-BR'))
  ];

  const dataPoints = [
    prePregnancyWeight, 
    ...sortedHistory.map(entry => entry.weight)
  ];

  // Usa a data do parto recebida para adicionar o ponto final ao gráfico
  if (dueDate && dueDate > new Date()) {
    labels.push(`DPP: ${dueDate.toLocaleDateString('pt-BR')}`);
    dataPoints.push(null); 
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Seu Peso (kg)',
        data: dataPoints,
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.5)',
        tension: 0.1,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
            color: '#cbd5e1'
        }
      },
      title: {
        display: true,
        text: 'Evolução do Peso',
        color: '#e2e8f0',
        font: {
            size: 18
        }
      },
    },
    scales: {
        y: {
            beginAtZero: false,
            ticks: {
                color: '#94a3b8'
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)'
            }
        },
        x: {
            ticks: {
                color: '#94a3b8'
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)'
            }
        }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl mb-6">
      <div className="relative h-64 sm:h-80">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
}