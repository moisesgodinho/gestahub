// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyAgVvYUYW-KoNQ4LfUJXfR3P0VYILQcUQk",
  authDomain: "gestahub-6295b.firebaseapp.com",
  projectId: "gestahub-6295b",
  storageBucket: "gestahub-6295b.appspot.com",
  messagingSenderId: "565508957327",
  appId: "1:565508957327:web:26ece9ead4efd1718fbcfa",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/login.png", // Ícone grande e colorido
    badge: "/notification-badge.png", // <-- LINHA ADICIONADA: Ícone da barra de status
    data: {
        url: '/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click Received.');
  event.notification.close();
  const urlToOpen = event.notification.data.url || '/';
  event.waitUntil(
    clients.matchAll({
      type: "window",
    }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});