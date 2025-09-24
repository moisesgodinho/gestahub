// src/hooks/useMaternityBag.js
import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useMaternityBag(user) {
  const [checkedItems, setCheckedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setCheckedItems([]);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const bagData = userData.gestationalProfile?.maternityBag || [];
        setCheckedItems(bagData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateCheckedItems = async (newCheckedItems) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        { gestationalProfile: { maternityBag: newCheckedItems } },
        { merge: true },
      );
    } catch (error) {
      console.error("Erro ao salvar itens da mala:", error);
    }
  };

  return { checkedItems, loading, updateCheckedItems };
}
