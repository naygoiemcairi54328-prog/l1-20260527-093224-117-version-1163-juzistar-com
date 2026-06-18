(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        const show = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        const restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.dataset.heroDot || 0));
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    const lists = Array.from(document.querySelectorAll('[data-card-list]'));

    lists.forEach(function (list) {
        const cards = Array.from(list.querySelectorAll('.movie-card'));
        const root = list.closest('main') || document;
        const keywordInput = root.querySelector('[data-filter-keyword]');
        const yearSelect = root.querySelector('[data-filter-year]');
        const regionSelect = root.querySelector('[data-filter-region]');
        const sortSelect = root.querySelector('[data-sort-cards]');
        const emptyState = root.querySelector('[data-empty-state]');
        const resultCount = root.querySelector('[data-result-count]');
        const querySync = root.querySelector('[data-query-sync]');

        if (querySync) {
            const params = new URLSearchParams(window.location.search);
            const q = params.get('q');
            if (q) {
                querySync.value = q;
            }
        }

        const normalize = function (value) {
            return String(value || '').toLowerCase().trim();
        };

        const scoreOf = function (card) {
            const badge = card.querySelector('.score-badge');
            return Number(badge ? badge.textContent : 0);
        };

        const apply = function () {
            const keyword = normalize(keywordInput ? keywordInput.value : '');
            const year = yearSelect ? yearSelect.value : '';
            const region = regionSelect ? regionSelect.value : '';
            let visibleCount = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.category
                ].join(' '));
                const okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                const okYear = !year || String(card.dataset.year) === year;
                const okRegion = !region || String(card.dataset.region) === region;
                const visible = okKeyword && okYear && okRegion;

                card.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (sortSelect) {
                const sorted = cards.slice().sort(function (a, b) {
                    const mode = sortSelect.value;
                    if (mode === 'year-asc') {
                        return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
                    }
                    if (mode === 'score-desc') {
                        return scoreOf(b) - scoreOf(a);
                    }
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                });
                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
            }

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }

            if (resultCount) {
                resultCount.textContent = '共 ' + visibleCount + ' 部影片';
            }
        };

        [keywordInput, yearSelect, regionSelect, sortSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    });

    const players = Array.from(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
        const video = player.querySelector('video');
        const button = player.querySelector('[data-play-button]');
        const source = player.dataset.src;
        let initialized = false;

        const init = function () {
            if (initialized || !video || !source) {
                return;
            }
            initialized = true;

            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        };

        const play = function () {
            init();
            if (button) {
                button.classList.add('is-hidden');
            }
            const promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        };

        if (button && video) {
            button.addEventListener('click', play);
            video.addEventListener('play', function () {
                button.classList.add('is-hidden');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    button.classList.remove('is-hidden');
                }
            });
        }
    });
})();
