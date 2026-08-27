(function () {
  'use strict';

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
