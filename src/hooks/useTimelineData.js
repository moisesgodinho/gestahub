// src/hooks/useTimelineData.js
import { useState, useEffect } from "react";
import { doc, onSnapshot, collection, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getDueDate } from "@/lib/gestationalAge";
import { timelineTasks } from "@/data/timelineData";
import { weeklyInfo } from "@/data/weeklyInfo"; // Importe weeklyInfo

// Importe os ícones que vamos usar
import CalendarIcon from "@/components/icons/CalendarIcon";
import StarIcon from "@/components/icons/StarIcon";
import CheckCircleIcon from "@/components/icons/CheckCircleIcon";
import BabyIcon from "@/components/icons/BabyIcon";
import HeartIcon from "@/components/icons/HeartIcon";


const ultrasoundSchedule = [
  {
    id: "transvaginal",
    name: "1º Ultrassom (Transvaginal)",
    startWeek: 8,
    endWeek: 11,
    type: "ultrasound",
    color: "bg-blue-500",
    icon: CalendarIcon,
  },
  {
    id: "morfologico_1",
    name: "Morfológico 1º Trimestre",
    startWeek: 12,
    endWeek: 14,
    type: "ultrasound",
    color: "bg-green-500",
    icon: CalendarIcon,
  },
  {
    id: "morfologico_2",
    name: "Morfológico 2º Trimestre",
    startWeek: 22,
    endWeek: 24,
    type: "ultrasound",
    color: "bg-pink-500",
    icon: CalendarIcon,
  },
  {
    id: "ecocardiograma",
    name: "Ecocardiograma Fetal",
    startWeek: 26,
    endWeek: 28,
    type: "ultrasound",
    color: "bg-purple-500",
    icon: CalendarIcon,
  },
  {
    id: "doppler_3",
    name: "3º Trimestre com Doppler",
    startWeek: 28,
    endWeek: 36,
    type: "ultrasound",
    color: "bg-teal-500",
    icon: CalendarIcon,
  },
];

export function useTimelineData(user, lmpDate) {
  const [timeline, setTimeline] = useState({});
  const [currentWeek, setCurrentWeek] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !lmpDate) {
      setLoading(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lmpTime = lmpDate.getTime();
    const todayTime = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const gestationalAgeInMs = todayTime - lmpTime;
    const gestationalAgeInDays = Math.floor(
      gestationalAgeInMs / (1000 * 60 * 60 * 24)
    );
    const currentWeekNumber = Math.floor(gestationalAgeInDays / 7);
    setCurrentWeek(currentWeekNumber);

    const processData = (
      manualAppointments = [],
      ultrasoundAppointments = []
    ) => {
      let eventsByWeek = {};

      const addEventToWeek = (weekNumber, event) => {
        if (!eventsByWeek[weekNumber]) {
          eventsByWeek[weekNumber] = [];
        }
        eventsByWeek[weekNumber].push(event);
      };

      // **NOVO**: Adicionar informações da mãe e do bebê para TODAS as semanas
      weeklyInfo.forEach((info, week) => {
        if (week > 0 && week <= 42) {
          // Adiciona info do bebê
          addEventToWeek(week, {
            id: `baby-info-${week}`,
            title: info.baby,
            source: "Desenvolvimento do Bebê",
            color: "bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-200",
            icon: BabyIcon,
          });
          // Adiciona info da mãe
          addEventToWeek(week, {
            id: `mom-info-${week}`,
            title: info.mom,
            source: "Mudanças na Mamãe",
            color: "bg-pink-100 dark:bg-pink-500/20 text-pink-800 dark:text-pink-200",
            icon: HeartIcon,
          });
        }
      });

      for (const week in timelineTasks) {
        timelineTasks[week].forEach((task) => {
          addEventToWeek(parseInt(week, 10), {
            ...task,
            icon: CheckCircleIcon,
            source: "Marcos e Tarefas",
          });
        });
      }

      manualAppointments.forEach((app) => {
        const appDate = new Date(app.date + "T00:00:00Z");
        const daysFromLmp = Math.floor(
          (appDate.getTime() - lmpTime) / (1000 * 60 * 60 * 24)
        );
        const weekNumber = Math.floor(daysFromLmp / 7);

        addEventToWeek(weekNumber, {
          id: `manual-${app.id}`,
          title: app.title,
          source: "Consultas",
          color: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200",
          icon: CalendarIcon,
        });
      });

      ultrasoundAppointments.forEach((app) => {
          const startWeek = app.startWeek;
          const endWeek = app.endWeek;

          for (let week = startWeek; week <= endWeek; week++) {
              addEventToWeek(week, {
                  id: `ultrasound-window-${app.id}-${week}`,
                  title: `Janela para: ${app.name}`,
                  source: 'Ultrassons',
                  color: 'bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-200',
                  icon: CalendarIcon,
                  isWindow: true
              })
          }
      });

      const dueDate = getDueDate(lmpDate);
      if (dueDate) {
        addEventToWeek(40, {
          id: "due-date",
          title: "Data Provável do Parto!",
          source: "Gestação",
          color: "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-200",
          icon: StarIcon,
        });
      }
        
      setTimeline(eventsByWeek);
      setLoading(false);
    };

    const appointmentsRef = collection(db, "users", user.uid, "appointments");
    const q = query(appointmentsRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const manual = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      
      const userDocRef = doc(db, "users", user.uid);
      onSnapshot(userDocRef, (docSnap) => {
        const userData = docSnap.exists() ? docSnap.data() : {};
        const ultrasoundData = userData.gestationalProfile?.ultrasoundSchedule || {};
        const scheduledUltrasounds = ultrasoundSchedule.map(exam => ({
          ...exam,
          ...ultrasoundData[exam.id],
        }));
        processData(manual, scheduledUltrasounds);
      });
    });

    return () => unsubscribe();
  }, [user, lmpDate]);

  return { timeline, currentWeek, loading };
}