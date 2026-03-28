// Service Worker para TCC Hub PWA
const CACHE_NAME = 'tcc-hub-v5';
const APP_VERSION = '1.0.1';
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 horas em milissegundos

// URLs para cache
const urlsToCache = [
  '/',
  '/index.html',
  '/mobile.html',
  '/admin.html',
  '/manifest.json',
  '/css/style.css',
  '/js/app.js',
  '/js/admin.js',
  '/data/tccs.json',
  '/icons/icon.png',
  '/version.txt'
];

// Instalação
self.addEventListener('install', event => {
  console.log(`[SW] Instalando versão ${APP_VERSION}...`);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Ativação
self.addEventListener('activate', event => {
  console.log('[SW] Ativando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  
  // Inicia verificação periódica após ativação
  event.waitUntil(checkForUpdates());
  self.clients.claim();
});

// Verificação de atualizações periódica
async function checkForUpdates() {
  console.log('[SW] Verificando atualizações...');
  
  try {
    const response = await fetch('/version.txt?' + Date.now());
    const newVersion = await response.text();
    const currentVersion = APP_VERSION;
    
    if (newVersion.trim() !== currentVersion) {
      console.log(`[SW] Nova versão disponível: ${newVersion.trim()}`);
      
      // Notifica todos os clientes
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_AVAILABLE',
          version: newVersion.trim(),
          oldVersion: currentVersion
        });
      });
      
      // Força atualização do cache
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(urlsToCache);
    }
  } catch (error) {
    console.log('[SW] Erro ao verificar atualizações:', error);
  }
  
  // Agenda próxima verificação
  setTimeout(checkForUpdates, CHECK_INTERVAL);
}

// Intercepta requisições
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Ignorar Google APIs
  if (url.origin === 'https://accounts.google.com') {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Para arquivos estáticos, cache first
  if (url.pathname.match(/\.(css|js|json|png|jpg|jpeg|svg|ico)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request).then(response => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
            return response;
          });
        })
    );
    return;
  }
  
  // Para HTML, network first
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(response => response || caches.match('/mobile.html'));
      })
  );
});

// Mensagem do cliente
self.addEventListener('message', event => {
  if (event.data === 'check-version') {
    checkForUpdates();
  }
});
