(function () {
  'use strict';

  // Completeaza cu endpointul oficial al organizatiei. Acesta trebuie sa
  // accepte POST JSON {type, data} si sa raspunda cu un status HTTP 2xx doar
  // dupa ce solicitarea a fost preluata in siguranta.
  window.GREENTECH_CHARITY_CONFIG = Object.assign({
    formEndpoint: ''
  }, window.GREENTECH_CHARITY_CONFIG || {});
})();
