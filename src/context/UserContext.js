// src/context/UserContext.js
"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "react-toastify";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const hadPendingWrites = useRef(false);

  useEffect(() => {
    // --- INÍCIO DA MUDANÇA ---
    let unsubscribeSyncListener = () => {};

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        document.body.classList.add("user-logged-in");
        
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().profile) {
          setUserProfile(docSnap.data().profile);
        }

        // Configura o listener para feedback de sincronização
        unsubscribeSyncListener = onSnapshot(docRef, { includeMetadataChanges: true }, (snapshot) => {
          const hasWrites = snapshot.metadata.hasPendingWrites;
          
          // Se o estado anterior tinha escritas pendentes e o atual não tem,
          // significa que uma sincronização com o servidor acabou de ser concluída.
          if (hadPendingWrites.current && !hasWrites) {
            toast.success("Seus dados foram sincronizados com a nuvem!");
          }

          // Atualiza o estado para a próxima verificação.
          hadPendingWrites.current = hasWrites;
        });

      } else {
        document.body.classList.remove("user-logged-in");
        setUserProfile(null);
        hadPendingWrites.current = false; // Reseta ao fazer logout
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubscribeSyncListener(); // Garante que o novo listener seja limpo
    };
    // --- FIM DA MUDANÇA ---
  }, []);

  const updateUserProfile = (newProfile) => {
    setUserProfile(newProfile);
  };

  const value = {
    user,
    userProfile,
    loading,
    updateUserProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => {
  return useContext(UserContext);
};