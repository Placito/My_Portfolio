document.addEventListener('DOMContentLoaded', async (event) => {
    console.log('DOM fully loaded and parsed');

    // Dynamic import and initialize menu handler if menu mobile element is present
    if (document.querySelector('.menu-mobile')) {
        const { initMenuHandler } = await import('./menuHandler.js');
        initMenuHandler();
    }

    // Dynamic import and initialize scroll animation if data-anime elements are present
    if (document.querySelector("[data-anime]")) {
        const { initScrollAnimation } = await import('./scrollAnimation.js');
        initScrollAnimation();
    }

    // Dynamic import and initialize language handler if form select element is present
    if (document.querySelector('select.form-select')) {
        const { setLanguage, loadSavedLanguage } = await import('./languageHandler.js');
        loadSavedLanguage();
        document.querySelector('select.form-select').addEventListener('change', setLanguage);
    }

    // Dynamic import and initialize the subscribe button
    if (document.querySelector('#subscribe')) {
        const subscribe = async () => {
            console.log('subscribe function called');
            try {
                console.log('Waiting for service worker to be ready...');
                let swRegistration = await navigator.serviceWorker.ready;
                console.log('Service Worker ready:', swRegistration);

                if (!swRegistration.pushManager) {
                    console.error('Push Manager is not available.');
                    return;
                }

                let pushSubscription = await swRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: 'BfGC8STIEy3gnPXdtIZS2QLzy_eShWxmUdy2jQnot83_xm84gLSCV-b10QK8crsNPLC1RBj21VHt0_vxAsM'
                });

                console.log('Push Subscription Object:', pushSubscription);

                // Send subscription to the server
                await fetch('/subscribe', {
                    method: 'POST',
                    body: JSON.stringify(pushSubscription),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(response => {
                    if (response.ok) {
                        console.log('Subscription sent to server');
                    } else {
                        console.error('Subscription failed:', response.statusText);
                    }
                }).catch(error => {
                    console.error('Subscription failed:', error);
                });

            } catch (error) {
                console.error('Subscription failed:', error);
            }
        };

        document.querySelector('#subscribe').addEventListener('click', subscribe);
    }
});
