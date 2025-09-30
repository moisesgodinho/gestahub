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
    // --- INÍCIO DA MUDANÇA ---
    // Pré-cache de imagens essenciais para o App Shell
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "essential-images-cache",
        expiration: {
          maxEntries: 20, // Aumente se tiver mais imagens essenciais
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 ano
        },
        // Certifique-se de que a imagem de login e os ícones estejam no cache
        precacheManager: {
          urls: [
            "/login.png",
            "/icons/journal.png",
            "/icons/calendar.png",
          ],
        },
      },
    },
    // --- FIM DA MUDANÇA ---
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
    // A regra genérica de imagens foi substituída pela regra mais específica acima
  ],
});

export default withPWA(nextConfig);