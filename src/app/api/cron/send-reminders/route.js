import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

// ... (código de inicialização do Firebase Admin permanece o mesmo)
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

const getYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

async function cleanUpFailedTokens(userId, tokens, responses) {
  // ... (esta função permanece a mesma)
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
    // ... (lógica inicial de busca de usuários e datas permanece a mesma)
    const usersSnapshot = await adminDb.collection("users").get();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dateToday = getYYYYMMDD(today);
    const dateTomorrow = getYYYYMMDD(tomorrow);

    let totalSent = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const tokensSnapshot = await adminDb
        .collection(`users/${userId}/fcmTokens`)
        .get();
      const tokens = tokensSnapshot.docs.map((doc) => doc.id);

      if (tokens.length === 0) continue;

      // Lógica de lembrete de consulta
      const appointmentsRef = adminDb.collection(
        `users/${userId}/appointments`
      );
      const qAppointments = appointmentsRef.where("date", "==", dateTomorrow);
      const appointmentsSnapshot = await qAppointments.get();

      if (!appointmentsSnapshot.empty) {
        const appointment = appointmentsSnapshot.docs[0].data();
        const time = appointment.time ? ` às ${appointment.time}` : "";
        const message = {
          // --- ALTERAÇÃO AQUI ---
          data: {
            title: "Lembrete de Consulta 🗓️",
            body: `Não se esqueça da sua consulta "${appointment.title}" amanhã${time}!`,
            link: "/consultas",
          },
          tokens: tokens,
        };
        const response = await messaging.sendEachForMulticast(message);
        totalSent += response.successCount;
        await cleanUpFailedTokens(userId, tokens, response.responses);
      }

      // Lógica de lembrete do diário
      const journalEntryRef = adminDb.doc(
        `users/${userId}/symptomEntries/${dateToday}`
      );
      const journalEntrySnap = await journalEntryRef.get();

      if (!journalEntrySnap.exists) {
        const message = {
          // --- ALTERAÇÃO AQUI ---
          data: {
            title: "Como você está hoje? 📝",
            body: "Não se esqueça de registrar seu humor e sintomas no diário de hoje!",
            link: "/diario-de-sintomas",
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
      message: `Verificação concluída. ${totalSent} lembretes enviados.`,
    });
  } catch (error) {
    console.error("Erro crítico ao enviar lembretes:", error);
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
