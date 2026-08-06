import {useCallback, useEffect, useRef, useState} from 'react';

type GreencubeScrollProgress = {
  target: number;
  settled: number;
  progress: number;
  animating: boolean;
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

const FIRST_LEG_MS = 850;
const SECOND_LEG_MS = 1200;
const RETURN_MS = 1550;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const smoothstep = (start: number, end: number, value: number) => {
  const amount = clamp((value - start) / (end - start));
  return amount * amount * (3 - 2 * amount);
};

const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

export default function App() {
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [sectionPhase, setSectionPhase] = useState<SectionPhase>('house');
  const sectionPhaseRef = useRef<SectionPhase>('house');
  const brandbookReady = useRef(false);
  const brandbookFrameElement = useRef<HTMLIFrameElement>(null);
  const brandbookSectionElement = useRef<HTMLElement>(null);
  const transitionFrame = useRef<number | undefined>(undefined);
  const transitionToken = useRef(0);
  const transitionProgress = useRef(0);
  const wasAtScrollEnd = useRef(false);
  const waitingForBrandbook = useRef<(() => void) | null>(null);
  const portalAnchor = useRef<PortalAnchor>({x: 0.5, y: 0.5, radius: 180});
  const childRingAnchor = useRef<PortalAnchor>({x: 0.5, y: 0.5, radius: 180});
  const progress = useRef<GreencubeScrollProgress>({
    target: 0,
    settled: 0,
    progress: 0.5,
    animating: true,
  });

  useEffect(() => {
    void import('./greencube-runtime.js');
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
    const amount = transitionProgress.current;
    const reveal = smoothstep(0.46, 0.98, amount);
    const portalX = clamp(parentRing.x, 0.05, 0.95) * width;
    const portalY = clamp(parentRing.y, 0.05, 0.95) * height;
    const farthestX = Math.max(portalX, width - portalX);
    const farthestY = Math.max(portalY, height - portalY);
    const coverRadius = Math.hypot(farthestX, farthestY) + 4;
    const firstRadius = Math.max(8, parentRing.radius * 0.22);
    const radius = reveal <= 0 ? 0 : firstRadius + (coverRadius - firstRadius) * reveal;

    section.style.clipPath = `circle(${radius}px at ${portalX}px ${portalY}px)`;

    const childRadius = Math.max(childRing.radius, 1);
    const initialScale = clamp(parentRing.radius / childRadius, 0.28, 3.2);
    const initialX = portalX - childRing.x * width * initialScale;
    const initialY = portalY - childRing.y * height * initialScale;
    const frameBlend = smoothstep(0.04, 0.92, reveal);
    const frameScale = initialScale + (1 - initialScale) * frameBlend;
    const frameX = initialX * (1 - frameBlend);
    const frameY = initialY * (1 - frameBlend);
    frame.style.transform = `translate3d(${frameX}px, ${frameY}px, 0) scale(${frameScale})`;
  }, []);

  const applyTransitionProgress = useCallback(
    (amount: number) => {
      const value = clamp(amount);
      transitionProgress.current = value;
      renderPortal();
      window.dispatchEvent(
        new CustomEvent('greencube:section-transition', {
          detail: {progress: value, requestAnchor: value > 0 && value < 0.72},
        }),
      );
    },
    [renderPortal],
  );

  const animateTo = useCallback(
    (target: number, duration: number, token: number, onComplete: () => void) => {
      window.cancelAnimationFrame(transitionFrame.current ?? 0);
      const startValue = transitionProgress.current;
      const startTime = performance.now();

      const update = (now: number) => {
        if (token !== transitionToken.current) return;
        const elapsed = clamp((now - startTime) / duration);
        const eased = easeInOutCubic(elapsed);
        applyTransitionProgress(startValue + (target - startValue) * eased);

        if (elapsed < 1) {
          transitionFrame.current = window.requestAnimationFrame(update);
        } else {
          onComplete();
        }
      };

      transitionFrame.current = window.requestAnimationFrame(update);
    },
    [applyTransitionProgress],
  );

  const finishEntry = useCallback(
    (token: number) => {
      waitingForBrandbook.current = null;
      animateTo(1, SECOND_LEG_MS, token, () => {
        if (token !== transitionToken.current) return;
        applyTransitionProgress(1);
        setPhase('active');
        postToBrandbook('entry-active');
      });
    },
    [animateTo, applyTransitionProgress, postToBrandbook, setPhase],
  );

  const openBrandbook = useCallback(() => {
    if (sectionPhaseRef.current !== 'house') return;

    const token = ++transitionToken.current;
    setShowScrollHint(false);
    setPhase('entering');
    postToBrandbook('activate-entry');
    applyTransitionProgress(0);

    animateTo(0.48, FIRST_LEG_MS, token, () => {
      if (token !== transitionToken.current) return;
      if (brandbookReady.current) {
        finishEntry(token);
      } else {
        waitingForBrandbook.current = () => finishEntry(token);
      }
    });
  }, [animateTo, applyTransitionProgress, finishEntry, postToBrandbook, setPhase]);

  const closeBrandbook = useCallback(() => {
    if (sectionPhaseRef.current !== 'active') return;

    const token = ++transitionToken.current;
    setPhase('leaving');
    postToBrandbook('entry-leaving');

    animateTo(0, RETURN_MS, token, () => {
      if (token !== transitionToken.current) return;
      applyTransitionProgress(0);
      setPhase('house');
      postToBrandbook('park-at-entry');
    });
  }, [animateTo, applyTransitionProgress, postToBrandbook, setPhase]);

  useEffect(() => {
    const onProgress = (event: Event) => {
      const current = (event as CustomEvent<GreencubeScrollProgress>).detail;
      progress.current = current;
      const atScrollEnd =
        !current.animating && current.target >= 0.999 && current.settled >= 0.985;

      if (atScrollEnd && !wasAtScrollEnd.current && sectionPhaseRef.current === 'house') {
        openBrandbook();
      }
      wasAtScrollEnd.current = atScrollEnd;
    };

    window.addEventListener('greencube:scroll-progress', onProgress);
    return () => window.removeEventListener('greencube:scroll-progress', onProgress);
  }, [openBrandbook]);

  useEffect(() => {
    const onAnchor = (event: Event) => {
      const detail = (event as CustomEvent<PortalAnchor>).detail;
      if (!detail || !Number.isFinite(detail.x) || !Number.isFinite(detail.y)) return;
      portalAnchor.current = {
        x: detail.x,
        y: detail.y,
        radius: Number.isFinite(detail.radius) && detail.radius > 0 ? detail.radius : portalAnchor.current.radius,
      };
      renderPortal();
    };

    window.addEventListener('greencube:transition-anchor', onAnchor);
    return () => window.removeEventListener('greencube:transition-anchor', onAnchor);
  }, [renderPortal]);

  useEffect(() => {
    window.addEventListener('greencube:next-section-intent', openBrandbook);
    return () => window.removeEventListener('greencube:next-section-intent', openBrandbook);
  }, [openBrandbook]);

  useEffect(() => {
    const canOpenBrandbook = () => {
      const current = progress.current;
      return (
        sectionPhaseRef.current === 'house' &&
        !current.animating &&
        current.target >= 0.999 &&
        current.settled >= 0.985
      );
    };

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY > 8 && canOpenBrandbook()) openBrandbook();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(event.key) && canOpenBrandbook()) {
        openBrandbook();
      }
    };

    window.addEventListener('wheel', onWheel, {passive: true});
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [openBrandbook]);

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
        const continueEntry = waitingForBrandbook.current;
        if (continueEntry) continueEntry();
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
      transitionToken.current += 1;
      window.cancelAnimationFrame(transitionFrame.current ?? 0);
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

        @media (orientation: portrait) and (max-width: 1100px) {
          .greentech-scroll-hint {
            bottom: calc(var(--column) * 2 + var(--space) * 2);
            font-size: 16px;
          }
        }
      `}</style>

      <div
        className={`greentech-scroll-hint${showScrollHint && sectionPhase === 'house' ? ' is-visible' : ''}`}
        aria-hidden={!showScrollHint || sectionPhase !== 'house'}
      >
        Scroll down
      </div>

      <section
        ref={brandbookSectionElement}
        className={`greentech-brandbook-section${sectionPresent ? ' is-present' : ''}${sectionInteractive ? ' is-interactive' : ''}`}
        aria-label="Povestea GREENTECH Charity"
        aria-hidden={!sectionInteractive}
      >
        <iframe
          ref={brandbookFrameElement}
          className="greentech-brandbook-frame"
          src="/brandbook-section/?entry=connected"
          title="Povestea GREENTECH Charity"
          loading="eager"
          allow="fullscreen"
        />
      </section>
    </>
  );
}
