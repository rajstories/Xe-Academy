// src/lib/seo/JsonLd.tsx
// SEO Step: INDEX (rich results / AEO) — emits Schema.org JSON-LD so search and
// answer engines can parse entities (Course, Organization, Breadcrumb, FAQ) and
// award rich-result + featured-snippet real estate. JSON-LD is Google's
// preferred format and is read during the Index step after rendering.

import { SITE, absoluteUrl } from './siteConfig';

/** Injects a single <script type="application/ld+json"> block. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Pre-serialized, trusted, app-controlled data (no user HTML) — safe.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ── EducationalOrganization ────────────────────────────────────────────────
// INDEX: establishes the brand entity in Google's Knowledge Graph. Render once
// on the homepage. `sameAs` links consolidate your social profiles to the org.
export function organizationSchema(opts?: { sameAs?: string[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${SITE.origin}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    // Domain-as-one-word variant — helps Google associate the "xeacademy"
    // query (no space) with the same entity as "XE Academy" / "XE.Academy".
    alternateName: ['xeacademy', 'xeacademy.com', 'XE.Academy'],
    url: SITE.origin,
    logo: absoluteUrl('/brand/logo-icon-indigo.svg'),
    description: SITE.description,
    sameAs: opts?.sameAs ?? [],
  };
}

// ── Course ─────────────────────────────────────────────────────────────────
// INDEX: drives the Course rich result (title, provider, price). Google
// requires `name`, `description`, and `provider`. `offers` + `hasCourseInstance`
// unlock pricing and delivery-mode enhancements.
export interface CourseSchemaInput {
  name: string;
  description: string;
  url: string; // root-relative, e.g. /courses/react-101
  price?: number; // 0 => free
  currency?: string; // ISO 4217, e.g. "USD"
  providerName?: string; // creator/instructor or brand
  image?: string;
  syllabus?: string[]; // section/lesson titles
  language?: string; // BCP-47
  mode?: 'online' | 'onsite' | 'blended';
}

export function courseSchema(c: CourseSchemaInput) {
  const free = !c.price || c.price <= 0;
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: c.name,
    description: c.description,
    url: absoluteUrl(c.url),
    inLanguage: c.language ?? 'en',
    ...(c.image ? { image: absoluteUrl(c.image) } : {}),
    provider: {
      '@type': 'EducationalOrganization',
      name: c.providerName ?? SITE.name,
      sameAs: SITE.origin,
    },
    // Pricing rich result. Google needs a price + currency (0 for free).
    offers: {
      '@type': 'Offer',
      category: free ? 'Free' : 'Paid',
      price: free ? 0 : c.price,
      priceCurrency: c.currency ?? 'USD',
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(c.url),
    },
    // Delivery mode + a course instance (required by some Course enhancements).
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: c.mode ?? 'online',
      courseWorkload: c.syllabus?.length ? `PT${c.syllabus.length}H` : undefined,
    },
    // Syllabus as named sections improves topical understanding.
    ...(c.syllabus?.length
      ? {
          syllabusSections: c.syllabus.map((title, i) => ({
            '@type': 'Syllabus',
            name: title,
            position: i + 1,
          })),
        }
      : {}),
  };
}

// ── BreadcrumbList ─────────────────────────────────────────────────────────
// INDEX (architecture): shows the site hierarchy in the SERP and signals crawl
// depth/relationships. Pass the trail from home → ... → current page.
export interface Crumb {
  name: string;
  path: string; // root-relative
}

export function breadcrumbSchema(trail: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

// ── FAQPage ────────────────────────────────────────────────────────────────
// INDEX (AEO): captures answer-engine / "People also ask" real estate. Only use
// for genuine, visible Q&A on the page (Google penalizes hidden/marketing FAQ).
export interface QA {
  question: string;
  answer: string; // plain text or simple HTML
}

export function faqSchema(items: QA[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((qa) => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: { '@type': 'Answer', text: qa.answer },
    })),
  };
}
