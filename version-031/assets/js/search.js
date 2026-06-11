(function () {
    const movies = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];
    const categories = Array.isArray(window.SITE_CATEGORIES) ? window.SITE_CATEGORIES : [];
    const form = document.querySelector("[data-search-panel]");
    const resultBox = document.querySelector("[data-search-results]");
    const summary = document.querySelector("[data-search-summary]");

    if (!form || !resultBox || !summary) {
        return;
    }

    const yearSelect = form.querySelector("select[name='year']");
    const queryInput = form.querySelector("input[name='q']");
    const categorySelect = form.querySelector("select[name='category']");
    const params = new URLSearchParams(window.location.search);

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function uniqueYears() {
        return Array.from(new Set(movies.map(function (movie) {
            return movie.year;
        }).filter(Boolean))).sort(function (a, b) {
            return String(b).localeCompare(String(a));
        });
    }

    uniqueYears().forEach(function (year) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    queryInput.value = params.get("q") || "";
    categorySelect.value = params.get("category") || "";
    yearSelect.value = params.get("year") || "";

    function getCategoryTitle(id) {
        const category = categories.find(function (item) {
            return item.id === id;
        });
        return category ? category.title : "";
    }

    function matchMovie(movie, keyword, category, year) {
        const text = [
            movie.title,
            movie.region,
            movie.type,
            movie.genre,
            movie.tags,
            movie.oneLine,
            getCategoryTitle(movie.categoryId)
        ].join(" ").toLowerCase();

        const keywordOk = !keyword || text.indexOf(keyword) !== -1;
        const categoryOk = !category || movie.categoryId === category;
        const yearOk = !year || String(movie.year) === String(year);

        return keywordOk && categoryOk && yearOk;
    }

    function render() {
        const keyword = queryInput.value.trim().toLowerCase();
        const category = categorySelect.value;
        const year = yearSelect.value;
        const results = movies.filter(function (movie) {
            return matchMovie(movie, keyword, category, year);
        });
        const visible = results.slice(0, 240);

        summary.textContent = results.length ? "为你找到相关影片" : "没有找到匹配影片";
        resultBox.innerHTML = visible.map(function (movie) {
            return [
                "<a class=\"movie-card\" href=\"" + escapeHtml(movie.url) + "\">",
                "<span class=\"poster-wrap\">",
                "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
                "<span class=\"poster-shade\"></span>",
                "<span class=\"badge top-left\">" + escapeHtml(movie.type) + "</span>",
                "<span class=\"badge top-right\">" + escapeHtml(movie.year) + "</span>",
                "</span>",
                "<span class=\"card-body\">",
                "<strong>" + escapeHtml(movie.title) + "</strong>",
                "<em>" + escapeHtml(movie.oneLine) + "</em>",
                "<span class=\"card-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(getCategoryTitle(movie.categoryId)) + "</span>",
                "</span>",
                "</a>"
            ].join("");
        }).join("");
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const params = new URLSearchParams();
        if (queryInput.value.trim()) {
            params.set("q", queryInput.value.trim());
        }
        if (categorySelect.value) {
            params.set("category", categorySelect.value);
        }
        if (yearSelect.value) {
            params.set("year", yearSelect.value);
        }
        const suffix = params.toString();
        history.replaceState(null, "", suffix ? "./search.html?" + suffix : "./search.html");
        render();
    });

    [queryInput, categorySelect, yearSelect].forEach(function (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
    });

    render();
})();
