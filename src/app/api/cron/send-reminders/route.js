import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

// ... (toda a parte de inicialização do Firebase Admin permanece a mesma)
const serviceAccountString = process.env.FIREBASE_ADMIN_CREDENTIALS;
let initError = null;

if (!admin.apps.length) {
  if (!serviceAccountString) {
    initError =
      "A variável de ambiente FIREBASE_ADMIN_CREDENTIALS não está definida.";
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

async function cleanUpFailedTokens(userId, tokens, responses) {
  const failedTokens = [];
  responses.forEach((resp, idx) => {
    if (!resp.success) {
      failedTokens.push(tokens[idx]);
    }
  });

  if (failedTokens.length > 0) {
    console.log(
      `Limpando ${failedTokens.length} tokens inválidos para o usuário ${userId}`
    );
    for (const token of failedTokens) {
      await adminDb.doc(`users/${userId}/fcmTokens/${token}`).delete();
    }
  }
}

export async function GET() {
  if (initError || !adminDb || !messaging) {
    return NextResponse.json(
      {
        success: false,
        error: "Erro na inicialização do Firebase Admin.",
        details: initError,
      },
      { status: 500 }
    );
  }

  try {
    const usersSnapshot = await adminDb.collection("users").get();
    
    // --- INÍCIO DA CORREÇÃO ---
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    
    // Obtém a data de amanhã no formato YYYY-MM-DD para o fuso horário do Brasil
    const dateTomorrow = tomorrow.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    // --- FIM DA CORREÇÃO ---

    let totalSent = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const tokensSnapshot = await adminDb
        .collection(`users/${userId}/fcmTokens`)
        .get();
      const tokens = tokensSnapshot.docs.map((doc) => doc.id);

      if (tokens.length === 0) continue;

      const appointmentsRef = adminDb.collection(
        `users/${userId}/appointments`
      );
      const qAppointments = appointmentsRef.where("date", "==", dateTomorrow);
      const appointmentsSnapshot = await qAppointments.get();

      if (!appointmentsSnapshot.empty) {
        const appointment = appointmentsSnapshot.docs[0].data();
        const time = appointment.time ? ` às ${appointment.time}` : "";
        const message = {
          webpush: {
            notification: {
              title: "Lembrete de Consulta 🗓️",
              body: `Não se esqueça da sua consulta "${appointment.title}" amanhã${time}!`,
              icon: "/login.png",
              badge: "/notification-badge.png",
            },
            fcmOptions: {
              link: "/consultas",
            },
          },
          tokens: tokens,
        };
        const response = await messaging.sendEachForMulticast(message);
        totalSent += response.successCount;
        await cleanUpFailedTokens(userId, tokens, response.responses);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Verificação de consultas concluída. ${totalSent} lembretes enviados.`,
    });
  } catch (error) {
    console.error("Erro crítico ao enviar lembretes de consulta:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Falha ao enviar lembretes de consulta.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}