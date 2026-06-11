import { H as Hls } from './hls-dru42stk.js';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function setupMobileMenu() {
  const button = $('[data-menu-toggle]');
  const nav = $('[data-mobile-nav]');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

function setupHero() {
  const hero = $('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = $$('[data-hero-slide]', hero);
  const dots = $$('[data-hero-dot]', hero);
  let current = 0;
  let timer = null;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === current);
    });
  };

  const start = () => {
    timer = window.setInterval(() => show(current + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      stop();
      show(Number(dot.dataset.heroDot || 0));
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  show(0);
  start();
}

function setupLocalFilters() {
  const panel = $('[data-filter-panel]');
  const list = $('[data-card-list]');

  if (!panel || !list) {
    return;
  }

  const cards = $$('.movie-card', list);
  const count = $('[data-result-count]');
  const form = $('[data-local-search-form]');
  let year = 'all';
  let type = 'all';
  let keyword = '';

  const apply = () => {
    let visible = 0;
    const needle = keyword.trim().toLowerCase();

    cards.forEach((card) => {
      const haystack = [
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.region,
        card.dataset.tags
      ].join(' ').toLowerCase();
      const yearMatched = year === 'all' || card.dataset.year === year;
      const typeMatched = type === 'all' || card.dataset.type === type;
      const keywordMatched = !needle || haystack.includes(needle);
      const matched = yearMatched && typeMatched && keywordMatched;

      card.classList.toggle('hidden-card', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = `${visible} 部影片`;
    }
  };

  $$('[data-filter-year]', panel).forEach((button) => {
    button.addEventListener('click', () => {
      year = button.dataset.filterYear || 'all';
      $$('[data-filter-year]', panel).forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      apply();
    });
  });

  $$('[data-filter-type]', panel).forEach((button) => {
    button.addEventListener('click', () => {
      type = button.dataset.filterType || 'all';
      $$('[data-filter-type]', panel).forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      apply();
    });
  });

  if (form) {
    const input = $('input', form);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      keyword = input ? input.value : '';
      apply();
    });

    if (input) {
      input.addEventListener('input', () => {
        keyword = input.value;
        apply();
      });
    }
  }
}

function setupPlayers() {
  $$('[data-player]').forEach((player) => {
    const video = $('video', player);
    const button = $('[data-play-button]', player);
    const message = $('[data-player-message]', player);

    if (!video || !button) {
      return;
    }

    const source = video.dataset.src;

    button.addEventListener('click', async () => {
      if (!source) {
        if (message) {
          message.textContent = '当前影片暂未绑定播放源。';
        }
        return;
      }

      try {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (Hls && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          player.hlsInstance = hls;
        } else {
          video.src = source;
        }

        button.classList.add('hidden');
        video.controls = true;
        await video.play();
      } catch (error) {
        button.classList.remove('hidden');
        if (message) {
          message.textContent = '播放器已加载播放源，请再次点击或稍后重试。';
        }
      }
    });
  });
}

function createSearchCard(movie) {
  const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

  return `
<article class="movie-card" data-title="${escapeHtml(movie.title)}">
  <a class="poster-frame" href="${movie.url}" aria-label="观看${escapeHtml(movie.title)}">
    <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy" onerror="this.hidden=true; this.closest('.poster-frame').classList.add('poster-missing');">
    <span class="poster-fallback">${escapeHtml(movie.title)}</span>
    <span class="play-chip">播放</span>
  </a>
  <div class="movie-card-body">
    <div class="card-meta">
      <span>${escapeHtml(movie.year)}</span>
      <span>${escapeHtml(movie.region)}</span>
      <span>${escapeHtml(movie.type)}</span>
    </div>
    <h3><a href="${movie.url}">${escapeHtml(movie.title)}</a></h3>
    <p>${escapeHtml(movie.oneLine)}</p>
    <div class="tag-row">${tags}</div>
    <a class="category-pill" href="${movie.categoryUrl}">${escapeHtml(movie.categoryName)}</a>
  </div>
</article>`;
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;'
  })[char]);
}

function setupSearchPage() {
  const results = $('#searchResults');
  const status = $('#searchStatus');
  const input = $('#searchPageInput');

  if (!results || !window.SITE_MOVIES) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim();

  if (input) {
    input.value = query;
  }

  const normalized = query.toLowerCase();
  const matches = window.SITE_MOVIES.filter((movie) => {
    if (!normalized) {
      return true;
    }

    const haystack = [
      movie.title,
      movie.year,
      movie.region,
      movie.type,
      movie.genre,
      movie.categoryName,
      movie.oneLine,
      ...(movie.tags || [])
    ].join(' ').toLowerCase();

    return haystack.includes(normalized);
  }).slice(0, 120);

  if (status) {
    status.textContent = query ? `找到 ${matches.length} 条结果` : '默认展示 120 条影片';
  }

  if (!matches.length) {
    results.innerHTML = '<div class="empty-results">没有找到匹配影片，请尝试更换关键词。</div>';
    return;
  }

  results.innerHTML = matches.map(createSearchCard).join('');
}

setupMobileMenu();
setupHero();
setupLocalFilters();
setupPlayers();
setupSearchPage();
