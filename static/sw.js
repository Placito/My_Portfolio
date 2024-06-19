self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('my-cache').then(function(cache) {
            return cache.addAll(['/']);
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
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/img/maskable-icon.png'
    });
});
