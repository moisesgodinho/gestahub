// src/components/WaterChart.js
"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/context/UserContext";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { Chart } from "react-chartjs-2";
import SkeletonLoader from "./SkeletonLoader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);

export default function WaterChart() {
  const { user } = useUser();
  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "users", user.uid, "waterIntake"),
        orderBy("date", "desc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), date: doc.id }));
        setAllEntries(data);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const checkDarkMode = () => setIsDarkMode(document.documentElement.classList.contains("dark"));
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const entriesByMonth = useMemo(() => {
    return allEntries.reduce((acc, entry) => {
      const monthYear = entry.date.substring(0, 7);
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(entry);
      return acc;
    }, {});
  }, [allEntries]);

  const sortedMonths = useMemo(() => {
    const today = new Date();
    const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const monthKeys = new Set(Object.keys(entriesByMonth));
    monthKeys.add(currentMonthKey);
    return Array.from(monthKeys).sort().reverse();
  }, [entriesByMonth]);

  const chartData = useMemo(() => {
    if (sortedMonths.length === 0) return null;

    const monthKey = sortedMonths[currentMonthIndex];
    const monthEntries = entriesByMonth[monthKey] || [];
    const goal = monthEntries.length > 0 ? monthEntries[0].goal : 2000;

    const [year, month] = monthKey.split('-').map(Number);
    const numDaysInMonth = new Date(year, month, 0).getDate();

    const labels = Array.from({ length: numDaysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));
    const data = Array(numDaysInMonth).fill(null);

    monthEntries.forEach(entry => {
      const dayOfMonth = new Date(entry.date + 'T00:00:00Z').getUTCDate();
      data[dayOfMonth - 1] = entry.current;
    });

    // --- LÓGICA HÍBRIDA (BARRA ÚNICA / ONDA) ---
    const isSingleDataPoint = monthEntries.length <= 1;
    
    const consumptionDataset = {
      label: `Consumo de Água (ml)`,
      data: data,
      order: 2,
    };

    if (isSingleDataPoint) {
      Object.assign(consumptionDataset, {
        type: 'bar',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
          gradient.addColorStop(1, 'rgba(147, 197, 253, 0.4)');
          return gradient;
        },
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: { topLeft: 15, topRight: 15 },
        borderSkipped: false,
        maxBarThickness: 60,
      });
    } else {
      Object.assign(consumptionDataset, {
        type: 'line',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
          gradient.addColorStop(1, 'rgba(147, 197, 253, 0)');
          return gradient;
        },
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointRadius: 3,
        tension: 0.4,
        fill: true,
      });
    }

    return {
      labels,
      datasets: [
        consumptionDataset,
        {
          type: 'line',
          label: `Meta: ${goal}ml`,
          data: Array(numDaysInMonth).fill(goal),
          borderColor: isDarkMode ? 'rgba(251, 146, 60, 0.7)' : 'rgba(249, 115, 22, 0.7)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
          tension: 0.1,
          order: 1,
        }
      ],
    };
  }, [currentMonthIndex, entriesByMonth, sortedMonths, isDarkMode]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDarkMode ? '#e2e8f0' : '#334155',
        }
      },
      tooltip: {
        filter: function (tooltipItem) {
          return tooltipItem.datasetIndex === 0;
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: isDarkMode ? "#94a3b8" : "#64748b" },
        grid: { color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" },
      },
      x: {
        ticks: { color: isDarkMode ? "#94a3b8" : "#64748b" },
        grid: { display: false },
      },
    },
  };

  if (loading) {
    return <SkeletonLoader type="card" />;
  }
  
  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl mt-8">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentMonthIndex(prev => Math.min(prev + 1, sortedMonths.length - 1))}
          disabled={currentMonthIndex >= sortedMonths.length - 1}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
        >
          <ChevronLeftIcon />
        </button>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 capitalize">
          {new Date(sortedMonths[currentMonthIndex] + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
        </h3>
        <button
          onClick={() => setCurrentMonthIndex(prev => Math.max(prev - 1, 0))}
          disabled={currentMonthIndex <= 0}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
        >
          <ChevronRightIcon />
        </button>
      </div>
      <div className="relative h-64">
        {chartData && <Chart type='bar' options={options} data={chartData} />}
      </div>
    </div>
  );
}