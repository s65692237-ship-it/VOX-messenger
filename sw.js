const CACHE_NAME = 'vox-neo-v1.2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json'
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

    // Для остальных файлов (HTML, CSS, картинки) — берем из кэша, если есть, иначе качаем
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchRes) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    // Кэшируем только успешные GET-запросы
                    if (event.request.method === 'GET' && fetchRes.status === 200) {
                        cache.put(event.request, fetchRes.clone());
                    }
                    return fetchRes;
                });
            });
        }).catch(() => {
            // Если интернета нет и файла нет в кэше — показываем index.html
            if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
        })
    );
});
".validate": "newData.val() === 'typing' || newData.val() === 'idle'"
        }
      }
    },

    "status": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && auth.uid === $uid",
        ".validate": "newData.val() === 'online' || newData.val() === 'offline'"
      }
    }
  }
}
