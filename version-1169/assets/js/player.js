(function () {
  window.setupMoviePlayer = function (source) {
    var video = document.querySelector(".movie-video");
    var overlay = document.querySelector(".player-overlay");
    var button = document.querySelector(".player-start");
    var attached = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function playNow() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function attach(done) {
      if (attached) {
        done();
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", done, { once: true });
        video.load();
        window.setTimeout(done, 300);
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          done();
        });
        return;
      }
      video.src = source;
      video.addEventListener("loadedmetadata", done, { once: true });
      video.load();
      window.setTimeout(done, 300);
    }

    function start(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.controls = true;
      attach(playNow);
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
