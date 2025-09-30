// src/components/NotificationButton.js
"use client";

import { useState, useEffect } from "react";
import { getToken, deleteToken } from "firebase/messaging";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { messaging, db } from "@/lib/firebase";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";

const BellIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const BellOffIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    <path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path>
    <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path>
    <path d="M18 8a6 6 0 0 0-9.33-5"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

export default function NotificationButton() {
  const { user } = useUser();
  const [permission, setPermission] = useState("default");
  const [isTokenActive, setIsTokenActive] = useState(false);
  const [loading, setLoading] = useState(true);
  // --- INÍCIO DA MUDANÇA 1 ---
  const [isSupported, setIsSupported] = useState(true);
  // --- FIM DA MUDANÇA 1 ---

  useEffect(() => {
    const checkNotificationState = async () => {
      setLoading(true);
      // --- INÍCIO DA MUDANÇA 2 ---
      // Verifica se as notificações são suportadas pelo navegador
      if (typeof window !== 'undefined' && 'Notification' in window && messaging) {
        setIsSupported(true);
        setPermission(Notification.permission);
      // --- FIM DA MUDANÇA 2 ---
        if (Notification.permission === "granted" && user) {
          try {
            const currentToken = await getToken(messaging, {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            });
            if (currentToken) {
              const tokenRef = doc(
                db,
                "users",
                user.uid,
                "fcmTokens",
                currentToken
              );
              const docSnap = await getDoc(tokenRef);
              setIsTokenActive(docSnap.exists());
            } else {
              setIsTokenActive(false);
            }
          } catch (error) {
            console.error("Erro ao verificar token:", error);
            setIsTokenActive(false);
          }
        } else {
          setIsTokenActive(false);
        }
      } else {
        // --- INÍCIO DA MUDANÇA 3 ---
        setIsSupported(false);
        // --- FIM DA MUDANÇA 3 ---
      }
      setLoading(false);
    };
    checkNotificationState();
  }, [user]);

  const handleRequestPermission = async () => {
    if (!user || !messaging) return;
    try {
      const currentPermission = await Notification.requestPermission();
      setPermission(currentPermission);

      if (currentPermission === "granted") {
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        const currentToken = await getToken(messaging, { vapidKey });

        if (currentToken) {
          const tokenRef = doc(
            db,
            "users",
            user.uid,
            "fcmTokens",
            currentToken
          );
          await setDoc(tokenRef, { createdAt: new Date() });
          setIsTokenActive(true);
          toast.success("Notificações ativadas neste dispositivo!");
        } else {
          toast.warn("Não foi possível obter o token de notificação. Tente recarregar a página.");
        }
      } else {
        toast.error("Permissão para notificações foi negada.");
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão:", error);
      // --- INÍCIO DA MUDANÇA 4 ---
      if (error.code === 'messaging/unsupported-browser') {
        toast.error("Seu navegador não suporta notificações. Tente usar um navegador diferente.");
      } else {
        toast.error("Ocorreu um erro ao ativar as notificações.");
      }
      // --- FIM DA MUDANÇA 4 ---
    }
  };

  const handleDisableNotifications = async () => {
    if (!user || !messaging) return;
    try {
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      if (currentToken) {
        await deleteToken(messaging);
        const tokenRef = doc(db, "users", user.uid, "fcmTokens", currentToken);
        await deleteDoc(tokenRef);
        setIsTokenActive(false);
        setPermission("default");
        toast.info("Notificações desativadas neste dispositivo.");
      }
    } catch (error) {
      console.error("Erro ao desativar notificações:", error);
      toast.error("Não foi possível desativar as notificações.");
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Verificando status...</p>;
  }
  
  // --- INÍCIO DA MUDANÇA 5 ---
  if (!isSupported) {
    return (
      <p className="text-sm text-amber-600 dark:text-amber-400">
        Seu navegador não é compatível com notificações.
      </p>
    );
  }
  // --- FIM DA MUDANÇA 5 ---

  if (permission === "granted" && isTokenActive) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <BellIcon className="w-5 h-5" />
          <p className="font-semibold">Notificações Ativadas</p>
        </div>
        <button
          onClick={handleDisableNotifications}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-300 transition-colors"
        >
          <BellOffIcon className="w-5 h-5" />
          Desativar neste dispositivo
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleRequestPermission}
      className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
      disabled={permission === "denied"}
    >
      {permission === "denied"
        ? "Notificações Bloqueadas"
        : "Ativar Notificações"}
    </button>
  );
}