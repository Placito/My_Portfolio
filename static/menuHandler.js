// static/menuHandler.js
export function initMenuHandler() {
    const menuMobile = document.querySelector('.menu-mobile');
    const body = document.querySelector('body');

    if (menuMobile && body) {
        menuMobile.addEventListener('click', () => {
            if (menuMobile.classList.contains('bi-list')) {
                menuMobile.classList.replace('bi-list', 'bi-x');
            } else {
                menuMobile.classList.replace('bi-x', 'bi-list');
            }
            body.classList.toggle('menu-nav-active');
        });

        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (body.classList.contains('menu-nav-active')) {
                    body.classList.remove('menu-nav-active');
                    menuMobile.classList.replace('bi-x', 'bi-list');
                }
            });
        });
    } else {
        console.error('Menu or body element not found');
    }
}
