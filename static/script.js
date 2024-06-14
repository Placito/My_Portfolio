document.addEventListener('DOMContentLoaded', async (event) => {
    console.log('DOM fully loaded and parsed');

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

    if (document.querySelector('#contact-form')) {
        const { initFormHandler } = await import('./formHandler.js');
        initFormHandler();
    }

    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/static/sw.js');
            console.log('Service Worker registered:', registration);

            if (document.querySelector('#subscribe')) {
                const subscribe = async () => {
                    console.log('subscribe function called');
                    try {
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
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
});
