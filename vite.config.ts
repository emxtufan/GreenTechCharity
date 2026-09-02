import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {createHash} from 'node:crypto';
import {closeSync, existsSync, openSync, readFileSync, readSync} from 'node:fs';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

const SCENE_RUNTIME_PATCH_VERSION =
  'ground-grass-v2-solar-inline-card-system-camera-owner-v1';

function originalPages(): Plugin {
  return {
    name: 'original-pages',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        const requestUrl = new URL(req.url, 'http://localhost');
        const pathname = decodeURIComponent(requestUrl.pathname);

        if (pathname === '/index.js') {
          req.url = '/src/main.tsx';
          return next();
        }

        if (pathname === '/stage-worker.js') {
          req.url = '/src/stage-worker.js';
          return next();
        }

        if (pathname === '/') return next();

        const publicRoot = path.resolve(__dirname, 'public');
        const relativePath = pathname.replace(/^\/+|\/+$/g, '');
        const pagePath = path.resolve(publicRoot, relativePath, 'index.html');

        if (!pagePath.startsWith(`${publicRoot}${path.sep}`) || !existsSync(pagePath)) {
          return next();
        }

        if (!pathname.endsWith('/')) {
          res.statusCode = 308;
          res.setHeader('Location', `${requestUrl.pathname}/${requestUrl.search}`);
          res.end();
          return;
        }

        try {
          const html = await server.transformIndexHtml(
            pathname,
            readFileSync(pagePath, 'utf8'),
          );
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        } catch (error) {
          next(error as Error);
        }
      });
    },
  };
}

function fingerprintFile(filePath: string) {
  const hash = createHash('sha256');
  const handle = openSync(filePath, 'r');
  const buffer = Buffer.allocUnsafe(4 * 1024 * 1024);

  try {
    let bytesRead = 0;
    while ((bytesRead = readSync(handle, buffer, 0, buffer.length, null)) > 0) {
      hash.update(buffer.subarray(0, bytesRead));
    }
  } finally {
    closeSync(handle);
  }

  return hash.digest('hex').slice(0, 16);
}

function fingerprintValue(value: string) {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function versionAssetUrl(assetUrl: string, version: string) {
  const separator = assetUrl.includes('?') ? '&' : '?';
  return `${assetUrl}${separator}v=${version}`;
}

/**
 * Pastreaza runtimeul 3D original, versionand resursele pentru cache/CDN.
 * Ajustarile scenei sunt limitate la viteza 2x a zoomului final si la
 * vegetatia cladirii si canalul unic de control al camerei: poligonul de la
 * sol foloseste exact configuratia publica GREENTECH, cu dimensiunile
 * originale. Faza initiala a norilor, traseul si easingul raman identice cu
 * originalul.
 */
function originalSceneAssets(modelUrl: string, workerVersion: string): Plugin {
  const runtimePath = path.resolve(__dirname, 'src/greencube-runtime.js').replaceAll('\\', '/');
  const workerPath = path.resolve(__dirname, 'src/stage-worker.js').replaceAll('\\', '/');

  return {
    name: 'greentech-original-scene-assets',
    enforce: 'pre',
    transform(source, id) {
      const cleanId = id.split('?')[0].replaceAll('\\', '/');
      if (cleanId !== runtimePath && cleanId !== workerPath) return null;

      const modelLiteral = '"/greencube-OE4BBULY.glb"';
      if (!source.includes(modelLiteral)) {
        throw new Error(`Nu am gasit URL-ul modelului original in ${cleanId}.`);
      }

      let transformed = source.replace(modelLiteral, JSON.stringify(modelUrl));

      const grassPolygon =
        '[[-17.853007,-12.741863],[-12.031148,-12.741863],[-12.031148,2.316407],[-12.031148,4.307389],[-12.031148,6.946362],[-17.987307,7.087376],[-18.205542,7.07059],[-18.430493,7.020228],[-18.652087,6.932932],[-18.860249,6.805348],[-19.048268,6.647547],[-19.209427,6.459528],[-19.333653,6.248007],[-19.420948,6.026415],[-19.47131,5.804821],[-19.451165,5.469075],[-19.333653,4.411469],[-19.135563,2.413773]]';

      const vegetationTokens = cleanId === runtimePath
        ? {
            declaration: 'let a=new $e,c=0,l=0,h=0,u=[],d=[],f=[];',
            placement:
              'for(let A=0;A<sc;A++){let m=Math.random()<.5,p=m?s_:i_,b=Ce.randFloat(p.x[0],p.x[1]),T=Ce.randFloat(p.y[0],p.y[1]),_=Ce.randFloat(p.z[0],p.z[1]),P=this.noise',
            grassRotation:
              'a.rotation.set(m?Ce.randFloat(.05,.75):0,Ce.randFloat(-.5,.5),Math.random()*Math.PI*.075)',
            leavesPosition:
              'a.position.set(b,m?T:T+Ce.randFloat(0,.25),m?_+Ce.randFloat(0,.25):_)',
            flowersPosition:
              'a.position.set(b+Ce.randFloat(-.1,.1),m?T:T+Ce.randFloat(.2,.55),m?_+Ce.randFloat(.2,.45):_)',
            pointerArea: 'let g=new at(new wi(11,4,11),new Dt);g.position.y=3.25',
          }
        : {
            declaration: 'let a=new ze,c=0,l=0,h=0,u=[],d=[],f=[];',
            placement:
              'for(let g=0;g<Ca;g++){let m=Math.random()<.5,p=m?vv:xv,S=Ue.randFloat(p.x[0],p.x[1]),T=Ue.randFloat(p.y[0],p.y[1]),_=Ue.randFloat(p.z[0],p.z[1]),E=this.noise',
            grassRotation:
              'a.rotation.set(m?Ue.randFloat(.05,.75):0,Ue.randFloat(-.5,.5),Math.random()*Math.PI*.075)',
            leavesPosition:
              'a.position.set(S,m?T:T+Ue.randFloat(0,.25),m?_+Ue.randFloat(0,.25):_)',
            flowersPosition:
              'a.position.set(S+Ue.randFloat(-.1,.1),m?T:T+Ue.randFloat(.2,.55),m?_+Ue.randFloat(.2,.45):_)',
            pointerArea: 'let A=new ot(new pi(11,4,11),new Lt);A.position.y=3.25',
          };

      const vegetationReplacements = cleanId === runtimePath
        ? {
            declaration: `let a=new $e,c=0,l=0,h=0,u=[],d=[],f=[],v=${grassPolygon};`,
            placement:
              'for(let A=0;A<sc;A++){let b=Ce.randFloat(-19.47131,-12.031148),T=-2.1122,_=Ce.randFloat(-12.741863,7.087376),V=!1;for(let Y=0,Z=v.length-1;Y<v.length;Z=Y++){let Q=v[Y],z=v[Z];Q[1]>_!=z[1]>_&&b<(z[0]-Q[0])*(_-Q[1])/(z[1]-Q[1])+Q[0]&&(V=!V)}if(!V)continue;let P=this.noise',
            grassRotation:
              'a.rotation.set(0,Ce.randFloat(-.5,.5),Math.random()*Math.PI*.075)',
            leavesPosition: 'a.position.set(b,T+Ce.randFloat(0,.25),_)',
            flowersPosition:
              'a.position.set(b+Ce.randFloat(-.1,.1),T+Ce.randFloat(.2,.55),_)',
            pointerArea:
              'let g=new at(new wi(7.45,.1,19.83),new Dt);g.position.set(-15.7512,-2.1622,-2.8272)',
          }
        : {
            declaration: `let a=new ze,c=0,l=0,h=0,u=[],d=[],f=[],v=${grassPolygon};`,
            placement:
              'for(let g=0;g<Ca;g++){let S=Ue.randFloat(-19.47131,-12.031148),T=-2.1122,_=Ue.randFloat(-12.741863,7.087376),V=!1;for(let q=0,j=v.length-1;q<v.length;j=q++){let k=v[q],x=v[j];k[1]>_!=x[1]>_&&S<(x[0]-k[0])*(_-k[1])/(x[1]-k[1])+k[0]&&(V=!V)}if(!V)continue;let E=this.noise',
            grassRotation:
              'a.rotation.set(0,Ue.randFloat(-.5,.5),Math.random()*Math.PI*.075)',
            leavesPosition: 'a.position.set(S,T+Ue.randFloat(0,.25),_)',
            flowersPosition:
              'a.position.set(S+Ue.randFloat(-.1,.1),T+Ue.randFloat(.2,.55),_)',
            pointerArea:
              'let A=new ot(new pi(7.45,.1,19.83),new Lt);A.position.set(-15.7512,-2.1622,-2.8272)',
          };

      for (const key of Object.keys(vegetationTokens) as Array<keyof typeof vegetationTokens>) {
        const token = vegetationTokens[key];
        if (!transformed.includes(token)) {
          throw new Error(`Nu am gasit secventa ${key} a vegetatiei originale in ${cleanId}.`);
        }
        transformed = transformed.replace(token, vegetationReplacements[key]);
      }

      // Modelul original lasa mesh-urile PV_* cu materialul alb implicit.
      // Le tratam identic in runtimeul principal si in worker, pastrand stilul
      // toon si liniile scenei, dar cu albastrul inchis specific panourilor.
      const solarPanelToken = cleanId === runtimePath
        ? 'case"roof":{S.material=new vr'
        : 'case"roof":{w.material=new ir';
      const solarPanelReplacement = cleanId === runtimePath
        ? 'case"PV":{R({mesh:S,color:new X(1516351)});break}case"roof":{S.material=new vr'
        : 'case"PV":{b({mesh:w,color:new Y(1516351)});break}case"roof":{w.material=new ir';
      if (!transformed.includes(solarPanelToken)) {
        throw new Error(`Nu am gasit tratarea acoperisului pentru panourile solare in ${cleanId}.`);
      }
      transformed = transformed.replace(solarPanelToken, solarPanelReplacement);

      if (cleanId === runtimePath) {
        const emptySceneClick =
          'onClickCallback(e){let{activeRoute:t,lang:n}=this.app.router;this.hover=e,this.hover?this.app.router.push(this.hover===t?`/${n}/`:this.hover):this.app.router.push(`/${n}/`)}';
        const safeSceneClick =
          'onClickCallback(e){if(!e)return;let{activeRoute:t}=this.app.router;this.hover=e,this.app.router.push(this.hover===t?"/":this.hover)}';
        if (!transformed.includes(emptySceneClick)) {
          throw new Error('Nu am gasit callback-ul original de click al scenei.');
        }
        transformed = transformed.replace(emptySceneClick, safeSceneClick);

        const legacyRouter =
          'var Gr=class{constructor(e){this.onChange=e;this.routes=window.__ROUTES__,this.activeRoute=window.location.pathname,this.lang=fi,window.history.scrollRestoration="manual",window.addEventListener("popstate",this.onPopState.bind(this))}routes=[];lang=fi;activeRoute;push(e){e=e.endsWith("/")?e:`${e}/`;let{pathname:t}=new URL(`${window.location.origin}${e}`),n=this.routes.includes(t)?e:"/404/";n!==this.activeRoute&&(this.activeRoute=n,this.lang=fi,window.history.pushState({},this.activeRoute,`${window.location.origin}${this.activeRoute}`),this.onChange(this.activeRoute))}onPopState(){let e=this.routes.includes(window.location.pathname)?window.location.pathname:"/404/";e!==this.activeRoute&&(this.activeRoute=e,this.onChange(this.activeRoute))}}';
        const inlineCardState =
          'var Gr=class{constructor(e){this.onChange=e;this.activeRoute="/",this.lang=fi,window.addEventListener("greentech:card-request",t=>this.push(t.detail?.card||"/"))}routes=[];lang=fi;activeRoute;push(e){let t=e&&document.querySelector(`template[data-gc-card-id="${e}"]`)?e:"/";t!==this.activeRoute&&(this.activeRoute=t,this.lang=fi,this.onChange(this.activeRoute),window.dispatchEvent(new CustomEvent("greentech:active-card-change",{detail:{activeCard:t==="/"?null:t}})))}onPopState(){}}';
        if (!transformed.includes(legacyRouter)) {
          throw new Error('Nu am gasit routerul legacy pentru cardurile cladirii.');
        }
        transformed = transformed.replace(legacyRouter, inlineCardState);

        const legacyButtonPath = 'this.pathname=new URL(this.node.href).pathname;';
        const inlineButtonPath =
          'this.pathname=this.node.dataset.gcCardTarget||this.node.closest(`.${pi.Main}`)?.dataset.pathname||"/";';
        if (!transformed.includes(legacyButtonPath)) {
          throw new Error('Nu am gasit identificarea legacy a cardului din eticheta.');
        }
        transformed = transformed.replace(legacyButtonPath, inlineButtonPath);

        const legacyBodyNavigation =
          'onBodyClick(e){let t=e.target,{origin:n,pathname:s}=window.location;for(;t&&t.parentNode;){if(t.tagName==="A"){let{origin:r,pathname:o,search:a,hash:c}=new URL(t.href);r===n&&o!==s&&t.dataset.pass!=="true"&&(e.preventDefault(),this.router.push(`${o}${a}${c}`));break}t=t.parentNode}}';
        const inlineBodyNavigation =
          'onBodyClick(e){let t=e.target;for(;t&&t.parentNode;){if(t.tagName==="A"){let n=t.dataset.gcCardTarget||t.closest(`.${pi.Main}`)?.dataset.pathname,s=t.hasAttribute("data-gc-card-close");if((n||s)&&t.dataset.pass!=="true"){e.preventDefault(),e.stopPropagation(),this.router.push(s?"/":n)}break}t=t.parentNode}}';
        if (!transformed.includes(legacyBodyNavigation)) {
          throw new Error('Nu am gasit navigarea legacy a linkurilor cardurilor.');
        }
        transformed = transformed.replace(legacyBodyNavigation, inlineBodyNavigation);

        const legacyPageLoader =
          'async loadPage(e){return om&&this.previewManager?.previewMode?await this.previewManager.fetch(e):await(await fetch(e==="/"?"index.html":`${e.replace(/\\/$/,"")}/index.html`)).text()}updatePage(e){let t=this.parser.parseFromString(e,"text/html"),gcContent=window.GreentechMainContent;gcContent?.apply(t);let n=t.querySelector("main");this.main?.replaceWith(n),this.main=document.querySelector("main"),document.title=t.title,gcContent?.syncMetadata(t),document.documentElement.lang=t.documentElement.lang,this.lang=t.documentElement.lang}';
        const inlinePageLoader =
          'async loadPage(e){let t=document.querySelector(`template[data-gc-card-id="${e}"]`)||document.querySelector(`template[data-gc-card-id="/"]`);return t?.innerHTML||"<main></main>"}updatePage(e){let t=this.parser.parseFromString(e,"text/html"),gcContent=window.GreentechMainContent;gcContent?.apply(t);let n=t.querySelector("main");this.main?.replaceWith(n),this.main=document.querySelector("main")}';
        if (!transformed.includes(legacyPageLoader)) {
          throw new Error('Nu am gasit loaderul legacy al paginilor cardurilor.');
        }
        transformed = transformed.replace(legacyPageLoader, inlinePageLoader);

        const legacyPreviewBootstrap =
          'if(om){let{PreviewManager:e}=await import("./PreviewManager.js");if(this.previewManager=new e,this.previewManager?.previewMode){let t=await this.loadPage(window.location.pathname+window.location.search);if(t){let n=this.parser.parseFromString(t,"text/html"),gcContent=window.GreentechMainContent;gcContent?.apply(n);let s=document.body.querySelector(`.${Vr.Content}`),r=n.querySelector(`.${Vr.Content}`);s.replaceWith(r),this.main=document.querySelector("main"),document.title=n.title,gcContent?.syncMetadata(n),document.documentElement.lang=n.documentElement.lang,this.lang=n.documentElement.lang}}}';
        if (!transformed.includes(legacyPreviewBootstrap)) {
          throw new Error('Nu am gasit bootstrap-ul legacy Prismic PreviewManager.');
        }
        transformed = transformed.replace(legacyPreviewBootstrap, '');

        const legacyPreviewProperty = 'previewManager;';
        if (!transformed.includes(legacyPreviewProperty)) {
          throw new Error('Nu am gasit proprietatea legacy PreviewManager.');
        }
        transformed = transformed.replace(legacyPreviewProperty, '');

        const legacyLogoNavigation = 'this.logo.addEventListener("click",()=>{window.open("/","_self")})';
        const inlineLogoNavigation =
          'this.logo.addEventListener("click",e=>{e.preventDefault(),this.app.router.push("/")})';
        if (!transformed.includes(legacyLogoNavigation)) {
          throw new Error('Nu am gasit navigarea legacy a logoului.');
        }
        transformed = transformed.replace(legacyLogoNavigation, inlineLogoNavigation);

        const automaticZoomSpeed = 'this.autoScroll&&(this.scrollTarget+=t*.1)';
        if (!transformed.includes(automaticZoomSpeed)) {
          throw new Error('Nu am gasit secventa zoomului final original.');
        }
        transformed = transformed.replace(
          automaticZoomSpeed,
          'this.autoScroll&&(this.scrollTarget+=t*.2)',
        );

        // Camera originala primeste un singur pointer normalizat per frame. Auto-orbitarea
        // foloseste un canal separat si inlocuieste acel pointer doar cat timp detine camera;
        // mouse-ul/touch-ul real nu mai concureaza cu evenimente pointer sintetice.
        const cameraInputToken =
          'let[s,r]=pc(this.pointerX,this.pointerY,this.width,this.height);this.hasOffscreen?';
        const cameraInputReplacement =
          'let[s,r]=pc(this.pointerX,this.pointerY,this.width,this.height);window.__GREENTECH_CAMERA_ORBIT_ACTIVE__&&(s=window.__GREENTECH_CAMERA_ORBIT_X__??s);this.hasOffscreen?';
        if (!transformed.includes(cameraInputToken)) {
          throw new Error('Nu am gasit compunerea pointerului pentru camera originala.');
        }
        transformed = transformed.replace(cameraInputToken, cameraInputReplacement);

        const workerLiteral = 'new Worker("/stage-worker.js",{type:"module"})';
        if (!transformed.includes(workerLiteral)) {
          throw new Error('Nu am gasit initializarea workerului original.');
        }
        transformed = transformed.replace(
          workerLiteral,
          `new Worker("/stage-worker.js?v=${workerVersion}",{type:"module"})`,
        );

        const stageLoaded = 'onLoad(){this.isLoaded=!0,this.loader.classList.add(ls.Hidden)}';
        if (!transformed.includes(stageLoaded)) {
          throw new Error('Nu am gasit finalizarea loaderului scenei originale.');
        }
        transformed = transformed.replace(
          stageLoaded,
          'onLoad(){this.isLoaded=!0,this.loader.classList.add(ls.Hidden),window.__GREENTECH_STAGE_READY__=!0,window.dispatchEvent(new CustomEvent("greencube:stage-ready"))}',
        );
      }

      return {code: transformed, map: null};
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, __dirname, '');
  const modelPath = path.resolve(__dirname, 'public/greencube-original-OE4BBULY.glb');
  const modelVersion = fingerprintFile(modelPath);
  const configuredModelUrl =
    env.VITE_SCENE_MODEL_URL?.trim() || '/greencube-original-OE4BBULY.glb';

  if (!configuredModelUrl.startsWith('/') && !/^https:\/\//i.test(configuredModelUrl)) {
    throw new Error('VITE_SCENE_MODEL_URL trebuie sa fie o cale absoluta /... sau un URL HTTPS.');
  }

  const modelUrl = versionAssetUrl(configuredModelUrl, modelVersion);
  const workerVersion = fingerprintValue([
    fingerprintFile(path.resolve(__dirname, 'src/stage-worker.js')),
    modelVersion,
    SCENE_RUNTIME_PATCH_VERSION,
  ].join(':'));

  return {
    plugins: [
      originalSceneAssets(modelUrl, workerVersion),
      originalPages(),
      react(),
      tailwindcss(),
    ],
    appType: 'mpa',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      minify: false,
      rollupOptions: {
        input: {
          home: path.resolve(__dirname, 'index.html'),
          app: path.resolve(__dirname, 'src/main.tsx'),
          'stage-worker': path.resolve(__dirname, 'src/stage-worker.js'),
        },
        output: {
          entryFileNames: ({name}) => {
            if (name === 'app') return 'index.js';
            if (name === 'stage-worker') return 'stage-worker.js';
            return 'assets/[name]-[hash].js';
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
