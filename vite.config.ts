import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import { updateClerkPublicMetadata } from './src/lib/clerkMetadataServer';
import { createResumableUpload } from './src/lib/youtubeUploadServer';

// Serves public/*.html as clean, extension-less routes (e.g. /login -> public/login.html)
// so multi-page static routes never expose ".html" in the URL bar.
function cleanHtmlUrls() {
  return {
    name: 'clean-html-urls',
    configureServer(server: any) {
      server.middlewares.use((req: any, _res: any, next: any) => {
        const url = req.url?.split('?')[0];
        if (url && !url.includes('.') && url !== '/') {
          const candidate = path.resolve(__dirname, `public${url}.html`);
          if (fs.existsSync(candidate)) {
            req.url = `${url}.html${req.url.slice(url.length)}`;
          }
        }
        next();
      });
    },
  };
}

function clerkMetadataApi() {
  return {
    name: 'clerk-metadata-api',
    configureServer(server: any) {
      server.middlewares.use('/api/clerk/update-metadata', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed.' }));
          return;
        }

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(Buffer.from(chunk));
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
          const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
          const result = await updateClerkPublicMetadata(token, body);
          res.statusCode = result.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result.body));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unable to update metadata.' }));
        }
      });
    },
  };
}

function youtubeUploadApi() {
  return {
    name: 'youtube-upload-api',
    configureServer(server: any) {
      server.middlewares.use('/api/youtube/create-upload', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed.' }));
          return;
        }

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(Buffer.from(chunk));
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
          const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
          const result = await createResumableUpload(token, body);
          res.statusCode = result.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result.body));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unable to start the video upload.' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), clerkMetadataApi(), youtubeUploadApi(), cleanHtmlUrls()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
