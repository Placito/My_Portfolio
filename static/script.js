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

    // Function to set the correct language that is selected with the translations
    async function setLanguage(event) {
        event.preventDefault();  // Prevent the form from submitting
        console.log('Language change triggered'); // Log language change trigger
        const lang = event.target.value;
        console.log('Selected language:', lang); // Log selected language
        if (lang) {
            try {
                const response = await fetch(`/set_language/${lang}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    console.log('Language set successfully');
                    const translations = await fetchTranslations(lang);
                    updatePageContent(translations);
                } else {
                    console.error('Failed to set language');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }

    // Ensure the function is globally accessible
    window.setLanguage = setLanguage;

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
        for (let line of lines) {
            if (line.startsWith('msgid')) {
                msgid = line.replace(/msgid\s+"(.*)"/, '$1');
            } else if (line.startsWith('msgstr')) {
                msgstr = line.replace(/msgstr\s+"(.*)"/, '$1');
                translations[msgid] = msgstr;
                msgid = '';
                msgstr = '';
            }
        }
        return translations;
    }

    // Function to update the page content based on the fetched translations
    function updatePageContent(translations) {
        // Helper function to update text content
        const updateElement = (id, translationKey) => {
            const element = document.getElementById(id);
            if (element && translations[translationKey]) {
                element.textContent = translations[translationKey];
            }
        };

        // Update title and description
        updateElement('title', 'title');
        updateElement('subtitle', 'subtitle');

        // Update navigation links
        updateElement('nav-home', 'Home');
        updateElement('nav-about', 'About');
        updateElement('nav-skills', 'Skills');
        updateElement('nav-curriculum', 'Curriculum');
        updateElement('nav-portfolio', 'Portfolio');
        updateElement('nav-contact', 'Contact');

        // Update form labels and placeholders
        updateElement('label-name', 'Name');
        updateElement('label-email', 'Email');
        updateElement('label-message', 'Message');
        updateElement('placeholder-name', 'Write your name');
        updateElement('placeholder-email', 'Write your email');
        updateElement('placeholder-message', 'Write your message');

        // Update section headers and other texts
        updateElement('about-title', 'About');
        updateElement('about-description', 'Proactive Full Stack Developer. I started my journey with a degree in Human Biology, which later led me to discover my new abilities with a Design course, which sparked a passion for me in the programming field. I have a natural aptitude for the front-end but a passion for discovering how things work behind the scenes, which led me to combine these two areas.');
        updateElement('skills-title', 'Skills');
        updateElement('skills-description', 'Throughout my time as a professional I have acquired some technical and soft skills, most of them are here, according to the percentage of knowledge I believe I have in each of them.');
        updateElement('curriculum-title', 'Curriculum');
        updateElement('portfolio-title', 'Portfolio');
        updateElement('portfolio-description', 'Develop during a programming bootcamp, an e-commerce platform where users can browse, review, purchase.');
        updateElement('contact-title', 'Contact');
        updateElement('location', 'Location');
        updateElement('email-title', 'Email');
        updateElement('btn-send', 'Send');

        // Optionally, reload the page if necessary
        location.reload();
    }
});