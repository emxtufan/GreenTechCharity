(function () {
  'use strict';

  function installStableShaderRequests() {
    const prototype = window.XMLHttpRequest && window.XMLHttpRequest.prototype;
    if (!prototype || prototype.__greentechStableShaderRequests) return;

    const legacyOpen = prototype.open;
    prototype.open = function () {
      const args = Array.prototype.slice.call(arguments);
      if (
        typeof args[1] === 'string' &&
        /(?:^|\/)assets\/shader\/[^?]+\.js(?:\?|$)/.test(args[1])
      ) {
        args[1] = args[1].split('?')[0];
      }
      return legacyOpen.apply(this, args);
    };
    prototype.__greentechStableShaderRequests = true;
  }

  function installStageZeroAssetCleanup() {
    const partsPrototype = window.glPartsMng && window.glPartsMng.prototype;
    if (!partsPrototype || typeof partsPrototype.init !== 'function') return;

    const stageZeroPrimary = 'assets/image/stage0/s0_o.webp';
    const stageZeroSecondary = 'assets/image/stage0/s0_o_s.webp';
    const transparentPlaceholder = 'assets/image/stage0/transparent.png';
    const legacyInit = partsPrototype.init;
    const legacyLoadTextureEnd = partsPrototype.loadTextureEnd;

    partsPrototype.init = function () {
      legacyInit.apply(this, arguments);
      if (!Array.isArray(this._trgTex) || !Array.isArray(this._firstItem)) return;

      this._trgTex = this._trgTex.filter(function (path) {
        return path !== stageZeroSecondary && path !== transparentPlaceholder;
      });

      const textureItem = this._firstItem.find(function (item) {
        return item && item._type === 'texture';
      });
      if (textureItem) textureItem._list = this._trgTex;

      this._totalNum = this._firstItem.reduce(function (total, item) {
        return total + (Array.isArray(item && item._list) ? item._list.length : 0);
      }, 0);

      // The two legacy letter planes need an alpha-only map, not a downloaded
      // file. One transparent pixel keeps their material behaviour identical.
      const transparentPixel = new THREE.DataTexture(
        new Uint8Array([0, 0, 0, 0]),
        1,
        1,
        THREE.RGBAFormat
      );
      transparentPixel.minFilter = THREE.LinearFilter;
      transparentPixel.magFilter = THREE.LinearFilter;
      transparentPixel.needsUpdate = true;
      this._texMap[transparentPlaceholder] = transparentPixel;
    };

    partsPrototype.loadTextureEnd = function (texture, item, index) {
      const path = item && item._list && item._list[index];
      if (path === stageZeroPrimary) {
        // Both shader inputs intentionally point to the primary artwork, so
        // the first frame cannot flash the old secondary ring texture.
        this._texMap[stageZeroSecondary] = texture;
      }
      return legacyLoadTextureEnd.apply(this, arguments);
    };
  }

  function installImmediateStandaloneRoad() {
    const standalone =
      window.parent === window &&
      new URLSearchParams(window.location.search).get('entry') === 'standalone';
    const roadPrototype = window.gl0Road && window.gl0Road.prototype;
    if (!standalone || !roadPrototype || roadPrototype.__greentechImmediateEntry) return;

    const revealRoad = function (road) {
      [
        road && road._frontShader && road._frontShader.uniforms && road._frontShader.uniforms.alpha,
        road && road._backShader && road._backShader.uniforms && road._backShader.uniforms.alpha
      ].forEach(function (alpha) {
        if (!alpha) return;
        gsap.killTweensOf(alpha);
        alpha.value = 1;
      });

      [road && road._m1, road && road._m2, road && road._topM, road && road._handM]
        .forEach(function (material) {
          if (!material) return;
          gsap.killTweensOf(material);
          material.opacity = 1;
        });
    };

    ['start', 'startRE', 'show'].forEach(function (methodName) {
      const legacyMethod = roadPrototype[methodName];
      if (typeof legacyMethod !== 'function') return;

      roadPrototype[methodName] = function () {
        const result = legacyMethod.apply(this, arguments);
        revealRoad(this);
        return result;
      };
    });

    roadPrototype.__greentechImmediateEntry = true;
  }

  installStableShaderRequests();
  installStageZeroAssetCleanup();
  installImmediateStandaloneRoad();

  const ready = window.GreentechCharityContentReady || Promise.resolve();
  const legacyOnLoad = window.onload;

  window.onload = function (event) {
    ready.then(function () {
      if (typeof legacyOnLoad === 'function') legacyOnLoad.call(window, event);
    }).catch(function (error) {
      console.error('[GREENTECH Charity] Experienta nu a putut fi initializata.', error);
      if (typeof legacyOnLoad === 'function') legacyOnLoad.call(window, event);
    });
  };
})();
