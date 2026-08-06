import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {existsSync, readFileSync} from 'node:fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

function originalPages(): Plugin {
  return {
    name: 'original-pages',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);

        if (pathname === '/index.js') {
          req.url = '/src/main.tsx';
          return next();
        }

        if (pathname === '/stage-worker.js') {
          req.url = '/src/stage-worker.js';
          return next();
        }

        if (pathname === '/' || !pathname.endsWith('/')) return next();

        const publicRoot = path.resolve(__dirname, 'public');
        const relativePath = pathname.replace(/^\/+|\/+$/g, '');
        const pagePath = path.resolve(publicRoot, relativePath, 'index.html');

        if (!pagePath.startsWith(`${publicRoot}${path.sep}`) || !existsSync(pagePath)) {
          return next();
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

export default defineConfig({
  plugins: [originalPages(), react(), tailwindcss()],
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
