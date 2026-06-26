/**
 * Publishes a creator's course to the shared catalog (Upstash Redis via
 * KV_REST_API_URL/KV_REST_API_TOKEN — see api/courses/list.ts for details).
 * Requires a signed-in Clerk session when CLERK_SECRET_KEY is configured.
 */

async function readRequestBody(req: any) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

const CATALOG_KEY = 'xe:catalog';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;
    if (!kvUrl || !kvToken) {
      res.status(500).json({ error: 'Course storage is not configured yet. Connect a KV/Redis store to this project in Vercel.' });
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
    const title = (body.title || '').toString().trim();
    if (!title) {
      res.status(400).json({ error: 'A course title is required.' });
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

    const getRes = await fetch(`${kvUrl}/get/${CATALOG_KEY}`, { headers: { Authorization: `Bearer ${kvToken}` } });
    const getData = (await getRes.json().catch(() => ({}))) as { result?: string | null };
    const current = getData.result ? JSON.parse(getData.result) : [];
    const updated = [course, ...current];

    const setRes = await fetch(`${kvUrl}/set/${CATALOG_KEY}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}` },
      body: JSON.stringify(updated),
    });
    if (!setRes.ok) {
      res.status(502).json({ error: 'Failed to save the course to storage.', detail: await setRes.text() });
      return;
    }

    res.status(200).json({ course, catalog: updated });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to publish the course.' });
  }
}
