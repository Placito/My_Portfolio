self.addEventListener('install', function(event) {
    console.log('Service Worker installing.');

    event.waitUntil(
        caches.open('my-cache').then(function(cache) {
            return cache.addAll([
                '../templates/index.html',
                './static/style.min.css',
                './static/script.js',
                './static/sw.js'
            ]).catch(function(error) {
                console.error('Failed to add resource to cache:', error);
            });
        }).catch(function(error) {
            console.error('Failed to open cache:', error);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service worker activating.');
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', function(event) {
    console.log('Service worker fetching:', event.request.url);
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request).catch(e => {
                console.error('Fetch failed for:', event.request.url, e);
            });
        })
    );
});
