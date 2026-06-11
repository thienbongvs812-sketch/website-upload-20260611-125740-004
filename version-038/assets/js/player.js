(function () {
  function startPlayer(panel) {
    var video = panel.querySelector("video");
    var button = panel.querySelector(".js-play-button");
    var status = panel.querySelector(".player-status");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !button) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text || "";
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          setStatus("请再次点击播放");
        });
      }
    }

    function loadVideo() {
      var url = video.getAttribute("data-video-url");
      if (!url) {
        return;
      }
      panel.classList.add("is-playing");
      video.setAttribute("controls", "controls");
      setStatus("");

      if (loaded) {
        playVideo();
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.load();
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
        } else {
          video.addEventListener("loadedmetadata", playVideo, { once: true });
        }
        if (window.Hls.Events && window.Hls.Events.ERROR) {
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("加载失败，请稍后重试");
            }
          });
        }
        return;
      }

      video.src = url;
      video.load();
      playVideo();
    }

    button.addEventListener("click", loadVideo);
    video.addEventListener("click", function () {
      if (!loaded) {
        loadVideo();
      }
    });
    video.addEventListener("error", function () {
      setStatus("加载失败，请稍后重试");
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll(".js-player-panel")).forEach(startPlayer);
})();
