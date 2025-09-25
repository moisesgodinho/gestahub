// src/hooks/useBirthPlan.js
import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-toastify";
import { birthPlanData as defaultPlan } from "@/data/birthPlanData";

export function useBirthPlan(user) {
  const [answers, setAnswers] = useState({});
  const [planStructure, setPlanStructure] = useState(defaultPlan);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data().gestationalProfile || {};
        setAnswers(userData.birthPlanAnswers || {});
        setPlanStructure(userData.birthPlanStructure || defaultPlan);
      } else {
        setPlanStructure(defaultPlan);
        setAnswers({});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateFirestore = async (dataToUpdate) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        { gestationalProfile: dataToUpdate },
        { merge: true }
      );
    } catch (error) {
      console.error("Erro ao salvar o Plano de Parto:", error);
      toast.error("Não foi possível salvar as alterações.");
    }
  };

  const saveAnswers = async (newAnswers) => {
    await updateFirestore({ birthPlanAnswers: newAnswers });
    toast.success("Plano de Parto salvo com sucesso!");
  };

  const addCustomOption = async (sectionId, questionId, newOption) => {
    const newStructure = planStructure.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map(q => {
            if (q.id === questionId) {
              if (q.options.includes(newOption)) return q; // Evita duplicados
              return { ...q, options: [...q.options, newOption] };
            }
            return q;
          })
        };
      }
      return section;
    });
    setPlanStructure(newStructure);
    await updateFirestore({ birthPlanStructure: newStructure });
  };
  
  const removeCustomOption = async (sectionId, questionId, optionToRemove) => {
    const newStructure = planStructure.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map(q => {
            if (q.id === questionId) {
              return { ...q, options: q.options.filter(opt => opt !== optionToRemove) };
            }
            return q;
          })
        };
      }
      return section;
    });
    
    setPlanStructure(newStructure);
    await updateFirestore({ birthPlanStructure: newStructure });
    toast.info("Opção removida!");
  };


  return { answers, planStructure, loading, saveAnswers, addCustomOption, removeCustomOption };
}