import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Usamos a nossa config do cliente para query

// Carregue a chave da conta de serviço de forma segura
// Nota: O Next.js agrupa o serviceAccountKey.json no build do servidor.
const serviceAccount = require("../../../../../serviceAccountKey.json");

// Inicialize o Admin SDK se ainda não tiver sido inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Função para formatar a data como YYYY-MM-DD
const getYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};


export async function GET() {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dateTomorrow = getYYYYMMDD(tomorrow);

    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      const userId = userDoc.id;

      if (user.fcmToken) {
        // --- Lembrete de Consulta ---
        const appointmentsRef = collection(db, `users/${userId}/appointments`);
        const q = query(appointmentsRef, where("date", "==", dateTomorrow));
        const appointmentsSnapshot = await getDocs(q);

        if (!appointmentsSnapshot.empty) {
            const appointment = appointmentsSnapshot.docs[0].data();
            const message = {
                notification: {
                    title: "Lembrete de Consulta 🗓️",
                    body: `Não se esqueça da sua consulta "${appointment.title}" amanhã!`,
                },
                token: user.fcmToken,
            };
            await admin.messaging().send(message);
        }

        // --- Lembrete de Diário (Exemplo: enviar toda noite) ---
        // (Esta lógica pode ser ajustada para verificar se já foi preenchido)
        const dailyReminderMessage = {
            notification: {
                title: "Como você está se sentindo? ✨",
                body: "Não se esqueça de registrar seus sintomas e humor no diário hoje!",
            },
            token: user.fcmToken,
        };
        // Aqui você adicionaria a lógica para enviar o lembrete do diário
        // await admin.messaging().send(dailyReminderMessage);
      }
    }

    return NextResponse.json({ success: true, message: "Reminders sent." });
  } catch (error) {
    console.error("Error sending reminders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send reminders." },
      { status: 500 }
    );
  }
}