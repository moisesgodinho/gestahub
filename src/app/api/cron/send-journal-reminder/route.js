// src/app/api/cron/send-journal-reminder/route.js

import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

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
    // Obtém a data de hoje no formato YYYY-MM-DD para o fuso horário do Brasil
    const dateToday = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    // --- FIM DA CORREÇÃO ---

    let totalSent = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const tokensSnapshot = await adminDb
        .collection(`users/${userId}/fcmTokens`)
        .get();
      const tokens = tokensSnapshot.docs.map((doc) => doc.id);

      if (tokens.length === 0) continue;

      // Lógica de lembrete do diário
      const journalEntryRef = adminDb.doc(
        `users/${userId}/symptomEntries/${dateToday}`
      );
      const journalEntrySnap = await journalEntryRef.get();

      if (!journalEntrySnap.exists) {
        const message = {
          webpush: {
            notification: {
              title: "Como você está hoje? 📝",
              body: "Não se esqueça de registrar seu humor e sintomas no diário de hoje!",
              icon: "/login.png",
              badge: "/notification-badge.png",
            },
            fcmOptions: {
              link: "/diario-de-sintomas",
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
      message: `Verificação do diário concluída. ${totalSent} lembretes enviados.`,
    });
  } catch (error) {
    console.error("Erro crítico ao enviar lembretes do diário:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Falha ao enviar lembretes do diário.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}