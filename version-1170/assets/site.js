(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;

    var showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearSelect = document.querySelector('[data-year-select]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-scope .movie-card'));

  if (cards.length && (filterInput || yearSelect)) {
    var years = cards.map(function (card) {
      return card.getAttribute('data-year') || '';
    }).filter(Boolean).filter(function (year, i, arr) {
      return arr.indexOf(year) === i;
    }).sort(function (a, b) {
      return Number(b) - Number(a);
    });

    if (yearSelect) {
      years.forEach(function (year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && filterInput) {
      filterInput.value = q;
    }

    var applyFilter = function () {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesYear = !year || card.getAttribute('data-year') === year;
        card.classList.toggle('is-filtered-out', !(matchesKeyword && matchesYear));
      });
    };

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }

    applyFilter();
  }

  var player = document.getElementById('moviePlayer');

  if (player) {
    var playLayer = document.querySelector('.play-layer');
    var media = player.querySelector('source');
    var streamUrl = media ? media.getAttribute('src') : player.currentSrc;
    var prepared = false;

    var prepareVideo = function () {
      if (prepared || !streamUrl) {
        return;
      }

      if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(player);
      } else {
        player.src = streamUrl;
      }

      prepared = true;
    };

    var startVideo = function () {
      prepareVideo();
      if (playLayer) {
        playLayer.classList.add('is-hidden');
      }
      var promise = player.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    };

    if (playLayer) {
      playLayer.addEventListener('click', startVideo);
    }

    player.addEventListener('play', function () {
      if (playLayer) {
        playLayer.classList.add('is-hidden');
      }
    });
  }
}());
