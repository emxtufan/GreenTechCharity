type ContentRecord = Record<string, unknown>;

type MainContentController = {
  apply: (root?: ParentNode, content?: ContentRecord) => void;
  syncMetadata: (source: Document) => void;
};

declare global {
  interface Window {
    GREENTECH_CHARITY_CONTENT?: ContentRecord;
    GreentechMainContent?: MainContentController;
    GreentechMainContentReady?: Promise<ContentRecord>;
  }
}

const CONTENT_URL = '/brandbook-section/content.json';
const ALLOWED_RICH_TEXT_ELEMENTS = new Set(['BR', 'EM', 'SPAN', 'STRONG']);

const readPath = (source: unknown, path: string) =>
  String(path || '').split('.').reduce<unknown>((value, key) => {
    if (!value || typeof value !== 'object') return undefined;
    return (value as ContentRecord)[key];
  }, source);

const selectBoundElements = (root: ParentNode, selector: string) => {
  const elements = Array.from(root.querySelectorAll<HTMLElement>(selector));
  if (root instanceof HTMLElement && root.matches(selector)) elements.unshift(root);
  return elements;
};

const sanitiseRichHtml = (value: unknown) => {
  const template = document.createElement('template');
  template.innerHTML = String(value ?? '');

  template.content.querySelectorAll('*').forEach((element) => {
    if (!ALLOWED_RICH_TEXT_ELEMENTS.has(element.tagName)) {
      element.replaceWith(document.createTextNode(element.textContent || ''));
      return;
    }
    Array.from(element.attributes).forEach((attribute) => element.removeAttribute(attribute.name));
  });

  return template.innerHTML;
};

const applyDirectText = (element: HTMLElement, value: unknown) => {
  const existing = Array.from(element.childNodes).find(
    (node) => node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim(),
  );
  if (existing) {
    existing.nodeValue = String(value ?? '');
    return;
  }
  element.insertBefore(document.createTextNode(String(value ?? '')), element.firstChild);
};

const applyPoiTitles = (element: HTMLElement, value: unknown) => {
  if (!Array.isArray(value)) return;

  try {
    const points = JSON.parse(decodeURIComponent(element.dataset.poi || '[]')) as Array<ContentRecord>;
    points.forEach((point, index) => {
      point.title = typeof value[index] === 'string' ? value[index] : '';
    });
    // StageController decodes this payload with decodeURI, so preserve URI
    // separators while encoding the JSON delimiters.
    element.dataset.poi = encodeURI(JSON.stringify(points));
  } catch (error) {
    console.error('[GREENTECH Charity] Datele punctelor 3D nu au putut fi pregatite.', error);
  }
};

export const applyMainContent = (
  root: ParentNode = document,
  content: ContentRecord = window.GREENTECH_CHARITY_CONTENT || {},
) => {
  selectBoundElements(root, '[data-gc-content]').forEach((element) => {
    const value = readPath(content, element.dataset.gcContent || '');
    if (value != null) element.textContent = String(value);
  });

  selectBoundElements(root, '[data-gc-content-html]').forEach((element) => {
    const value = readPath(content, element.dataset.gcContentHtml || '');
    if (value != null) element.innerHTML = sanitiseRichHtml(value);
  });

  selectBoundElements(root, '[data-gc-content-direct]').forEach((element) => {
    const value = readPath(content, element.dataset.gcContentDirect || '');
    if (value != null) applyDirectText(element, value);
  });

  selectBoundElements(root, '[data-gc-content-meta]').forEach((element) => {
    const value = readPath(content, element.dataset.gcContentMeta || '');
    if (value != null) element.setAttribute('content', String(value));
  });

  selectBoundElements(root, '[data-gc-content-aria]').forEach((element) => {
    const value = readPath(content, element.dataset.gcContentAria || '');
    if (value != null) element.setAttribute('aria-label', String(value));
  });

  selectBoundElements(root, '[data-gc-content-alt]').forEach((element) => {
    const value = readPath(content, element.dataset.gcContentAlt || '');
    if (value != null) element.setAttribute('alt', String(value));
  });

  selectBoundElements(root, '[data-gc-content-email-href]').forEach((element) => {
    const value = readPath(content, element.dataset.gcContentEmailHref || '');
    if (value != null) element.setAttribute('href', `mailto:${String(value)}`);
  });

  selectBoundElements(root, '[data-gc-content-poi-titles]').forEach((element) => {
    const value = readPath(content, element.dataset.gcContentPoiTitles || '');
    applyPoiTitles(element, value);
  });
};

export const syncMainMetadata = (source: Document) => {
  const language = source.documentElement.getAttribute('lang');
  if (language === null) document.documentElement.removeAttribute('lang');
  else document.documentElement.setAttribute('lang', language);

  const selectors = [
    'title',
    'meta[name="description"]',
    'meta[name="robots"]',
    'meta[property^="og:"]',
    'meta[name^="twitter:"]',
    'link[rel="canonical"]',
    'script[type="application/ld+json"]',
  ];
  selectors.forEach((selector) => {
    const replacements = Array.from(source.querySelectorAll(selector), (element) =>
      element.cloneNode(true),
    );
    document.querySelectorAll(selector).forEach((element) => element.remove());
    replacements.forEach((element) => document.head.appendChild(element));
  });
};

const controller: MainContentController = {
  apply: applyMainContent,
  syncMetadata: syncMainMetadata,
};

window.GreentechMainContent = controller;

export const mainContentReady: Promise<ContentRecord> = fetch(CONTENT_URL, {cache: 'no-store'})
  .then((response) => {
    if (!response.ok) throw new Error(`content-http-${response.status}`);
    return response.json() as Promise<ContentRecord>;
  })
  .then((content) => {
    window.GREENTECH_CHARITY_CONTENT = content;
    applyMainContent(document, content);
    document.documentElement.dataset.gcContentReady = 'true';
    return content;
  })
  .catch((error) => {
    console.error('[GREENTECH Charity] content.json nu a putut fi incarcat.', error);
    document.documentElement.dataset.gcContentReady = 'fallback';
    return {} as ContentRecord;
  });

window.GreentechMainContentReady = mainContentReady;

export {};
