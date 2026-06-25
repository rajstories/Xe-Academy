import { updateClerkPublicMetadata } from '../../src/lib/clerkMetadataServer';

async function readRequestBody(req: any) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody ? JSON.parse(rawBody) : {};
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const body = await readRequestBody(req);
    const result = await updateClerkPublicMetadata(token, body);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Clerk metadata update failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to update metadata.',
    });
  }
}
