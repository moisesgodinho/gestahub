// src/components/WeightChart.js
"use client";

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export default function WeightChart({ history, prePregnancyWeight, dueDate }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Função para verificar se o modo escuro está ativo
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode(); // Verifica o tema na montagem do componente

    // Observa mudanças na classe do elemento <html> para atualizar o tema
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect(); // Limpa o observador
  }, []);

  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );

  const labels = [
    "Início",
    ...sortedHistory.map((entry) =>
      new Date(entry.date).toLocaleDateString("pt-BR", { timeZone: "UTC" }),
    ),
  ];

  const dataPoints = [
    prePregnancyWeight,
    ...sortedHistory.map((entry) => entry.weight),
  ];

  if (dueDate && dueDate > new Date()) {
    labels.push(
      `DPP: ${dueDate.toLocaleDateString("pt-BR", { timeZone: "UTC" })}`,
    );
    dataPoints.push(null);
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: "Seu Peso (kg)",
        data: dataPoints,
        borderColor: "rgb(236, 72, 153)",
        backgroundColor: "rgba(236, 72, 153, 0.5)",
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
        display: false,
      },
      title: {
        display: true,
        text: "Evolução do Peso",
        color: isDarkMode ? "#e2e8f0" : "#1e293b",
        font: {
          size: 18,
        },
        padding: {
          bottom: 15,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          color: isDarkMode ? "#94a3b8" : "#64748b",
        },
        grid: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        ticks: {
          color: isDarkMode ? "#94a3b8" : "#64748b",
        },
        grid: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl mb-6">
      <div className="relative h-64 sm:h-80">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
}
