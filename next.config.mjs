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
    {
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "pages-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
        },
      },
    },
    {
      urlPattern: /^https?:\/\/.+\/_next\/(static|image)\/.+/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-static-assets-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 ano
        },
      },
    },
    
    // --- INÍCIO DA CORREÇÃO ---
    // Regra específica para a API com Background Sync
    {
      urlPattern: /\/api\/.*/i, // Captura qualquer chamada para /api/
      handler: "NetworkOnly",
      method: "POST", // Aplica-se a requisições POST
      options: {
        backgroundSync: {
          name: "gestahub-mutations-queue",
          options: {
            maxRetentionTime: 24 * 60, // Tentar reenviar por até 24 horas
          },
        },
      },
    },
    // (Opcional, mas recomendado) Adicione regras separadas se usar outros métodos
    {
      urlPattern: /\/api\/.*/i,
      handler: "NetworkOnly",
      method: "PATCH",
      options: {
        backgroundSync: {
          name: "gestahub-mutations-queue",
          options: {
            maxRetentionTime: 24 * 60,
          },
        },
      },
    },
    {
      urlPattern: /\/api\/.*/i,
      handler: "NetworkOnly",
      method: "DELETE",
      options: {
        backgroundSync: {
          name: "gestahub-mutations-queue",
          options: {
            maxRetentionTime: 24 * 60,
          },
        },
      },
    },
    // --- FIM DA CORREÇÃO ---

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
          statuses: [0, 200],
        },
      },
    },
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