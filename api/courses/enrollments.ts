/**
 * Returns the signed-in student's enrolled course ids from Upstash Redis,
 * so My Courses shows the same enrollments on any device.
 */

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;
    if (!kvUrl || !kvToken) {
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

    const key = `xe:enroll:${userId}`;
    const getRes = await fetch(`${kvUrl}/get/${key}`, { headers: { Authorization: `Bearer ${kvToken}` } });
    const data = (await getRes.json().catch(() => ({}))) as { result?: string | null };
    const enrolledIds = data.result ? JSON.parse(data.result) : [];
    res.status(200).json({ enrolledIds });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to load enrollments.' });
  }
}
