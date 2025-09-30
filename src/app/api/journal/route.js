// src/app/api/journal/route.js

import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

// Inicialização do Firebase Admin (coloque suas credenciais no Vercel)
try {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (e) {
  console.error("Firebase Admin Initialization Error", e.message);
}

const db = admin.firestore();

export async function POST(request) {
  try {
    const { token, entryData } = await request.json();

    if (!token || !entryData || !entryData.date) {
      return NextResponse.json({ success: false, error: "Dados inválidos." }, { status: 400 });
    }

    // Autenticar o usuário
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Salvar no Firestore
    const entryRef = db.collection("users").doc(uid).collection("symptomEntries").doc(entryData.date);
    await entryRef.set(entryData, { merge: true });

    return NextResponse.json({ success: true, message: "Entrada salva com sucesso!" });

  } catch (error) {
    console.error("Erro ao salvar entrada do diário:", error);
    // Se o token for inválido, o erro será capturado aqui
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
      return NextResponse.json({ success: false, error: "Autenticação inválida." }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "Erro interno do servidor." }, { status: 500 });
  }
}