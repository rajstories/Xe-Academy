/**
 * Public, shared course catalog — backed by Upstash Redis (via Vercel KV / the
 * Upstash Marketplace integration), so a course published on one device shows
 * up for every student on any device. Uses the REST API directly rather than
 * the (now deprecated) @vercel/kv package, so it works with either the legacy
 * Vercel KV integration or the newer Upstash Marketplace one — both expose the
 * same KV_REST_API_URL / KV_REST_API_TOKEN REST endpoint.
 *
 * Required environment variables (Vercel Storage tab → connect a KV/Redis
 * store to this project, which adds these automatically):
 *   KV_REST_API_URL
 *   KV_REST_API_TOKEN
 */

const CATALOG_KEY = 'xe:catalog';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (!kvUrl || !kvToken) {
    // No store connected yet — degrade to an empty catalog instead of erroring,
    // so the app still loads while the creator/owner finishes setup.
    res.status(200).json({ catalog: [] });
    return;
  }

  try {
    const kvRes = await fetch(`${kvUrl}/get/${CATALOG_KEY}`, {
      headers: { Authorization: `Bearer ${kvToken}` },
    });
    const data = (await kvRes.json().catch(() => ({}))) as { result?: string | null };
    const catalog = data.result ? JSON.parse(data.result) : [];
    res.status(200).json({ catalog });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to load the catalog.' });
  }
}
