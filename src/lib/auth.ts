import { Role } from '../types';

export type AuthRole = Extract<Role, 'student' | 'creator'>;

export const creatorCategories = [
  'Web Development',
  'Design (UI/UX)',
  'Marketing',
  'Business & Entrepreneurship',
  'Photography & Video',
  'Data & AI',
  'Personal Development',
  'Music & Audio',
  'Writing',
  'Other',
];

export function getRoleDashboardPath(role?: string) {
  if (role === 'creator') return '/studio';
  if (role === 'admin') return '/admin';
  return '/dashboard';
}

export function getUserDisplayName(user?: {
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
}) {
  if (!user) return 'Learner';
  if (user.firstName) return user.firstName;
  if (user.fullName) return user.fullName.split(' ')[0] || 'Learner';
  return user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Learner';
}

export function getFullName(user?: {
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
}) {
  if (!user) return 'XE Learner';
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return name || user.fullName || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'XE Learner';
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'XE';
}

export function extractClerkError(error: unknown) {
  const maybeError = error as { errors?: Array<{ longMessage?: string; message?: string }>; message?: string };
  return maybeError.errors?.[0]?.longMessage || maybeError.errors?.[0]?.message || maybeError.message || 'Something went wrong. Please try again.';
}
