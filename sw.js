const CACHE_NAME = 'vox-cache-v2'; // Версия обновлена
const urlsToCache = [
    './',
    './index.html',
    './manifest.json'
];

self.addEventListener('install', event => {
    self.skipWaiting(); // Принудительно активируем новый SW
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // Стратегия: Сеть в приоритете, кэш как запасной (чтобы обновления подгружались)
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
