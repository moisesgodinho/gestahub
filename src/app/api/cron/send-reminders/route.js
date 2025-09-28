import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirestore } from "firebase-admin/firestore"; // Importa o getFirestore do admin

// Pega as credenciais da variável de ambiente
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);

// Inicialize o Admin SDK se ainda não tiver sido inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Usa o firestore do admin para queries no servidor
const adminDb = getFirestore();

// Função para formatar a data como YYYY-MM-DD
const getYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export async function GET() {
  try {
    const usersSnapshot = await adminDb.collection("users").get();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dateTomorrow = getYYYYMMDD(tomorrow);

    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      const userId = userDoc.id;

      if (user.fcmToken) {
        // --- Lembrete de Consulta ---
        const appointmentsRef = adminDb.collection(
          `users/${userId}/appointments`
        );
        const q = query(appointmentsRef, where("date", "==", dateTomorrow));
        const appointmentsSnapshot = await getDocs(q);

        if (!appointmentsSnapshot.empty) {
          const appointment = appointmentsSnapshot.docs[0].data();
          const time = appointment.time ? ` às ${appointment.time}` : "";
          const message = {
            notification: {
              title: "Lembrete de Consulta 🗓️",
              body: `Não se esqueça da sua consulta "${appointment.title}" amanhã${time}!`,
            },
            token: user.fcmToken,
          };
          await admin.messaging().send(message);
        }
      }
    }

    return NextResponse.json({ success: true, message: "Reminders checked." });
  } catch (error) {
    console.error("Error sending reminders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send reminders." },
      { status: 500 }
    );
  }
}
