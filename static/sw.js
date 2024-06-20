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
                '/static/css/style.css',
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

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    console.log('Service Worker: Fetching', event.request.url);
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch((error) => {
                console.error('Fetch failed for request:', error);
            });
        })
    );
});
