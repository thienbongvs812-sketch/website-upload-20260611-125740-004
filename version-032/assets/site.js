(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('navLinks');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var current = 0;
    var show = function (index) {
      current = index % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  var input = document.querySelector('.filter-input');
  var selects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-row'));
  var applyFilter = function () {
    if (!cards.length) {
      return;
    }
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var filters = {};
    selects.forEach(function (select) {
      filters[select.getAttribute('data-filter')] = select.value;
    });
    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-type'),
        card.getAttribute('data-region'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-category'),
        card.getAttribute('data-year')
      ].join(' ').toLowerCase();
      var ok = !keyword || text.indexOf(keyword) !== -1;
      if (filters.type) {
        ok = ok && (card.getAttribute('data-type') || '').indexOf(filters.type) !== -1;
      }
      if (filters.year) {
        ok = ok && card.getAttribute('data-year') === filters.year;
      }
      if (filters.category) {
        ok = ok && card.getAttribute('data-category') === filters.category;
      }
      card.classList.toggle('hidden-by-filter', !ok);
    });
  };
  if (input) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      input.value = q;
    }
    input.addEventListener('input', applyFilter);
  }
  selects.forEach(function (select) {
    select.addEventListener('change', applyFilter);
  });
  applyFilter();
})();
