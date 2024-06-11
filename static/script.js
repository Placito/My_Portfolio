// static/script.js
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
});
