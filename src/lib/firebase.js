// src/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  getFirestore, // Importe também o getFirestore
} from "firebase/firestore";

// As suas credenciais do Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let db;

// CORREÇÃO: Envolve a inicialização em um try...catch
try {
  // Tenta inicializar o Firestore com as opções de cache offline
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      cacheSizeBytes: 100000000, // 100 MB
    }),
  });
} catch (error) {
  // Se der erro (porque já foi inicializado), apenas pega a instância existente
  if (error.code === 'failed-precondition') {
      console.warn("Firebase (Firestore):", error.message);
  }
  db = getFirestore(app);
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { db }; // Exporta a instância do db (seja ela nova ou a já existente)