import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {createHash} from 'node:crypto';
import {closeSync, existsSync, openSync, readFileSync, readSync} from 'node:fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

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

function sceneRuntimeTuning(modelVersion: string): Plugin {
  const runtimePath = path.resolve(__dirname, 'src/greencube-runtime.js').replaceAll('\\', '/');
  const workerPath = path.resolve(__dirname, 'src/stage-worker.js').replaceAll('\\', '/');

  return {
    name: 'greentech-scene-runtime-tuning',
    enforce: 'pre',
    transform(source, id) {
      const cleanId = id.split('?')[0].replaceAll('\\', '/');
      if (cleanId !== runtimePath && cleanId !== workerPath) return null;

      const replacements: Array<[string, string]> = [
        [
          '"/greencube-OE4BBULY.glb"',
          `"/greencube-OE4BBULY.glb?v=${modelVersion}"`,
        ],
        [
          '.to({elapsed:1},6e3).delay(500).easing(',
          '.to({elapsed:1},3e3).delay(0).easing(',
        ],
        [
          '.to({scale:1},1500).delay(2e3).easing(',
          '.to({scale:1},900).delay(0).easing(',
        ],
      ];

      if (cleanId === runtimePath) {
        replacements.push([
          '.easing(vt.Cubic.InOut).to({scroll:.5},4e3)',
          '.easing(vt.Cubic.InOut).to({scroll:.5},2e3)',
        ]);
      }

      let transformed = source;
      for (const [search, replacement] of replacements) {
        if (!transformed.includes(search)) {
          throw new Error(`Nu am gasit secventa de animatie asteptata in ${cleanId}: ${search}`);
        }
        transformed = transformed.replace(search, replacement);
      }

      return {code: transformed, map: null};
    },
  };
}

const modelVersion = fingerprintFile(
  path.resolve(__dirname, 'public/greencube-OE4BBULY.glb'),
);

export default defineConfig({
  plugins: [
    sceneRuntimeTuning(modelVersion),
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
        redirect: path.resolve(__dirname, 'index.html'),
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
});
