// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Login from '@/components/Login';
import GestationalInfoDashboard from '@/components/GestationalInfoDashboard';
import CalculatorPanel from '@/components/CalculatorPanel';
import AppNavigation from '@/components/AppNavigation';
import { weeklyInfo } from '@/data/weeklyInfo'; // <-- ADICIONE ESTA LINHA

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCalculator, setActiveCalculator] = useState('dum');
  
  const [isEditing, setIsEditing] = useState(false);
  const [gestationalInfo, setGestationalInfo] = useState(null);
  const [estimatedLmp, setEstimatedLmp] = useState(null);
  const [dataSource, setDataSource] = useState('dum');
  const [countdown, setCountdown] = useState({ weeks: 0, days: 0 });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserData(currentUser.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    let lmpDate = null;

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.ultrasound && data.ultrasound.examDate) {
        const { examDate, weeksAtExam, daysAtExam } = data.ultrasound;
        const examDateTime = new Date(examDate).getTime();
        const daysAtExamTotal = (parseInt(weeksAtExam, 10) * 7) + (parseInt(daysAtExam, 10) || 0);
        lmpDate = new Date(examDateTime);
        lmpDate.setDate(lmpDate.getUTCDate() - daysAtExamTotal);
        setActiveCalculator('ultrassom');
        setDataSource('ultrassom');
      } else if (data.lmp) {
        lmpDate = new Date(data.lmp);
        setActiveCalculator('dum');
        setDataSource('dum');
      }
    }

    if (lmpDate) {
      setEstimatedLmp(lmpDate);
      calculateGestationalInfo(lmpDate);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };
  
  const calculateGestationalInfo = (lmpDate) => {
    const lmpDateTime = lmpDate.getTime();
    const today = new Date();
    const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const gestationalAgeInMs = todayTime - lmpDateTime;
    const gestationalAgeInDays = Math.floor(gestationalAgeInMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(gestationalAgeInDays / 7);
    const days = gestationalAgeInDays % 7;
    const dueDate = new Date(lmpDateTime);
    dueDate.setDate(dueDate.getDate() + 280);

    const totalPregnancyDays = 280;
    const remainingDaysTotal = totalPregnancyDays - gestationalAgeInDays;
    setCountdown({
        weeks: Math.floor(remainingDaysTotal / 7),
        days: remainingDaysTotal % 7,
    });

    setGestationalInfo({
        weeks, days,
        dueDate: dueDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        currentWeekInfo: weeklyInfo[weeks || 1] || "Informações para esta semana ainda não disponíveis.",
    });
  };

  const handleSaveSuccess = async () => {
      if(user) {
        await fetchUserData(user.uid);
      }
      setIsEditing(false);
  };

  if (loading) {
    return ( <div className="flex items-center justify-center flex-grow"> <p className="text-lg text-rose-500 dark:text-rose-400">Carregando...</p> </div> );
  }

  return (
    <div className="flex items-center justify-center flex-grow p-4">
      {!user ? (
        <Login />
      ) : (
        <div className="w-full max-w-3xl">
          {!isEditing && gestationalInfo && (
            <GestationalInfoDashboard 
              gestationalInfo={gestationalInfo}
              countdown={countdown}
              estimatedLmp={estimatedLmp}
              dataSource={dataSource}
              onSwitchToUltrasound={() => {
                setActiveCalculator('ultrassom');
                setIsEditing(true);
              }}
              onEdit={() => setIsEditing(true)}
            />
          )}

          {(isEditing || !gestationalInfo) && (
            <CalculatorPanel
              user={user}
              activeCalculator={activeCalculator}
              onSwitch={setActiveCalculator}
              onSaveSuccess={handleSaveSuccess}
              onCancel={() => setIsEditing(false)}
            />
          )}
          
          <AppNavigation />
        </div>
      )}
    </div>
  );
}