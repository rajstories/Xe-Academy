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

async function readJsonBody(req: any) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

let devRedisClientPromise: Promise<any> | null = null;
async function getDevRedis() {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (!devRedisClientPromise) {
    const { createClient } = await import('redis');
    const client = createClient({ url });
    devRedisClientPromise = client.connect().then(() => client);
  }
  return devRedisClientPromise;
}

async function kvGet(key: string) {
  const redis = await getDevRedis();
  if (!redis) return null;
  const raw = await redis.get(key);
  return raw ? JSON.parse(raw) : null;
}

async function kvSet(key: string, value: unknown) {
  const redis = await getDevRedis();
  if (!redis) throw new Error('Redis is not configured.');
  await redis.set(key, JSON.stringify(value));
}

async function verifyClerk(req: any): Promise<{ ok: boolean; userId?: string }> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return { ok: true };
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return { ok: false };
  try {
    const { verifyToken } = await import('@clerk/backend');
    const verified = await verifyToken(token, { secretKey });
    return verified.sub ? { ok: true, userId: verified.sub } : { ok: false };
  } catch {
    return { ok: false };
  }
}

// Dev-server mirror of api/courses/*.ts (Redis via REDIS_URL) so the
// creator→student course catalog and enrollments work the same locally.
function coursesDevApi() {
  return {
    name: 'courses-dev-api',
    configureServer(server: any) {
      server.middlewares.use('/api/courses/list', async (req: any, res: any) => {
        res.setHeader('Content-Type', 'application/json');
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed.' }));
          return;
        }
        try {
          if (!process.env.REDIS_URL) {
            res.end(JSON.stringify({ catalog: [] }));
            return;
          }
          const catalog = (await kvGet('xe:catalog')) || [];
          res.end(JSON.stringify({ catalog }));
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to load the catalog.' }));
        }
      });

      server.middlewares.use('/api/courses/publish', async (req: any, res: any) => {
        res.setHeader('Content-Type', 'application/json');
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed.' }));
          return;
        }
        try {
          if (!process.env.REDIS_URL) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Course storage is not configured yet. Connect a Redis store to this project in Vercel.' }));
            return;
          }
          const auth = await verifyClerk(req);
          if (!auth.ok) {
            res.statusCode = 401;
            res.end(JSON.stringify({ error: 'Missing or invalid session token. Please sign in again.' }));
            return;
          }
          const body = await readJsonBody(req);
          const title = (body.title || '').toString().trim();
          if (!title) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'A course title is required.' }));
            return;
          }
          const course = {
            id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            title,
            description: (body.description || '').toString(),
            category: (body.category || 'General').toString(),
            thumbnail: (body.thumbnail || '').toString(),
            creatorName: (body.creatorName || 'XE Creator').toString(),
            price: Math.max(0, Number(body.price) || 0),
            videoUrl: (body.videoUrl || '').toString(),
            lessons: Math.max(0, Number(body.lessons) || 0),
            publishedAt: Date.now(),
          };
          const current = (await kvGet('xe:catalog')) || [];
          const updated = [course, ...current];
          await kvSet('xe:catalog', updated);
          res.end(JSON.stringify({ course, catalog: updated }));
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to publish the course.' }));
        }
      });

      server.middlewares.use('/api/courses/enroll', async (req: any, res: any) => {
        res.setHeader('Content-Type', 'application/json');
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed.' }));
          return;
        }
        try {
          if (!process.env.REDIS_URL) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Course storage is not configured yet. Connect a Redis store to this project in Vercel.' }));
            return;
          }
          const auth = await verifyClerk(req);
          if (!auth.ok || !auth.userId) {
            res.statusCode = 401;
            res.end(JSON.stringify({ error: 'Missing or invalid session token. Please sign in again.' }));
            return;
          }
          const body = await readJsonBody(req);
          const courseId = (body.courseId || '').toString();
          if (!courseId) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'A courseId is required.' }));
            return;
          }
          const key = `xe:enroll:${auth.userId}`;
          const current: string[] = (await kvGet(key)) || [];
          const updated = current.includes(courseId) ? current : [...current, courseId];
          await kvSet(key, updated);
          res.end(JSON.stringify({ enrolledIds: updated }));
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to enroll in this course.' }));
        }
      });

      server.middlewares.use('/api/courses/enrollments', async (req: any, res: any) => {
        res.setHeader('Content-Type', 'application/json');
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed.' }));
          return;
        }
        try {
          if (!process.env.REDIS_URL) {
            res.end(JSON.stringify({ enrolledIds: [] }));
            return;
          }
          const auth = await verifyClerk(req);
          if (!auth.ok || !auth.userId) {
            res.end(JSON.stringify({ enrolledIds: [] }));
            return;
          }
          const enrolledIds = (await kvGet(`xe:enroll:${auth.userId}`)) || [];
          res.end(JSON.stringify({ enrolledIds }));
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to load enrollments.' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      clerkMetadataApi(),
      youtubeUploadApi(),
      youtubeUploadChunkApi(),
      coursesDevApi(),
      cleanHtmlUrls(),
    ],
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
