/**
 * Records a student's enrollment in a course, keyed by their Clerk user id,
 * in Redis (REDIS_URL). This is what makes "My Courses" show enrollments
 * from any device the student signs into.
 */

import { createClient } from 'redis';

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
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) {
      res.status(401).json({ error: 'Missing session token. Please sign in again.' });
      return;
    }

    let userId: string | undefined;
    try {
      const { verifyToken } = await import('@clerk/backend');
      const verified = await verifyToken(token, { secretKey: clerkSecret || '' });
      userId = verified.sub;
    } catch {
      res.status(401).json({ error: 'Invalid session token. Please sign in again.' });
      return;
    }
    if (!userId) {
      res.status(401).json({ error: 'Invalid session token. Please sign in again.' });
      return;
    }

    const body = await readRequestBody(req);
    const courseId = (body.courseId || '').toString();
    if (!courseId) {
      res.status(400).json({ error: 'A courseId is required.' });
      return;
    }

    const key = `xe:enroll:${userId}`;
    const raw = (await redis.get(key)) as string | null;
    const current: string[] = raw ? JSON.parse(raw) : [];
    const updated = current.includes(courseId) ? current : [...current, courseId];
    await redis.set(key, JSON.stringify(updated));

    res.status(200).json({ enrolledIds: updated });
  } catch (error) {
    clientPromise = null;
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to enroll in this course.' });
  }
}
