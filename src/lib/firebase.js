// src/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// 1. Importe 'initializeFirestore' e 'persistentLocalCache' em vez de 'getFirestore'
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

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

// 2. Inicialize o Firestore com a configuração de cache offline
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    // Configura o tamanho do cache em bytes. O padrão é 40MB.
    // Você pode ajustar se necessário. 100000000 bytes = 100MB
    cacheSizeBytes: 100000000 
  })
});

// 3. O bloco try...catch foi removido, pois o novo método é mais integrado.

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();