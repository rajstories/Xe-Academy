/**
 * White-labeled video upload, backed by the YouTube Data API (server-side only).
 * Inlined (no cross-directory import) so Vercel's function bundler reliably
 * includes everything this route needs — a relative import into ../../src/lib
 * was silently dropped from the deployed bundle, causing ERR_MODULE_NOT_FOUND.
 *
 * The browser never sees the YouTube OAuth credentials. Instead:
 *   1. The client asks this endpoint to start an upload (passing the file's size + type).
 *   2. We exchange a stored refresh token for a short-lived access token.
 *   3. We open a *resumable* upload session with YouTube and hand the one-time
 *      session URL back to the client, which PUTs the bytes directly to Google.
 *      (Large video bytes never pass through our serverless function.)
 *
 * Required environment variables (add these in Vercel / your server env):
 *   YT_CLIENT_ID       OAuth 2.0 client id for a Google Cloud project with the YouTube Data API enabled.
 *   YT_CLIENT_SECRET   OAuth 2.0 client secret.
 *   YT_REFRESH_TOKEN   A refresh token for the channel owner, generated once with the
 *                      https://www.googleapis.com/auth/youtube.upload scope.
 *
 * Optional:
 *   CLERK_SECRET_KEY   When present, we verify the caller is a signed-in user before starting an upload.
 */

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
    const clientId = process.env.YT_CLIENT_ID;
    const clientSecret = process.env.YT_CLIENT_SECRET;
    const refreshToken = process.env.YT_REFRESH_TOKEN;
    const clerkSecret = process.env.CLERK_SECRET_KEY;

    if (!clientId || !clientSecret || !refreshToken) {
      res.status(500).json({
        error:
          'Video upload is not configured yet. Add YT_CLIENT_ID, YT_CLIENT_SECRET, and YT_REFRESH_TOKEN to your server environment.',
      });
      return;
    }

    // Only allow signed-in users (creators) to initiate uploads when Clerk is configured.
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
    const title = (body.title || 'Untitled lesson').toString().slice(0, 100);
    const description = (body.description || '').toString().slice(0, 5000);
    const contentType = body.contentType || 'video/*';
    const contentLength = body.contentLength;

    if (!contentLength || contentLength <= 0) {
      res.status(400).json({ error: 'A valid file size is required to start the upload.' });
      return;
    }

    // 1) Exchange the long-lived refresh token for a short-lived access token.
    let accessToken: string;
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });
      if (!tokenRes.ok) {
        res.status(502).json({ error: 'Could not authorize with the video service.', detail: await tokenRes.text() });
        return;
      }
      const tokenJson = (await tokenRes.json()) as { access_token?: string };
      if (!tokenJson.access_token) {
        res.status(502).json({ error: 'Authorization response did not include an access token.' });
        return;
      }
      accessToken = tokenJson.access_token;
    } catch (error) {
      res.status(502).json({ error: error instanceof Error ? error.message : 'Authorization failed.' });
      return;
    }

    // 2) Open a resumable upload session. The video is created unlisted and embeddable.
    try {
      const initRes = await fetch(
        'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Upload-Content-Length': String(contentLength),
            'X-Upload-Content-Type': contentType,
          },
          body: JSON.stringify({
            snippet: { title, description, categoryId: '27' /* Education */ },
            status: { privacyStatus: 'unlisted', selfDeclaredMadeForKids: false, embeddable: true },
          }),
        },
      );

      if (!initRes.ok) {
        res.status(502).json({ error: 'The video service rejected the upload request.', detail: await initRes.text() });
        return;
      }

      const uploadUrl = initRes.headers.get('location');
      if (!uploadUrl) {
        res.status(502).json({ error: 'The video service did not return an upload URL.' });
        return;
      }

      res.status(200).json({ uploadUrl });
    } catch (error) {
      res.status(502).json({ error: error instanceof Error ? error.message : 'Failed to start the upload.' });
    }
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unable to start the video upload.' });
  }
}
