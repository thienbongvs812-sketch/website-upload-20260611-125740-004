(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    if (!button) {
      return;
    }
    var target = document.getElementById(button.getAttribute("data-menu-toggle"));
    if (!target) {
      return;
    }
    button.addEventListener("click", function () {
      target.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    restart();
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function initFilters() {
    var input = document.querySelector(".local-search");
    var select = document.querySelector(".local-select");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-grid .movie-card"));
    if (!cards.length) {
      return;
    }

    var queryValue = getQueryValue("q");
    if (input && queryValue) {
      input.value = queryValue;
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var type = select ? select.value : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedType = !type || cardType.indexOf(type) !== -1;
        card.hidden = !(matchedQuery && matchedType);
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
    apply();
  }

  window.initMoviePlayer = function (videoId, coverId, source) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    if (!video || !cover || !source) {
      return;
    }
    var attached = false;

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.hlsInstance = hls;
      } else {
        video.src = source;
      }
      video.setAttribute("controls", "controls");
    }

    function play() {
      attachSource();
      cover.classList.add("is-hidden");
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          cover.classList.remove("is-hidden");
        });
      }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  };

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initFilters();
  });
})();
