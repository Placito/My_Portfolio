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

        // Function to fetch translations
    async function fetchTranslations(lang) {
        const response = await fetch(`/translations/${lang}/LC_MESSAGES/messages.po`);
        if (!response.ok) {
            throw new Error('Failed to load translations');
        }
        const poContent = await response.text();
        return parsePO(poContent);
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
                msgid = line.replace(/msgid\s*"(.*)"/, '$1');
            } else if (line.startsWith('msgstr')) {
                inMsgstr = true;
                inMsgid = false;
                msgstr = line.replace(/msgstr\s*"(.*)"/, '$1');
                translations[msgid] = msgstr;
                msgid = '';
                msgstr = '';
            } else if (inMsgid && line.startsWith('"')) {
                msgid += line.replace(/"(.*)"/, '$1');
            } else if (inMsgstr && line.startsWith('"')) {
                msgstr += line.replace(/"(.*)"/, '$1');
            }
        }
        return translations;
    }

    // Function to update the page content based on the fetched translations
    function updatePageContent(translations) {
        const elementsToUpdate = document.querySelectorAll('[data-i18n]');
        elementsToUpdate.forEach((element) => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });
    }

    // Function to set the language and reload the page
    async function setLanguage(event) {
        const lang = event.target.value;
        if (lang) {
            try {
                const translations = await fetchTranslations(lang);
                console.log(translations)
                updatePageContent(translations);
                localStorage.setItem('selectedLang', lang);
                location.reload();
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }

    window.setLanguage = setLanguage;

    const savedLang = localStorage.getItem('selectedLang');
    if (savedLang) {
        document.querySelector('select.form-select').value = savedLang;
        fetchTranslations(savedLang).then(translations => {
            updatePageContent(translations);
        });
    }
});