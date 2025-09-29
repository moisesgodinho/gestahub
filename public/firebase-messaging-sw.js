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
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/login.png",
    // Adiciona a URL aos dados da notificação para que possamos usá-la no evento de clique
    data: {
      url: payload.fcmOptions.link
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- NOVA LÓGICA ADICIONADA AQUI ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Fecha a notificação

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((clientList) => {
      // Se uma janela do app já estiver aberta, foque nela
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Se nenhuma janela estiver aberta ou na URL correta, abra uma nova
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});