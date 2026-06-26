// src/lib/seo/siteConfig.ts
// SEO Step: INDEX (canonical/identity) — single source of truth for the
// origin, brand identity, and locale map. Every SEO primitive (SEOHead,
// JSON-LD, sitemap, hreflang) reads from here so the site speaks with one
// consistent voice to search engines. Change the domain in ONE place.

export const SITE = {
  // Canonical origin. No trailing slash. Used to build absolute URLs —
  // search engines index absolute, not relative, canonicals.
  origin: 'https://www.xeacademy.com',
  name: 'XE Academy',
  legalName: 'XE Academy',
  // Default social share image (1200x630). Absolute URL required by scrapers.
  defaultImage: '/og-image.png',
  twitter: '@xeacademy',
  description:
    'Where creators, brands & learners grow together. Build courses, go live, and reach your audience with XE Academy.',
} as const;

// SEO Step: INDEX (internationalization) — the locale table powers hreflang.
// `default: true` marks the x-default target. Add locales here as you ship
// translated routes; hreflang + sitemap pick them up automatically.
// Convention: a non-default locale lives under a path prefix (e.g. /es/courses).
export interface Locale {
  // BCP-47 tag emitted in hreflang (e.g. "en", "es-MX", "hi-IN").
  hreflang: string;
  // URL path prefix for this locale ('' for the default, no leading slash).
  prefix: string;
  // Human label (for language switchers, not SEO).
  label: string;
  default?: boolean;
}

export const LOCALES: Locale[] = [
  { hreflang: 'en', prefix: '', label: 'English', default: true },
  // Activate as translations ship — hreflang/sitemap require no further code:
  // { hreflang: 'es', prefix: 'es', label: 'Español' },
  // { hreflang: 'hi-IN', prefix: 'hi', label: 'हिन्दी' },
  // { hreflang: 'pt-BR', prefix: 'pt', label: 'Português (Brasil)' },
];

export const DEFAULT_LOCALE = LOCALES.find((l) => l.default) ?? LOCALES[0];

/** Build an absolute, canonical URL from a root-relative path. */
export function absoluteUrl(path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.origin}${clean === '/' ? '/' : clean.replace(/\/$/, '')}`;
}

/** Prefix a path for a locale: ('es','/courses') -> '/es/courses'. */
export function localizedPath(prefix: string, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return prefix ? `/${prefix}${clean === '/' ? '' : clean}` : clean;
}
