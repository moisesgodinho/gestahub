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
  // --- INÍCIO DA MUDANÇA ---
  fallbacks: {
    document: "/offline", // URL da página de fallback para navegação
  },
  // --- FIM DA MUDANÇA ---
  runtimeCaching: [
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "essential-images-cache",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 ano
        },
        precacheManager: {
          urls: [
            "/login.png",
            "/icons/journal.png",
            "/icons/calendar.png",
          ],
        },
      },
    },
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
  ],
});

export default withPWA(nextConfig);