(function () {
  const parentWindow = window.parent;
  // Land straight on the 1/7 frame: road and characters already placed, no
  // logo intro to sit through.
  const ENTRY_Z = 400;
  const RETURN_TARGET_Z = 430;
  const RETURN_SETTLED_Z = 440;
  const FINAL_SYNTHESIS_SCROLL_SCALE = 3.25;
  const FINAL_GLOBE_TO_FOOTER_DELAY = 1000;
  const DIRECT_FOOTER = new URLSearchParams(window.location.search).get('entry') === 'footer';
  let touchStartX = 0;
  let touchStartY = 0;
  let touchExitSent = false;
  let activeRequested = false;
  let interactionActive = false;
  let detailReady = false;
  let preparing = false;
  let outroTouchHandled = false;
  let outroStepLocked = false;
  let outroWheelNeedsRelease = false;
  let outroWheelReleaseTimer = 0;
  let outroOpenGuardUntil = 0;
  let finalFooterTimer = 0;

  function armOutroWheelRelease() {
    outroWheelNeedsRelease = true;
    window.clearTimeout(outroWheelReleaseTimer);
    outroWheelReleaseTimer = window.setTimeout(function () {
      outroWheelNeedsRelease = false;
    }, 220);
  }

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

  // Step 7 originally needs roughly 300 scroll units before the synthesis copy
  // fades and the globe transition starts. Keep the original animation intact,
  // but compress only that forward-scroll interval on wheel and touch devices.
  function tuneFinalSynthesisScroll() {
    const runtime = window._glMain;
    const finalScene = runtime?._world?._stage6?._fin;
    const scroll = runtime?._scroll;

    if (!finalScene || !scroll || typeof finalScene.setWheel !== 'function' || typeof finalScene.fixFrame !== 'function') {
      window.requestAnimationFrame(tuneFinalSynthesisScroll);
      return;
    }
    if (finalScene.__greentechFastSynthesis) return;

    const originalSetWheel = finalScene.setWheel;
    const originalFixFrame = finalScene.fixFrame;

    finalScene.setWheel = function (delta) {
      const amount = Number(delta) || 0;
      const adjusted = this.isFix === 1 && amount > 0
        ? amount * FINAL_SYNTHESIS_SCROLL_SCALE
        : amount;
      return originalSetWheel.call(this, adjusted);
    };

    finalScene.fixFrame = function () {
      const previousMode = this.isFix;
      const originalThrow = scroll._throwDis;
      let result;
      if (this.isFix === 1 && originalThrow > 0) {
        scroll._throwDis = originalThrow * FINAL_SYNTHESIS_SCROLL_SCALE;
      }
      try {
        result = originalFixFrame.call(this);
      } finally {
        scroll._throwDis = originalThrow;
      }

      if (previousMode === 1 && this.isFix === 2) {
        window.clearTimeout(finalFooterTimer);
        finalFooterTimer = window.setTimeout(function () {
          if (finalScene.isFix !== 2 || isOutroActive()) return;

          // The original flow waits for another 70 scroll units here. Finish
          // that exact branch automatically so the globe flows into the footer.
          gsap.killTweensOf(finalScene._waitTimer);
          finalScene._fixScroll = 0;
          finalScene.isFix = 3;
          scroll.setScrollTrg(null);
          runtime.removeEnterFrame(finalScene);
          finalScene._parent.nextStage();
        }, FINAL_GLOBE_TO_FOOTER_DELAY);
      }

      return result;
    };

    finalScene.__greentechFastSynthesis = true;
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

  function isOutroModalOpen() {
    return document.getElementById('bb-footer-modal')?.open === true;
  }

  function focusActiveOutroSection() {
    if (!isOutroActive()) return;
    const section = getOutro()?.querySelector('[data-outro-section].is-active');
    if (!section) return;
    section.tabIndex = -1;
    section.focus({preventScroll: true});
  }

  function setOutroIndex(nextIndex, direction) {
    const outro = getOutro();
    if (!outro) return false;

    const sections = Array.from(outro.querySelectorAll('[data-outro-section]'));
    if (!sections.length) return false;

    const safeIndex = Math.max(0, Math.min(sections.length - 1, nextIndex));
    outro.dataset.outroIndex = String(safeIndex);
    outro.dataset.outroDirection = direction < 0 ? 'backward' : 'forward';

    sections.forEach(function (section, index) {
      const active = index === safeIndex;
      section.classList.toggle('is-active', active);
      section.classList.toggle('is-before', index < safeIndex);
      section.classList.toggle('is-after', index > safeIndex);
      section.setAttribute('aria-hidden', String(!active));
      section.inert = !active;
    });

    const current = outro.querySelector('[data-outro-current]');
    if (current) current.textContent = String(safeIndex + 1).padStart(2, '0');

    const hint = outro.querySelector('[data-outro-hint]');
    if (hint) hint.textContent = safeIndex === sections.length - 1 ? 'Deruleaza in sus' : 'Deruleaza in jos';

    outro.querySelectorAll('[data-outro-go]').forEach(function (button) {
      const active = Number(button.dataset.outroGo) === safeIndex;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });

    window.dispatchEvent(new CustomEvent('brandbook-outro-change', {
      detail: {index: safeIndex, direction},
    }));
    return true;
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
    return setOutroIndex(nextIndex, direction);
  }

  // At the first footer panel, a backward gesture slides it away and restores
  // the already formed 7/7 globe. Nothing is restarted and nothing reaches
  // the house scene.
  function returnToFinalStage() {
    // `/footer/` is an isolated preview route. Backward scroll stays inside
    // the footer instead of reconnecting the hidden 3D journey.
    if (DIRECT_FOOTER) return true;

    const outro = getOutro();
    const runtime = window._glMain;
    const stage = runtime?._world?._stage6;
    if (!outro) return false;

    outro.classList.remove('is-visible');
    outro.setAttribute('aria-hidden', 'true');
    outroWheelNeedsRelease = false;
    outroOpenGuardUntil = 0;
    window.clearTimeout(outroWheelReleaseTimer);

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
      }, 780);
    }
    return true;
  }

  // One physical wheel/trackpad gesture may emit many inertia events. Require
  // that gesture to finish before another card can be selected, otherwise the
  // same scroll that reveals card 01 can immediately skip to card 02.
  function consumeOutroWheel(event) {
    if (!isOutroActive() || Math.abs(event.deltaY) <= 2) return false;

    if (performance.now() < outroOpenGuardUntil || outroWheelNeedsRelease) {
      event.preventDefault();
      event.stopImmediatePropagation();
      armOutroWheelRelease();
      return true;
    }

    const consumed = consumeOutroScroll(event, event.deltaY > 0 ? 1 : -1);
    if (consumed) armOutroWheelRelease();
    return consumed;
  }

  document.addEventListener('wheel', function (event) {
    if (isOutroModalOpen()) return;
    if (consumeOutroWheel(event)) return;
    if (event.deltaY < -2) requestReturn(event);
  }, {capture: true, passive: false});

  document.addEventListener('touchstart', function (event) {
    if (isOutroModalOpen()) return;
    const touch = event.touches[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchExitSent = false;
    outroTouchHandled = false;
  }, {capture: true, passive: true});

  document.addEventListener('touchmove', function (event) {
    if (isOutroModalOpen()) return;
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
    if (isOutroModalOpen()) return;
    const tagName = event.target?.tagName;
    const interactiveTarget = tagName === 'A' || tagName === 'BUTTON' || tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
    if (interactiveTarget && (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Enter')) return;

    if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ' || event.key === 'Spacebar') {
      if (consumeOutroScroll(event, 1)) {
        window.requestAnimationFrame(focusActiveOutroSection);
        return;
      }
    }
    if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      if (consumeOutroScroll(event, -1)) {
        window.requestAnimationFrame(focusActiveOutroSection);
        return;
      }
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

    const outro = getOutro();
    outro?.querySelectorAll('[data-outro-go]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        const oldIndex = Number(outro.dataset.outroIndex || 0);
        const nextIndex = Number(button.dataset.outroGo || 0);
        if (nextIndex !== oldIndex) setOutroIndex(nextIndex, nextIndex < oldIndex ? -1 : 1);
      });
    });

    if (outro) {
      setOutroIndex(Number(outro.dataset.outroIndex || 0), 1);
      new MutationObserver(function (mutations) {
        if (mutations.some(function (mutation) { return mutation.attributeName === 'class'; }) && outro.classList.contains('is-visible')) {
          // Preserve card 01 long enough to be read and discard the inertia of
          // the gesture that opened the footer. Touch also waits for a new swipe.
          outroOpenGuardUntil = performance.now() + 900;
          outroTouchHandled = true;
          armOutroWheelRelease();
          setOutroIndex(Number(outro.dataset.outroIndex || 0), 1);
        }
      }).observe(outro, {attributes: true, attributeFilter: ['class']});

      if (DIRECT_FOOTER) {
        outro.dataset.outroIndex = '0';
        outro.classList.add('is-visible');
        outro.setAttribute('aria-hidden', 'false');
      }
    }

    if (DIRECT_FOOTER) return;

    prepareEntry();
    enforceEntryFloor();
    tuneFinalSynthesisScroll();
  });
})();
