(function () {
  var video = document.getElementById('movie-player');
  var trigger = document.getElementById('play-trigger');
  if (!video || !trigger) {
    return;
  }
  var url = video.getAttribute('data-url');
  var started = false;
  var boot = function () {
    if (!url) {
      return;
    }
    if (!started) {
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }
    trigger.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    var play = video.play();
    if (play && typeof play.catch === 'function') {
      play.catch(function () {});
    }
  };
  trigger.addEventListener('click', boot);
  video.addEventListener('click', function () {
    if (!started) {
      boot();
    }
  });
})();
