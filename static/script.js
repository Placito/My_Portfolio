document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    // Open and close side menu in mobile mode
    const menuMobile = document.querySelector('.menu-mobile');
    const body = document.querySelector('body');

    if (menuMobile && body) {
        menuMobile.addEventListener('click', () => {
            console.log('Menu toggle clicked'); // Log menu toggle click
            if (menuMobile.classList.contains('bi-list')) {
                menuMobile.classList.replace('bi-list', 'bi-x');
            } else {
                menuMobile.classList.replace('bi-x', 'bi-list');
            }
            body.classList.toggle('menu-nav-active');
        });

        // Closes the menu when clicking on an item in responsive mode
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                console.log('Nav item clicked'); // Log nav item click
                if (body.classList.contains('menu-nav-active')) {
                    body.classList.remove('menu-nav-active');
                    menuMobile.classList.replace('bi-x', 'bi-list');
                }
            });
        });

        // Animate all items with data-anime attribute
        const animeItems = document.querySelectorAll("[data-anime]");

        const animeScroll = () => {
            console.log('Scroll event fired'); // Log scroll event
            const windowTop = window.scrollY + window.innerHeight * 0.85;
            animeItems.forEach((element) => {
                if (windowTop > element.offsetTop) {
                    element.classList.add("animate");
                } else {
                    element.classList.remove("animate");
                }
            });
        };

        // Initial animation check
        animeScroll();

        // Add scroll event listener for animation
        window.addEventListener("scroll", animeScroll);
    } else {
        console.error('Menu or body element not found');
    }

    // Function to update the page content based on the fetched translations
    async function updatePageContent(translations) {
        const elementsToUpdate = document.querySelectorAll('[data-i18n], [data-i18n-placeholder]');
        elementsToUpdate.forEach((element) => {
            const key = element.getAttribute('data-i18n');
            if (key && translations[key]) {
                console.log(`Key: ${key}, Value: ${translations[key]}`);
                element.textContent = translations[key];
            }
            const placeholderKey = element.getAttribute('data-i18n-placeholder');
            if (placeholderKey && translations[placeholderKey]) {
                element.setAttribute('placeholder', translations[placeholderKey]);
            } else {
                console.warn(`Translation missing for key: ${key}`);
            }
        });

        // Update the text translations from app.py
        const textTranslations = await fetchTextTranslations(savedLang);
        for (const [key, value] of Object.entries(textTranslations)) {
            const element = document.querySelector(`[data-text-i18n="${key}"]`);
            if (element) {
                element.textContent = value;
            }
        }
    }

    // Function to fetch text translations from app.py
    async function fetchTextTranslations(lang) {
        try {
            const response = await fetch(`/translations/${lang}/text`);
            if (!response.ok) {
                throw new Error('Failed to load text translations');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching text translations:', error);
            return {};
        }
    }

    // Function to set language
    window.setLanguage = async function(event) {
        const lang = event.target.value;
        if (lang) {
            try {
                const response = await fetch(`/set_language/${lang}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    localStorage.setItem('lang', lang);
                    const translations = await fetchTranslations(lang);
                    updatePageContent(translations);
                    // Optionally, reload the page to ensure full translation application
                    location.reload();
                } else {
                    console.error('Failed to set language on server');
                }
            } catch (error) {
                console.error('Error setting language:', error);
            }
        }
    };

    // Function to fetch translations
    async function fetchTranslations(lang) {
        try {
            const response = await fetch(`/translations/${lang}/LC_MESSAGES/messages.po`);
            if (!response.ok) {
                throw new Error('Failed to load translations');
            }
            const poContent = await response.text();
            return parsePO(poContent);
        } catch (error) {
            console.error('Error fetching translations:', error);
            return {};
        }
    }

    // Function to parse .po file content
    function parsePO(content) {
        const translations = {};
        const lines = content.split('\n');
        let msgid = '';
        let msgstr = '';
        let inMsgid = false;
        let inMsgstr = false;

        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('msgid')) {
                inMsgid = true;
                inMsgstr = false;
                msgid = line.replace(/^msgid\s*"(.*)"/, '$1');
            } else if (line.startsWith('msgstr')) {
                inMsgstr = true;
                inMsgid = false;
                msgstr = line.replace(/^msgstr\s*"(.*)"/, '$1');
            } else if (inMsgid && line.startsWith('"')) {
                msgid += line.replace(/"(.*)"/, '$1');
            } else if (inMsgstr && line.startsWith('"')) {
                msgstr += line.replace(/"(.*)"/, '$1');
            } else if (!line) {
                // Empty line indicates end of a translation block
                if (msgid && msgstr) {
                    translations[msgid] = msgstr;
                    msgid = '';
                    msgstr = '';
                }
                inMsgid = false;
                inMsgstr = false;
            }
        }
        // Ensure the last translation is added if the file doesn't end with an empty line
        if (msgid && msgstr) {
            translations[msgid] = msgstr;
        }
        return translations;
    }

    // On page load, check localStorage for language setting
    const savedLang = localStorage.getItem('lang');
    if (savedLang && savedLang !== "{{ lang|e }}") {
        const langSelect = document.querySelector('select.form-select');
        if (langSelect) {
            langSelect.value = savedLang;
        }
        fetchTranslations(savedLang).then(translations => {
            updatePageContent(translations);
        });
    }

    $(document).ready(function() {
        $('#contact-form').on('submit', function(event) {
            event.preventDefault();

            $.ajax({
                type: 'POST',
                url: '/send',
                data: $(this).serialize(),
                success: function(response) {
                    let alertContainer = $('#alert-container');
                    let alertMessage = `
                    <div class="alert alert-${response.status === 'success' ? 'success' : 'danger'} alert-dismissible fade show" role="alert">
                        ${response.message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                    `;

                    alertContainer.html(alertMessage);
                    if (response.status === 'success') {
                        $('#contact-form')[0].reset();
                    }
                },
                error: function() {
                    let alertContainer = $('#alert-container');
                    let alertMessage = `
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        An error occurred. Please try again.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                    `;
                    alertContainer.html(alertMessage);
                }
            });
        });
    });
});
