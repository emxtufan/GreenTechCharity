(function () {
  'use strict';

  var IMAGE_ROOT = '../brandbook-section/assets/image/';

  var projects = {
    'camin-eficient': {
      index: 1,
      category: 'Locuire',
      title: 'Camin eficient',
      summary: 'O directie de interventie pentru locuinte mai sigure, mai confortabile si mai usor de intretinut.',
      description: 'Inainte de orice interventie, ascultam familia si intelegem felul in care este folosita locuinta. Evaluarea tehnica, prioritatile umane si resursele disponibile sunt puse impreuna intr-un plan realist, care evita solutiile standard aplicate fara context.',
      tags: ['Confort', 'Siguranta', 'Eficienta'],
      process: [
        'Ascultam familia si definim impreuna nevoile prioritare.',
        'Evaluam locuinta si identificam interventiile potrivite contextului.',
        'Construim un plan clar de implementare, resurse si responsabilitati.',
        'Documentam rezultatul si lectiile utile pentru initiative viitoare.'
      ],
      impact: [
        'Un spatiu mai sigur si mai potrivit vietii de zi cu zi.',
        'Mai mult control asupra confortului si consumului locuintei.',
        'Solutii gandite pentru utilizare si intretinere pe termen lung.'
      ],
      gallery: [
        {src: 'ring1.webp', alt: 'Casa sustenabila integrata intr-un peisaj verde', caption: 'Locuirea privita ca un sistem: casa, energie, natura si comunitate.'},
        {src: 'stage6/earth.webp', alt: 'Peisaj sustenabil cu locuinte si energie regenerabila', caption: 'Interventii care urmaresc echilibrul dintre confort si resurse.'},
        {src: 'ring211.webp', alt: 'Detaliu ilustrat cu o locuinta Greentech Charity', caption: 'Fiecare decizie porneste de la nevoile reale ale familiei.'}
      ]
    },
    'energie-cu-sens': {
      index: 2,
      category: 'Energie',
      title: 'Energie cu sens',
      summary: 'Exploram solutii responsabile care pot sustine confortul unei familii si un consum mai atent.',
      description: 'Nu pornim de la tehnologie, ci de la situatia concreta a locuintei. Analizam consumul, comportamentul cladirii si optiunile relevante, apoi propunem doar masurile care pot fi intelese, folosite si intretinute responsabil.',
      tags: ['Consum responsabil', 'Energie curata', 'Claritate'],
      process: [
        'Intelegem consumul si punctele in care locuinta pierde resurse.',
        'Comparam solutii potrivite cladirii, familiei si contextului local.',
        'Prioritizam interventiile cu utilitate clara si intretinere realista.',
        'Explicam utilizarea si urmarim felul in care solutia functioneaza.'
      ],
      impact: [
        'Un consum mai usor de inteles si de gestionat.',
        'Mai putina presiune generata de pierderile inutile de energie.',
        'Alegeri tehnice legate direct de confortul familiei.'
      ],
      gallery: [
        {src: 'ring2.webp', alt: 'Peisaj cu panouri solare, turbine eoliene si locuinta', caption: 'Energia regenerabila integrata intr-o imagine completa a locuirii.'},
        {src: 'stage6/earth.webp', alt: 'Comunitate verde cu panouri solare si turbine eoliene', caption: 'Solutiile energetice au sens atunci cand servesc oamenii.'},
        {src: 'stage2/rightBack.webp', alt: 'Element ilustrat despre sustenabilitate si energie', caption: 'Fiecare tehnologie este evaluata in raport cu nevoia concreta.'}
      ]
    },
    'spatii-vii': {
      index: 3,
      category: 'Natura',
      title: 'Spatii vii',
      summary: 'Regandim spatiul din jurul casei ca loc de siguranta, joaca, odihna si apropiere de natura.',
      description: 'Un camin nu se termina la usa. Analizam modul in care curtea sau spatiul comun poate deveni mai sigur, mai accesibil si mai viu, fara amenajari fragile sau greu de intretinut. Vegetatia si zonele de folosire sunt alese in functie de oameni si loc.',
      tags: ['Spatiu verde', 'Stare de bine', 'Biodiversitate'],
      process: [
        'Observam cum este folosit spatiul si unde apar bariere sau riscuri.',
        'Definim zone pentru joaca, odihna, circulatie si vegetatie.',
        'Alegem solutii rezistente, accesibile si usor de ingrijit.',
        'Implicam comunitatea in folosirea si pastrarea spatiului.'
      ],
      impact: [
        'Mai mult loc sigur pentru timp petrecut afara.',
        'O relatie mai fireasca intre casa, oameni si natura.',
        'Spatii care incurajeaza apropierea si responsabilitatea comuna.'
      ],
      gallery: [
        {src: 'stage6/earth.webp', alt: 'Peisaj sustenabil bogat in vegetatie', caption: 'Natura devine parte din experienta cotidiana a locuirii.'},
        {src: 'ring1.webp', alt: 'Casa sustenabila inconjurata de natura', caption: 'Spatii gandite pentru oameni, vegetatie si utilizare indelungata.'},
        {src: 'stage1/center_back.webp', alt: 'Peisaj ilustrat cu dealuri si vegetatie', caption: 'Un exterior bine gandit poate sustine starea de bine.'}
      ]
    },
    'reteaua-care-construieste': {
      index: 4,
      category: 'Comunitate',
      title: 'Reteaua care construieste',
      summary: 'Aducem impreuna familii, voluntari, specialisti si parteneri in jurul unui proces bine coordonat.',
      description: 'Impactul durabil are nevoie de roluri clare si incredere. Pentru fiecare initiativa definim ce expertiza este necesara, cum poate contribui fiecare partener si cum pastram familia implicata in deciziile care ii privesc locuinta.',
      tags: ['Voluntariat', 'Parteneriate', 'Transparenta'],
      process: [
        'Definim nevoia si competentele necesare pentru interventie.',
        'Conectam organizatii, specialisti si voluntari potriviti.',
        'Stabilim responsabilitati clare si un mod comun de lucru.',
        'Comunicam progresul si pastram deschis dialogul cu familia.'
      ],
      impact: [
        'Resurse si competente folosite acolo unde sunt cu adevarat utile.',
        'Un proces mai coerent pentru familie si pentru cei implicati.',
        'Relatii de colaborare care pot sustine initiative viitoare.'
      ],
      gallery: [
        {src: 'ring3.webp', alt: 'Compozitie despre colaborare, arhitectura si sustenabilitate', caption: 'O retea de oameni si competente orientata spre acelasi scop.'},
        {src: 'stage4/center1.webp', alt: 'Ilustratie despre oameni si constructie colectiva', caption: 'Colaborarea functioneaza cand fiecare rol este clar.'},
        {src: 'stage3/center.webp', alt: 'Ilustratie despre proiectare si realizare', caption: 'Expertiza devine impact printr-un proces bine coordonat.'}
      ]
    }
  };

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
      button.setAttribute('aria-label', 'Afiseaza imaginea ' + (index + 1) + ' pentru ' + project.title);
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
    if (!project || !dialog) return false;

    activeSlug = slug;
    setText('[data-drawer-position]', 'Initiativa 0' + project.index + ' / 04');
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
    contactAction.href = actionUrl('contact', slug);
    contactAction.dataset.bbProject = slug;
    document.title = project.title + ' | Proiecte GREENTECH Charity';
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
    if (announcer) announcer.textContent = 'Ai deschis detaliile initiativei ' + projects[slug].title + '.';
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
    document.title = 'Proiecte | GREENTECH Charity';

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

        result.textContent = visibleCount === 1 ? '1 initiativa' : visibleCount + ' initiative';
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
})();
