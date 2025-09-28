import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

// Pega as credenciais da variável de ambiente
const serviceAccountString = process.env.FIREBASE_ADMIN_CREDENTIALS;

// Inicialize o Admin SDK se ainda não tiver sido inicializado
if (!admin.apps.length) {
  if (!serviceAccountString) {
    throw new Error(
      "A variável de ambiente FIREBASE_ADMIN_CREDENTIALS não está definida."
    );
  }
  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e) {
    console.error("Falha ao fazer parse das credenciais do Firebase Admin:", e);
    throw new Error("As credenciais do Firebase Admin não são um JSON válido.");
  }
}

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

    const sentMessages = [];

    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      const userId = userDoc.id;

      if (user.fcmToken) {
        const appointmentsRef = adminDb.collection(
          `users/${userId}/appointments`
        );
        const q = adminDb
          .collection(`users/${userId}/appointments`)
          .where("date", "==", dateTomorrow);
        const appointmentsSnapshot = await q.get();

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

          try {
            await admin.messaging().send(message);
            sentMessages.push({ userId, token: user.fcmToken });
          } catch (error) {
            console.error(
              `Falha ao enviar notificação para ${userId}:`,
              error.message
            );
            // Continua para o próximo usuário mesmo se um falhar
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Verificação concluída. ${sentMessages.length} lembretes enviados.`,
    });
  } catch (error) {
    console.error("Erro crítico ao enviar lembretes:", error);
    // Retorna a mensagem de erro específica
    return NextResponse.json(
      {
        success: false,
        error: "Falha ao enviar lembretes.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
