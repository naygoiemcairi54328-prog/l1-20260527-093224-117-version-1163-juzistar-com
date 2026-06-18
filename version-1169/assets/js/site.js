(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
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
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    show(0);
    restart();
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().replace(/\s+/g, "");
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".search-panel"));
    panels.forEach(function (panel) {
      var input = panel.querySelector(".movie-search-input");
      var chips = Array.prototype.slice.call(panel.querySelectorAll(".filter-chip"));
      var scopeSelector = panel.getAttribute("data-scope") || "body";
      var scope = document.querySelector(scopeSelector) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector(".no-results");
      var active = "all";

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" "));
          var filterOk = active === "all" || haystack.indexOf(normalize(active)) !== -1;
          var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
          var ok = filterOk && keywordOk;
          card.classList.toggle("is-hidden-card", !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          active = chip.getAttribute("data-filter") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          apply();
        });
      });
      apply();
    });
  }

  function initHeroSearch() {
    var form = document.querySelector(".hero-search");
    if (!form) {
      return;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input");
      var query = input ? encodeURIComponent(input.value.trim()) : "";
      window.location.href = query ? "search.html?q=" + query : "search.html";
    });
  }

  function initQuerySearch() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (!query) {
      return;
    }
    var input = document.querySelector(".movie-search-input");
    if (input) {
      input.value = query;
      input.dispatchEvent(new Event("input"));
    }
  }

  function initBackTop() {
    var button = document.querySelector(".back-to-top");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initHeroSearch();
    initFilters();
    initQuerySearch();
    initBackTop();
  });
})();
