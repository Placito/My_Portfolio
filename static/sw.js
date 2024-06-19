self.addEventListener('install', function(event) {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open('my-cache').then(function(cache) {
            console.log('Service Worker: Caching assets...');
            return cache.addAll([
                '/',
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

self.addEventListener('activate', event => {
    console.log('Service Worker: Activated');
    event.waitUntil(clients.claim());
});

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

self.addEventListener('push', function(event) {
    const data = event.data.json();
    console.log('Service Worker: Push received', data);
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/static/img/maskable-icon.png' // Ensure this path is correct
    });
});
