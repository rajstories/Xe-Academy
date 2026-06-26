/**
 * Returns the signed-in student's enrolled course ids from Redis (REDIS_URL),
 * so My Courses shows the same enrollments on any device.
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

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const redis = await getRedis();
    if (!redis) {
      res.status(200).json({ enrolledIds: [] });
      return;
    }

    const clerkSecret = process.env.CLERK_SECRET_KEY;
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) {
      res.status(200).json({ enrolledIds: [] });
      return;
    }

    let userId: string | undefined;
    try {
      const { verifyToken } = await import('@clerk/backend');
      const verified = await verifyToken(token, { secretKey: clerkSecret || '' });
      userId = verified.sub;
    } catch {
      res.status(200).json({ enrolledIds: [] });
      return;
    }
    if (!userId) {
      res.status(200).json({ enrolledIds: [] });
      return;
    }

    const raw = (await redis.get(`xe:enroll:${userId}`)) as string | null;
    const enrolledIds = raw ? JSON.parse(raw) : [];
    res.status(200).json({ enrolledIds });
  } catch (error) {
    clientPromise = null;
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to load enrollments.' });
  }
}
