(function () {
    const navToggle = document.querySelector("[data-nav-toggle]");
    const mainNav = document.querySelector("[data-main-nav]");

    if (navToggle && mainNav) {
        navToggle.addEventListener("click", function () {
            mainNav.classList.toggle("is-open");
        });
    }

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    let activeSlide = 0;
    let heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === activeSlide);
        });
    }

    function startHeroTimer() {
        if (slides.length < 2) {
            return;
        }

        clearInterval(heroTimer);
        heroTimer = setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5600);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
            startHeroTimer();
        });
    });

    showSlide(0);
    startHeroTimer();

    const headerSearch = document.querySelector("[data-header-search]");
    if (headerSearch) {
        headerSearch.addEventListener("submit", function (event) {
            const input = headerSearch.querySelector("input[name='q']");
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = "./search.html";
            }
        });
    }
})();
