// Install event: cache essential assets
self.addEventListener('install', function(event) {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open('my-cache').then(function(cache) {
            console.log('Service Worker: Caching assets...');
            return cache.addAll([
                '/',
                '/templates/index.html',
                '/templates/privacy_policy.html',
                '/templates/terms.html',
                '/static/css/style.css',
                '/static/js/script.js',
                '/static/img/banner.avif',
                '/static/img/icon-144x144.png', 
                '/static/manifest.json',
            ]);
        }).catch(function(error) {
            console.error('Failed to open cache:', error);
        })
    );
});

// Activate event: clean up old caches and take control of clients
self.addEventListener('activate', event => {
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

// Fetch event: serve cached content if available, otherwise fetch from network
self.addEventListener('fetch', function(event) {
    console.log('Service Worker: Fetching', event.request.url);
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request).catch(function(error) {
                console.error('Fetch failed for request:', error);
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
