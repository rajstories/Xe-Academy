import { updateClerkPublicMetadata } from '../../src/lib/clerkMetadataServer';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const result = await updateClerkPublicMetadata(token, req.body || {});
    res.status(result.status).json(result.body);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unable to update metadata.' });
  }
}
