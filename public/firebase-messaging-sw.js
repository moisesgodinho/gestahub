// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

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

  // --- ALTERAÇÃO AQUI ---
  // Lendo o título e o corpo do objeto 'data'
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: "/login.png",
    // Lendo o link do objeto 'data'
    data: {
      url: payload.data.link,
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          // Se a URL já estiver aberta, foca nela
          if (
            client.url === self.location.origin + urlToOpen &&
            "focus" in client
          ) {
            return client.focus();
          }
        }
        // Se não, abre uma nova janela
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
