/**
 * api/sitemap.ts — SEO Step: DISCOVERY
 * Serves a scalable sitemap index plus focused URL sitemaps for static pages,
 * published courses, and blog content. Search engines discover public URLs here
 * before crawling them, so private app routes stay out of the index flow.
 */

import { createClient } from 'redis';

const SITE_ORIGIN = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://www.xeacademy.com').replace(/\/$/, '');
const CATALOG_KEY = 'xe:catalog';
const BLOG_KEY = 'xe:blog';

const LOCALES = [
  { hreflang: 'en', prefix: '', default: true },
  // Add shipped translations here, e.g. { hreflang: 'hi-IN', prefix: 'hi' }.
];

const STATIC_ROUTES = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/courses', priority: 0.9, changefreq: 'daily' },
  { path: '/documentation', priority: 0.6, changefreq: 'weekly' },
];

let clientPromise: Promise<any> | null = null;

async function getRedis() {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (!clientPromise) {
    const client = createClient({ url });
    clientPromise = client.connect().then(() => client);
  }
  return clientPromise;
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char] as string),
  );
}

function absoluteUrl(path: string) {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_ORIGIN}${clean === '/' ? '/' : clean.replace(/\/$/, '')}`;
}

function localizedPath(prefix: string, path: string) {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return prefix ? `/${prefix}${clean === '/' ? '' : clean}` : clean;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function coursePath(course: { id: string; title?: string }) {
  const titleSlug = course.title ? slugify(course.title) : '';
  return `/courses/${titleSlug ? `${titleSlug}-${course.id}` : course.id}`;
}

function blogPath(post: { slug?: string; id?: string }) {
  return `/blog/${post.slug || post.id}`;
}

function localizedAlternates(path: string) {
  if (LOCALES.length <= 1) return '';
  const links = LOCALES.map(
    (locale) =>
      `    <xhtml:link rel="alternate" hreflang="${locale.hreflang}" href="${escapeXml(
        absoluteUrl(localizedPath(locale.prefix, path)),
      )}" />`,
  );
  const fallback = LOCALES.find((locale) => locale.default) || LOCALES[0];
  links.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(
      absoluteUrl(localizedPath(fallback.prefix, path)),
    )}" />`,
  );
  return `\n${links.join('\n')}`;
}

function urlEntry(path: string, lastmod: string, changefreq: string, priority: number) {
  return (
    `  <url>\n` +
    `    <loc>${escapeXml(absoluteUrl(path))}</loc>\n` +
    `    <lastmod>${lastmod}</lastmod>\n` +
    `    <changefreq>${changefreq}</changefreq>\n` +
    `    <priority>${priority.toFixed(1)}</priority>` +
    `${localizedAlternates(path)}\n` +
    `  </url>`
  );
}

function xmlUrlset(entries: string[]) {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    `${entries.join('\n')}\n` +
    `</urlset>\n`
  );
}

function xmlIndex(today: string) {
  const sitemaps = ['/sitemap-static.xml', '/sitemap-courses.xml', '/sitemap-blog.xml'];
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemaps
      .map((path) => `  <sitemap>\n    <loc>${escapeXml(absoluteUrl(path))}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`)
      .join('\n') +
    `\n</sitemapindex>\n`
  );
}

function sendXml(res: any, xml: string) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
}

export default async function handler(req: any, res: any) {
  const type = (req.query?.type || 'index').toString();
  const today = new Date().toISOString().slice(0, 10);

  if (type === 'index') {
    sendXml(res, xmlIndex(today));
    return;
  }

  const entries: string[] = [];

  if (type === 'static') {
    STATIC_ROUTES.forEach((route) => entries.push(urlEntry(route.path, today, route.changefreq, route.priority)));
    sendXml(res, xmlUrlset(entries));
    return;
  }

  try {
    const redis = await getRedis();

    if (type === 'courses') {
      const raw = redis ? ((await redis.get(CATALOG_KEY)) as string | null) : null;
      const catalog: Array<{ id: string; title?: string; publishedAt?: number }> = raw ? JSON.parse(raw) : [];
      catalog.slice(0, 49_000).forEach((course) => {
        if (!course?.id) return;
        const lastmod = course.publishedAt ? new Date(course.publishedAt).toISOString().slice(0, 10) : today;
        entries.push(urlEntry(coursePath(course), lastmod, 'weekly', 0.8));
      });
      sendXml(res, xmlUrlset(entries));
      return;
    }

    if (type === 'blog') {
      const raw = redis ? ((await redis.get(BLOG_KEY)) as string | null) : null;
      const posts: Array<{ slug?: string; id?: string; updatedAt?: number; publishedAt?: number }> = raw ? JSON.parse(raw) : [];
      posts.slice(0, 49_000).forEach((post) => {
        if (!post?.slug && !post?.id) return;
        const stamp = post.updatedAt || post.publishedAt;
        const lastmod = stamp ? new Date(stamp).toISOString().slice(0, 10) : today;
        entries.push(urlEntry(blogPath(post), lastmod, 'weekly', 0.7));
      });
      sendXml(res, xmlUrlset(entries));
      return;
    }
  } catch {
    clientPromise = null;
  }

  sendXml(res, xmlUrlset(entries));
}
