(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  ready(function() {
    var searchToggle = document.querySelector(".nav-search-toggle");
    var searchPanel = document.querySelector(".search-panel");
    var mobileToggle = document.querySelector(".mobile-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (searchToggle && searchPanel) {
      searchToggle.addEventListener("click", function() {
        searchPanel.classList.toggle("active");
        if (searchPanel.classList.contains("active")) {
          var input = searchPanel.querySelector("input");
          if (input) {
            input.focus();
          }
        }
      });
    }

    if (mobileToggle && mobilePanel) {
      mobileToggle.addEventListener("click", function() {
        mobilePanel.classList.toggle("active");
      });
    }

    document.querySelectorAll("form[action='./search.html']").forEach(function(form) {
      form.addEventListener("submit", function(event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var current = 0;
      var timer;
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle("active", i === current);
        });
      }
      function play() {
        timer = window.setInterval(function() {
          show(current + 1);
        }, 5200);
      }
      dots.forEach(function(dot, i) {
        dot.addEventListener("click", function() {
          window.clearInterval(timer);
          show(i);
          play();
        });
      });
      if (slides.length > 1) {
        play();
      }
    }

    var filterButtons = document.querySelectorAll(".filter-btn");
    if (filterButtons.length) {
      filterButtons.forEach(function(button) {
        button.addEventListener("click", function() {
          var panel = button.closest(".filter-panel");
          var container = document.querySelector("[data-card-list]");
          var value = button.getAttribute("data-filter") || "all";
          if (panel) {
            panel.querySelectorAll(".filter-btn").forEach(function(item) {
              item.classList.toggle("active", item === button);
            });
          }
          if (container) {
            container.querySelectorAll(".movie-card").forEach(function(card) {
              var blob = [
                card.getAttribute("data-title"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region"),
                card.getAttribute("data-genre")
              ].join(" ");
              card.hidden = value !== "all" && blob.indexOf(value) === -1;
            });
          }
        });
      });
    }

    var results = document.getElementById("search-results");
    if (results && typeof searchMovies !== "undefined") {
      var params = new URLSearchParams(window.location.search);
      var query = (params.get("q") || "").trim();
      var title = document.getElementById("search-title");
      var summary = document.getElementById("search-summary");
      var normalized = query.toLowerCase();
      var matches = searchMovies.filter(function(movie) {
        if (!normalized) {
          return true;
        }
        return movie.search.indexOf(normalized) !== -1;
      }).slice(0, 120);

      if (title) {
        title.textContent = query ? "“" + query + "”的搜索结果" : "热门影视推荐";
      }
      if (summary) {
        summary.textContent = query ? "已为你匹配相关电视剧、电影与剧集内容。" : "可直接输入关键词搜索片名、地区、类型或年份。";
      }

      if (!matches.length) {
        results.innerHTML = '<div class="empty-state">未找到相关影片，请尝试其他关键词。</div>';
      } else {
        results.innerHTML = matches.map(function(movie) {
          return '<article class="movie-card">' +
            '<a href="' + escapeHtml(movie.file) + '" class="poster-link">' +
              '<span class="poster-frame">' +
                '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                '<span class="poster-badge">' + escapeHtml(movie.rating) + '</span>' +
                '<span class="poster-play">▶</span>' +
              '</span>' +
            '</a>' +
            '<div class="card-body">' +
              '<h3><a href="' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>' +
              '<p class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>' +
              '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>' +
              '<div class="tag-list"><span>' + escapeHtml(movie.genre) + '</span></div>' +
            '</div>' +
          '</article>';
        }).join("");
      }
    }
  });
})();
