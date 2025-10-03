// src/hooks/useShoppingList.js
import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { shoppingListData as defaultData } from "@/data/shoppingListData";
import { toast } from "react-toastify";

export function useShoppingList(user) {
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
        if (userData.shoppingList) {
          setListData(userData.shoppingList);
        } else {
          setListData(defaultData);
          await setDoc(
            userDocRef,
            { gestationalProfile: { shoppingList: defaultData } },
            { merge: true }
          );
        }
        setCheckedItems(userData.shoppingListChecked || []);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateFirestore = async (newData) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        { gestationalProfile: newData },
        { merge: true }
      );
    } catch (error) {
      console.error("Erro ao atualizar a lista de compras:", error);
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

    setListData(newListData);
    await updateFirestore({ shoppingList: newListData });
  };

  const removeItem = async (categoryId, itemId, onComplete) => {
    if (!listData) return;

    const newListData = { ...listData };
    newListData[categoryId].items = newListData[categoryId].items.filter(
      (item) => item.id !== itemId
    );

    const newCheckedItems = checkedItems.filter((id) => id !== itemId);

    setListData(newListData);
    setCheckedItems(newCheckedItems);
    await updateFirestore({
      shoppingList: newListData,
      shoppingListChecked: newCheckedItems,
    });

    toast.info("Item removido da lista.");
    if (onComplete) onComplete();
  };

  const toggleItem = async (itemId) => {
    const newCheckedItems = checkedItems.includes(itemId)
      ? checkedItems.filter((id) => id !== itemId)
      : [...checkedItems, itemId];

    setCheckedItems(newCheckedItems);
    await updateFirestore({ shoppingListChecked: newCheckedItems });
  };

  const restoreDefaults = async () => {
    if (!listData) return;
    let itemsRestored = 0;
    const newListData = JSON.parse(JSON.stringify(listData));

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
      await updateFirestore({ shoppingList: newListData });
      toast.success(`${itemsRestored} item(ns) padrão restaurado(s)!`);
    } else {
      toast.info("Nenhum item padrão para restaurar.");
    }
  };

  return {
    listData,
    checkedItems,
    loading,
    addItem,
    removeItem,
    toggleItem,
    restoreDefaults,
  };
}
