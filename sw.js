// sw.js — Service Worker para Controle de Abastecimento
const CACHE_NAME = 'comb-v1';

const ARQUIVOS = [
  '/comb/',
  '/comb/index.html',
  '/comb/manifest.json',
  '/comb/icons/icon-192.png',
  '/comb/icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS))
  );
  self.skipWaiting(); // Força a ativação imediata
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return res;
      }).catch(() => caches.match('/comb/index.html'));
    })
  );
});
