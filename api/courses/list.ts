/**
 * Public, shared course catalog — backed by Redis (Vercel Marketplace "Redis"
 * product, connected via REDIS_URL), so a course published on one device
 * shows up for every student on any device.
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

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const redis = await getRedis();
    if (!redis) {
      // No store connected yet — degrade to an empty catalog instead of erroring.
      res.status(200).json({ catalog: [] });
      return;
    }
    const raw = (await redis.get(CATALOG_KEY)) as string | null;
    const catalog = raw ? JSON.parse(raw) : [];
    res.status(200).json({ catalog });
  } catch (error) {
    clientPromise = null;
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to load the catalog.' });
  }
}
