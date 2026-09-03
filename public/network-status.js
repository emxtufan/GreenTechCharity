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
  var dismissed = false;
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
      '.gc-network-notice{position:fixed;z-index:2147483000;left:max(14px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:11px;box-sizing:border-box;width:min(430px,calc(100vw - 28px));padding:12px 12px 12px 14px;border:1px solid rgba(247,244,232,.22);border-radius:15px;color:#f7f4e8;background:rgba(20,54,35,.96);box-shadow:0 14px 45px rgba(8,32,20,.2);font-family:Helvetica,"Helvetica Neue",Arial,sans-serif;font-size:13px;line-height:1.4;letter-spacing:.005em;opacity:0;visibility:hidden;transform:translate3d(0,9px,0);transition:opacity .24s linear,transform .38s cubic-bezier(.22,1,.36,1),visibility 0s linear .38s;pointer-events:none;-webkit-font-smoothing:antialiased}',
      '.gc-network-notice.is-visible{opacity:1;visibility:visible;transform:none;transition-delay:0s;pointer-events:auto}',
      '.gc-network-notice__signal{width:9px;height:9px;border-radius:50%;background:#c5ec4d;box-shadow:0 0 0 5px rgba(197,236,77,.13)}',
      '.gc-network-notice[data-state="offline"] .gc-network-notice__signal{background:#f0a24a;box-shadow:0 0 0 5px rgba(240,162,74,.14)}',
      '.gc-network-notice__message{margin:0}',
      '.gc-network-notice__message strong{display:block;margin-bottom:1px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}',
      '.gc-network-notice__close{position:relative;display:grid;place-items:center;width:31px;height:31px;margin:0;padding:0;border:1px solid rgba(247,244,232,.3);border-radius:50%;color:inherit;background:transparent;font:inherit;cursor:pointer}',
      '.gc-network-notice__close:before,.gc-network-notice__close:after{content:"";position:absolute;width:11px;height:1px;background:currentColor}',
      '.gc-network-notice__close:before{transform:rotate(45deg)}.gc-network-notice__close:after{transform:rotate(-45deg)}',
      '.gc-network-notice__close:focus-visible{outline:2px solid #c5ec4d;outline-offset:2px}',
      '@media(max-width:700px){.gc-network-notice{left:12px;right:12px;bottom:auto;top:max(104px,calc(env(safe-area-inset-top) + 88px));width:auto;padding:11px 10px 11px 13px;border-radius:13px;font-size:12px}}',
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
      '<span class="gc-network-notice__signal" aria-hidden="true"></span>' +
      '<p class="gc-network-notice__message"></p>' +
      '<button class="gc-network-notice__close" type="button" aria-label="Inchide mesajul"></button>';
    message = notice.querySelector('.gc-network-notice__message');
    notice.querySelector('.gc-network-notice__close').addEventListener('click', function () {
      dismissed = true;
      notice.classList.remove('is-visible');
    });
    document.body.appendChild(notice);
    return notice;
  }

  function copyFor(state) {
    if (state === 'offline') {
      return '<strong>Conexiune intrerupta</strong>Pastreaza pagina deschisa. Continutul deja incarcat ramane disponibil.';
    }
    if (pageKind === 'brandbook') {
      if (state === 'delayed') {
        return '<strong>Incarcare prelungita</strong>Pregatim textele, ilustratiile si animatiile. Pastreaza pagina deschisa.';
      }
      return '<strong>Conexiune lenta</strong>Pregatim textele, ilustratiile si animatiile. Aceasta sectiune poate avea nevoie de mai mult timp.';
    }
    if (state === 'delayed') {
      return '<strong>Incarcare prelungita</strong>Experienta 3D are nevoie de mai mult timp pe acest dispozitiv. Pastreaza pagina deschisa.';
    }
    return '<strong>Conexiune lenta</strong>Experienta 3D poate avea nevoie de mai mult timp, iar unele efecte vizuale pot rula in mod redus.';
  }

  function show(state) {
    window.clearTimeout(recoveryTimer);
    currentState = state;
    if (dismissed && state !== 'offline') return;
    var element = ensureNotice();
    element.dataset.state = state;
    message.innerHTML = copyFor(state);
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
    dismissed = false;
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
