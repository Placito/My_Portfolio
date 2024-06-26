document.addEventListener('DOMContentLoaded', async (event) => {
    console.log('DOM fully loaded and parsed');

    // Initialize form handler if contact form exists
    if (document.querySelector('#contact-form')) {
        const { initFormHandler } = await import('./formHandler.js');
        initFormHandler();
    }

    // Initialize menu handler if menu-mobile exists
    if (document.querySelector('.menu-mobile')) {
        const { initMenuHandler } = await import('./menuHandler.js');
        initMenuHandler();
    }

    // Initialize scroll animations if data-anime elements exist
    if (document.querySelector("[data-anime]")) {
        const { initScrollAnimation } = await import('./scrollAnimation.js');
        initScrollAnimation();
    }

    // Initialize language handler if language selection exists
    if (document.querySelector('select.form-select')) {
        try {
            const { setLanguage, loadSavedLanguage } = await import('./languageHandler.js');
            loadSavedLanguage();
            document.querySelector('select.form-select').addEventListener('change', setLanguage);
        } catch (error) {
            console.error('Error loading language handler:', error);
        }
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/static/sw.js', {scope: '/static/'});
            console.log('Service Worker registered with scope:', registration.scope);

            const swRegistration = await navigator.serviceWorker.ready;
            console.log('Service Worker ready:', swRegistration);

            document.querySelector('#subscribe').addEventListener('click', async () => {
                try {
                    console.log('button clicked');
                    const response = await fetch('/subscribe', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ seconds: 10 })
                    });
                    const data = await response.json();
                    console.log('Task started:', data);

                    const interval = setInterval(async () => {
                        const statusResponse = await fetch(`/suscribe/${data.job_id}`);
                        const statusData = await statusResponse.json();
                        console.log('Task status:', statusData);

                        if (statusData.status === 'finished' || statusData.status === 'failed') {
                            clearInterval(interval);
                        }
                    }, 1000);
                } catch (error) {
                    console.error('Failed to start task:', error);
                }
            });
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
});
// Unregister existing service workers and clear caches
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for (let registration of registrations) {
            registration.unregister().then(function() {
                console.log('Service Worker unregistered:', registration);
            });
        }
    });
    
    caches.keys().then(function(names) {
        for (let name of names) {
            caches.delete(name).then(function() {
                console.log('Cache deleted:', name);
            });
        }
    });
}