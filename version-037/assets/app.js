(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setActiveSlide(slides, dots, index) {
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      setActiveSlide(slides, dots, index);
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        schedule();
      });
    }

    show(0);
    schedule();
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-page-filter]');
      var year = scope.querySelector('[data-year-filter]');
      var type = scope.querySelector('[data-type-filter]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var empty = scope.querySelector('[data-empty-state]');

      function apply() {
        var keyword = normalize(input && input.value);
        var yearValue = year ? year.value : '';
        var typeValue = type ? type.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-haystack'));
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
          var matchesType = !typeValue || card.getAttribute('data-type') === typeValue;
          var show = matchesKeyword && matchesYear && matchesType;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      if (type) {
        type.addEventListener('change', apply);
      }
      apply();
    });
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function buildCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + escapeHtml(item.url) + '">',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '海报" loading="lazy">',
      '<span class="poster-badge">' + escapeHtml(item.year) + '</span>',
      '</a>',
      '<div class="card-content">',
      '<p class="card-type">' + escapeHtml(item.type) + ' · ' + escapeHtml(item.category) + '</p>',
      '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function initSearchPage() {
    var mount = document.querySelector('[data-search-results]');
    if (!mount || !window.__MOVIE_INDEX__) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var form = document.querySelector('[data-search-main]');
    var input = document.querySelector('[data-search-page-input]');
    var empty = document.querySelector('[data-search-empty]');

    if (input) {
      input.value = q;
    }

    function render(keyword) {
      var value = normalize(keyword);
      var items = window.__MOVIE_INDEX__.filter(function (item) {
        if (!value) {
          return item.featured;
        }
        return normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.category,
          (item.tags || []).join(' '),
          item.oneLine
        ].join(' ')).indexOf(value) !== -1;
      }).slice(0, value ? 240 : 80);

      mount.innerHTML = items.map(buildCard).join('');
      if (empty) {
        empty.classList.toggle('is-visible', items.length === 0);
      }
    }

    if (form && input) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var next = input.value.trim();
        var url = next ? 'search.html?q=' + encodeURIComponent(next) : 'search.html';
        window.history.replaceState(null, '', url);
        render(next);
      });
    }

    render(q);
  }

  function initPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (box) {
      var video = box.querySelector('video[data-stream]');
      var button = box.querySelector('[data-play-button]');
      var started = false;
      var hls = null;

      if (!video || !button) {
        return;
      }

      function start() {
        var stream = video.getAttribute('data-stream');
        if (!stream) {
          return;
        }

        box.classList.add('is-playing');

        if (started) {
          video.play().catch(function () {});
          return;
        }

        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          return;
        }

        video.src = stream;
        video.play().catch(function () {});
      }

      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function initSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || input.value.trim()) {
          return;
        }
        event.preventDefault();
        input.focus();
      });
    });
  }

  ready(function () {
    initHero();
    initMobileMenu();
    initFilters();
    initSearchForms();
    initSearchPage();
    initPlayer();
  });
})();
