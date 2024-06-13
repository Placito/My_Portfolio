self.addEventListener('install', function(event) {
    console.log('Service Worker installing.');
    event.waitUntil(
        caches.open('my-cache').then(function(cache) {
            return cache.addAll([
                '/templates/index.html',
                '/templates/privacy_policy.html',
                '/templates/terms.html',
                '/static/style.min.css',
                '/static/script.js',
                '/static/sw.js' // Ensure the service worker script itself is cached
            ]);
        }).catch(function(error) {
            console.error('Failed to open cache:', error);
        })
    );
});

self.addEventListener('activate', function(event) {
    console.log('Service Worker activating.');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== 'my-cache') {
                        console.log('Service Worker removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', function(event) {
    console.log('Service Worker fetching:', event.request.url);
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});
