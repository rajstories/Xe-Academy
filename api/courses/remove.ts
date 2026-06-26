/**
 * Removes a course from the shared catalog (Redis via REDIS_URL), so it
 * stops showing up in Browse Courses. Deliberately does NOT touch any
 * student's enrollment snapshots (xe:enroll:*) — students who already
 * enrolled keep access to the course in My Courses even after this runs.
 */

import { createClient } from 'redis';

const CATALOG_KEY = 'xe:catalog';

let clientPromise: Promise<any> | null = null;
async function getRedis() {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (!clientPromise) {
    const client = createClient({ url });
    clientPromise = client.connect().then(() => client);
  }
  return clientPromise;
}

async function readRequestBody(req: any) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const redis = await getRedis();
    if (!redis) {
      res.status(500).json({ error: 'Course storage is not configured yet. Connect a Redis store to this project in Vercel.' });
      return;
    }

    const clerkSecret = process.env.CLERK_SECRET_KEY;
    if (clerkSecret) {
      const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
      if (!token) {
        res.status(401).json({ error: 'Missing session token. Please sign in again.' });
        return;
      }
      try {
        const { verifyToken } = await import('@clerk/backend');
        const verified = await verifyToken(token, { secretKey: clerkSecret });
        if (!verified.sub) {
          res.status(401).json({ error: 'Invalid session token. Please sign in again.' });
          return;
        }
      } catch {
        res.status(401).json({ error: 'Invalid session token. Please sign in again.' });
        return;
      }
    }

    const body = await readRequestBody(req);
    const courseId = (body.courseId || '').toString();
    if (!courseId) {
      res.status(400).json({ error: 'A courseId is required.' });
      return;
    }

    const raw = (await redis.get(CATALOG_KEY)) as string | null;
    const current: any[] = raw ? JSON.parse(raw) : [];
    const updated = current.filter((c) => c.id !== courseId);
    await redis.set(CATALOG_KEY, JSON.stringify(updated));

    res.status(200).json({ catalog: updated });
  } catch (error) {
    clientPromise = null;
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to remove the course.' });
  }
}
