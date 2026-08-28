import {useCallback, useEffect, useRef, useState} from 'react';
import {mainContentReady} from './main-content';

type GreencubeScrollProgress = {
  target: number;
  settled: number;
  progress: number;
  animating: boolean;
  orbitTarget?: number;
  orbit?: number;
  entryTarget?: number;
  entry?: number;
};

type PortalAnchor = {
  x: number;
  y: number;
  radius: number;
};

type BrandbookMessage = {
  source?: string;
  type?: string;
  ring?: PortalAnchor;
};

type SectionPhase = 'house' | 'entering' | 'active' | 'leaving';

type WrapperCopy = {
  navigation: {
    contact: string;
    transparency: string;
    tabAriaTemplate: string;
  };
  scrollHint: string;
  brandbook: {
    ariaLabel: string;
    frameTitle: string;
  };
};

const EMPTY_WRAPPER_COPY: WrapperCopy = {
  navigation: {
    contact: '',
    transparency: '',
    tabAriaTemplate: '',
  },
  scrollHint: '',
  brandbook: {
    ariaLabel: '',
    frameTitle: '',
  },
};

const readString = (value: unknown) => (typeof value === 'string' ? value : '');

const normaliseWrapperCopy = (value: unknown): WrapperCopy => {
  if (!value || typeof value !== 'object') return EMPTY_WRAPPER_COPY;

  const source = value as {
    navigation?: Record<string, unknown>;
    scrollHint?: unknown;
    brandbook?: Record<string, unknown>;
  };

  return {
    navigation: {
      contact: readString(source.navigation?.contact),
      transparency: readString(source.navigation?.transparency),
      tabAriaTemplate: readString(source.navigation?.tabAriaTemplate),
    },
    scrollHint: readString(source.scrollHint),
    brandbook: {
      ariaLabel: readString(source.brandbook?.ariaLabel),
      frameTitle: readString(source.brandbook?.frameTitle),
    },
  };
};

const formatCopy = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');

// The scroll cascade (zoom -> orbit -> entry) is the only clock: the mask and
// the 3D camera both read the same `entry` value, so they cannot drift apart.
const ENTRY_EPSILON = 0.002;
const ENTRY_SETTLED = 0.985;
const PORTAL_OPEN_FROM = 0.3;
const PORTAL_OPEN_TO = 0.6;
const FRAME_BLEND_FROM = 0.35;
const FRAME_BLEND_TO = 0.95;
const PORTAL_COVER_FROM = 0.9;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const smoothstep = (start: number, end: number, value: number) => {
  const amount = clamp((value - start) / (end - start));
  return amount * amount * (3 - 2 * amount);
};

export default function App() {
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [sectionPhase, setSectionPhase] = useState<SectionPhase>('house');
  const [wrapperCopy, setWrapperCopy] = useState<WrapperCopy>(EMPTY_WRAPPER_COPY);
  const sectionPhaseRef = useRef<SectionPhase>('house');
  const brandbookReady = useRef(false);
  const brandbookFrameElement = useRef<HTMLIFrameElement>(null);
  const brandbookSectionElement = useRef<HTMLElement>(null);
  const entryProgress = useRef(0);
  const portalAnchor = useRef<PortalAnchor>({x: 0.5, y: 0.5, radius: 180});
  const childRingAnchor = useRef<PortalAnchor>({x: 0.5, y: 0.5, radius: 180});

  useEffect(() => {
    let active = true;
    void mainContentReady.then((content) => {
      if (active) setWrapperCopy(normaliseWrapperCopy(content.wrapper));
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (
      !wrapperCopy.navigation.contact ||
      !wrapperCopy.navigation.transparency ||
      !wrapperCopy.navigation.tabAriaTemplate
    ) {
      return;
    }

    const legacyContactRoute = '/contact/';
    const transparencyRoute = '/transparenta/';
    const routes = (window as Window & {__ROUTES__?: string[]}).__ROUTES__;
    if (routes && !routes.includes(legacyContactRoute)) routes.push(legacyContactRoute);

    const menu = document.querySelector<HTMLElement>('._68f6d6 ._68695a');
    if (!menu || menu.dataset.gcPersistentNavReady === 'true') return;
    menu.dataset.gcPersistentNavReady = 'true';

    const baseHeaderItems = Array.from(menu.children).filter(
      (item): item is HTMLElement =>
        item instanceof HTMLElement &&
        item.matches('._2680ad[data-in-header="true"]'),
    );

    const snapshots = baseHeaderItems.map((item) => ({
      item,
      className: item.className,
      style: item.getAttribute('style'),
      inHeader: item.dataset.inHeader,
      anchorClassName: item.querySelector('a')?.className ?? '',
    }));

    const createPersistentTab = (route: string, label: string, marker: string) => {
      const tab = document.createElement('div');
      tab.className = '_2680ad _0ca877 _f722b9';
      tab.dataset.inHeader = 'true';
      tab.dataset.pathname = route;
      tab.setAttribute(marker, 'true');
      const ariaLabel = formatCopy(wrapperCopy.navigation.tabAriaTemplate, {label});
      tab.innerHTML = `
      <a href="${route}" class="_2bb0cd _7423af" aria-label="${ariaLabel}">
        <span class="_14690a" aria-hidden="true">
          <svg class="_6c8233" viewBox="0 0 101 101" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 50.5C2.50001 23.9903 23.9903 2.50001 50.5 2.50001C77.0097 2.50001 98.5 23.9903 98.5 50.5C98.5 77.0097 77.0097 98.5 50.5 98.5C23.9903 98.5 2.5 77.0097 2.5 50.5Z" vector-effect="non-scaling-stroke" />
            <path class="_19c712" d="M50.5 16.55V84.45" vector-effect="non-scaling-stroke" />
            <path d="M84.4502 50.5L16.5502 50.5" vector-effect="non-scaling-stroke" />
          </svg>
        </span>
        <span class="_5862ff"><span class="_fc3732">${label}</span></span>
      </a>
      <div class="_9bef0c"></div>
    `;
      return tab;
    };

    const legacyContactTab = createPersistentTab(
      legacyContactRoute,
      wrapperCopy.navigation.contact,
      'data-gc-legacy-contact-tab',
    );
    const existingTransparencyTab = menu.querySelector<HTMLElement>(
      `._2680ad[data-pathname="${transparencyRoute}"]`,
    );
    const transparencySnapshot = existingTransparencyTab
      ? {
          className: existingTransparencyTab.className,
          style: existingTransparencyTab.getAttribute('style'),
          inHeader: existingTransparencyTab.dataset.inHeader,
          anchorClassName: existingTransparencyTab.querySelector('a')?.className ?? '',
          anchorAriaLabel: existingTransparencyTab.querySelector('a')?.getAttribute('aria-label'),
          label: existingTransparencyTab.querySelector('._fc3732')?.textContent ?? '',
          nextSibling: existingTransparencyTab.nextSibling,
        }
      : null;
    const transparencyTab = existingTransparencyTab ?? createPersistentTab(
      transparencyRoute,
      wrapperCopy.navigation.transparency,
      'data-gc-transparency-tab',
    );

    transparencyTab.setAttribute('data-gc-transparency-tab', 'true');
    const transparencyAnchor = transparencyTab.querySelector('a');
    const transparencyLabel = transparencyTab.querySelector('._fc3732');
    if (transparencyAnchor) {
      transparencyAnchor.setAttribute(
        'aria-label',
        formatCopy(wrapperCopy.navigation.tabAriaTemplate, {
          label: wrapperCopy.navigation.transparency,
        }),
      );
    }
    if (transparencyLabel) transparencyLabel.textContent = wrapperCopy.navigation.transparency;
    menu.appendChild(legacyContactTab);
    menu.appendChild(transparencyTab);

    const persistentTabs = [...baseHeaderItems, legacyContactTab, transparencyTab];
    const activeIndex = persistentTabs.findIndex(
      (item) => item.dataset.pathname === window.location.pathname,
    );

    persistentTabs.forEach((item, index) => {
      item.classList.add('_0ca877');
      item.dataset.inHeader = 'true';
      item.style.setProperty('--offset', String(persistentTabs.length - index));
      item.style.setProperty('--index', String(index));
      item.classList.toggle('_5257f8', activeIndex >= index);
      item.classList.toggle('gc-tab-collapsed', activeIndex > index);
      item.querySelector('a')?.classList.toggle('_5a376b', activeIndex === index);
    });

    return () => {
      legacyContactTab.remove();
      snapshots.forEach(({item, className, style, inHeader, anchorClassName}) => {
        item.className = className;
        if (style === null) item.removeAttribute('style');
        else item.setAttribute('style', style);
        if (inHeader === undefined) delete item.dataset.inHeader;
        else item.dataset.inHeader = inHeader;
        const anchor = item.querySelector('a');
        if (anchor) anchor.className = anchorClassName;
      });
      if (transparencySnapshot) {
        transparencyTab.className = transparencySnapshot.className;
        if (transparencySnapshot.style === null) transparencyTab.removeAttribute('style');
        else transparencyTab.setAttribute('style', transparencySnapshot.style);
        if (transparencySnapshot.inHeader === undefined) delete transparencyTab.dataset.inHeader;
        else transparencyTab.dataset.inHeader = transparencySnapshot.inHeader;
        transparencyTab.removeAttribute('data-gc-transparency-tab');
        const anchor = transparencyTab.querySelector('a');
        if (anchor) {
          anchor.className = transparencySnapshot.anchorClassName;
          if (transparencySnapshot.anchorAriaLabel === null) anchor.removeAttribute('aria-label');
          else anchor.setAttribute('aria-label', transparencySnapshot.anchorAriaLabel);
        }
        const label = transparencyTab.querySelector('._fc3732');
        if (label) label.textContent = transparencySnapshot.label;
        menu.insertBefore(transparencyTab, transparencySnapshot.nextSibling);
      } else {
        transparencyTab.remove();
      }
      delete menu.dataset.gcPersistentNavReady;
    };
  }, [wrapperCopy.navigation]);

  useEffect(() => {
    void mainContentReady
      .then(() => new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve())))
      .then(() => import('./greencube-runtime.js'));
  }, []);

  useEffect(() => {
    const intro = document.querySelector<HTMLElement>('._b400e8');
    if (!intro) return;

    let armed = false;
    let revealTimer: number | undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(event.key)) dismiss();
    };

    const dismiss = () => {
      window.clearTimeout(revealTimer);
      setShowScrollHint(false);
      window.removeEventListener('wheel', dismiss);
      window.removeEventListener('touchmove', dismiss);
      window.removeEventListener('keydown', onKeyDown);
    };

    const revealWhenIntroCloses = () => {
      if (armed || !intro.classList.contains('_289adb')) return;
      armed = true;
      window.addEventListener('wheel', dismiss, {passive: true});
      window.addEventListener('touchmove', dismiss, {passive: true});
      window.addEventListener('keydown', onKeyDown);
      revealTimer = window.setTimeout(() => setShowScrollHint(true), 650);
    };

    const observer = new MutationObserver(revealWhenIntroCloses);
    observer.observe(intro, {attributes: true, attributeFilter: ['class']});
    revealWhenIntroCloses();

    return () => {
      observer.disconnect();
      dismiss();
    };
  }, []);

  const setPhase = useCallback((phase: SectionPhase) => {
    sectionPhaseRef.current = phase;
    setSectionPhase(phase);

    const transitioning = phase === 'entering' || phase === 'leaving';
    document.body.classList.toggle('greentech-section-transitioning', transitioning);
    document.body.classList.toggle('brandbook-section-active', phase === 'active');
  }, []);

  const postToBrandbook = useCallback((type: string) => {
    brandbookFrameElement.current?.contentWindow?.postMessage(
      {source: 'greentech-parent', type},
      window.location.origin,
    );
  }, []);

  const renderPortal = useCallback(() => {
    const section = brandbookSectionElement.current;
    const frame = brandbookFrameElement.current;
    if (!section || !frame) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const parentRing = portalAnchor.current;
    const childRing = childRingAnchor.current;
    const amount = entryProgress.current;
    const active = sectionPhaseRef.current === 'active';

    const portalX = clamp(parentRing.x, -1, 2) * width;
    const portalY = clamp(parentRing.y, -1, 2) * height;
    const farthestX = Math.max(portalX, width - portalX);
    const farthestY = Math.max(portalY, height - portalY);
    const coverRadius = Math.hypot(farthestX, farthestY) + 4;

    // The mask is the ring hole: it tracks the projected circle so the section
    // is literally seen through it, then blends to full cover at the very end
    // so the viewport corners are guaranteed regardless of projection error.
    const open = smoothstep(PORTAL_OPEN_FROM, PORTAL_OPEN_TO, amount);
    const settle = active ? 1 : smoothstep(PORTAL_COVER_FROM, 1, amount);
    const holeRadius = Math.max(parentRing.radius, 0) * open;
    const radius = holeRadius + (coverRadius - holeRadius) * settle;

    section.style.clipPath = `circle(${radius}px at ${portalX}px ${portalY}px)`;

    // Line the child's own ring up with the hole, then release it to its
    // natural framing as the hole takes over the viewport.
    const childRadius = Math.max(childRing.radius, 1);
    // At the head of stage0 the child's ring is large on screen, so the early
    // alignment scale is much smaller than it was at the parked frame.
    const alignedScale = clamp(parentRing.radius / childRadius, 0.03, 8);
    const blend = active ? 1 : smoothstep(FRAME_BLEND_FROM, FRAME_BLEND_TO, amount);
    const frameScale = alignedScale + (1 - alignedScale) * blend;
    const frameX = (portalX - childRing.x * width * frameScale) * (1 - blend);
    const frameY = (portalY - childRing.y * height * frameScale) * (1 - blend);
    frame.style.transform = `translate3d(${frameX}px, ${frameY}px, 0) scale(${frameScale})`;
  }, []);

  const closeBrandbook = useCallback(() => {
    if (sectionPhaseRef.current !== 'active') return;

    setPhase('leaving');
    postToBrandbook('entry-leaving');
    // Hand the entry channel back to zero; the scene controller eases both the
    // camera and the mask out of it on the same curve it eased them in.
    window.dispatchEvent(
      new CustomEvent('greencube:section-transition', {
        detail: {progress: 0, requestAnchor: true},
      }),
    );
  }, [postToBrandbook, setPhase]);

  useEffect(() => {
    const onProgress = (event: Event) => {
      const detail = (event as CustomEvent<GreencubeScrollProgress>).detail;
      const entry = clamp(Number(detail.entry) || 0);
      const entryTarget = clamp(Number(detail.entryTarget) || 0);
      entryProgress.current = entry;

      const phase = sectionPhaseRef.current;

      if (phase === 'house') {
        if (entry > ENTRY_EPSILON && brandbookReady.current) {
          setShowScrollHint(false);
          setPhase('entering');
          postToBrandbook('activate-entry');
        }
      } else if (phase === 'entering') {
        if (entry >= ENTRY_SETTLED && entryTarget >= 0.999) {
          setPhase('active');
          postToBrandbook('entry-active');
        } else if (entry <= ENTRY_EPSILON && entryTarget <= ENTRY_EPSILON) {
          setPhase('house');
          postToBrandbook('park-at-entry');
        }
      } else if (phase === 'leaving' && entry <= ENTRY_EPSILON && entryTarget <= ENTRY_EPSILON) {
        setPhase('house');
        postToBrandbook('park-at-entry');
      }

      renderPortal();
    };

    window.addEventListener('greencube:scroll-progress', onProgress);
    return () => window.removeEventListener('greencube:scroll-progress', onProgress);
  }, [postToBrandbook, renderPortal, setPhase]);

  useEffect(() => {
    const onAnchor = (event: Event) => {
      const detail = (event as CustomEvent<PortalAnchor>).detail;
      if (!detail || !Number.isFinite(detail.x) || !Number.isFinite(detail.y)) return;
      portalAnchor.current = {
        x: detail.x,
        y: detail.y,
        radius:
          Number.isFinite(detail.radius) && detail.radius > 0
            ? detail.radius
            : portalAnchor.current.radius,
      };
      renderPortal();
    };

    window.addEventListener('greencube:transition-anchor', onAnchor);
    return () => window.removeEventListener('greencube:transition-anchor', onAnchor);
  }, [renderPortal]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<BrandbookMessage>) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== brandbookFrameElement.current?.contentWindow ||
        event.data?.source !== 'greentech-brandbook'
      ) {
        return;
      }

      if (event.data.type === 'stage0-detail-ready') {
        if (event.data.ring) childRingAnchor.current = event.data.ring;
        brandbookReady.current = true;
        renderPortal();
      } else if (event.data.type === 'entry-anchor' && event.data.ring) {
        childRingAnchor.current = event.data.ring;
        renderPortal();
      } else if (event.data.type === 'return-to-house') {
        closeBrandbook();
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [closeBrandbook, renderPortal]);

  useEffect(() => {
    const onResize = () => renderPortal();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [renderPortal]);

  useEffect(() => {
    return () => {
      document.body.classList.remove('brandbook-section-active', 'greentech-section-transitioning');
    };
  }, []);

  const sectionPresent = sectionPhase !== 'house';
  const sectionInteractive = sectionPhase === 'active';

  return (
    <>
      <style>{`
        .greentech-scroll-hint {
          position: fixed;
          left: 50%;
          bottom: calc(var(--column) + var(--space));
          z-index: 40;
          padding: .38em .9em .42em;
          transform: translate(-50%, 12px);
          border: 1px solid currentColor;
          border-radius: 999px;
          color: var(--forest);
          background: rgba(239, 237, 224, .9);
          font-family: Garamond, serif;
          font-size: clamp(16px, 1.25vw, 22px);
          line-height: 1;
          letter-spacing: .04em;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity .35s linear, transform .5s var(--ease-out-expo);
          backdrop-filter: blur(4px);
        }

        .greentech-scroll-hint.is-visible {
          opacity: 1;
          transform: translate(-50%, 0);
        }

        .greentech-brandbook-section {
          position: fixed;
          inset: 0;
          z-index: 1000;
          width: 100vw;
          height: 100vh;
          height: 100svh;
          overflow: hidden;
          isolation: isolate;
          visibility: hidden;
          pointer-events: none;
          background: #efede0;
          clip-path: circle(0 at 50% 50%);
          will-change: clip-path;
        }

        .greentech-brandbook-section.is-present {
          visibility: visible;
        }

        .greentech-brandbook-section.is-interactive {
          pointer-events: auto;
        }

        .greentech-brandbook-frame {
          display: block;
          width: 100%;
          height: 100%;
          border: 0;
          background: #efede0;
          transform-origin: 0 0;
          will-change: transform;
        }

        body.greentech-section-transitioning ._68f6d6,
        body.brandbook-section-active ._68f6d6 {
          opacity: 0;
          pointer-events: none;
          transition: opacity .35s linear;
        }

        @media (min-width: 1921px) {
          :root,
          ._f6ab87 {
            --space: 20px !important;
            --column: 120px !important;
            --text-xs: 12px !important;
            --text-s: 16px !important;
            --text-m: 20px !important;
            --title-s: 60px !important;
            --title-m: 60px !important;
            --title-l: 120px !important;
            --title-xl: 200px !important;
            --radius: 30px !important;
          }
        }

        [data-gc-legacy-contact] .gc-legacy-contact__page {
          align-content: start;
        }

        [data-gc-legacy-contact] .gc-legacy-contact__intro {
          max-width: 34rem;
        }

        [data-gc-legacy-contact] .gc-legacy-contact__kicker {
          display: block;
          margin-bottom: 1.2rem;
          font-size: var(--text-xs);
          font-style: normal;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        [data-gc-legacy-contact] .gc-legacy-contact__list {
          display: grid;
          align-content: start;
          font-style: normal;
          border-bottom: 1px solid currentColor;
        }

        [data-gc-legacy-contact] .gc-legacy-contact__row {
          display: grid;
          grid-template-columns: minmax(7rem, .4fr) minmax(0, 1fr);
          gap: var(--space);
          align-items: start;
          padding-block: calc(var(--space) * 1.25);
          border-top: 1px solid currentColor;
        }

        [data-gc-legacy-contact] .gc-legacy-contact__row > span {
          padding-top: .35em;
          font-size: var(--text-xs);
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        [data-gc-legacy-contact] .gc-legacy-contact__row > a,
        [data-gc-legacy-contact] .gc-legacy-contact__row > strong {
          font-family: Garamond, serif;
          font-size: var(--title-s);
          font-style: normal;
          font-weight: 400;
          line-height: .95;
          overflow-wrap: anywhere;
          text-decoration: none;
        }

        [data-gc-legacy-contact] .gc-legacy-contact__row > a {
          transition: opacity .2s linear;
        }

        @media (pointer: fine) {
          [data-gc-legacy-contact] .gc-legacy-contact__row > a:hover {
            opacity: .58;
          }
        }

        @media (orientation: portrait) and (max-width: 1100px) {
          .greentech-scroll-hint {
            bottom: calc(var(--column) * 4 + var(--space) * 2);
            font-size: 16px;
          }

          [data-gc-legacy-contact] .gc-legacy-contact__row {
            grid-template-columns: minmax(0, 1fr);
            gap: .35rem;
          }

          [data-gc-legacy-contact] .gc-legacy-contact__row > span {
            padding-top: 0;
          }
        }
      `}</style>

      <div
        className={`greentech-scroll-hint${showScrollHint && sectionPhase === 'house' ? ' is-visible' : ''}`}
        aria-hidden={!showScrollHint || sectionPhase !== 'house'}
      >
        {wrapperCopy.scrollHint}
      </div>

      <section
        ref={brandbookSectionElement}
        className={`greentech-brandbook-section${sectionPresent ? ' is-present' : ''}${sectionInteractive ? ' is-interactive' : ''}`}
        aria-label={wrapperCopy.brandbook.ariaLabel}
        aria-hidden={!sectionInteractive}
      >
        <iframe
          ref={brandbookFrameElement}
          className="greentech-brandbook-frame"
          src="/brandbook-section/?entry=connected"
          title={wrapperCopy.brandbook.frameTitle}
          loading="eager"
          allow="fullscreen"
        />
      </section>
    </>
  );
}
