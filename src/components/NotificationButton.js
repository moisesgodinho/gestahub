// src/components/NotificationButton.js
"use client";

import { useState, useEffect } from "react";
import { getToken } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { messaging, db } from "@/lib/firebase";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";

// Ícone de sino
const BellIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);


export default function NotificationButton() {
  const { user } = useUser();
  const [notificationPermission, setNotificationPermission] = useState(Notification?.permission);

  const handleRequestPermission = async () => {
    if (!user || !messaging) return;

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        const currentToken = await getToken(messaging, { vapidKey });

        if (currentToken) {
          console.log('Seu token de notificação (FCM Token) é:', currentToken);
          toast.info("Token de notificação copiado para o console.");
          
          const userDocRef = doc(db, "users", user.uid);
          await setDoc(userDocRef, { fcmToken: currentToken }, { merge: true });
          toast.success("Notificações ativadas com sucesso!");
        } else {
          toast.warn("Não foi possível obter o token de notificação. Tente novamente.");
        }
      } else {
        toast.error("Permissão para notificações foi negada.");
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão de notificação:", error);
      toast.error("Ocorreu um erro ao ativar as notificações.");
    }
  };

  if (notificationPermission === "granted") {
    return (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        <BellIcon className="w-5 h-5" />
        <p className="font-semibold">Notificações Ativadas</p>
      </div>
    );
  }

  return (
    <button
      onClick={handleRequestPermission}
      className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
    >
      Ativar Notificações
    </button>
  );
}