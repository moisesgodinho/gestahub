// next.config.mjs
/** @type {import('next').NextConfig} */
import withPWAInit from "@ducanh2912/next-pwa";

const nextConfig = {};

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  importScripts: ["/firebase-messaging-sw.js"],
  runtimeCaching: [
    // --- NÍVEL 3: Background Sync para Ações Offline ---
    // Esta regra deve vir primeiro para capturar as mutações de dados.
    {
      urlPattern: ({ request }) => ['POST', 'DELETE', 'PATCH'].includes(request.method),
      handler: 'NetworkOnly',
      options: {
        backgroundSync: {
          name: 'gestahub-mutations-queue', // Uma única fila para todas as ações
          options: {
            maxRetentionTime: 24 * 60, // Tentar reenviar por até 24 horas
          },
        },
      },
    },
    // --- NÍVEL 2: Cache de Dados do Firebase para Visualização Offline ---
    {
      urlPattern: /^https?:\/\/firestore\.googleapis\.com\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "firebase-firestore-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
        },
        cacheableResponse: {
          statuses: [0, 200], // Armazena respostas bem-sucedidas em cache
        },
      },
    },
    // --- Regras de Cache para Recursos Estáticos ---
    {
      urlPattern: /^https?:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 365 dias
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-image-assets",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
      },
    },
  ],
});

export default withPWA(nextConfig);