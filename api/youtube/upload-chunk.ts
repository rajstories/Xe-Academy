/**
 * Relays one chunk of a video file from the browser to a YouTube resumable
 * upload session, server-side. The YouTube Data API does not allow direct
 * browser-to-Google uploads (no CORS support on the upload endpoint), so the
 * browser sends each chunk to this same-origin route instead, and we forward
 * it to Google over a server-to-server request, which isn't subject to CORS.
 *
 * Chunks are capped client-side (~4MB) to stay under Vercel's request body
 * limit for serverless functions, and relayed using the resumable upload
 * protocol's Content-Range header so Google can reassemble the full file.
 */

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_CHUNK_BYTES = 4_500_000;

function getQueryParam(req: any, key: string): string {
  if (req.query && typeof req.query[key] === 'string') return req.query[key];
  const queryString = (req.url || '').split('?')[1] || '';
  return new URLSearchParams(queryString).get(key) || '';
}

async function readRawBody(req: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const uploadUrl = getQueryParam(req, 'uploadUrl');
    const start = Number(getQueryParam(req, 'start'));
    const end = Number(getQueryParam(req, 'end'));
    const total = Number(getQueryParam(req, 'total'));

    if (!uploadUrl || !uploadUrl.startsWith('https://www.googleapis.com/')) {
      res.status(400).json({ error: 'Missing or invalid upload session URL.' });
      return;
    }
    if (![start, end, total].every((value) => Number.isFinite(value) && value >= 0) || end <= start || end > total) {
      res.status(400).json({ error: 'Invalid chunk range.' });
      return;
    }
    if (end - start > MAX_CHUNK_BYTES) {
      res.status(400).json({ error: 'Chunk too large.' });
      return;
    }

    const chunk = await readRawBody(req);
    if (chunk.length !== end - start) {
      res.status(400).json({ error: 'Chunk size does not match the declared range.' });
      return;
    }

    const googleRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Length': String(chunk.length),
        'Content-Range': `bytes ${start}-${end - 1}/${total}`,
      },
      body: chunk,
    });

    if (googleRes.status === 308) {
      res.status(200).json({ done: false });
      return;
    }

    if (googleRes.ok) {
      const data = await googleRes.json().catch(() => ({}) as Record<string, unknown>);
      res.status(200).json({ done: true, id: (data as { id?: string }).id });
      return;
    }

    res.status(502).json({ error: 'The video service rejected this chunk.', detail: await googleRes.text() });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to relay this chunk.' });
  }
}
