/**
 * Records a student's enrollment in a course, keyed by their Clerk user id,
 * in Upstash Redis (KV_REST_API_URL/KV_REST_API_TOKEN). This is what makes
 * "My Courses" show enrollments from any device the student signs into.
 */

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
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;
    if (!kvUrl || !kvToken) {
      res.status(500).json({ error: 'Course storage is not configured yet. Connect a KV/Redis store to this project in Vercel.' });
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
    const getRes = await fetch(`${kvUrl}/get/${key}`, { headers: { Authorization: `Bearer ${kvToken}` } });
    const getData = (await getRes.json().catch(() => ({}))) as { result?: string | null };
    const current: string[] = getData.result ? JSON.parse(getData.result) : [];
    const updated = current.includes(courseId) ? current : [...current, courseId];

    const setRes = await fetch(`${kvUrl}/set/${key}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}` },
      body: JSON.stringify(updated),
    });
    if (!setRes.ok) {
      res.status(502).json({ error: 'Failed to save the enrollment.', detail: await setRes.text() });
      return;
    }

    res.status(200).json({ enrolledIds: updated });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to enroll in this course.' });
  }
}
