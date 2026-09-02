export const STANDALONE_BRANDBOOK_URL = '/brandbook-section/?entry=standalone';

const BRANDBOOK_BASE_URL = '/brandbook-section/';
const BRANDBOOK_RUNTIME_URL = '/brandbook-section/assets/js/glmain.min.js';
const SPECULATION_RULES_ID = 'gc-brandbook-prerender';
const DOCUMENT_PREFETCH_ID = 'gc-brandbook-document-prefetch';

// These are the images needed by the first real 1/7 frame. They are retained
// after Image.decode() so non-prerendering browsers can reuse the decoded
// entry artwork without keeping every later stage alive in the house page.
const ENTRY_IMAGE_PATHS = [
  'assets/image/bg.webp',
  'assets/image/bgNoise.webp',
  'assets/image/bgMask.webp',
  'assets/image/stage0/s0_o.webp',
  'assets/image/stage0/s0_t_ro.png',
  'assets/image/stage0/s0_t_sp_ro.png',
  'assets/image/stage0/s0_copy_ro.png',
  'assets/image/stage0/s0_copy2_ro.png',
  'assets/image/stage0/s0_copy2_g.webp',
  'assets/image/road0_2.webp',
  'assets/image/road1_1.webp',
  'assets/image/chara/chara1_1.webp',
  'assets/image/chara/chara5_3.webp',
  'assets/image/chara/chara5_3_top.webp',
  'assets/image/chara/chara5_3_hand.webp',
  'assets/image/particle/particle1.webp',
  'assets/image/mess/001.webp',
  'assets/image/mess/002.webp',
  'assets/image/mess/003.webp',
] as const;

const ENTRY_IMAGE_URLS = new Set(
  ENTRY_IMAGE_PATHS.map((path) => new URL(path, new URL(BRANDBOOK_BASE_URL, window.location.href)).href),
);

const EXCLUDED_RUNTIME_ASSETS = new Set([
  'assets/image/stage0/s0_o_s.webp',
  'assets/image/stage0/transparent.png',
]);

type FetchPriority = 'high' | 'low' | 'auto';
type PriorityRequestInit = RequestInit & {priority?: FetchPriority};
type ScriptConstructorWithSupports = typeof HTMLScriptElement & {
  supports?: (type: string) => boolean;
};
type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
  };
};

type WarmupDetail = {
  phase: 'idle' | 'running' | 'entry-ready' | 'ready' | 'failed';
  completed?: number;
  total?: number;
};

let warmupPromise: Promise<void> | undefined;
let manifestPromise: Promise<string[]> | undefined;
const retainedEntryImages: HTMLImageElement[] = [];

const updateWarmupState = (detail: WarmupDetail) => {
  document.documentElement.dataset.gcBrandbookWarmup = detail.phase;
  window.dispatchEvent(new CustomEvent('greentech:brandbook-warmup', {detail}));
};

const supportsManagedPrerender = () => {
  const constructor = HTMLScriptElement as ScriptConstructorWithSupports;
  return constructor.supports?.('speculationrules') === true;
};

const installManagedPrerender = () => {
  if (!document.getElementById(DOCUMENT_PREFETCH_ID)) {
    const prefetch = document.createElement('link');
    prefetch.id = DOCUMENT_PREFETCH_ID;
    prefetch.rel = 'prefetch';
    prefetch.href = STANDALONE_BRANDBOOK_URL;
    document.head.appendChild(prefetch);
  }

  if (!supportsManagedPrerender() || document.getElementById(SPECULATION_RULES_ID)) return;

  const rules = document.createElement('script');
  rules.id = SPECULATION_RULES_ID;
  rules.type = 'speculationrules';
  rules.textContent = JSON.stringify({
    prerender: [
      {
        urls: [STANDALONE_BRANDBOOK_URL],
        eagerness: 'immediate',
      },
    ],
  });
  document.head.appendChild(rules);
  document.documentElement.dataset.gcBrandbookPrerender = 'requested';
};

const toAbsoluteUrl = (value: string, base: string) => {
  try {
    const url = new URL(value, base);
    if (url.origin !== window.location.origin) return null;
    return url.href;
  } catch {
    return null;
  }
};

const fetchResource = async (url: string, priority: FetchPriority = 'low') => {
  const response = await fetch(url, {
    cache: 'force-cache',
    credentials: 'same-origin',
    priority,
  } as PriorityRequestInit);
  if (!response.ok) throw new Error(`Preload ${response.status}: ${url}`);
  await response.arrayBuffer();
};

const fetchText = async (url: string) => {
  const response = await fetch(url, {
    cache: 'force-cache',
    credentials: 'same-origin',
    priority: 'high',
  } as PriorityRequestInit);
  if (!response.ok) throw new Error(`Manifest ${response.status}: ${url}`);
  return response.text();
};

const extractCssUrls = (css: string, stylesheetUrl: string) => {
  const urls: string[] = [];
  const pattern = /url\(\s*(['"]?)([^'"\)]+)\1\s*\)/gi;
  for (const match of css.matchAll(pattern)) {
    const value = match[2]?.trim();
    if (!value || value.startsWith('data:') || value.startsWith('#')) continue;
    const resolved = toAbsoluteUrl(value, stylesheetUrl);
    if (resolved) urls.push(resolved);
  }
  return urls;
};

const buildManifest = () => {
  if (manifestPromise) return manifestPromise;

  manifestPromise = (async () => {
    const targetUrl = new URL(STANDALONE_BRANDBOOK_URL, window.location.href).href;
    const baseUrl = new URL(BRANDBOOK_BASE_URL, window.location.href).href;
    const runtimeUrl = new URL(BRANDBOOK_RUNTIME_URL, window.location.href).href;
    const [html, runtime] = await Promise.all([
      fetchText(targetUrl),
      fetchText(runtimeUrl),
    ]);

    const urls = new Set<string>([targetUrl, runtimeUrl]);
    const parsed = new DOMParser().parseFromString(html, 'text/html');

    parsed.querySelectorAll<HTMLElement>('[src], link[href]').forEach((element) => {
      const value = element.getAttribute('src') || element.getAttribute('href');
      if (!value) return;
      const resolved = toAbsoluteUrl(value, baseUrl);
      if (resolved) urls.add(resolved);
    });

    urls.add(new URL('content.json', baseUrl).href);
    urls.add(new URL('cream-theme.css', baseUrl).href);

    // The legacy loader owns the authoritative asset list. Reading its paths
    // avoids a second hand-maintained manifest drifting away from glmain.
    const runtimeAssetPattern = /["'](assets\/(?:image|shader)\/[^"']+\.(?:avif|gif|jpe?g|png|svg|webp|js))["']/gi;
    for (const match of runtime.matchAll(runtimeAssetPattern)) {
      const path = match[1];
      if (!path || EXCLUDED_RUNTIME_ASSETS.has(path)) continue;
      urls.add(new URL(path, baseUrl).href);
    }

    const stylesheetUrls = [...urls].filter((url) => /\.css(?:\?|$)/i.test(url));
    const stylesheetResults = await Promise.allSettled(
      stylesheetUrls.map(async (stylesheetUrl) => ({
        stylesheetUrl,
        css: await fetchText(stylesheetUrl),
      })),
    );
    stylesheetResults.forEach((result) => {
      if (result.status !== 'fulfilled') return;
      extractCssUrls(result.value.css, result.value.stylesheetUrl).forEach((url) => urls.add(url));
    });

    ENTRY_IMAGE_URLS.forEach((url) => urls.add(url));
    return [...urls];
  })();

  return manifestPromise;
};

const runPool = async <T>(items: T[], concurrency: number, task: (item: T) => Promise<void>) => {
  let cursor = 0;
  const workers = Array.from({length: Math.min(concurrency, items.length)}, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await task(items[index]);
    }
  });
  await Promise.all(workers);
};

const decodeEntryImage = (url: string) =>
  new Promise<void>((resolve) => {
    const image = new Image();
    image.alt = '';
    image.decoding = 'async';
    image.loading = 'eager';
    image.setAttribute('fetchpriority', 'high');

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      retainedEntryImages.push(image);
      resolve();
    };

    image.addEventListener('load', () => {
      if (typeof image.decode === 'function') void image.decode().catch(() => undefined).then(finish);
      else finish();
    }, {once: true});
    image.addEventListener('error', finish, {once: true});
    image.src = url;
    if (image.complete && image.naturalWidth > 0) {
      if (typeof image.decode === 'function') void image.decode().catch(() => undefined).then(finish);
      else finish();
    }
  });

const performWarmup = async () => {
  updateWarmupState({phase: 'running'});
  installManagedPrerender();

  const urls = await buildManifest();
  let completed = 0;
  const failures: string[] = [];
  const connection = (navigator as NavigatorWithConnection).connection;
  const concurrency = connection?.saveData ? 2 : 5;

  await runPool(urls, concurrency, async (url) => {
    try {
      await fetchResource(url, ENTRY_IMAGE_URLS.has(url) ? 'high' : 'low');
    } catch {
      failures.push(url);
    } finally {
      completed += 1;
      if (completed === urls.length || completed % 16 === 0) {
        updateWarmupState({phase: 'running', completed, total: urls.length});
      }
    }
  });

  await runPool([...ENTRY_IMAGE_URLS], 2, decodeEntryImage);
  updateWarmupState({phase: 'entry-ready', completed, total: urls.length});

  if (failures.length > 0) {
    console.warn('[GREENTECH Charity] Unele resurse brandbook nu au putut fi pregatite.', failures);
  }
  updateWarmupState({phase: 'ready', completed, total: urls.length});
};

export const startBrandbookWarmup = () => {
  if (!warmupPromise) {
    warmupPromise = performWarmup().catch((error) => {
      console.error('[GREENTECH Charity] Preincarcarea brandbook a esuat.', error);
      updateWarmupState({phase: 'failed'});
    });
  }
  return warmupPromise;
};

export const waitForBrandbookWarmup = () => startBrandbookWarmup();
