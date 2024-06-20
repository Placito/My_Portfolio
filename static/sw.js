// Install event: cache essential assets
self.addEventListener('install', function(event) {
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open('my-cache').then((cache) => {
            console.log('Service Worker: Caching assets...');
            return cache.addAll([
                '/',
                '/templates/index.html',
                '/templates/privacy_policy.html',
                '/templates/terms.html',
                '/static/css/style.min.css',
                '/static/js/script.js',
                '/static/img/banner.avif',
                '/static/img/icon-144x144.png',
                '/static/manifest.json',
            ]);
        }).catch((error) => {
            console.error('Failed to open cache:', error);
        })
    );
});

// Activate event: clean up old caches and take control of clients
self.addEventListener('activate', event => {
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== 'my-cache') {
                        console.log('Service Worker: Clearing old cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => clients.claim())
    );
});

self.addEventListener('fetch', function(event) {
    console.log('Service Worker: Fetching', event.request.url);
    event.respondWith(
        caches.match(event.request).then(function(response) {
     
            return response || fetch(event.request).then(function(networkResponse) {
                return networkResponse;
            }).catch(function(error) {
                console.error('Network fetch failed for:', event.request.url, error);
                return new Response('Network fetch failed', {
                    status: 408,
                    statusText: 'Request Timeout'
                });
            });
        }).catch(function(error) {
            console.error('Cache match failed for:', event.request.url, error);
            return new Response('Cache match failed', {
                status: 408,
                statusText: 'Request Timeout'
            });
        })
    );
});

// Push event: display notifications
self.addEventListener('push', function(event) {
    const data = event.data.json();
    console.log('Service Worker: Push received', data);
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/static/img/maskable-icon.png' // Ensure this path is correct
    });
});
