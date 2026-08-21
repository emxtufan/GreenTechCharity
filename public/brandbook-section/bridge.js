(function () {
  const parentWindow = window.parent;
  // Land straight on the 1/7 frame: road and characters already placed, no
  // logo intro to sit through.
  const ENTRY_Z = 400;
  const RETURN_TARGET_Z = 430;
  const RETURN_SETTLED_Z = 440;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchExitSent = false;
  let activeRequested = false;
  let interactionActive = false;
  let detailReady = false;
  let preparing = false;
  let outroTouchHandled = false;
  let outroStepLocked = false;

  function post(type, payload) {
    if (parentWindow !== window) {
      parentWindow.postMessage(
        Object.assign({source: 'greentech-brandbook', type}, payload || {}),
        window.location.origin,
      );
    }
  }

  function getParts() {
    const runtime = window._glMain;
    return {
      runtime,
      scene: runtime?._sceneMng,
      stage: runtime?._world?._stage0,
      world: runtime?._world,
    };
  }

  function setPaused(paused) {
    const runtime = window._glMain;
    if (runtime) runtime.isFrameLock = paused;
  }

  function getRingMetrics() {
    const {stage, world} = getParts();
    const mesh = stage?._logo?._logoO;
    const camera = world?._cam;
    if (!mesh || !camera || !window.THREE) return null;

    world._scene.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    mesh.updateWorldMatrix(true, false);

    const center = mesh.localToWorld(new THREE.Vector3(0, 0, 0)).project(camera);
    const edge = mesh.localToWorld(new THREE.Vector3(49.04, 0, 0)).project(camera);
    return {
      x: (center.x + 1) * 0.5,
      y: (1 - center.y) * 0.5,
      radius: Math.abs(edge.x - center.x) * world._width * 0.5,
    };
  }

  function postEntryAnchor(type) {
    const ring = getRingMetrics();
    if (ring) post(type || 'entry-anchor', {ring});
  }

  function enforceEntryFloor() {
    const {scene, stage} = getParts();
    if (detailReady && scene?._trgStage === 0 && stage) {
      if (stage._scrollZ.value < ENTRY_Z) stage._scrollZ.value = ENTRY_Z;
      if (stage._z < ENTRY_Z) stage._z = ENTRY_Z;
    }
    window.requestAnimationFrame(enforceEntryFloor);
  }

  function placeLogoAtEntry(logo) {
    // enterFrame eases the group toward (-oX, -oY) * (_z / 400); park it on the
    // value that matches ENTRY_Z so nothing slides on the first frame.
    const zoom = Math.min(Math.max(ENTRY_Z / 400, 0), 1);
    logo._group.position.set(-logo._oX * zoom, -logo._oY * zoom, ENTRY_Z);
  }

  // Pin the logo in its far state so ENTRY_Z lands on the 1/7 composition with
  // nothing left to play in.
  function settleLogoAtEntry() {
    const {stage} = getParts();
    const logo = stage?._logo;
    if (!logo) return;

    logo.isNear = true;
    logo.isNearRoad = true;
    logo.isNearBtn = false;
    logo.isInfoNear = false;
    logo.enterFrame();
  }

  function finalizeEntry() {
    const {runtime, scene, stage} = getParts();
    if (!runtime || !scene || !stage) return;

    gsap.killTweensOf(stage._scrollZ);
    stage._scrollZ.value = ENTRY_Z;
    stage._z = ENTRY_Z;
    stage.isFirstScroll = true;
    stage.isScrollFix = true;
    stage.isShowFix = true;
    runtime._scroll.setScrollTrg(stage);
    placeLogoAtEntry(stage._logo);
    settleLogoAtEntry();
    detailReady = true;
    setPaused(!activeRequested);
    postEntryAnchor('stage0-detail-ready');
  }

  function prepareEntry() {
    if (preparing || detailReady) return;
    const {runtime, scene, stage} = getParts();
    if (
      !runtime ||
      !scene ||
      !stage ||
      !stage._root?.visible ||
      runtime._scroll?._target !== stage
    ) {
      window.requestAnimationFrame(prepareEntry);
      return;
    }

    preparing = true;
    scene._trgStage = 0;
    scene._oldStage = 0;
    gsap.killTweensOf(stage._scrollZ);
    stage.isFirstScroll = true;
    stage.isScrollFix = false;
    stage._scrollZ.value = ENTRY_Z;
    stage._z = ENTRY_Z;

    placeLogoAtEntry(stage._logo);
    settleLogoAtEntry();

    window.setTimeout(finalizeEntry, 1250);
  }

  function isAtEntry() {
    const {scene, stage} = getParts();
    if (!detailReady || !interactionActive || !scene || !stage || scene._trgStage !== 0) {
      return false;
    }

    const target = Number(stage._scrollZ?.value ?? Number.POSITIVE_INFINITY);
    const settled = Number(stage._z ?? Number.POSITIVE_INFINITY);
    return target <= RETURN_TARGET_Z && settled <= RETURN_SETTLED_Z;
  }

  function requestReturn(event) {
    if (!isAtEntry()) return false;
    event?.preventDefault();
    event?.stopImmediatePropagation();
    interactionActive = false;
    post('return-to-house');
    return true;
  }

  function getOutro() {
    return document.getElementById('brandbook-outro');
  }

  function isOutroActive() {
    return getOutro()?.classList.contains('is-visible') ?? false;
  }

  // This is intentionally a separate scroll lane. The 3D journey must never
  // restart at the house after its final cover; upcoming editorial sections
  // simply opt in with data-outro-section and are traversed in either direction.
  function moveOutro(direction) {
    const outro = getOutro();
    if (!outro) return false;

    const sections = Array.from(outro.querySelectorAll('[data-outro-section]'));
    const oldIndex = Number(outro.dataset.outroIndex || 0);
    const nextIndex = Math.max(0, Math.min(sections.length - 1, oldIndex + direction));
    if (nextIndex === oldIndex) return false;

    outro.dataset.outroIndex = String(nextIndex);
    sections.forEach(function (section, index) {
      const active = index === nextIndex;
      section.classList.toggle('is-active', active);
      section.setAttribute('aria-hidden', String(!active));
    });
    window.dispatchEvent(new CustomEvent('brandbook-outro-change', {
      detail: {index: nextIndex, direction},
    }));
    return true;
  }

  // At the first footer panel, a backward gesture slides it away and restores
  // the already formed 7/7 globe. Nothing is restarted and nothing reaches
  // the house scene.
  function returnToFinalStage() {
    const outro = getOutro();
    const runtime = window._glMain;
    const stage = runtime?._world?._stage6;
    if (!outro) return false;

    outro.classList.remove('is-visible');
    outro.setAttribute('aria-hidden', 'true');

    if (!runtime || !stage) return true;

    // Keep every visual object exactly as it is. Only reconnect the existing
    // final scroll controller so a later backward gesture can reach step 7/7.
    stage._fin._fixScroll = 0;
    stage._fin.isFix = 2;
    runtime.removeEnterFrame(stage._fin);
    runtime.addEnterFrame(stage._fin, 'fixFrame');
    runtime._scroll.setScrollTrg(stage._fin);
    return true;
  }

  function consumeOutroScroll(event, direction) {
    if (!isOutroActive()) return false;
    event?.preventDefault();
    event?.stopImmediatePropagation();

    if (!outroStepLocked) {
      outroStepLocked = true;
      if (direction < 0) {
        if (!moveOutro(direction)) returnToFinalStage();
      } else {
        moveOutro(direction);
      }
      window.setTimeout(function () {
        outroStepLocked = false;
      }, 280);
    }
    return true;
  }

  document.addEventListener('wheel', function (event) {
    if (Math.abs(event.deltaY) > 2 && consumeOutroScroll(event, event.deltaY > 0 ? 1 : -1)) return;
    if (event.deltaY < -2) requestReturn(event);
  }, {capture: true, passive: false});

  document.addEventListener('touchstart', function (event) {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchExitSent = false;
    outroTouchHandled = false;
  }, {capture: true, passive: true});

  document.addEventListener('touchmove', function (event) {
    const touch = event.touches[0];
    if (!touch || touchExitSent || outroTouchHandled) return;

    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    if (Math.abs(dy) > 26 && Math.abs(dy) > Math.abs(dx) * 1.12 && consumeOutroScroll(event, dy < 0 ? 1 : -1)) {
      outroTouchHandled = true;
      return;
    }
    if (dy > 26 && Math.abs(dy) > Math.abs(dx) * 1.12 && requestReturn(event)) {
      touchExitSent = true;
    }
  }, {capture: true, passive: false});

  document.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ' || event.key === 'Spacebar') {
      if (consumeOutroScroll(event, 1)) return;
    }
    if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      if (consumeOutroScroll(event, -1)) return;
    }
    if (event.key === 'ArrowUp' || event.key === 'PageUp') requestReturn(event);
  }, {capture: true});

  window.addEventListener('message', function (event) {
    if (
      event.origin !== window.location.origin ||
      event.source !== parentWindow ||
      event.data?.source !== 'greentech-parent'
    ) {
      return;
    }

    switch (event.data.type) {
      case 'activate-entry':
        activeRequested = true;
        interactionActive = false;
        setPaused(false);
        if (detailReady) postEntryAnchor();
        break;
      case 'entry-active':
        activeRequested = true;
        interactionActive = true;
        setPaused(false);
        break;
      case 'entry-leaving':
        interactionActive = false;
        setPaused(false);
        break;
      case 'park-at-entry':
        activeRequested = false;
        interactionActive = false;
        finalizeEntry();
        setPaused(true);
        break;
    }
  });

  window.addEventListener('resize', function () {
    if (!detailReady) return;
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        postEntryAnchor();
      });
    });
  });

  window.addEventListener('DOMContentLoaded', function () {
    document.getElementById('brandbook-back-button')?.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (!requestReturn(event)) post('return-to-house');
    });
    prepareEntry();
    enforceEntryFloor();
  });
})();
