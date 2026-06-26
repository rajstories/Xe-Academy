# XE Academy — Technical SEO Guide

How the four search-engine stages (**Discovery → Crawl → Render → Index**) map onto
this codebase, what's already wired, and the two architectural decisions that are
yours to make.

---

## What's implemented (ready to use now)

| Pillar | File | Stage it solves |
| --- | --- | --- |
| Crawl steering | `public/robots.txt` | Discovery + Crawl |
| URL discovery feed | `api/sitemap.ts` → `/sitemap.xml` | Discovery |
| Routing / SPA fallback / asset caching | `vercel.json` | Crawl + Render + Perf |
| Per-page head (title, meta, OG, Twitter, canonical, hreflang) | `src/lib/seo/SEOHead.tsx` | Render + Index |
| Schema.org JSON-LD (Course, Org, Breadcrumb, FAQ) | `src/lib/seo/JsonLd.tsx` | Index |
| Single source of truth (origin, locales, org) | `src/lib/seo/siteConfig.ts` | Index |
| Public course catalog/detail routes | `src/components/PublicCourses.tsx`, `src/App.tsx` | Crawl + Render + Index |

### Usage — drop into any public page component

```tsx
import { SEOHead } from '../lib/seo/SEOHead';
import { JsonLd, courseSchema, breadcrumbSchema } from '../lib/seo/JsonLd';

function CoursePage({ course }: { course: CatalogCourse }) {
  const path = `/courses/${course.id}`;
  return (
    <>
      {/* RENDER + INDEX: per-page title/description/OG/canonical */}
      <SEOHead
        title={course.title}
        description={course.description}
        path={path}
        image={course.thumbnail}
        type="website"
      />
      {/* INDEX: Course rich result + breadcrumb trail */}
      <JsonLd data={courseSchema({
        name: course.title,
        description: course.description,
        url: path,
        price: course.price,
        currency: 'USD',
        providerName: course.creatorName,
        image: course.thumbnail,
      })} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Courses', path: '/courses' },
        { name: course.title, path },
      ])} />
      {/* ...page content... */}
    </>
  );
}
```

Render `organizationSchema()` once on the homepage. Use `faqSchema()` only where
real, visible Q&A exists on the page.

---

## Decision 1 — Rendering strategy (the big one)

**Current state:** Vite SPA. The browser downloads JS, then React paints into an
empty `<div id="root">`. There is **no SSR/SSG**.

**Why it matters:**
- Googlebot renders JS, so it *will* eventually see `SEOHead`/JSON-LD output — but
  on a slower, two-pass "render queue" that delays indexing.
- **Social/answer scrapers (WhatsApp, LinkedIn, Slack, X, many AI crawlers) do NOT
  run JS.** They only see the static tags in `index.html`. So every course page
  shares one generic preview until the route is prerendered.
- Client-only rendering hurts LCP (content waits on the JS bundle).

**Options, fastest-to-ship first:**

1. **Prerender public routes with `vite-react-ssg`** *(recommended).* Keep the
   authed dashboard as a SPA; statically generate `/`, `/courses`, `/courses/:id`,
   `/documentation` at build time. Per-page HTML (with real meta) ships to every
   crawler. Lowest blast radius — no framework migration.
2. **`react-snap` / Puppeteer prerender** as a post-build step. Quick, but flaky on
   dynamic/auth-aware routes; treat as a stopgap.
3. **Migrate marketing + catalog to Next.js (App Router)** and keep the dashboard
   as-is or port incrementally. Best long-term SEO + DX; largest effort.

> I did **not** auto-install any of these — switching rendering strategy is a
> hard-to-reverse architectural change. Tell me which option and I'll implement it.

---

## Public course pages

The public catalog is now available at `/courses`, with individual course detail
pages at `/courses/[title]-[id]`. The private dashboard catalog remains available
for enrolled-user workflows, but search engines get the public catalog/detail
surface.

The sitemap uses the same slug pattern, so course URLs discovered in
`/sitemap-courses.xml` resolve to live public pages once courses are published.

### Internal linking (un-orphaning deep pages) — pillar 1c

To minimize crawl depth (target: every course reachable in ≤3 clicks from home):
- Link the homepage course CTA to `/courses` with a real `<a href>` — crawlers
  follow this without JavaScript.
- Add a `RelatedCourses` block on each course page linking 4–6 sibling courses in
  the same `category` (creates a topical mesh).
- Add a category hub: `/courses?category=business` → keep it crawlable with real
  links, and self-canonical the filtered view to `/courses` to avoid thin dupes.
- Ensure the catalog grid uses anchor tags so link equity flows to detail pages.

---

## Pillar 5 — Core Web Vitals checklist

**LCP (largest contentful paint) — your biggest risk today.**
- [ ] `public/hero-img-2.png` (1.5 MB) and `hero-img-3.png` (1.3 MB) → convert to
      **WebP/AVIF** and resize to actual display size. Target < 150 KB each.
- [ ] Serve a responsive `srcset`/`sizes` for the hero; add `fetchpriority="high"`
      to the LCP image and **do not** lazy-load it.
- [ ] `hero-video.mp4` (4.1 MB) → `preload="none"`, a lightweight poster image, and
      load the video only after first paint (or on interaction).
- [ ] Preload the LCP image: `<link rel="preload" as="image" ...>` in `index.html`.

**CLS (layout shift).**
- [ ] Set explicit `width`/`height` (or `aspect-ratio`) on every `<img>` and the
      course thumbnails so the grid doesn't reflow as images load.
- [ ] Reserve space for the sticky header / any async banners.
- [ ] Self-host fonts with `font-display: swap` and preloaded `woff2` to avoid
      FOUT-driven shifts (currently relying on system/default fonts — verify).

**INP (interactivity).**
- [ ] Code-split heavy routes with `React.lazy` + `Suspense` (the dashboard,
      `recharts`, `react-player`, `framer-motion` views) so the landing bundle
      stays small. Currently everything is in one bundle (~280 KB JS).
- [ ] Defer non-critical third-party scripts (analytics) with `defer`/`async`.
- [ ] Avoid long tasks on the main thread during initial load.

**Verify:** run Lighthouse on `/` and a course page, and watch field data in
Google Search Console → Core Web Vitals after deploy.

---

## Post-deploy verification

1. `https://www.xeacademy.com/robots.txt` returns the file.
2. `https://www.xeacademy.com/sitemap.xml` returns valid XML (test in GSC →
   Sitemaps → Submit).
3. Rich Results Test (`search.google.com/test/rich-results`) on a course page →
   Course + Breadcrumb valid.
4. Facebook Sharing Debugger / LinkedIn Post Inspector → confirm per-page OG image
   (this is what fails until Decision 1 is resolved).
5. GSC → URL Inspection → "Test live URL" → confirm Google sees rendered content.
