import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

const serviceAccountString = process.env.FIREBASE_ADMIN_CREDENTIALS;
let initError = null;

// Tenta inicializar o Firebase Admin no escopo do módulo
if (!admin.apps.length) {
  if (!serviceAccountString) {
    initError = "A variável de ambiente FIREBASE_ADMIN_CREDENTIALS não está definida.";
    console.error(initError);
  } else {
    try {
      const serviceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e) {
      initError = "As credenciais do Firebase Admin não são um JSON válido.";
      console.error(initError, e);
    }
  }
}

const adminDb = !initError ? getFirestore() : null;
const messaging = !initError ? getMessaging() : null;

const getYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export async function GET() {
  if (initError || !adminDb || !messaging) {
    return NextResponse.json(
      { success: false, error: "Erro na inicialização do Firebase Admin.", details: initError },
      { status: 500 }
    );
  }

  try {
    const usersSnapshot = await adminDb.collection("users").get();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dateTomorrow = getYYYYMMDD(tomorrow);
    let totalSent = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const tokensSnapshot = await adminDb.collection(`users/${userId}/fcmTokens`).get();
      const tokens = tokensSnapshot.docs.map(doc => doc.id);

      if (tokens.length > 0) {
        const appointmentsRef = adminDb.collection(`users/${userId}/appointments`);
        const q = appointmentsRef.where("date", "==", dateTomorrow);
        const appointmentsSnapshot = await q.get();

        if (!appointmentsSnapshot.empty) {
          const appointment = appointmentsSnapshot.docs[0].data();
          const time = appointment.time ? ` às ${appointment.time}` : '';
          
          const message = {
            notification: {
              title: "Lembrete de Consulta 🗓️",
              body: `Não se esqueça da sua consulta "${appointment.title}" amanhã${time}!`,
            },
            tokens: tokens,
          };

          // --- ESTA É A LINHA CORRIGIDA ---
          const response = await messaging.sendEachForMulticast(message);
          totalSent += response.successCount;
          
          if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                failedTokens.push(tokens[idx]);
              }
            });
            console.log(`Limpando ${failedTokens.length} tokens inválidos para o usuário ${userId}`);
            for (const token of failedTokens) {
                await adminDb.doc(`users/${userId}/fcmTokens/${token}`).delete();
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: `Verificação concluída. ${totalSent} lembretes enviados.` });

  } catch (error) {
    console.error("Erro crítico ao enviar lembretes:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao enviar lembretes.", details: error.message },
      { status: 500 }
    );
  }
}