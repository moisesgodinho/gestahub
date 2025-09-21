// src/hooks/useGestationalData.js
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getEstimatedLmp, getDueDate } from '@/lib/gestationalAge';
import { weeklyInfo } from '@/data/weeklyInfo';

export function useGestationalData(user) {
  const [loading, setLoading] = useState(true);
  const [estimatedLmp, setEstimatedLmp] = useState(null);
  const [dataSource, setDataSource] = useState('dum');
  const [hasData, setHasData] = useState(false);
  const [gestationalInfo, setGestationalInfo] = useState(null);
  const [countdown, setCountdown] = useState({ weeks: 0, days: 0 });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      // Reseta os estados quando o usuário faz logout
      setHasData(false);
      setGestationalInfo(null);
      setEstimatedLmp(null);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const lmpDate = getEstimatedLmp(userData);

        if (lmpDate) {
          setEstimatedLmp(lmpDate);
          setDataSource(userData.ultrasound?.examDate ? 'ultrassom' : 'dum');
          setHasData(true);
          
          // Calcula as informações gestacionais
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
              currentWeekInfo: weeklyInfo[weeks] || weeklyInfo[42],
          });

        } else {
          setHasData(false);
          setGestationalInfo(null);
        }
      } else {
        setHasData(false);
        setGestationalInfo(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { loading, estimatedLmp, gestationalInfo, countdown, dataSource, hasData };
}