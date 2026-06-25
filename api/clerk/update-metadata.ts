const validRoles = new Set(['student', 'creator']);

async function readRequestBody(req: any) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody ? JSON.parse(rawBody) : {};
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      res.status(500).json({ error: 'Missing CLERK_SECRET_KEY in Vercel Production environment.' });
      return;
    }

    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) {
      res.status(401).json({ error: 'Missing Clerk session token. Please sign in again.' });
      return;
    }

    const body = await readRequestBody(req);
    const role = body.role;
    const categories = Array.isArray(body.categories) ? body.categories.filter((item: unknown): item is string => typeof item === 'string') : [];

    if (!role || !validRoles.has(role)) {
      res.status(400).json({ error: 'Role must be student or creator.' });
      return;
    }

    if (role === 'creator' && (categories.length < 1 || categories.length > 3)) {
      res.status(400).json({ error: 'Creators must select 1 to 3 categories.' });
      return;
    }

    const { createClerkClient, verifyToken } = await import('@clerk/backend');
    const verified = await verifyToken(token, { secretKey });
    const userId = verified.sub;

    if (!userId) {
      res.status(401).json({ error: 'Invalid Clerk session token. Please sign in again.' });
      return;
    }

    const clerkClient = createClerkClient({ secretKey });
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
        categories: role === 'creator' ? categories : [],
      },
    });

    res.status(200).json({ ok: true, role, categories: role === 'creator' ? categories : [] });
  } catch (error) {
    console.error('Clerk metadata update failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to update onboarding metadata.',
    });
  }
}
