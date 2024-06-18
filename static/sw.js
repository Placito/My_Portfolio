// install Caches the specified resources during the installation phase.
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('my-cache').then(function(cache) {
            return cache.addAll(['/']);
        }).catch(function(error) {
            console.error('Failed to open cache:', error);
        })
    );
});
// Claims control over all clients as soon as the service worker becomes active.
self.addEventListener('activate', event => {
    console.log('Service worker activating.');
    event.waitUntil(clients.claim());
});
// Responds to network requests by first trying to serve them from the cache and falling back to the network if not found in the cache.
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request).catch(function(error) {
                console.error('Fetch failed for request:', error);
            });
        })
    );
});
// Listens for push events and displays notifications with the specified title, body, and icon.
self.addEventListener('push', function(event) {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/img/maskable-icon.png'
    });
});
