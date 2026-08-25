(function () {
  'use strict';

  const modal = document.getElementById('bb-outro-modal');
  if (!modal) return;

  const modalTitle = modal.querySelector('[data-bb-modal-title]');
  const modalEyebrow = modal.querySelector('[data-bb-modal-eyebrow]');
  const modalContent = modal.querySelector('[data-bb-modal-content]');
  let opener = null;
  let closing = false;
  let fieldSequence = 0;
  let submissionEpoch = 0;
  let activeRequestController = null;

  function fieldIdentity(name) {
    fieldSequence += 1;
    const id = 'bb-field-' + name + '-' + fieldSequence;
    return {id: id, errorId: id + '-error'};
  }

  function inputField(name, label, type, attributes, full) {
    const identity = fieldIdentity(name);
    return '<label class="bb-form__field' + (full ? ' bb-form__field--full' : '') + '">' +
      '<span>' + label + '</span>' +
      '<input id="' + identity.id + '" type="' + type + '" name="' + name + '" aria-describedby="' + identity.errorId + '" ' + (attributes || '') + '>' +
      '<small id="' + identity.errorId + '" class="bb-form__error"></small>' +
    '</label>';
  }

  function selectField(name, label, options, attributes, full) {
    const identity = fieldIdentity(name);
    return '<label class="bb-form__field' + (full ? ' bb-form__field--full' : '') + '">' +
      '<span>' + label + '</span>' +
      '<select id="' + identity.id + '" name="' + name + '" aria-describedby="' + identity.errorId + '" ' + (attributes || '') + '>' + options + '</select>' +
      '<small id="' + identity.errorId + '" class="bb-form__error"></small>' +
    '</label>';
  }

  function textareaField(name, label, attributes) {
    const identity = fieldIdentity(name);
    return '<label class="bb-form__field bb-form__field--full">' +
      '<span>' + label + '</span>' +
      '<textarea id="' + identity.id + '" name="' + name + '" aria-describedby="' + identity.errorId + '" ' + (attributes || '') + '></textarea>' +
      '<small id="' + identity.errorId + '" class="bb-form__error"></small>' +
    '</label>';
  }

  function consentField(kind) {
    const identity = fieldIdentity('consent');
    const copy = kind === 'newsletter'
      ? 'Sunt de acord sa primesc prin e-mail noutati despre proiecte si oportunitati de implicare.'
      : 'Sunt de acord ca datele introduse sa fie folosite exclusiv pentru gestionarea acestei solicitari.';
    return '<div class="bb-form__consent bb-form__field--full">' +
      '<input id="' + identity.id + '" type="checkbox" name="consent" aria-describedby="' + identity.errorId + '" required>' +
      '<label for="' + identity.id + '">' + copy + '</label>' +
      '<a class="bb-form__privacy" href="/impressum/" target="_top">Informatii despre date</a>' +
      '<small id="' + identity.errorId + '" class="bb-form__error"></small>' +
    '</div>';
  }

  function formShell(kind, intro, fields, note) {
    return '<p id="bb-modal-description" class="bb-modal__lead">' + intro + '</p>' +
      (note || '') +
      '<form class="bb-form" data-bb-form="' + kind + '" novalidate>' +
        '<input type="hidden" name="form_type" value="' + kind + '">' +
        '<input type="hidden" name="started_at" value="' + Date.now() + '">' +
        '<label class="bb-form__trap" aria-hidden="true">Nu completa acest camp<input type="text" name="website" tabindex="-1" autocomplete="off"></label>' +
        '<div class="bb-form__grid">' + fields + consentField(kind) + '</div>' +
        '<div class="bb-form__submit-row">' +
          '<button class="bb-form__submit" type="submit"><span>Trimite solicitarea</span><i aria-hidden="true">&nearr;</i></button>' +
          '<p class="bb-form__status" role="status" aria-live="polite"></p>' +
        '</div>' +
      '</form>';
  }

  const MODALS = {
    donation: {
      eyebrow: 'Implicare / Donatie',
      title: 'Sustine un camin',
      render: function () {
        const options =
          '<option value="">Alege frecventa</option>' +
          '<option value="unica">Donatie unica</option>' +
          '<option value="lunara">Donatie lunara</option>' +
          '<option value="materiale">Donatie de materiale sau servicii</option>';
        const projects =
          '<option value="">Alege directia</option>' +
          '<option value="prioritar">Catre nevoia prioritara</option>' +
          '<option value="casa">Casa sustenabila</option>' +
          '<option value="energie">Energie curata</option>' +
          '<option value="spatiu-verde">Spatiu verde si sigur</option>';
        const fields =
          inputField('name', 'Nume complet *', 'text', 'required minlength="2" autocomplete="name"', false) +
          inputField('email', 'E-mail *', 'email', 'required autocomplete="email"', false) +
          inputField('phone', 'Telefon', 'tel', 'pattern="[0-9+() .-]{7,}" autocomplete="tel"', false) +
          selectField('frequency', 'Tipul contributiei *', options, 'required data-bb-donation-kind', false) +
          inputField('amount', 'Valoare estimata (RON) *', 'number', 'required min="10" step="10" inputmode="decimal" data-bb-donation-amount', false) +
          selectField('project', 'Directia sprijinului *', projects, 'required', false) +
          textareaField('message', 'Mesaj sau detalii', 'rows="3" maxlength="800" placeholder="Spune-ne daca vrei sa sustii o etapa sau o resursa anume."');
        return formShell(
          'donation',
          'Alege forma de sprijin potrivita. Nu solicitam date de card in acest formular; plata sau predarea resurselor se stabileste numai prin canalul oficial al organizatiei.',
          fields,
          '<div class="bb-modal__notice"><strong>Transparenta inainte de plata</strong><span>Vei primi detaliile proiectului, destinatia contributiei si pasii urmatori inainte de orice transfer.</span></div>'
        );
      }
    },
    volunteer: {
      eyebrow: 'Implicare / Voluntariat',
      title: 'Timpul tau poate construi',
      render: function () {
        const skills =
          '<option value="">Alege aria principala</option>' +
          '<option value="constructii">Constructii si amenajari</option>' +
          '<option value="arhitectura">Arhitectura si proiectare</option>' +
          '<option value="logistica">Logistica si organizare</option>' +
          '<option value="comunicare">Comunicare si continut</option>' +
          '<option value="sprijin-familie">Activitati pentru familie</option>' +
          '<option value="alta">Alta competenta</option>';
        const availability =
          '<option value="">Alege disponibilitatea</option>' +
          '<option value="ocazional">Ocazional</option>' +
          '<option value="weekend">In weekend</option>' +
          '<option value="saptamanal">Saptamanal</option>' +
          '<option value="proiect">Pe durata unui proiect</option>';
        const fields =
          inputField('name', 'Nume complet *', 'text', 'required minlength="2" autocomplete="name"', false) +
          inputField('email', 'E-mail *', 'email', 'required autocomplete="email"', false) +
          inputField('phone', 'Telefon *', 'tel', 'required pattern="[0-9+() .-]{7,}" autocomplete="tel"', false) +
          inputField('city', 'Localitate *', 'text', 'required minlength="2" autocomplete="address-level2"', false) +
          selectField('skills', 'Cum poti ajuta *', skills, 'required', false) +
          selectField('availability', 'Disponibilitate *', availability, 'required', false) +
          textareaField('message', 'Experienta si motivatia ta *', 'required rows="4" minlength="20" maxlength="1200" placeholder="Spune-ne pe scurt ce stii sa faci si cum ai vrea sa te implici."');
        return formShell(
          'volunteer',
          'Potrivim fiecare voluntar cu o etapa concreta, astfel incat timpul oferit sa produca un rezultat sigur si vizibil.',
          fields,
          '<div class="bb-modal__notice"><strong>Implicare responsabila</strong><span>Rolul, programul si regulile de siguranta sunt confirmate inaintea fiecarei activitati.</span></div>'
        );
      }
    },
    partner: {
      eyebrow: 'Implicare / Parteneriat',
      title: 'Construieste alaturi de noi',
      render: function () {
        const support =
          '<option value="">Alege forma de sprijin</option>' +
          '<option value="financiar">Finantare</option>' +
          '<option value="materiale">Materiale si echipamente</option>' +
          '<option value="servicii">Servicii profesionale</option>' +
          '<option value="voluntariat-corporate">Voluntariat corporate</option>' +
          '<option value="comunicare">Comunicare si vizibilitate</option>' +
          '<option value="mixt">Parteneriat mixt</option>';
        const fields =
          inputField('organization', 'Organizatie / Companie *', 'text', 'required minlength="2" autocomplete="organization"', false) +
          inputField('registration', 'CUI / Cod de inregistrare', 'text', 'maxlength="40"', false) +
          inputField('name', 'Persoana de contact *', 'text', 'required minlength="2" autocomplete="name"', false) +
          inputField('role', 'Rol in organizatie *', 'text', 'required minlength="2" autocomplete="organization-title"', false) +
          inputField('email', 'E-mail profesional *', 'email', 'required autocomplete="email"', false) +
          inputField('phone', 'Telefon *', 'tel', 'required pattern="[0-9+() .-]{7,}" autocomplete="tel"', false) +
          selectField('support', 'Tipul parteneriatului *', support, 'required', true) +
          textareaField('message', 'Propunerea ta *', 'required rows="4" minlength="30" maxlength="1500" placeholder="Descrie resursele, expertiza sau directia de colaborare propusa."');
        return formShell(
          'partner',
          'Parteneriatele reunesc resurse, expertiza si incredere. Pornim fiecare colaborare cu obiective, responsabilitati si rezultate clar definite.',
          fields,
          '<div class="bb-modal__notice"><strong>Parteneriat documentat</strong><span>Contributiile, etapele si raportarea impactului sunt stabilite transparent de la inceput.</span></div>'
        );
      }
    },
    contact: {
      eyebrow: 'Organizatie / Contact',
      title: 'Hai sa vorbim',
      render: function () {
        const subjects =
          '<option value="">Alege subiectul</option>' +
          '<option value="proiecte">Proiecte si beneficiari</option>' +
          '<option value="donatie">Donatii</option>' +
          '<option value="voluntariat">Voluntariat</option>' +
          '<option value="parteneriat">Parteneriate</option>' +
          '<option value="presa">Presa si comunicare</option>' +
          '<option value="altul">Alt subiect</option>';
        const fields =
          inputField('name', 'Nume complet *', 'text', 'required minlength="2" autocomplete="name"', false) +
          inputField('email', 'E-mail *', 'email', 'required autocomplete="email"', false) +
          inputField('phone', 'Telefon', 'tel', 'pattern="[0-9+() .-]{7,}" autocomplete="tel"', false) +
          selectField('subject', 'Subiect *', subjects, 'required', false) +
          textareaField('message', 'Mesaj *', 'required rows="5" minlength="20" maxlength="1500" placeholder="Scrie-ne cu ce te putem ajuta."');
        return formShell(
          'contact',
          'Trimite-ne intrebarea ta, iar aceasta va fi directionata catre echipa potrivita.',
          fields,
          ''
        );
      }
    },
    newsletter: {
      eyebrow: 'Comunitate / Newsletter',
      title: 'Urmareste progresul',
      render: function () {
        const interests =
          '<option value="">Alege ce vrei sa urmaresti</option>' +
          '<option value="toate">Toate proiectele</option>' +
          '<option value="santier">Etapele de santier</option>' +
          '<option value="impact">Impact si transparenta</option>' +
          '<option value="voluntariat">Oportunitati de voluntariat</option>' +
          '<option value="parteneriate">Parteneriate si resurse</option>';
        const fields =
          inputField('first_name', 'Prenume', 'text', 'minlength="2" autocomplete="given-name"', false) +
          inputField('email', 'E-mail *', 'email', 'required autocomplete="email"', false) +
          selectField('interest', 'Interes principal *', interests, 'required', true);
        return formShell(
          'newsletter',
          'Primeste actualizari relevante despre proiecte, etape de constructie, impact si moduri concrete de implicare.',
          fields,
          '<div class="bb-modal__notice"><strong>Fara zgomot inutil</strong><span>Doar actualizari despre proiecte si impact. Dezabonarea va fi disponibila in fiecare mesaj.</span></div>'
        );
      }
    },
    about: {
      eyebrow: 'Organizatie / Despre noi',
      title: 'Casa cu casa',
      render: function () {
        return '<p id="bb-modal-description" class="bb-modal__lead">GREENTECH Charity transforma sprijinul comunitatii in locuinte sustenabile pentru familii aflate in dificultate.</p>' +
          '<div class="bb-about__principles">' +
            '<article><span>01</span><h3>Oameni</h3><p>Pornim de la nevoile reale ale familiei si pastram demnitatea in centrul fiecarei decizii.</p></article>' +
            '<article><span>02</span><h3>Sustenabilitate</h3><p>Construim pentru siguranta, consum redus, intretinere simpla si o viata lunga a locuintei.</p></article>' +
            '<article><span>03</span><h3>Transparenta</h3><p>Facem vizibile etapele, resursele si rezultatul fiecarui proiect.</p></article>' +
          '</div>' +
          '<div class="bb-about__process">' +
            '<p><span>Ascultam</span> intelegem situatia familiei.</p>' +
            '<p><span>Proiectam</span> alegem solutia potrivita.</p>' +
            '<p><span>Construim</span> coordonam resursele si specialistii.</p>' +
            '<p><span>Raportam</span> aratam progresul si impactul.</p>' +
          '</div>' +
          '<div class="bb-modal__actions">' +
            '<a href="/proiecte/" target="_top">Vezi proiectele <span>&nearr;</span></a>' +
            '<a href="/impressum/" target="_top">Transparenta <span>&nearr;</span></a>' +
          '</div>';
      }
    },
    social: {
      eyebrow: 'Comunitate / Social media',
      title: 'Da misiunea mai departe',
      render: function () {
        return '<p id="bb-modal-description" class="bb-modal__lead">Distribuie proiectele GREENTECH Charity prin canalul pe care il folosesti. Nu afisam profiluri oficiale pana cand acestea nu sunt configurate si verificate.</p>' +
          '<div class="bb-share">' +
            '<button type="button" data-bb-share="native"><span>Distribuie</span><small>Aplicatiile de pe dispozitiv</small><i>&nearr;</i></button>' +
            '<button type="button" data-bb-share="linkedin"><span>LinkedIn</span><small>Distribuie profesional</small><i>&nearr;</i></button>' +
            '<button type="button" data-bb-share="facebook"><span>Facebook</span><small>Trimite comunitatii</small><i>&nearr;</i></button>' +
            '<button type="button" data-bb-share="whatsapp"><span>WhatsApp</span><small>Trimite unui contact</small><i>&nearr;</i></button>' +
            '<button type="button" data-bb-share="copy"><span>Copiaza linkul</span><small>Pastreaza sau trimite direct</small><i>&nearr;</i></button>' +
          '</div>' +
          '<p class="bb-share__status" role="status" aria-live="polite"></p>';
      }
    }
  };

  function isModalOpen() {
    return modal.open;
  }

  function applyProjectContext(trigger) {
    const slug = trigger?.dataset?.bbProject;
    const form = modalContent.querySelector('[data-bb-form]');
    if (!slug || !form) return;

    const labels = {
      'camin-eficient': 'Camin eficient',
      'energie-cu-sens': 'Energie cu sens',
      'spatii-vii': 'Spatii vii',
      'reteaua-care-construieste': 'Reteaua care construieste'
    };
    const label = labels[slug] || slug;
    const context = document.createElement('p');
    const hidden = document.createElement('input');

    context.className = 'bb-modal__context';
    context.textContent = 'Initiativa selectata: ' + label;
    modalContent.querySelector('.bb-modal__lead')?.insertAdjacentElement('afterend', context);

    hidden.type = 'hidden';
    hidden.name = 'project_context';
    hidden.value = slug;
    form.appendChild(hidden);

    if (form.dataset.bbForm === 'donation') {
      const projectDirections = {
        'camin-eficient': 'casa',
        'energie-cu-sens': 'energie',
        'spatii-vii': 'spatiu-verde',
        'reteaua-care-construieste': 'prioritar'
      };
      const projectSelect = form.elements.project;
      if (projectSelect && projectDirections[slug]) projectSelect.value = projectDirections[slug];
    }

    if (form.dataset.bbForm === 'contact' && form.elements.subject) {
      form.elements.subject.value = 'proiecte';
    }
  }

  function openModal(name, trigger) {
    const definition = MODALS[name];
    if (!definition || isModalOpen()) return;

    opener = trigger || document.activeElement;
    modal.dataset.modal = name;
    modalEyebrow.textContent = definition.eyebrow;
    modalTitle.textContent = definition.title;
    modalContent.innerHTML = definition.render();
    modalContent.scrollTop = 0;
    applyProjectContext(trigger);
    document.body.classList.add('bb-modal-open');
    modal.showModal();
    modal.querySelector('.bb-modal__close')?.focus({preventScroll: true});

    window.requestAnimationFrame(function () {
      modal.classList.add('is-open');
    });
  }

  function closeModal() {
    if (!isModalOpen() || closing) return;
    closing = true;
    submissionEpoch += 1;
    activeRequestController?.abort();
    activeRequestController = null;
    modal.classList.remove('is-open');
    modal.classList.add('is-closing');

    window.setTimeout(function () {
      modal.close();
      modal.classList.remove('is-closing');
      modalContent.innerHTML = '';
      document.body.classList.remove('bb-modal-open');
      closing = false;
      opener?.focus?.({preventScroll: true});
      opener = null;
    }, 320);
  }

  function getErrorContainer(field) {
    return field.closest('.bb-form__field, .bb-form__consent, .bb-form__options-group');
  }

  function validationMessage(field) {
    if (field.validity.valueMissing) {
      return field.type === 'checkbox' ? 'Confirma acordul pentru prelucrarea datelor.' : 'Completeaza acest camp.';
    }
    if (field.validity.typeMismatch) return 'Introdu o adresa de e-mail valida.';
    if (field.validity.tooShort) return 'Raspunsul este prea scurt.';
    if (field.validity.rangeUnderflow) return 'Introdu o valoare de cel putin ' + field.min + '.';
    if (field.validity.patternMismatch) return 'Verifica formatul introdus.';
    return 'Verifica valoarea introdusa.';
  }

  function clearFieldError(field) {
    const container = getErrorContainer(field);
    if (!container) return;
    container.classList.remove('has-error');
    const error = container.querySelector('.bb-form__error');
    if (error) error.textContent = '';
    field.removeAttribute('aria-invalid');
  }

  function showFieldError(field) {
    const container = getErrorContainer(field);
    if (!container) return;
    container.classList.add('has-error');
    const error = container.querySelector('.bb-form__error');
    if (error) error.textContent = validationMessage(field);
    field.setAttribute('aria-invalid', 'true');
  }

  function validateForm(form) {
    const fields = Array.from(form.querySelectorAll('input:not([type="hidden"]), select, textarea'));
    let firstInvalid = null;

    fields.forEach(function (field) {
      if (typeof field.value === 'string' && field.type !== 'checkbox' && field.type !== 'radio') {
        field.value = field.value.trim();
      }
      clearFieldError(field);
      if (!field.checkValidity()) {
        showFieldError(field);
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (firstInvalid) {
      const status = form.querySelector('.bb-form__status');
      status.textContent = 'Verifica toate campurile marcate.';
      status.classList.add('is-error');
      firstInvalid.focus({preventScroll: true});
      firstInvalid.scrollIntoView({behavior: 'smooth', block: 'center'});
      return false;
    }
    return true;
  }

  function serializeForm(form) {
    const values = {};
    new FormData(form).forEach(function (value, key) {
      if (key === 'website') return;
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        values[key] = Array.isArray(values[key]) ? values[key].concat(value) : [values[key], value];
      } else {
        values[key] = value;
      }
    });
    values.page = window.top === window ? window.location.href : document.referrer || window.location.href;
    values.submitted_at = new Date().toISOString();
    return values;
  }

  async function deliverForm(kind, payload) {
    const config = window.GREENTECH_CHARITY_CONFIG || {};
    const endpoint = String(config.formEndpoint || '').trim();
    if (!endpoint) {
      const error = new Error('missing-endpoint');
      error.code = 'MISSING_ENDPOINT';
      throw error;
    }

    const controller = new AbortController();
    activeRequestController?.abort();
    activeRequestController = controller;
    const timeout = window.setTimeout(function () { controller.abort(); }, 12000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        credentials: 'same-origin',
        signal: controller.signal,
        body: JSON.stringify({type: kind, data: payload})
      });
      if (!response.ok) throw new Error('request-failed-' + response.status);
      const result = await response.json().catch(function () { return {}; });
      return result;
    } finally {
      window.clearTimeout(timeout);
      if (activeRequestController === controller) activeRequestController = null;
    }
  }

  function showSuccess(kind, result) {
    const titles = {
      donation: 'Intentia ta de sprijin a fost trimisa.',
      volunteer: 'Inscrierea ta a fost trimisa.',
      partner: 'Propunerea de parteneriat a fost trimisa.',
      contact: 'Mesajul tau a fost trimis.',
      newsletter: 'Verifica e-mailul pentru confirmare.'
    };
    const reference = result?.id || result?.reference || '';
    modalContent.innerHTML =
      '<div id="bb-modal-description" class="bb-success" tabindex="-1">' +
        '<span class="bb-success__icon" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="m10 25 9 9 19-21"/></svg></span>' +
        '<p class="bb-success__kicker">Confirmare</p>' +
        '<h3>' + (titles[kind] || 'Solicitarea a fost trimisa.') + '</h3>' +
        '<p>Datele au fost preluate prin canalul securizat. Echipa GREENTECH Charity va continua procesul conform tipului solicitarii.</p>' +
        (reference ? '<small>Referinta: ' + String(reference).replace(/[<>&"]/g, '') + '</small>' : '') +
        '<div class="bb-modal__actions">' +
          '<button type="button" data-bb-modal-close>Inchide</button>' +
          '<a href="/proiecte/" target="_top">Vezi proiectele <span>&nearr;</span></a>' +
        '</div>' +
      '</div>';
    modalContent.querySelector('.bb-success')?.focus({preventScroll: true});
  }

  async function submitForm(form) {
    if (!validateForm(form)) return;
    if (form.elements.website?.value) return;

    const submit = form.querySelector('[type="submit"]');
    const status = form.querySelector('.bb-form__status');
    const kind = form.dataset.bbForm;
    const currentEpoch = ++submissionEpoch;
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    status.classList.remove('is-error');
    status.textContent = 'Se trimite in siguranta...';

    try {
      const result = await deliverForm(kind, serializeForm(form));
      if (currentEpoch !== submissionEpoch || !modal.open || !form.isConnected) return;
      showSuccess(kind, result);
    } catch (error) {
      if (currentEpoch !== submissionEpoch || !modal.open || !form.isConnected) return;
      status.classList.add('is-error');
      status.textContent = error?.code === 'MISSING_ENDPOINT'
        ? 'Canalul oficial de trimitere nu este configurat. Datele nu au fost trimise.'
        : 'Solicitarea nu a putut fi trimisa. Verifica conexiunea si incearca din nou.';
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
    }
  }

  function shareUrl() {
    return window.location.origin + '/proiecte/';
  }

  async function copyShareLink(status) {
    const value = shareUrl();
    let copied = false;
    try {
      await navigator.clipboard.writeText(value);
      copied = true;
    } catch {
      const temporary = document.createElement('textarea');
      temporary.value = value;
      temporary.setAttribute('readonly', '');
      temporary.style.position = 'fixed';
      temporary.style.opacity = '0';
      document.body.appendChild(temporary);
      temporary.select();
      copied = document.execCommand('copy');
      temporary.remove();
    }
    status.textContent = copied
      ? 'Linkul proiectelor a fost copiat.'
      : 'Copierea nu a fost permisa. Deschide proiectele si copiaza adresa din browser.';
  }

  async function handleShare(type) {
    const url = shareUrl();
    const text = 'Descopera proiectele GREENTECH Charity: locuinte sustenabile, construite cu transparenta.';
    const status = modalContent.querySelector('.bb-share__status');

    if (type === 'native' && navigator.share) {
      try {
        await navigator.share({title: 'GREENTECH Charity', text: text, url: url});
        status.textContent = 'Multumim ca duci misiunea mai departe.';
      } catch (error) {
        if (error?.name !== 'AbortError') await copyShareLink(status);
      }
      return;
    }
    if (type === 'copy' || type === 'native') {
      await copyShareLink(status);
      return;
    }

    const destinations = {
      linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url),
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url),
      whatsapp: 'https://wa.me/?text=' + encodeURIComponent(text + ' ' + url)
    };
    const destination = destinations[type];
    if (destination) {
      const popup = window.open(destination, '_blank', 'noopener,noreferrer,width=720,height=680');
      status.textContent = popup
        ? 'Fereastra de distribuire a fost deschisa.'
        : 'Browserul a blocat fereastra de distribuire. Permite ferestrele pop-up si incearca din nou.';
    }
  }

  function syncDonationAmount(form) {
    if (!form || form.dataset.bbForm !== 'donation') return;
    const kind = form.querySelector('[data-bb-donation-kind]');
    const amount = form.querySelector('[data-bb-donation-amount]');
    if (!kind || !amount) return;

    const materialsOnly = kind.value === 'materiale';
    amount.required = !materialsOnly;
    const label = amount.closest('.bb-form__field')?.querySelector(':scope > span');
    if (label) label.textContent = materialsOnly ? 'Valoare estimata (RON)' : 'Valoare estimata (RON) *';
    if (materialsOnly && !amount.value) clearFieldError(amount);
  }

  document.addEventListener('click', function (event) {
    const trigger = event.target.closest('[data-bb-modal-open]');
    if (trigger) {
      event.preventDefault();
      openModal(trigger.dataset.bbModalOpen, trigger);
      return;
    }

    if (event.target.closest('[data-bb-modal-close]')) {
      event.preventDefault();
      closeModal();
      return;
    }

    const share = event.target.closest('[data-bb-share]');
    if (share) {
      event.preventDefault();
      handleShare(share.dataset.bbShare);
    }
  });

  modal.addEventListener('cancel', function (event) {
    event.preventDefault();
    closeModal();
  });

  // Keep native scrolling inside the dialog. The legacy 3D runtime listens on
  // document for the same gestures and would otherwise consume desktop wheel
  // input before the form can scroll.
  modal.addEventListener('wheel', function (event) {
    event.stopPropagation();
  }, {passive: true});

  modal.addEventListener('touchmove', function (event) {
    event.stopPropagation();
  }, {passive: true});

  modal.addEventListener('submit', function (event) {
    const form = event.target.closest('[data-bb-form]');
    if (!form) return;
    event.preventDefault();
    submitForm(form);
  });

  modal.addEventListener('input', function (event) {
    const field = event.target.closest('input, select, textarea');
    if (!field) return;
    syncDonationAmount(field.form);
    clearFieldError(field);
    const status = field.form?.querySelector('.bb-form__status');
    if (status) {
      status.textContent = '';
      status.classList.remove('is-error');
    }
  });

  window.GreentechCharityFooter = {
    open: function (name) {
      openModal(name, document.activeElement);
    },
    close: closeModal,
    isOpen: isModalOpen
  };
})();
