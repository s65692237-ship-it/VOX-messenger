const CACHE_NAME = 'vox-neo-v1.4';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'
];

// Установка Service Worker (кэшируем оболочку)
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Принудительно активируем новый SW
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Активация (удаляем старые кэши)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
    // Если запрос идет к Firebase (сообщения, авторизация) — НЕ КЭШИРУЕМ, пускаем напрямую
    if (event.request.url.includes('firebase') || event.request.url.includes('googleapis')) {
        return; 
    }

    // Для остальных файлов (HTML, CSS, картинки) — Network First (Сначала сеть, потом кэш)
    // Это нужно, чтобы при обновлении кода ты сразу видел новый дизайн
    event.respondWith(
        fetch(event.request).then((response) => {
            // Если ответ успешный, обновляем кэш
            if (event.request.method === 'GET' && response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
            }
            return response;
        }).catch(() => {
            // Если интернета нет, отдаем из кэша
            return caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;
                // Если файла нет в кэше и интернета нет, показываем главную
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
