// static/languageHandler.js
export async function setLanguage(event) {
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
                location.reload();
            } else {
                console.error('Failed to set language on server');
            }
        } catch (error) {
            console.error('Error setting language:', error);
        }
    }
}

async function fetchTranslations(lang) {
    if (lang === 'en') {
        // Fetch the current locale from the server if the language is 'en'
        const localeResponse = await fetch('/get_locale');
        return {};
    }

    try {
        const response = await fetch(`/translations/${lang}/LC_MESSAGES/messages.po`);
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`Translations file not found for language: ${lang}`);
                return {}; // Return an empty object if file is not found
            }
            throw new Error('Failed to load translations');
        }
        const poContent = await response.text();
        return parsePO(poContent);
    } catch (error) {
        console.error('Error fetching translations:', error);
        return {};
    }
}

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
            if (msgid && msgstr) {
                translations[msgid] = msgstr;
                msgid = '';
                msgstr = '';
            }
            inMsgid = false;
            inMsgstr = false;
        }
    }
    if (msgid && msgstr) {
        translations[msgid] = msgstr;
    }
    return translations;
}

export function updatePageContent(translations) {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });
}

export function loadSavedLanguage() {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
        const langSelect = document.querySelector('select.form-select');
        if (langSelect) {
            langSelect.value = savedLang;
        }
        fetchTranslations(savedLang).then(translations => {
            updatePageContent(translations);
        });
    }
}
