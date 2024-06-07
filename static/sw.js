self.addEventListener('install', function(event) {
    console.log('Service Worker installing.');
    // Perform install steps, e.g., caching static assets
});

self.addEventListener('activate', function(event) {
    console.log('Service Worker activating.');
    // Perform activate steps, e.g., clearing old caches
});

self.addEventListener('fetch', function(event) {
    console.log('Service Worker fetching:', event.request.url);
    // Respond to network requests
    event.respondWith(fetch(event.request));
});
