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

    // Dynamic import and initialize form handler if contact form element is present
    if (document.querySelector('#contact-form')) {
        const { initFormHandler } = await import('./formHandler.js');
        initFormHandler();
    }

    // Dynamic import and initialize the subscribe button
    if (document.querySelector('#subscribe')) {
        const subscribe = async () => {
            console.log('subscribe function called');
            try {
                console.log('Waiting for service worker to be ready...');
                let sw = navigator.serviceWorker.ready;
                console.log('Service Worker ready:', sw);

                let push = sw.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: 'BGfCBSTIIey3gnPXdtIZS2OQlzy_eShWxmUdy2jQnot83_xm84gL5CV-b10Qk8CrsNPLc1RBj21VHt0_vxAS-mM'
                });

                console.log('Push Subscription Object:', push);

                // Send subscription to the server
                await fetch('/subscribe', {
                    method: 'POST',
                    body: JSON.stringify(push),
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
        }

        document.querySelector('#subscribe').addEventListener('click', subscribe);
    }
});
