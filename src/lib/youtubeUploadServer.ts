import { verifyToken } from '@clerk/backend';

/**
 * Server-side scaffold for white-labeled video uploads backed by the YouTube Data API.
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
 *
 * Note on quota: each upload costs ~1600 units of the default 10,000/day quota (~6 uploads/day)
 * until you request an increase from Google.
 */

export interface CreateUploadBody {
  title?: string;
  description?: string;
  contentType?: string;
  contentLength?: number;
}

interface Result {
  status: number;
  body: Record<string, unknown>;
}

export async function createResumableUpload(token: string | undefined, body: CreateUploadBody): Promise<Result> {
  const clientId = process.env.YT_CLIENT_ID;
  const clientSecret = process.env.YT_CLIENT_SECRET;
  const refreshToken = process.env.YT_REFRESH_TOKEN;
  const clerkSecret = process.env.CLERK_SECRET_KEY;

  if (!clientId || !clientSecret || !refreshToken) {
    return {
      status: 500,
      body: {
        error:
          'Video upload is not configured yet. Add YT_CLIENT_ID, YT_CLIENT_SECRET, and YT_REFRESH_TOKEN to your server environment.',
      },
    };
  }

  // Only allow signed-in users (creators) to initiate uploads when Clerk is configured.
  if (clerkSecret) {
    if (!token) {
      return { status: 401, body: { error: 'Missing session token. Please sign in again.' } };
    }
    try {
      const verified = await verifyToken(token, { secretKey: clerkSecret });
      if (!verified.sub) {
        return { status: 401, body: { error: 'Invalid session token. Please sign in again.' } };
      }
    } catch {
      return { status: 401, body: { error: 'Invalid session token. Please sign in again.' } };
    }
  }

  const title = (body.title || 'Untitled lesson').slice(0, 100);
  const description = (body.description || '').slice(0, 5000);
  const contentType = body.contentType || 'video/*';
  const contentLength = body.contentLength;

  if (!contentLength || contentLength <= 0) {
    return { status: 400, body: { error: 'A valid file size is required to start the upload.' } };
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
      return { status: 502, body: { error: 'Could not authorize with the video service.', detail: await tokenRes.text() } };
    }
    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenJson.access_token) {
      return { status: 502, body: { error: 'Authorization response did not include an access token.' } };
    }
    accessToken = tokenJson.access_token;
  } catch (error) {
    return { status: 502, body: { error: error instanceof Error ? error.message : 'Authorization failed.' } };
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
      }
    );

    if (!initRes.ok) {
      return { status: 502, body: { error: 'The video service rejected the upload request.', detail: await initRes.text() } };
    }

    const uploadUrl = initRes.headers.get('location');
    if (!uploadUrl) {
      return { status: 502, body: { error: 'The video service did not return an upload URL.' } };
    }

    return { status: 200, body: { uploadUrl } };
  } catch (error) {
    return { status: 502, body: { error: error instanceof Error ? error.message : 'Failed to start the upload.' } };
  }
}
