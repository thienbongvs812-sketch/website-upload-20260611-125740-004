(function () {
    const searchToggle = document.querySelector('.search-toggle');
    const searchBar = document.querySelector('.search-bar');
    const menuToggle = document.querySelector('.menu-toggle');
    const mobilePanel = document.querySelector('.mobile-panel');

    if (searchToggle && searchBar) {
        searchToggle.addEventListener('click', function () {
            searchBar.classList.toggle('is-open');
            const input = searchBar.querySelector('input');
            if (searchBar.classList.contains('is-open') && input) {
                input.focus();
            }
        });
    }

    if (menuToggle && mobilePanel) {
        menuToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    const prev = document.querySelector('.hero-prev');
    const next = document.querySelector('.hero-next');
    let slideIndex = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        slideIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === slideIndex);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === slideIndex);
        });
    }

    function startTimer() {
        if (!slides.length) {
            return;
        }
        clearInterval(timer);
        timer = setInterval(function () {
            showSlide(slideIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.dataset.slide || 0));
            startTimer();
        });
    });

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(slideIndex - 1);
            startTimer();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(slideIndex + 1);
            startTimer();
        });
    }

    startTimer();

    const params = new URLSearchParams(window.location.search);
    const queryFromUrl = (params.get('q') || '').trim().toLowerCase();
    const tagFromUrl = (params.get('tag') || '').trim().toLowerCase();
    const filterInputs = Array.from(document.querySelectorAll('.page-filter-input'));
    const tagButtons = Array.from(document.querySelectorAll('.tag-filter'));
    const cards = Array.from(document.querySelectorAll('.filter-grid .movie-card, .filter-grid .movie-list-card'));
    const emptyState = document.querySelector('.empty-state');
    let activeTag = tagFromUrl;

    function cardText(card) {
        return [card.dataset.title, card.dataset.tags, card.dataset.category, card.textContent].join(' ').toLowerCase();
    }

    function applyFilter() {
        if (!cards.length) {
            return;
        }
        const query = (filterInputs[0] ? filterInputs[0].value : '').trim().toLowerCase();
        let visible = 0;
        cards.forEach(function (card) {
            const text = cardText(card);
            const matchQuery = !query || text.indexOf(query) !== -1;
            const matchTag = !activeTag || text.indexOf(activeTag) !== -1;
            const show = matchQuery && matchTag;
            card.classList.toggle('is-hidden', !show);
            if (show) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    filterInputs.forEach(function (input) {
        if (queryFromUrl) {
            input.value = queryFromUrl;
        }
        input.addEventListener('input', applyFilter);
    });

    tagButtons.forEach(function (button) {
        const tagValue = (button.dataset.tag || '').toLowerCase();
        if (activeTag && activeTag === tagValue) {
            button.classList.add('is-active');
        }
        button.addEventListener('click', function () {
            if (activeTag === tagValue) {
                activeTag = '';
                button.classList.remove('is-active');
            } else {
                activeTag = tagValue;
                tagButtons.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                button.classList.add('is-active');
            }
            applyFilter();
        });
    });

    applyFilter();
}());
