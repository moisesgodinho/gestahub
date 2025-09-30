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
    // --- NOVA REGRA CORRIGIDA PARA O FIREBASE ---
    {
      // Captura requisições para os serviços do Google APIs (Firestore, Auth, etc.)
      urlPattern: /^https?:\/\/firestore\.googleapis\.com\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "firebase-firestore-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
        },
        cacheableResponse: {
          statuses: [0, 200], // Cacheia respostas bem-sucedidas
        },
      },
    },
    // --- REGRAS PARA FONTES E IMAGENS (permanecem as mesmas) ---
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