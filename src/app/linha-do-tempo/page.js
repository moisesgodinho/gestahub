// src/app/linha-do-tempo/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import Timeline from "@/components/Timeline";
import { useUser } from "@/context/UserContext";
import { useGestationalData } from "@/hooks/useGestationalData";
import SkeletonLoader from "@/components/SkeletonLoader";
import { useTimelineData } from "@/hooks/useTimelineData";
import ChevronLeftIcon from "@/components/icons/ChevronLeftIcon";
import ChevronRightIcon from "@/components/icons/ChevronRightIcon";

function WeekNavigator({ currentWeek, selectedWeek, onSelectWeek }) {
  const scrollerRef = useRef(null);

  useEffect(() => {
    if (scrollerRef.current) {
      const selectedElement = scrollerRef.current.querySelector(
        `[data-week="${selectedWeek}"]`
      );
      if (selectedElement) {
        const scrollPosition =
          selectedElement.offsetLeft -
          scrollerRef.current.offsetWidth / 2 +
          selectedElement.offsetWidth / 2;
        scrollerRef.current.scrollTo({
          left: scrollPosition,
          behavior: "smooth",
        });
      }
    }
  }, [selectedWeek]);

  const handleScroll = (direction) => {
    if (scrollerRef.current) {
      const scrollAmount = scrollerRef.current.offsetWidth * 0.7;
      scrollerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex items-center justify-between my-4">
      <button
        onClick={() => handleScroll("left")}
        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
      >
        <ChevronLeftIcon />
        <span className="sr-only">Rolar para a esquerda</span>
      </button>

      <div
        ref={scrollerRef}
        className="flex-grow flex items-center space-x-2 overflow-x-auto custom-scrollbar-hidden px-4" // <-- PADDING ADICIONADO AQUI
      >
        {Array.from({ length: 42 }, (_, i) => i + 1).map((week) => (
          <button
            key={week}
            data-week={week}
            onClick={() => onSelectWeek(week)}
            className={`w-10 h-10 rounded-full font-semibold text-sm flex-shrink-0 transition-all duration-200 flex items-center justify-center ${
              week === selectedWeek
                ? "bg-rose-500 text-white scale-110 shadow-lg"
                : week === currentWeek
                ? "bg-rose-100 dark:bg-rose-900/50 text-rose-500"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {week}
          </button>
        ))}
      </div>

      <button
        onClick={() => handleScroll("right")}
        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
      >
        <ChevronRightIcon />
        <span className="sr-only">Rolar para a direita</span>
      </button>
    </div>
  );
}

export default function TimelinePage() {
  const { user, loading: userLoading } = useUser();
  const { estimatedLmp, loading: gestationalLoading } = useGestationalData(user);
  const {
    timeline,
    currentWeek,
    loading: timelineLoading,
  } = useTimelineData(user, estimatedLmp);

  const [selectedWeek, setSelectedWeek] = useState(0);

  useEffect(() => {
    if (currentWeek > 0 && selectedWeek === 0) {
      setSelectedWeek(currentWeek);
    }
  }, [currentWeek, selectedWeek]);

  const loading = userLoading || gestationalLoading || timelineLoading;

  if (loading && Object.keys(timeline).length === 0) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <SkeletonLoader type="fullPage" />
      </div>
    );
  }

  const weekToDisplay = selectedWeek || currentWeek;

  return (
    <div className="flex items-start justify-center flex-grow p-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400 mb-2 text-center">
          Linha do Tempo
        </h1>
        <WeekNavigator
          currentWeek={currentWeek}
          selectedWeek={weekToDisplay}
          onSelectWeek={setSelectedWeek}
        />
        <Timeline
          weekData={timeline[weekToDisplay] || []}
          selectedWeek={weekToDisplay}
        />
      </div>
    </div>
  );
}