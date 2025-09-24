// src/hooks/useMaternityBag.js
import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { maternityBagData as defaultData } from "@/data/maternityBagData";
import { toast } from "react-toastify";

export function useMaternityBag(user) {
  const [listData, setListData] = useState(null);
  const [checkedItems, setCheckedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data().gestationalProfile || {};
        if (userData.maternityBagList) {
          setListData(userData.maternityBagList);
        } else {
          // Se o usuário não tem lista, cria uma a partir do padrão
          setListData(defaultData);
          await setDoc(
            userDocRef,
            { gestationalProfile: { maternityBagList: defaultData } },
            { merge: true }
          );
        }
        setCheckedItems(userData.maternityBagChecked || []);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Função genérica para salvar as atualizações no Firestore
  const updateFirestore = async (newData) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { gestationalProfile: newData }, { merge: true });
    } catch (error) {
      console.error("Erro ao atualizar a mala:", error);
      toast.error("Não foi possível salvar as alterações.");
    }
  };

  const addItem = async (categoryId, label) => {
    if (!listData) return;
    const newItem = {
      id: `custom-${Date.now()}`,
      label,
      isCustom: true,
    };

    const newListData = { ...listData };
    newListData[categoryId].items.push(newItem);
    
    setListData(newListData); // Atualiza o estado local imediatamente
    await updateFirestore({ maternityBagList: newListData });
  };

  const removeItem = async (categoryId, itemId) => {
    if (!listData) return;

    const newListData = { ...listData };
    newListData[categoryId].items = newListData[categoryId].items.filter(
      (item) => item.id !== itemId
    );
    
    const newCheckedItems = checkedItems.filter((id) => id !== itemId);

    setListData(newListData);
    setCheckedItems(newCheckedItems);
    await updateFirestore({ maternityBagList: newListData, maternityBagChecked: newCheckedItems });
  };

  const toggleItem = async (itemId) => {
    const newCheckedItems = checkedItems.includes(itemId)
      ? checkedItems.filter((id) => id !== itemId)
      : [...checkedItems, itemId];
    
    setCheckedItems(newCheckedItems);
    await updateFirestore({ maternityBagChecked: newCheckedItems });
  };

  const restoreDefaults = async () => {
    if (!listData) return;
    let itemsRestored = 0;
    const newListData = JSON.parse(JSON.stringify(listData)); // Deep copy

    Object.keys(defaultData).forEach((categoryId) => {
      defaultData[categoryId].items.forEach((defaultItem) => {
        const itemExists = newListData[categoryId].items.some(
          (userItem) => userItem.id === defaultItem.id
        );
        if (!itemExists) {
          newListData[categoryId].items.push(defaultItem);
          itemsRestored++;
        }
      });
    });

    if (itemsRestored > 0) {
      setListData(newListData);
      await updateFirestore({ maternityBagList: newListData });
      toast.success(`${itemsRestored} item(ns) padrão restaurado(s)!`);
    } else {
      toast.info("Nenhum item padrão para restaurar.");
    }
  };


  return { listData, checkedItems, loading, addItem, removeItem, toggleItem, restoreDefaults };
}