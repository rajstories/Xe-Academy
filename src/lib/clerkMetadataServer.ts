import { createClerkClient, verifyToken } from '@clerk/backend';

const validRoles = new Set(['student', 'creator']);

export async function updateClerkPublicMetadata(token: string | undefined, body: { role?: string; categories?: unknown }) {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    return { status: 500, body: { error: 'Missing CLERK_SECRET_KEY. Add it to your server environment.' } };
  }

  if (!token) {
    return { status: 401, body: { error: 'Missing Clerk session token.' } };
  }

  const role = body.role;
  const categories = Array.isArray(body.categories) ? body.categories.filter((item): item is string => typeof item === 'string') : [];

  if (!role || !validRoles.has(role)) {
    return { status: 400, body: { error: 'Role must be student or creator.' } };
  }

  if (role === 'creator' && (categories.length < 1 || categories.length > 3)) {
    return { status: 400, body: { error: 'Creators must select 1 to 3 categories.' } };
  }

  const verified = await verifyToken(token, { secretKey });
  const userId = verified.sub;
  if (!userId) {
    return { status: 401, body: { error: 'Invalid Clerk session token.' } };
  }

  const clerkClient = createClerkClient({ secretKey });
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      role,
      categories: role === 'creator' ? categories : [],
    },
  });

  return { status: 200, body: { ok: true, role, categories: role === 'creator' ? categories : [] } };
}
