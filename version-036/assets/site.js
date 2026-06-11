(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function escapeHTML(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMobileNav() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupSearchForms() {
        document.querySelectorAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    input && input.focus();
                    return;
                }
                event.preventDefault();
                window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        prev && prev.addEventListener('click', function () {
            show(current - 1);
            start();
        });
        next && next.addEventListener('click', function () {
            show(current + 1);
            start();
        });
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupLocalFilters() {
        document.querySelectorAll('[data-local-filter]').forEach(function (input) {
            input.addEventListener('input', function () {
                var query = normalize(input.value);
                var scope = input.closest('.section-block') || document;
                scope.querySelectorAll('[data-card]').forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-year'),
                        card.textContent
                    ].join(' '));
                    card.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
                });
            });
        });
    }

    function createSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHTML(tag) + '</span>';
        }).join('');
        return '<a class="movie-card" href="' + escapeHTML(movie.href) + '">' +
            '<div class="poster-frame">' +
                '<img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">' +
                '<div class="poster-mask"></div>' +
                '<div class="play-mark">▶</div>' +
            '</div>' +
            '<div class="card-body">' +
                '<div class="meta-line"><span>' + escapeHTML(movie.category) + '</span><span>' + escapeHTML(movie.year) + '</span><span class="score">' + escapeHTML(movie.score) + '分</span></div>' +
                '<h3>' + escapeHTML(movie.title) + '</h3>' +
                '<p>' + escapeHTML(movie.oneLine) + '</p>' +
                '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
        '</a>';
    }

    function setupSearchPage() {
        var results = document.getElementById('searchResults');
        if (!results || !window.SEARCH_MOVIES) {
            return;
        }
        var form = document.querySelector('[data-search-page-form]');
        var input = form && form.querySelector('input[name="q"]');
        var status = document.querySelector('[data-search-status]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input) {
            input.value = initial;
        }

        function render(query) {
            var normalized = normalize(query);
            var matched = window.SEARCH_MOVIES.filter(function (movie) {
                var text = normalize([
                    movie.title,
                    movie.category,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' '));
                return !normalized || text.indexOf(normalized) !== -1;
            }).slice(0, 120);
            results.innerHTML = matched.map(createSearchCard).join('');
            if (status) {
                if (normalized) {
                    status.innerHTML = '关键词 <strong>' + escapeHTML(query) + '</strong> 的搜索结果';
                } else {
                    status.textContent = '输入关键词后即可筛选影片内容';
                }
            }
        }

        form && form.addEventListener('submit', function (event) {
            event.preventDefault();
            var value = input ? input.value.trim() : '';
            var nextUrl = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
            history.replaceState(null, '', nextUrl);
            render(value);
        });
        render(initial);
    }

    function setupPlayers() {
        document.querySelectorAll('.movie-player').forEach(function (player) {
            var video = player.querySelector('video');
            var overlay = player.querySelector('.player-overlay');
            var source = player.getAttribute('data-stream');
            var loaded = false;

            function loadAndPlay() {
                if (!video || !source) {
                    return;
                }
                player.classList.add('is-playing');
                if (!loaded) {
                    loaded = true;
                    if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
                        video.src = source;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            lowLatencyMode: true,
                            backBufferLength: 90
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        player._hls = hls;
                    } else {
                        video.src = source;
                    }
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            overlay && overlay.addEventListener('click', function (event) {
                event.preventDefault();
                loadAndPlay();
            });
            video && video.addEventListener('click', function () {
                if (!loaded || video.paused) {
                    loadAndPlay();
                }
            });
            video && video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
        });
    }

    ready(function () {
        setupMobileNav();
        setupSearchForms();
        setupHero();
        setupLocalFilters();
        setupSearchPage();
        setupPlayers();
    });
})();
