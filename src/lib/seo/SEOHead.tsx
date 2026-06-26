// src/lib/seo/SEOHead.tsx
// SEO Step: RENDER + INDEX — a dependency-free <head> manager for a client
// rendered SPA. It imperatively upserts <title>, meta, canonical, and hreflang
// tags whenever a page mounts or its data changes, so each route exposes
// accurate, self-referencing metadata instead of the static index.html shell.
//
// ── Honest limitation ──────────────────────────────────────────────────────
// Tags written here appear only AFTER JavaScript runs. Googlebot renders JS and
// will see them; non-rendering social scrapers (WhatsApp/LinkedIn/Slack/X) will
// NOT. For per-page social previews you must also prerender/SSR the route (see
// docs/SEO.md). This component is correct and necessary either way.

import { useEffect } from 'react';
import { SITE, LOCALES, DEFAULT_LOCALE, absoluteUrl, localizedPath } from './siteConfig';

export interface SEOHeadProps {
  /** Page <title>. " — XE Academy" is appended unless `titleOverride` is set. */
  title: string;
  description: string;
  /** Root-relative path of THIS page, e.g. "/courses/react-101". Drives canonical + hreflang. */
  path: string;
  /** Absolute or root-relative share image. Defaults to the brand OG image. */
  image?: string;
  /** og:type — "website" for marketing pages, "article" for blog/docs. */
  type?: 'website' | 'article' | 'profile';
  /** Set true on private/thin pages you never want indexed. */
  noindex?: boolean;
  /** Use the title verbatim (no brand suffix) — e.g. for the homepage. */
  titleOverride?: boolean;
  /** Emit hreflang alternates. Enable once localized routes exist. */
  enableHreflang?: boolean;
}

// Upsert a <meta> by name or property so we never duplicate tags across renders.
function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

// Upsert a <link rel=...> keyed by rel+hreflang so each alternate is unique.
function upsertLink(rel: string, href: string, hreflang?: string) {
  const sel = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(sel);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (hreflang) el.setAttribute('hreflang', hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function SEOHead({
  title,
  description,
  path,
  image = SITE.defaultImage,
  type = 'website',
  noindex = false,
  titleOverride = false,
  enableHreflang = false,
}: SEOHeadProps) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const fullTitle = titleOverride ? title : `${title} — ${SITE.name}`;
    const canonical = absoluteUrl(path);
    const imageUrl = image.startsWith('http') ? image : absoluteUrl(image);

    // RENDER: page title is the strongest on-page relevance signal.
    document.title = fullTitle;

    // INDEX: description influences the SERP snippet (not ranking, but CTR).
    upsertMeta('name', 'description', description);

    // INDEX: control indexability per-page. noindex on private/thin routes.
    upsertMeta(
      'name',
      'robots',
      noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    );

    // INDEX: self-referencing canonical collapses duplicate/param URLs to one.
    upsertLink('canonical', canonical);

    // RENDER: Open Graph for link unfurls (seen by JS-rendering crawlers).
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', SITE.name);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:locale', DEFAULT_LOCALE.hreflang.replace('-', '_'));

    // RENDER: Twitter/X card.
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:site', SITE.twitter);
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', imageUrl);

    // INDEX (i18n): hreflang maps each locale's equivalent URL to prevent
    // international duplicate-content penalties. x-default points at the
    // language selector / default locale.
    if (enableHreflang && LOCALES.length > 1) {
      LOCALES.forEach((loc) => {
        upsertLink('alternate', absoluteUrl(localizedPath(loc.prefix, path)), loc.hreflang);
      });
      upsertLink('alternate', absoluteUrl(localizedPath(DEFAULT_LOCALE.prefix, path)), 'x-default');
    }
  }, [title, description, path, image, type, noindex, titleOverride, enableHreflang]);

  return null;
}
