(function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");
    const searchToggle = document.querySelector(".search-toggle");
    const headerSearch = document.querySelector(".header-search");
    const globalSearch = document.querySelector(".global-search");

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    if (searchToggle && headerSearch && globalSearch) {
        searchToggle.addEventListener("click", function () {
            headerSearch.classList.toggle("is-open");
            if (headerSearch.classList.contains("is-open")) {
                globalSearch.focus();
            }
        });
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function filterItems(input) {
        const keyword = normalize(input.value);
        const scope = input.closest("main") || document;
        const cards = Array.from(scope.querySelectorAll(".movie-card, .rank-row"));
        cards.forEach(function (card) {
            const text = normalize(card.getAttribute("data-search") || card.textContent);
            card.hidden = keyword.length > 0 && !text.includes(keyword);
        });
    }

    document.querySelectorAll(".card-search").forEach(function (input) {
        input.addEventListener("input", function () {
            filterItems(input);
        });
    });

    if (globalSearch) {
        globalSearch.addEventListener("input", function () {
            document.querySelectorAll(".movie-card, .rank-row").forEach(function (card) {
                const keyword = normalize(globalSearch.value);
                const text = normalize(card.getAttribute("data-search") || card.textContent);
                card.hidden = keyword.length > 0 && !text.includes(keyword);
            });
        });
    }

    document.querySelectorAll(".sort-select").forEach(function (select) {
        select.addEventListener("change", function () {
            const grid = select.closest("section").querySelector(".sortable-grid");
            if (!grid) {
                return;
            }
            const items = Array.from(grid.children);
            const mode = select.value;
            items.sort(function (a, b) {
                const ay = Number(a.getAttribute("data-year") || 0);
                const by = Number(b.getAttribute("data-year") || 0);
                const av = Number(a.getAttribute("data-views") || 0);
                const bv = Number(b.getAttribute("data-views") || 0);
                const as = Number(a.getAttribute("data-score") || 0);
                const bs = Number(b.getAttribute("data-score") || 0);
                if (mode === "views-desc") {
                    return bv - av;
                }
                if (mode === "score-desc") {
                    return bs - as;
                }
                return by - ay;
            });
            items.forEach(function (item) {
                grid.appendChild(item);
            });
        });
    });

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    const prev = document.querySelector(".hero-prev");
    const next = document.querySelector(".hero-next");
    let current = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, position) {
            slide.classList.toggle("is-active", position === current);
        });
        dots.forEach(function (dot, position) {
            dot.classList.toggle("is-active", position === current);
        });
    }

    function startCarousel() {
        if (slides.length <= 1) {
            return;
        }
        clearInterval(timer);
        timer = setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-slide-target") || 0));
            startCarousel();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(current - 1);
            startCarousel();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(current + 1);
            startCarousel();
        });
    }

    showSlide(0);
    startCarousel();
})();
