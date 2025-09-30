// src/app/api/appointments/route.js

import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

// Inicialização do Firebase Admin (assumindo que as credenciais estão nas variáveis de ambiente)
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

// Função para SALVAR ou ATUALIZAR uma consulta (método POST)
export async function POST(request) {
  try {
    const { token, appointmentData } = await request.json();

    if (!token || !appointmentData) {
      return NextResponse.json({ success: false, error: "Dados inválidos." }, { status: 400 });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const { id, type, ...data } = appointmentData;

    if (type === "ultrasound") {
      const userDocRef = db.collection("users").doc(uid);
      const docSnap = await userDocRef.get();
      const gestationalProfile = docSnap.data().gestationalProfile || {};
      const scheduleData = gestationalProfile.ultrasoundSchedule || {};
      
      const updatedSchedule = {
        ...scheduleData,
        [id]: {
          ...(scheduleData[id] || {}),
          scheduledDate: data.date, time: data.time, professional: data.professional, location: data.location, notes: data.notes,
        },
      };

      await userDocRef.set({ gestationalProfile: { ultrasoundSchedule: updatedSchedule } }, { merge: true });
    } else {
      const appointmentRef = id
        ? db.collection("users").doc(uid).collection("appointments").doc(id)
        : db.collection("users").doc(uid).collection("appointments").doc();

      await appointmentRef.set(data, { merge: true });
    }

    return NextResponse.json({ success: true, message: "Consulta salva!" });
  } catch (error) {
    console.error("API Error [POST /api/appointments]:", error);
    if (error.code?.startsWith('auth/')) {
      return NextResponse.json({ success: false, error: "Autenticação inválida." }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "Erro interno do servidor." }, { status: 500 });
  }
}

// Função para DELETAR uma consulta (método DELETE)
export async function DELETE(request) {
  try {
    const { token, appointmentId } = await request.json();

    if (!token || !appointmentId) {
      return NextResponse.json({ success: false, error: "Dados inválidos." }, { status: 400 });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const appointmentRef = db.collection("users").doc(uid).collection("appointments").doc(appointmentId);
    await appointmentRef.delete();

    return NextResponse.json({ success: true, message: "Consulta removida!" });
  } catch (error) {
    console.error("API Error [DELETE /api/appointments]:", error);
    if (error.code?.startsWith('auth/')) {
      return NextResponse.json({ success: false, error: "Autenticação inválida." }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "Erro interno do servidor." }, { status: 500 });
  }
}

// Função para MARCAR COMO CONCLUÍDO (método PATCH)
export async function PATCH(request) {
  try {
    const { token, appointment, newDoneStatus } = await request.json();

    if (!token || !appointment || typeof newDoneStatus !== 'boolean') {
      return NextResponse.json({ success: false, error: "Dados inválidos." }, { status: 400 });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    if (appointment.type === "manual") {
      const appointmentRef = db.collection("users").doc(uid).collection("appointments").doc(appointment.id);
      await appointmentRef.update({ done: newDoneStatus });
    } else if (appointment.type === "ultrasound") {
      const userDocRef = db.collection("users").doc(uid);
      const docSnap = await userDocRef.get();
      const gestationalProfile = docSnap.data()?.gestationalProfile || {};
      const scheduleData = gestationalProfile.ultrasoundSchedule || {};
      
      const updatedSchedule = {
        ...scheduleData,
        [appointment.id]: {
          ...(scheduleData[appointment.id] || {}),
          done: newDoneStatus,
        },
      };

      await userDocRef.set({ gestationalProfile: { ultrasoundSchedule: updatedSchedule } }, { merge: true });
    }

    return NextResponse.json({ success: true, message: "Status atualizado!" });
  } catch (error) {
    console.error("API Error [PATCH /api/appointments]:", error);
    if (error.code?.startsWith('auth/')) {
      return NextResponse.json({ success: false, error: "Autenticação inválida." }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "Erro interno do servidor." }, { status: 500 });
  }
}