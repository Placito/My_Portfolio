// static/scrollAnimation.js
export function initScrollAnimation() {
    const animeItems = document.querySelectorAll("[data-anime]");
    const animeScroll = () => {
        const windowTop = window.scrollY + window.innerHeight * 0.85;
        animeItems.forEach((element) => {
            if (windowTop > element.offsetTop) {
                element.classList.add("animate");
            } else {
                element.classList.remove("animate");
            }
        });
    };
    animeScroll();
    window.addEventListener("scroll", animeScroll);
}
