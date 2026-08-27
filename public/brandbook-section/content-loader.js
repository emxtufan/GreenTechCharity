(function () {
  'use strict';

  const scriptUrl = document.currentScript?.src || window.location.href;
  const contentUrl = new URL('content.json', scriptUrl).href;
  const requestController = new AbortController();
  const requestTimeout = window.setTimeout(function () {
    requestController.abort();
  }, 4000);

  function readPath(source, path) {
    return String(path || '').split('.').reduce(function (value, key) {
      return value == null ? undefined : value[key];
    }, source);
  }

  function isRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function applyDirectText(element, value) {
    const textNode = Array.from(element.childNodes).find(function (node) {
      return node.nodeType === Node.TEXT_NODE && node.nodeValue.trim();
    });
    if (textNode) textNode.nodeValue = String(value);
    else {
      const inserted = document.createTextNode(String(value));
      if (element.dataset.bbContentDirectPosition === 'after-first' && element.firstChild) {
        element.firstChild.after(inserted);
      } else {
        element.insertBefore(inserted, element.firstChild);
      }
    }
  }

  function applyPrefixText(element, value) {
    const textNode = Array.from(element.childNodes).find(function (node) {
      return node.nodeType === Node.TEXT_NODE && node.nodeValue.trim();
    });
    if (textNode) textNode.nodeValue = String(value);
    else element.insertBefore(document.createTextNode(String(value)), element.firstChild);
  }

  function sanitiseRichHtml(value) {
    const allowed = new Set(['BR', 'STRONG', 'EM', 'SPAN']);
    const template = document.createElement('template');
    template.innerHTML = String(value);
    Array.from(template.content.querySelectorAll('*')).forEach(function (element) {
      if (!allowed.has(element.tagName)) {
        element.replaceWith(document.createTextNode(element.textContent || ''));
        return;
      }
      Array.from(element.attributes).forEach(function (attribute) {
        element.removeAttribute(attribute.name);
      });
    });
    return template.innerHTML;
  }

  function applyTrailingHtml(element, value) {
    const preserved = element.firstElementChild;
    let node = preserved ? preserved.nextSibling : element.firstChild;
    while (node) {
      const next = node.nextSibling;
      node.remove();
      node = next;
    }
    const template = document.createElement('template');
    template.innerHTML = sanitiseRichHtml(value);
    element.appendChild(template.content);
  }

  function applyContent(content) {
    if (!isRecord(content) || ![content.navigation, content.steps, content.footer, content.modals, content.runtime].every(isRecord)) {
      throw new Error('content-schema-invalid');
    }
    window.GREENTECH_CHARITY_CONTENT = content;

    const pageName = document.body?.dataset.bbContentPage;
    const pageCopy = pageName === 'brandbook' ? content.page : content[pageName]?.page;
    if (pageCopy) {
      if (pageCopy.title) document.title = pageCopy.title;
      const description = document.querySelector('meta[name="description"]');
      if (description && pageCopy.description) {
        description.setAttribute('content', pageCopy.description);
      }
    }

    document.querySelectorAll('[data-bb-content]').forEach(function (element) {
      const value = readPath(content, element.dataset.bbContent);
      if (value != null) element.textContent = String(value);
    });

    document.querySelectorAll('[data-bb-content-html]').forEach(function (element) {
      const value = readPath(content, element.dataset.bbContentHtml);
      if (value != null) element.innerHTML = sanitiseRichHtml(value);
    });

    document.querySelectorAll('[data-bb-content-direct]').forEach(function (element) {
      const value = readPath(content, element.dataset.bbContentDirect);
      if (value != null) applyDirectText(element, value);
    });

    document.querySelectorAll('[data-bb-content-prefix]').forEach(function (element) {
      const value = readPath(content, element.dataset.bbContentPrefix);
      if (value != null) applyPrefixText(element, value);
    });

    document.querySelectorAll('[data-bb-content-tail-html]').forEach(function (element) {
      const value = readPath(content, element.dataset.bbContentTailHtml);
      if (value != null) applyTrailingHtml(element, value);
    });

    document.querySelectorAll('[data-bb-content-meta]').forEach(function (element) {
      const value = readPath(content, element.dataset.bbContentMeta);
      if (value != null) element.setAttribute('content', String(value));
    });

    document.querySelectorAll('[data-bb-content-aria]').forEach(function (element) {
      const value = readPath(content, element.dataset.bbContentAria);
      if (value != null) element.setAttribute('aria-label', String(value));
    });

    document.querySelectorAll('[data-bb-content-alt]').forEach(function (element) {
      const value = readPath(content, element.dataset.bbContentAlt);
      if (value != null) element.setAttribute('alt', String(value));
    });

    document.documentElement.dataset.bbContentReady = 'true';
    window.dispatchEvent(new CustomEvent('greentech-content-ready', {detail: content}));
    return content;
  }

  window.GreentechCharityContentReady = fetch(contentUrl, {
    cache: 'no-store',
    signal: requestController.signal
  })
    .then(function (response) {
      if (!response.ok) throw new Error('content-http-' + response.status);
      return response.json();
    })
    .then(applyContent)
    .catch(function (error) {
      console.error('[GREENTECH Charity] content.json nu a putut fi incarcat.', error);
      window.GREENTECH_CHARITY_CONTENT = window.GREENTECH_CHARITY_CONTENT || {};
      document.documentElement.dataset.bbContentReady = 'fallback';
      return window.GREENTECH_CHARITY_CONTENT;
    })
    .finally(function () {
      window.clearTimeout(requestTimeout);
    });
})();
