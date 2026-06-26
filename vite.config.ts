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

function youtubeUploadChunkApi() {
  const MAX_CHUNK_BYTES = 4_500_000;
  return {
    name: 'youtube-upload-chunk-api',
    configureServer(server: any) {
      server.middlewares.use('/api/youtube/upload-chunk', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed.' }));
          return;
        }

        try {
          const queryString = (req.url || '').split('?')[1] || '';
          const params = new URLSearchParams(queryString);
          const uploadUrl = params.get('uploadUrl') || '';
          const start = Number(params.get('start'));
          const end = Number(params.get('end'));
          const total = Number(params.get('total'));

          res.setHeader('Content-Type', 'application/json');

          if (!uploadUrl || !uploadUrl.startsWith('https://www.googleapis.com/')) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing or invalid upload session URL.' }));
            return;
          }
          if (![start, end, total].every((value) => Number.isFinite(value) && value >= 0) || end <= start || end > total) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid chunk range.' }));
            return;
          }
          if (end - start > MAX_CHUNK_BYTES) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Chunk too large.' }));
            return;
          }

          const chunks: Buffer[] = [];
          for await (const piece of req) chunks.push(Buffer.from(piece));
          const chunk = Buffer.concat(chunks);
          if (chunk.length !== end - start) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Chunk size does not match the declared range.' }));
            return;
          }

          const googleRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Length': String(chunk.length),
              'Content-Range': `bytes ${start}-${end - 1}/${total}`,
            },
            body: chunk,
          });

          if (googleRes.status === 308) {
            res.statusCode = 200;
            res.end(JSON.stringify({ done: false }));
            return;
          }

          if (googleRes.ok) {
            const data = await googleRes.json().catch(() => ({}) as Record<string, unknown>);
            res.statusCode = 200;
            res.end(JSON.stringify({ done: true, id: (data as { id?: string }).id }));
            return;
          }

          res.statusCode = 502;
          res.end(JSON.stringify({ error: 'The video service rejected this chunk.', detail: await googleRes.text() }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to relay this chunk.' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), clerkMetadataApi(), youtubeUploadApi(), youtubeUploadChunkApi(), cleanHtmlUrls()],
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
