(function () {
  'use strict';

  var IMAGE_ROOT = '../brandbook-section/assets/image/';

  var PROJECT_SCHEMAS = {
    'camin-eficient': {
      index: 1,
      gallery: [
        {copyKey: 'hero', src: 'ring1.webp'},
        {copyKey: 'context', src: 'stage6/earth.webp'},
        {copyKey: 'detail', src: 'ring211.webp'}
      ]
    },
    'energie-cu-sens': {
      index: 2,
      gallery: [
        {copyKey: 'hero', src: 'ring2.webp'},
        {copyKey: 'context', src: 'stage6/earth.webp'},
        {copyKey: 'detail', src: 'stage2/rightBack.webp'}
      ]
    },
    'spatii-vii': {
      index: 3,
      gallery: [
        {copyKey: 'hero', src: 'stage6/earth.webp'},
        {copyKey: 'context', src: 'ring1.webp'},
        {copyKey: 'detail', src: 'stage1/center_back.webp'}
      ]
    },
    'reteaua-care-construieste': {
      index: 4,
      gallery: [
        {copyKey: 'hero', src: 'ring3.webp'},
        {copyKey: 'context', src: 'stage4/center1.webp'},
        {copyKey: 'detail', src: 'stage3/center.webp'}
      ]
    }
  };

  function formatCopy(template, values) {
    return String(template || '').replace(/\{([a-z]+)\}/gi, function (match, key) {
      return Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match;
    });
  }

  function initialise() {
    var content = window.GREENTECH_CHARITY_CONTENT || {};
    var pageCopy = content.projects || {};
    var runtimeCopy = pageCopy.runtime || {};
    var itemCopy = pageCopy.items || {};
    var projects = {};

    Object.keys(PROJECT_SCHEMAS).forEach(function (slug) {
      var schema = PROJECT_SCHEMAS[slug];
      var copy = itemCopy[slug] || {};
      var galleryCopy = copy.gallery || {};
      projects[slug] = {
        index: schema.index,
        category: copy.category || '',
        title: copy.title || '',
        summary: copy.drawerSummary || '',
        description: copy.detailDescription || '',
        tags: Array.isArray(copy.tags) ? copy.tags : [],
        process: Array.isArray(copy.process) ? copy.process : [],
        impact: Array.isArray(copy.impact) ? copy.impact : [],
        gallery: schema.gallery.map(function (image) {
          var imageCopy = galleryCopy[image.copyKey] || {};
          return {src: image.src, alt: imageCopy.alt || '', caption: imageCopy.caption || ''};
        })
      };
    });
    var projectTotal = String(Object.keys(PROJECT_SCHEMAS).length).padStart(2, '0');

  var dialog = document.querySelector('[data-project-dialog]');
  var dialogScroll = dialog && dialog.querySelector('.project-drawer__scroll');
  var mainImage = dialog && dialog.querySelector('[data-drawer-image]');
  var galleryTimer = null;
  var lastFocusedElement = null;
  var activeSlug = null;

  function setText(selector, value) {
    var element = dialog.querySelector(selector);
    if (element) element.textContent = value;
  }

  function actionUrl(action, slug) {
    var url = new URL('/', window.location.origin);
    url.searchParams.set('action', action);
    if (slug) url.searchParams.set('project', slug);
    return url.pathname + url.search;
  }

  function renderList(container, values) {
    container.replaceChildren();
    values.forEach(function (value) {
      var item = document.createElement('li');
      item.textContent = value;
      container.appendChild(item);
    });
  }

  function selectGalleryImage(project, imageIndex, moveFocus) {
    var image = project.gallery[imageIndex];
    var buttons = Array.from(dialog.querySelectorAll('.gallery-button'));

    buttons.forEach(function (button, index) {
      button.setAttribute('aria-pressed', String(index === imageIndex));
    });

    if (galleryTimer) window.clearTimeout(galleryTimer);
    mainImage.classList.add('is-changing');

    galleryTimer = window.setTimeout(function () {
      mainImage.src = IMAGE_ROOT + image.src;
      mainImage.alt = image.alt;
      setText('[data-drawer-caption]', image.caption);
      mainImage.classList.remove('is-changing');
    }, 160);

    if (moveFocus && buttons[imageIndex]) buttons[imageIndex].focus();
  }

  function renderGallery(project) {
    var gallery = dialog.querySelector('[data-drawer-gallery]');
    gallery.replaceChildren();

    project.gallery.forEach(function (image, index) {
      var button = document.createElement('button');
      var thumbnail = document.createElement('img');

      button.type = 'button';
      button.className = 'gallery-button';
      button.setAttribute('aria-label', formatCopy(runtimeCopy.galleryButtonAria, {
        index: index + 1,
        title: project.title
      }));
      button.setAttribute('aria-pressed', String(index === 0));
      button.dataset.galleryIndex = String(index);

      thumbnail.src = IMAGE_ROOT + image.src;
      thumbnail.alt = '';
      thumbnail.width = 2400;
      thumbnail.height = 2400;
      thumbnail.loading = 'lazy';

      button.appendChild(thumbnail);
      button.addEventListener('click', function () {
        selectGalleryImage(project, index, false);
      });
      gallery.appendChild(button);
    });
  }

    function renderProject(slug) {
      var project = projects[slug];
      if (!project || !dialog) {
        var unavailableAnnouncer = document.querySelector('[data-project-announcer]');
        if (unavailableAnnouncer) unavailableAnnouncer.textContent = runtimeCopy.projectUnavailable || '';
        return false;
      }

      activeSlug = slug;
      setText('[data-drawer-position]', formatCopy(runtimeCopy.drawerPosition, {
        current: String(project.index).padStart(2, '0'),
        total: projectTotal
      }));
    setText('[data-drawer-category]', project.category);
    setText('[data-drawer-title]', project.title);
    setText('[data-drawer-summary]', project.summary);
    setText('[data-drawer-description]', project.description);
    setText('[data-drawer-caption]', project.gallery[0].caption);

    var tags = dialog.querySelector('[data-drawer-tags]');
    tags.replaceChildren();
    project.tags.forEach(function (tag) {
      var item = document.createElement('span');
      item.textContent = tag;
      tags.appendChild(item);
    });

    renderList(dialog.querySelector('[data-drawer-process]'), project.process);
    renderList(dialog.querySelector('[data-drawer-impact]'), project.impact);
    renderGallery(project);

    mainImage.classList.remove('is-changing');
    mainImage.src = IMAGE_ROOT + project.gallery[0].src;
    mainImage.alt = project.gallery[0].alt;

    var donateAction = dialog.querySelector('[data-drawer-donate]');
    var contactAction = dialog.querySelector('[data-drawer-contact]');
    donateAction.href = actionUrl('donate', slug);
    donateAction.dataset.bbProject = slug;
    contactAction.href = '/contact/';
      document.title = formatCopy(runtimeCopy.projectDocumentTitle, {title: project.title});
    return true;
  }

  function projectUrl(slug) {
    var url = new URL(window.location.href);
    url.searchParams.set('proiect', slug);
    url.hash = '';
    return url.pathname + url.search;
  }

  function openProject(slug, options) {
    options = options || {};
    if (!renderProject(slug)) return;

    if (options.updateHistory) {
      window.history.pushState({greentechProjectDrawer: true, project: slug}, '', projectUrl(slug));
    }

    if (!dialog.open) {
      lastFocusedElement = document.activeElement;
      dialog.showModal();
      document.body.classList.add('has-dialog');
    }

    if (dialogScroll) dialogScroll.scrollTop = 0;
    window.requestAnimationFrame(function () {
      var closeButton = dialog.querySelector('[data-close-dialog]');
      if (closeButton) closeButton.focus({preventScroll: true});
    });

    var announcer = document.querySelector('[data-project-announcer]');
      if (announcer) announcer.textContent = formatCopy(runtimeCopy.openedAnnouncement, {
        title: projects[slug].title
      });
  }

  function closeProject(options) {
    options = options || {};
    if (!dialog || !dialog.open) return;

    if (options.updateHistory) {
      var currentUrl = new URL(window.location.href);
      if (window.history.state && window.history.state.greentechProjectDrawer) {
        window.history.back();
        return;
      }
      currentUrl.searchParams.delete('proiect');
      window.history.replaceState(window.history.state, '', currentUrl.pathname + currentUrl.search + currentUrl.hash);
    }

    dialog.close();
    document.body.classList.remove('has-dialog');
    activeSlug = null;
      document.title = runtimeCopy.baseDocumentTitle || pageCopy.page?.title || '';

    if (lastFocusedElement && document.contains(lastFocusedElement)) {
      lastFocusedElement.focus({preventScroll: true});
    }
  }

  function syncDialogWithUrl() {
    var slug = new URL(window.location.href).searchParams.get('proiect');
    if (slug && projects[slug]) {
      if (!dialog.open || activeSlug !== slug) openProject(slug, {updateHistory: false});
    } else {
      closeProject({updateHistory: false});
    }
  }

  function trapFocus(event) {
    if (event.key !== 'Tab' || !dialog.open) return;

    var focusable = Array.from(dialog.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(function (element) {
      return element.offsetParent !== null;
    });

    if (!focusable.length) {
      event.preventDefault();
      return;
    }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function setupFilters() {
    var buttons = Array.from(document.querySelectorAll('[data-filter]'));
    var cards = Array.from(document.querySelectorAll('[data-project-card]'));
    var result = document.querySelector('[data-filter-result]');

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var filter = button.dataset.filter;
        var visibleCount = 0;

        buttons.forEach(function (item) {
          var active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });

        cards.forEach(function (card) {
          var visible = filter === 'toate' || card.dataset.category === filter;
          card.hidden = !visible;
          if (visible) visibleCount += 1;
        });

          var resultTemplates = runtimeCopy.filterResult || {};
          var template = visibleCount === 0 ? resultTemplates.none :
            visibleCount === 1 ? resultTemplates.one : resultTemplates.other;
          result.textContent = formatCopy(template, {count: visibleCount});
      });
    });
  }

  function setupHeader() {
    var header = document.querySelector('[data-site-header]');
    if (!header) return;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 18);
    }

    update();
    window.addEventListener('scroll', update, {passive: true});
  }

  document.addEventListener('click', function (event) {
    var openButton = event.target.closest('[data-open-project]');
    if (openButton) {
      openProject(openButton.dataset.openProject, {updateHistory: true});
      return;
    }

    if (event.target.closest('[data-close-dialog]')) {
      closeProject({updateHistory: true});
    }
  });

  if (dialog) {
    dialog.addEventListener('cancel', function (event) {
      event.preventDefault();
      closeProject({updateHistory: true});
    });

    dialog.addEventListener('click', function (event) {
      if (event.target !== dialog) return;
      var bounds = dialog.getBoundingClientRect();
      var clickedInside = event.clientX >= bounds.left && event.clientX <= bounds.right &&
        event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      if (!clickedInside) closeProject({updateHistory: true});
    });

    dialog.addEventListener('keydown', trapFocus);
  }

  window.addEventListener('popstate', syncDialogWithUrl);
  setupFilters();
  setupHeader();
  syncDialogWithUrl();

  }

  var ready = window.GreentechCharityContentReady;
  if (ready && typeof ready.then === 'function') ready.then(initialise, initialise);
  else initialise();
})();
