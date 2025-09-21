// src/hooks/useWeightData.js
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getEstimatedLmp, getDueDate } from '@/lib/gestationalAge';

const calculateBMI = (weight, height) => {
  if (!weight || !height) return 0;
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
};

export function useWeightData(user) {
  const [loading, setLoading] = useState(true);
  const [weightProfile, setWeightProfile] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [calculations, setCalculations] = useState({
    initialBmi: 0,
    currentBmi: 0,
    currentGain: 0,
  });
  const [estimatedLmp, setEstimatedLmp] = useState(null);
  const [dueDate, setDueDate] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const lmpDate = getEstimatedLmp(userData);

        if (lmpDate) {
          setEstimatedLmp(lmpDate);
          setDueDate(getDueDate(lmpDate));
        }

        if (userData.weightProfile) {
          const profile = userData.weightProfile;
          const history = profile.history?.sort((a, b) => new Date(b.date) - new Date(a.date)) || [];
          setWeightProfile(profile);
          setWeightHistory(history);

          if (profile.height && profile.prePregnancyWeight) {
            const initialBmi = calculateBMI(profile.prePregnancyWeight, profile.height);
            let currentBmi = initialBmi;
            let currentGain = 0;

            if (history.length > 0) {
              const latestEntry = history[0]; // Already sorted desc
              currentGain = (latestEntry.weight - profile.prePregnancyWeight).toFixed(2);
              currentBmi = latestEntry.bmi;
            }
            setCalculations({ initialBmi, currentBmi, currentGain });
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { loading, weightProfile, weightHistory, calculations, estimatedLmp, dueDate, setWeightHistory };
}