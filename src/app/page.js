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
import AgendaProximosPassos from '@/components/AgendaProximosPassos';
import { weeklyInfo } from '@/data/weeklyInfo';
import { getEstimatedLmp, getDueDate } from '@/lib/gestationalAge';

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

    if (docSnap.exists()) {
      const userData = docSnap.data();
      const lmpDate = getEstimatedLmp(userData);

      if (lmpDate) {
        setEstimatedLmp(lmpDate);
        calculateGestationalInfo(lmpDate);
        
        const source = userData.ultrasound && userData.ultrasound.examDate ? 'ultrassom' : 'dum';
        setDataSource(source);
        setActiveCalculator(source);
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    } else {
      setIsEditing(true);
    }
  };
  
  const calculateGestationalInfo = (lmpDate) => {
    const lmpDateTime = lmpDate.getTime();
    const today = new Date();
    const todayTime = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    
    const gestationalAgeInMs = todayTime - lmpDateTime;
    const gestationalAgeInDays = Math.floor(gestationalAgeInMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(gestationalAgeInDays / 7);
    const days = gestationalAgeInDays % 7;
    
    const dueDate = getDueDate(lmpDate);

    const totalPregnancyDays = 280;
    const remainingDaysTotal = totalPregnancyDays - gestationalAgeInDays;
    setCountdown({
        weeks: Math.floor(remainingDaysTotal / 7),
        days: remainingDaysTotal % 7,
    });

    setGestationalInfo({
        weeks, days,
        dueDate: dueDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        currentWeekInfo: weeklyInfo[weeks] || weeklyInfo[42], // Adiciona um fallback para o final
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
          {!isEditing && gestationalInfo ? (
            <>
              <GestationalInfoDashboard 
                gestationalInfo={gestationalInfo}
                countdown={countdown}
                dataSource={dataSource}
                onSwitchToUltrasound={() => {
                  setActiveCalculator('ultrassom');
                  setIsEditing(true);
                }}
                onEdit={() => setIsEditing(true)}
              />
              <AgendaProximosPassos lmpDate={estimatedLmp} user={user} />
            </>
          ) : (
            <CalculatorPanel
              user={user}
              activeCalculator={activeCalculator}
              onSwitch={setActiveCalculator}
              onSaveSuccess={handleSaveSuccess}
              onCancel={() => gestationalInfo && setIsEditing(false)}
            />
          )}
          
          <AppNavigation />
        </div>
      )}
    </div>
  );
}