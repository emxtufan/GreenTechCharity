(function () {
  'use strict';

  if (window.__GREENTECH_NETWORK_STATUS_INSTALLED__) return;
  window.__GREENTECH_NETWORK_STATUS_INSTALLED__ = true;

  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var pageKind = document.body && document.body.dataset.bbContentPage === 'brandbook'
    ? 'brandbook'
    : 'main';
  var startedAt = performance.now();
  var lastProgressAt = startedAt;
  var inferredSlow = false;
  var inferredDelay = false;
  var currentState = '';
  var recoveryTimer = 0;
  var stallTimer = 0;
  var notice;
  var message;

  function readNetworkHint() {
    if (!connection) return {definite: false, possible: false};
    var effectiveType = String(connection.effectiveType || '').toLowerCase();
    var downlink = Number(connection.downlink);
    var rtt = Number(connection.rtt);
    var definite = Boolean(
      connection.saveData ||
      effectiveType === 'slow-2g' ||
      effectiveType === '2g'
    );
    var possible = Boolean(
      effectiveType === '3g' ||
      (Number.isFinite(downlink) && downlink > 0 && downlink <= 1.5) ||
      (Number.isFinite(rtt) && rtt >= 300)
    );
    return {definite: definite, possible: possible};
  }

  function ensureNotice() {
    if (notice && notice.isConnected) return notice;

    var style = document.createElement('style');
    style.textContent = [
      '.gc-network-notice{position:fixed;z-index:2147483000;left:max(14px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));display:flex;align-items:center;gap:9px;box-sizing:border-box;width:max-content;max-width:calc(100vw - 28px);padding:9px 14px 9px 10px;border:1px solid rgba(247,244,232,.22);border-radius:999px;color:#f7f4e8;background:rgba(20,54,35,.96);box-shadow:0 10px 32px rgba(8,32,20,.18);font-family:Helvetica,"Helvetica Neue",Arial,sans-serif;font-size:13px;font-weight:500;line-height:1.25;letter-spacing:.005em;opacity:0;visibility:hidden;transform:translate3d(0,7px,0);transition:opacity .24s linear,transform .38s cubic-bezier(.22,1,.36,1),visibility 0s linear .38s;pointer-events:none;-webkit-font-smoothing:antialiased}',
      '.gc-network-notice.is-visible{opacity:1;visibility:visible;transform:none;transition-delay:0s;pointer-events:auto}',
      '.gc-network-notice__icon{display:block;flex:0 0 auto;width:25px;height:25px;object-fit:contain;filter:invert(1);opacity:.92}',
      '.gc-network-notice__message{margin:0;white-space:nowrap}',
      '@media(max-width:700px){.gc-network-notice{left:12px;bottom:auto;top:max(96px,calc(env(safe-area-inset-top) + 80px));max-width:calc(100vw - 24px);padding:8px 13px 8px 9px;font-size:12px}.gc-network-notice__icon{width:23px;height:23px}.gc-network-notice__message{white-space:normal}}',
      'body[data-bb-content-page="brandbook"] .gc-network-notice{top:max(14px,env(safe-area-inset-top));bottom:auto}',
      '@media(prefers-reduced-motion:reduce){.gc-network-notice{transition:opacity .15s linear,visibility 0s linear .15s;transform:none}.gc-network-notice.is-visible{transition-delay:0s}}'
    ].join('');
    document.head.appendChild(style);

    notice = document.createElement('aside');
    notice.className = 'gc-network-notice';
    notice.setAttribute('role', 'status');
    notice.setAttribute('aria-live', 'polite');
    notice.setAttribute('aria-atomic', 'true');
    notice.innerHTML =
      '<img class="gc-network-notice__icon" src="/no-wifi.png" alt="" aria-hidden="true">' +
      '<p class="gc-network-notice__message"></p>';
    message = notice.querySelector('.gc-network-notice__message');
    document.body.appendChild(notice);
    return notice;
  }

  function copyFor(state) {
    if (state === 'offline') {
      return 'Fara conexiune la internet';
    }
    if (state === 'delayed') return 'Incarcarea dureaza mai mult';
    return 'Conexiune slaba la internet';
  }

  function show(state) {
    window.clearTimeout(recoveryTimer);
    currentState = state;
    var element = ensureNotice();
    element.dataset.state = state;
    message.textContent = copyFor(state);
    element.classList.add('is-visible');
  }

  function hideSoon() {
    window.clearTimeout(recoveryTimer);
    recoveryTimer = window.setTimeout(function () {
      currentState = '';
      notice && notice.classList.remove('is-visible');
    }, 3500);
  }

  function evaluateConnection() {
    if (!navigator.onLine) {
      show('offline');
      return;
    }
    var hint = readNetworkHint();
    if (hint.definite || hint.possible || inferredSlow) {
      show('slow');
      return;
    }
    if (inferredDelay) {
      show('delayed');
      return;
    }
    if (currentState) hideSoon();
  }

  function markProgress() {
    lastProgressAt = performance.now();
  }

  function markReady() {
    inferredSlow = false;
    inferredDelay = false;
    markProgress();
    evaluateConnection();
  }

  function armStallCheck() {
    window.clearInterval(stallTimer);
    stallTimer = window.setInterval(function () {
      var now = performance.now();
      var waitingForMain = pageKind === 'main' && !window.__GREENTECH_STAGE_READY__;
      var waitingForBrandbook = pageKind === 'brandbook' &&
        document.documentElement.dataset.bbRuntimeReady !== 'true';
      var waiting = waitingForMain || waitingForBrandbook;
      var hint = readNetworkHint();
      var confirmedByDuration = hint.possible && now - startedAt >= 4500;
      var confirmedByStall = now - lastProgressAt >= 8000 && now - startedAt >= 8000;
      if (waiting && (confirmedByDuration || confirmedByStall)) {
        inferredSlow = confirmedByDuration;
        inferredDelay = !confirmedByDuration && confirmedByStall;
        evaluateConnection();
      }
    }, 2000);
  }

  window.addEventListener('offline', evaluateConnection);
  window.addEventListener('online', function () {
    inferredSlow = false;
    inferredDelay = false;
    markProgress();
    evaluateConnection();
  });
  if (connection && typeof connection.addEventListener === 'function') {
    connection.addEventListener('change', evaluateConnection);
  }

  [
    'greencube:stage-progress',
    'greentech:brandbook-warmup',
    'greentech-content-ready',
    'greentech:brandbook-deferred-progress'
  ].forEach(function (eventName) {
    window.addEventListener(eventName, markProgress);
  });
  ['greencube:stage-ready', 'greencube:stage-visible', 'greentech:brandbook-ready']
    .forEach(function (eventName) {
      window.addEventListener(eventName, markReady);
    });

  evaluateConnection();
  armStallCheck();
})();
