import { H as Hls } from './hls-vendor-dru42stk.js';

const ready = (fn) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
};

const normalize = (value) => String(value || '').trim().toLowerCase();

function initMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  if (!toggle || !menu) {
    return;
  }
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.textContent = expanded ? '☰' : '×';
    menu.hidden = expanded;
  });
}

function initHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const prev = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };

  const restart = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(() => show(index + 1), 5000);
  };

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      show(i);
      restart();
    });
  });
  if (prev) {
    prev.addEventListener('click', () => {
      show(index - 1);
      restart();
    });
  }
  if (next) {
    next.addEventListener('click', () => {
      show(index + 1);
      restart();
    });
  }
  restart();
}

function initFilters() {
  const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach((panel) => {
    const cards = Array.from(panel.querySelectorAll('.movie-card'));
    const search = panel.querySelector('[data-filter-search]');
    const status = panel.querySelector('[data-filter-status]');
    const reset = panel.querySelector('[data-filter-reset]');
    let activeGenre = 'all';
    let activeYear = 'all';

    const apply = () => {
      const query = normalize(search ? search.value : '');
      let visible = 0;
      cards.forEach((card) => {
        const title = normalize(card.dataset.title);
        const genre = normalize(card.dataset.genre);
        const year = normalize(card.dataset.year);
        const region = normalize(card.dataset.region);
        const matchQuery = !query || title.includes(query) || genre.includes(query) || year.includes(query) || region.includes(query);
        const matchGenre = activeGenre === 'all' || genre.includes(normalize(activeGenre));
        const matchYear = activeYear === 'all' || year === normalize(activeYear);
        const show = matchQuery && matchGenre && matchYear;
        card.classList.toggle('hidden-by-filter', !show);
        if (show) {
          visible += 1;
        }
      });
      if (status) {
        status.textContent = `当前显示 ${visible} 部影片`;
      }
    };

    panel.querySelectorAll('[data-filter-genre]').forEach((button) => {
      button.addEventListener('click', () => {
        activeGenre = button.dataset.filterGenre || 'all';
        panel.querySelectorAll('[data-filter-genre]').forEach((item) => item.classList.remove('is-active'));
        button.classList.add('is-active');
        apply();
      });
    });

    panel.querySelectorAll('[data-filter-year]').forEach((button) => {
      button.addEventListener('click', () => {
        activeYear = button.dataset.filterYear || 'all';
        panel.querySelectorAll('[data-filter-year]').forEach((item) => item.classList.remove('is-active'));
        button.classList.add('is-active');
        apply();
      });
    });

    if (search) {
      search.addEventListener('input', apply);
    }
    if (reset) {
      reset.addEventListener('click', () => {
        activeGenre = 'all';
        activeYear = 'all';
        if (search) {
          search.value = '';
        }
        panel.querySelectorAll('[data-filter-genre], [data-filter-year]').forEach((item) => item.classList.remove('is-active'));
        panel.querySelectorAll('[data-filter-genre="all"], [data-filter-year="all"]').forEach((item) => item.classList.add('is-active'));
        apply();
      });
    }
    apply();
  });
}

function initPlayers() {
  const players = Array.from(document.querySelectorAll('[data-player]'));
  players.forEach((player) => {
    const video = player.querySelector('video');
    const overlay = player.querySelector('.player-overlay');
    const error = player.querySelector('.player-error');
    const src = player.dataset.videoSrc;
    let loaded = false;
    let hls = null;

    if (!video || !src) {
      return;
    }

    const showError = () => {
      if (error) {
        error.hidden = false;
      }
    };

    const load = () => {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            showError();
          }
        });
      } else {
        showError();
      }
    };

    const play = async () => {
      load();
      if (overlay) {
        overlay.hidden = true;
      }
      video.controls = true;
      try {
        await video.play();
      } catch (errorObject) {
        if (overlay) {
          overlay.hidden = false;
        }
      }
    };

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', () => {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSearchCard(movie) {
  return `
    <a class="movie-card" href="./${escapeHtml(movie.url)}" data-title="${escapeHtml(movie.title)}" data-year="${escapeHtml(movie.year)}" data-region="${escapeHtml(movie.region)}" data-genre="${escapeHtml(movie.genre)}">
      <div class="movie-poster-wrap">
        <img src="./${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="card-year">${escapeHtml(movie.year)}</span>
        <span class="card-genre">${escapeHtml(movie.genreLabel)}</span>
      </div>
      <div class="movie-card-body">
        <h3>${escapeHtml(movie.title)}</h3>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="movie-meta">
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.type)}</span>
        </div>
      </div>
    </a>
  `;
}

function initSearchPage() {
  const results = document.querySelector('[data-search-results]');
  const summary = document.querySelector('[data-search-summary]');
  const movies = window.SEARCH_MOVIES || [];
  if (!results || !summary || !movies.length) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const query = normalize(params.get('q'));
  document.querySelectorAll('input[name="q"]').forEach((input) => {
    input.value = params.get('q') || '';
  });
  const matched = query
    ? movies.filter((movie) => {
        const haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(' '));
        return haystack.includes(query);
      })
    : movies.slice(0, 60);
  summary.textContent = query
    ? `搜索“${params.get('q')}”共找到 ${matched.length} 部影片`
    : '可直接搜索片名、年份、地区、类型或标签；下方先展示部分热门影片。';
  results.innerHTML = matched.slice(0, 240).map(renderSearchCard).join('');
}

ready(() => {
  initMobileMenu();
  initHero();
  initFilters();
  initPlayers();
  initSearchPage();
});
