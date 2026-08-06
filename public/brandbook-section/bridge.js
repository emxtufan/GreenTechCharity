(function () {
  const parentWindow = window.parent;
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
    const edge = mesh.localToWorld(new THREE.Vector3(122, 0, 0)).project(camera);
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

    const logo = stage._logo;
    logo._group.position.set(-logo._oX, -logo._oY, ENTRY_Z);
    logo.isNear = true;
    logo.isNearRoad = true;
    logo.isNearBtn = false;
    logo.isInfoNear = false;
    logo.enterFrame();

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

  document.addEventListener('wheel', function (event) {
    if (event.deltaY < -2) requestReturn(event);
  }, {capture: true, passive: false});

  document.addEventListener('touchstart', function (event) {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchExitSent = false;
  }, {capture: true, passive: true});

  document.addEventListener('touchmove', function (event) {
    const touch = event.touches[0];
    if (!touch || touchExitSent) return;

    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    if (dy > 26 && Math.abs(dy) > Math.abs(dx) * 1.12 && requestReturn(event)) {
      touchExitSent = true;
    }
  }, {capture: true, passive: false});

  document.addEventListener('keydown', function (event) {
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
