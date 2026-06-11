(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-slide-dot]"));
        var prev = hero.querySelector("[data-slide-prev]");
        var next = hero.querySelector("[data-slide-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(parseInt(dot.getAttribute("data-slide-dot"), 10));
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        start();
    }

    function initSearchQuery() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        var input = document.querySelector("[data-search-input]");
        if (input && q) {
            input.value = q;
        }
        if (q) {
            filterCards(q.toLowerCase(), "");
        }
    }

    function filterCards(query, year) {
        var list = document.querySelector("[data-filter-list]");
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.children);
        cards.forEach(function (card) {
            var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
            var cardYear = parseInt(card.getAttribute("data-year") || "0", 10);
            var passQuery = !query || haystack.indexOf(query) !== -1;
            var passYear = !year || cardYear >= parseInt(year, 10);
            card.classList.toggle("is-filter-hidden", !(passQuery && passYear));
        });
    }

    function initLocalFilter() {
        var input = document.querySelector("[data-local-filter]");
        var year = document.querySelector("[data-year-filter]");
        if (!input && !year) {
            return;
        }
        function run() {
            filterCards(input ? input.value.trim().toLowerCase() : "", year ? year.value : "");
        }
        if (input) {
            input.addEventListener("input", run);
        }
        if (year) {
            year.addEventListener("change", run);
        }
    }

    function initPlayer() {
        var video = document.querySelector(".movie-player[data-stream]");
        if (!video) {
            return;
        }
        var button = document.querySelector("[data-play-button]");
        var stream = video.getAttribute("data-stream");
        var attached = false;
        var hls = null;

        function attach() {
            if (attached || !stream) {
                return;
            }
            attached = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.load();
            }
        }

        function play() {
            attach();
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        attach();

        if (button) {
            button.addEventListener("click", function () {
                button.classList.add("is-hidden");
                play();
            });
        }

        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });

        video.addEventListener("click", function () {
            attach();
        }, { once: true });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initSearchQuery();
        initLocalFilter();
        initPlayer();
    });
})();
