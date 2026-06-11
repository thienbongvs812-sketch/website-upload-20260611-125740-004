(function () {
  var movies = window.MOVIES_DATA || [];
  var keyword = document.getElementById("searchKeyword");
  var typeFilter = document.getElementById("typeFilter");
  var genreFilter = document.getElementById("genreFilter");
  var regionFilter = document.getElementById("regionFilter");
  var yearFilter = document.getElementById("yearFilter");
  var sortFilter = document.getElementById("sortFilter");
  var results = document.getElementById("searchResults");
  var status = document.getElementById("searchStatus");
  var pages = document.getElementById("searchPages");
  var pageSize = 24;
  var currentPage = 1;
  var currentItems = [];

  function text(value) {
    return String(value || "");
  }

  function esc(value) {
    return text(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function card(movie) {
    var genreTags = text(movie.genre).split(/\s*[\/，,、]\s*/).filter(Boolean).slice(0, 2).map(function (item) {
      return "<span>" + esc(item) + "</span>";
    }).join("");

    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"./" + esc(movie.link) + "\" aria-label=\"" + esc(movie.title) + "\">" +
      "<span class=\"poster-shell\">" +
      "<img src=\"./" + esc(movie.cover) + "\" alt=\"" + esc(movie.title) + "\" loading=\"lazy\" decoding=\"async\" onerror=\"this.style.opacity='0';\">" +
      "<span class=\"poster-shade\"></span>" +
      "<span class=\"poster-play\">▶</span>" +
      "<span class=\"poster-year\">" + esc(movie.year) + "</span>" +
      "</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"movie-card-meta\"><span>" + esc(movie.type) + "</span><span>" + esc(movie.region) + "</span></div>" +
      "<h2><a href=\"./" + esc(movie.link) + "\">" + esc(movie.title) + "</a></h2>" +
      "<p>" + esc(movie.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + genreTags + "</div>" +
      "</div>" +
      "</article>";
  }

  function valueOf(node) {
    return node ? node.value.trim() : "";
  }

  function applyFilters() {
    var q = valueOf(keyword).toLowerCase();
    var type = valueOf(typeFilter);
    var genre = valueOf(genreFilter);
    var region = valueOf(regionFilter);
    var year = valueOf(yearFilter);
    var sort = valueOf(sortFilter) || "hot";

    currentItems = movies.filter(function (movie) {
      var pool = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
      return (!q || pool.indexOf(q) !== -1) &&
        (!type || movie.type === type) &&
        (!genre || movie.genre.indexOf(genre) !== -1) &&
        (!region || movie.region.indexOf(region) !== -1) &&
        (!year || movie.year === year);
    });

    currentItems.sort(function (a, b) {
      if (sort === "year") {
        return (b.yearNum || 0) - (a.yearNum || 0) || (b.heat || 0) - (a.heat || 0);
      }
      if (sort === "title") {
        return text(a.title).localeCompare(text(b.title), "zh-Hans-CN");
      }
      return (b.heat || 0) - (a.heat || 0);
    });

    currentPage = 1;
    render();
  }

  function render() {
    var totalPages = Math.max(1, Math.ceil(currentItems.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    var start = (currentPage - 1) * pageSize;
    var items = currentItems.slice(start, start + pageSize);
    results.innerHTML = items.map(card).join("");
    status.textContent = currentItems.length ? "找到 " + currentItems.length + " 部内容" : "未找到匹配内容";
    renderPages(totalPages);
  }

  function renderPages(totalPages) {
    if (!pages) {
      return;
    }
    if (totalPages <= 1) {
      pages.innerHTML = "";
      return;
    }
    var html = "";
    for (var i = 1; i <= totalPages; i += 1) {
      if (i === currentPage) {
        html += "<strong>" + i + "</strong>";
      } else if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) {
        html += "<a href=\"#\" data-page=\"" + i + "\">" + i + "</a>";
      } else if (Math.abs(i - currentPage) === 3) {
        html += "<span>…</span>";
      }
    }
    pages.innerHTML = html;
  }

  if (pages) {
    pages.addEventListener("click", function (event) {
      var target = event.target.closest("[data-page]");
      if (!target) {
        return;
      }
      event.preventDefault();
      currentPage = Number(target.getAttribute("data-page")) || 1;
      render();
      results.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  [keyword, typeFilter, genreFilter, regionFilter, yearFilter, sortFilter].forEach(function (node) {
    if (node) {
      node.addEventListener("input", applyFilters);
      node.addEventListener("change", applyFilters);
    }
  });

  var params = new URLSearchParams(window.location.search);
  if (params.get("q") && keyword) {
    keyword.value = params.get("q");
  }

  currentItems = movies.slice().sort(function (a, b) {
    return (b.heat || 0) - (a.heat || 0);
  });
  applyFilters();
})();
