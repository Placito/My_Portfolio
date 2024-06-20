
document.addEventListener('DOMContentLoaded', async (event) => {
    console.log('DOM fully loaded and parsed');

    if (document.querySelector('#contact-form')) {
        const { initFormHandler } = await import('./formHandler.js');
        initFormHandler();
    }

    if (document.querySelector('.menu-mobile')) {
        const { initMenuHandler } = await import('./menuHandler.js');
        initMenuHandler();
    }

    if (document.querySelector("[data-anime]")) {
        const { initScrollAnimation } = await import('./scrollAnimation.js');
        initScrollAnimation();
    }

    if (document.querySelector('select.form-select')) {
        try {
            const { setLanguage, loadSavedLanguage } = await import('./languageHandler.js');
            loadSavedLanguage();
            document.querySelector('select.form-select').addEventListener('change', setLanguage);
        } catch (error) {
            console.error('Error loading language handler:', error);
        }
    }
});
document.addEventListener('DOMContentLoaded', async (event) => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/static/sw.js');
            console.log('Service Worker registered with scope:', registration.scope);

            const swRegistration = await navigator.serviceWorker.ready;
            console.log('Service Worker ready:', swRegistration);

            if (!swRegistration.pushManager) {
                console.error('Push Manager is not available.');
                return;
            }

            let pushSubscription = await swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: 'YourApplicationServerKeyHere'
            });

            console.log('Push Subscription Object:', pushSubscription);

            await fetch('/subscribe', {
                method: 'POST',
                body: JSON.stringify(pushSubscription),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Service Worker registration or subscription failed:', error);
        }
    }
    document.querySelector('#start-task').addEventListener('click', async () => {
        try {
            const response = await fetch('/start-task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ seconds: 10 })
            });
            const data = await response.json();
            console.log('Task started:', data);

            const interval = setInterval(async () => {
                const statusResponse = await fetch(`/task-status/${data.job_id}`);
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
});

