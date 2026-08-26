(function () {
  'use strict';

  var IMAGE_ROOT = '../brandbook-section/assets/image/';

  var projects = {
    'camin-eficient': {
      index: 1,
      category: 'Locuire',
      title: 'Locuinta sigura',
      summary: 'Proiectam si construim un camin adaptat familiei, cu spatii sigure, confortabile si usor de intretinut.',
      description: 'Pornim de la situatia locativa a familiei si de la evaluarile tehnice ale amplasamentului. Arhitectii si specialistii transforma aceste date intr-un proiect realist, cu prioritati, buget, materiale si responsabilitati clare. Interventiile sunt confirmate tehnic inainte de executie si documentate pe parcurs.',
      tags: ['Siguranta', 'Confort', 'Durabilitate'],
      process: [
        'Verificam eligibilitatea si intelegem nevoile familiei.',
        'Evaluam amplasamentul sau constructia si stabilim riscurile.',
        'Definitivam proiectul, bugetul si calendarul de executie.',
        'Construim, verificam si predam locuinta cu documentatia necesara.'
      ],
      impact: [
        'Receptia tehnica finalizata si documentata.',
        'Spatii predate conform nevoilor validate impreuna cu familia.',
        'Instructiuni de utilizare si intretinere oferite la predare.'
      ],
      gallery: [
        {src: 'ring1.webp', alt: 'Casa sustenabila integrata intr-un peisaj verde', caption: 'Casa reuneste intr-un singur proiect siguranta, eficienta, spatiul verde si nevoile familiei.'},
        {src: 'stage6/earth.webp', alt: 'Peisaj sustenabil cu locuinte si energie regenerabila', caption: 'Performanta locuintei este gandita impreuna cu felul in care familia o va folosi.'},
        {src: 'ring211.webp', alt: 'Detaliu ilustrat cu o locuinta GREENTECH Charity', caption: 'Fiecare alegere este justificata prin nevoie, buget si durata de utilizare.'}
      ]
    },
    'energie-cu-sens': {
      index: 2,
      category: 'Energie',
      title: 'Energie pentru camin',
      summary: 'Integram eficienta energetica si surse regenerabile acolo unde analiza tehnica le confirma utilitatea.',
      description: 'Analizam anvelopa, orientarea, consumul estimat si echipamentele necesare. Alegem izolatia, tamplaria, sistemele si eventualele surse regenerabile dupa performanta, cost de exploatare, mentenanta si durata de viata, nu pentru efect vizual.',
      tags: ['Eficienta energetica', 'Surse regenerabile', 'Costuri controlate'],
      process: [
        'Estimam necesarul real de energie al casei.',
        'Identificam pierderile si prioritatile de eficientizare.',
        'Comparam solutiile dupa performanta, cost si mentenanta.',
        'Urmarim consumul dupa punerea in functiune si raportam rezultatele.'
      ],
      impact: [
        'Consumul urmarit si comparat cu estimarea proiectului.',
        'Echipamentele si lucrarile consemnate in documentatia tehnica.',
        'Familia instruita pentru folosirea si intretinerea sistemelor.'
      ],
      gallery: [
        {src: 'ring2.webp', alt: 'Peisaj cu panouri solare, turbine eoliene si locuinta', caption: 'Panourile solare si celelalte sisteme sunt integrate doar dupa validarea tehnica.'},
        {src: 'stage6/earth.webp', alt: 'Comunitate verde cu panouri solare si turbine eoliene', caption: 'Energia regenerabila completeaza eficienta cladirii; nu o inlocuieste.'},
        {src: 'stage2/rightBack.webp', alt: 'Element ilustrat despre sustenabilitate si energie', caption: 'Solutia potrivita este cea care ramane utila si usor de intretinut.'}
      ]
    },
    'spatii-vii': {
      index: 3,
      category: 'Spatiu verde',
      title: 'Curte pentru familie',
      summary: 'Amenajam curtea ca extensie a caminului: sigura, accesibila si usor de ingrijit.',
      description: 'Pornim de la varsta si rutina membrilor familiei, acces, drenaj, umbrire si siguranta. Delimitam circulatia, joaca si odihna, iar plantele sunt alese pentru contextul local si un necesar realist de intretinere.',
      tags: ['Joaca', 'Accesibilitate', 'Vegetatie'],
      process: [
        'Observam cum va fi folosit terenul si identificam zonele cu risc.',
        'Delimitam circulatia, joaca, odihna si suprafetele plantate.',
        'Alegem materiale si plante potrivite locului si intretinerii disponibile.',
        'Predam familiei un plan simplu de folosire si ingrijire.'
      ],
      impact: [
        'Zona de joaca separata de circulatia auto.',
        'Suprafete de acces si odihna realizate conform planului.',
        'Vegetatie inventariata si plan de ingrijire predat familiei.'
      ],
      gallery: [
        {src: 'stage6/earth.webp', alt: 'Peisaj sustenabil bogat in vegetatie', caption: 'Curtea continua viata casei si ofera loc pentru joaca, odihna si vegetatie.'},
        {src: 'ring1.webp', alt: 'Casa sustenabila inconjurata de natura', caption: 'Amenajarea echilibreaza utilizarea familiei cu intretinerea pe termen lung.'},
        {src: 'stage1/center_back.webp', alt: 'Peisaj ilustrat cu dealuri si vegetatie', caption: 'Vegetatia este aleasa in functie de teren, clima si resursele de ingrijire.'}
      ]
    },
    'reteaua-care-construieste': {
      index: 4,
      category: 'Comunitate',
      title: 'Comunitatea care construieste',
      summary: 'Aducem donatori, voluntari, specialisti si parteneri in jurul aceluiasi plan de constructie.',
      description: 'Un camin sustenabil are nevoie de competente, materiale, finantare si responsabilitati clare. GREENTECH Charity valideaza contributiile, coordoneaza rolurile si pastreaza familia implicata in deciziile care ii privesc viitoarea locuinta.',
      tags: ['Voluntariat', 'Parteneriate', 'Transparenta'],
      process: [
        'Publicam nevoile proiectului si competentele necesare.',
        'Verificam partenerii si potrivim fiecare contributie cu o etapa.',
        'Stabilim responsabilitati, termene si puncte de verificare.',
        'Documentam progresul, folosirea resurselor si rezultatul final.'
      ],
      impact: [
        'Fiecare contributie asociata unei etape si unui responsabil.',
        'Progresul si folosirea resurselor documentate pe parcurs.',
        'Rezultatele si lectiile proiectului publicate dupa finalizare.'
      ],
      gallery: [
        {src: 'ring3.webp', alt: 'Compozitie despre colaborare, arhitectura si sustenabilitate', caption: 'Un camin se construieste prin roluri clare si o directie comuna.'},
        {src: 'stage4/center1.webp', alt: 'Ilustratie despre oameni si constructie colectiva', caption: 'Voluntariatul completeaza lucrarile profesioniste, fara sa inlocuiasca expertiza necesara.'},
        {src: 'stage3/center.webp', alt: 'Ilustratie despre proiectare si realizare', caption: 'Proiectarea, executia si raportarea raman conectate de la inceput pana la predare.'}
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
    setText('[data-drawer-position]', 'Directia 0' + project.index + ' / 04');
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
    if (announcer) announcer.textContent = 'Ai deschis detaliile directiei ' + projects[slug].title + '.';
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

        result.textContent = visibleCount === 1 ? '1 directie' : visibleCount + ' directii';
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
