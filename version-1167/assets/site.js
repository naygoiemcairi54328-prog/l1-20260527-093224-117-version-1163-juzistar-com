(function () {
    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    document.addEventListener("DOMContentLoaded", function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        qsa("[data-hero]").forEach(function (hero) {
            var slides = qsa("[data-hero-slide]", hero);
            var dots = qsa("[data-hero-dot]", hero);
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === index);
                });
            }

            function play() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5600);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    play();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    play();
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    play();
                });
            });

            show(0);
            play();
        });

        qsa("[data-filter-area]").forEach(function (area) {
            var section = area.parentElement;
            var cards = qsa("[data-movie-card]", section);
            var empty = section.querySelector("[data-empty-state]");
            var queryInput = area.querySelector("[data-filter-query]");
            var regionInput = area.querySelector("[data-filter-region]");
            var yearInput = area.querySelector("[data-filter-year]");
            var resetButton = area.querySelector("[data-filter-reset]");
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q");

            if (initialQuery && queryInput) {
                queryInput.value = initialQuery;
            }

            function applyFilters() {
                var query = normalize(queryInput && queryInput.value);
                var region = normalize(regionInput && regionInput.value);
                var year = normalize(yearInput && yearInput.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var keywords = normalize(card.getAttribute("data-keywords"));
                    var cardRegion = normalize(card.getAttribute("data-region"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var matchesQuery = !query || keywords.indexOf(query) !== -1;
                    var matchesRegion = !region || cardRegion.indexOf(region) !== -1 || keywords.indexOf(region) !== -1;
                    var matchesYear = !year || cardYear.indexOf(year) !== -1;
                    var showCard = matchesQuery && matchesRegion && matchesYear;

                    card.style.display = showCard ? "" : "none";
                    if (showCard) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            }

            [queryInput, regionInput, yearInput].forEach(function (input) {
                if (input) {
                    input.addEventListener("input", applyFilters);
                }
            });

            if (resetButton) {
                resetButton.addEventListener("click", function () {
                    if (queryInput) {
                        queryInput.value = "";
                    }
                    if (regionInput) {
                        regionInput.value = "";
                    }
                    if (yearInput) {
                        yearInput.value = "";
                    }
                    applyFilters();
                });
            }

            applyFilters();
        });
    });

    window.setupMoviePlayer = function (source) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playOverlay");
        var hls = null;
        var loaded = false;

        if (!video || !source) {
            return;
        }

        function load() {
            if (loaded) {
                return Promise.resolve();
            }

            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }

            return Promise.resolve();
        }

        function start() {
            load().then(function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            });
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        video.addEventListener("emptied", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
                hls = null;
            }
            loaded = false;
        });
    };
})();
