// src/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getMessaging } from "firebase/messaging"; // Adicione esta linha
import {
  initializeFirestore,
  persistentLocalCache,
  getFirestore,
} from "firebase/firestore";

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
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      cacheSizeBytes: 100000000, // 100 MB
    }),
  });
} catch (error) {
  if (error.code === "failed-precondition") {
    console.warn("Firebase (Firestore):", error.message);
  }
  db = getFirestore(app);
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Adicione a exportação do messaging
export const messaging =
  typeof window !== "undefined" ? getMessaging(app) : null;
export { db };
