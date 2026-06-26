'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Clock, GraduationCap, Search, Sparkles, Star, User } from 'lucide-react';
import { CatalogCourse } from '../lib/courseStore';
import { SEOHead } from '../lib/seo/SEOHead';
import { JsonLd, breadcrumbSchema, courseSchema, faqSchema } from '../lib/seo/JsonLd';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function coursePath(course: Pick<CatalogCourse, 'id' | 'title'>) {
  const titleSlug = slugify(course.title);
  return `/courses/${titleSlug ? `${titleSlug}-${course.id}` : course.id}`;
}

function courseIdFromSlug(slug: string) {
  const parts = slug.split('-');
  return parts[parts.length - 1] || slug;
}

function priceLabel(price: number) {
  return price <= 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`;
}

function PublicCoursesLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="aspect-video animate-pulse bg-slate-100" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
            <div className="h-5 w-4/5 animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PublicCoursesShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-indigo-600">
            <ArrowLeft size={17} /> Back to XE Academy
          </a>
          <a href="/gateway" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-95">
            Get Started
          </a>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">{children}</main>
    </div>
  );
}

export function PublicCourseCatalogPage() {
  const [catalog, setCatalog] = useState<CatalogCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/courses/list');
        const data = await response.json().catch(() => ({}));
        if (!cancelled && Array.isArray(data.catalog)) setCatalog(data.catalog);
      } catch {
        if (!cancelled) setCatalog([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return catalog;
    return catalog.filter(
      (course) =>
        course.title.toLowerCase().includes(normalized) ||
        course.category.toLowerCase().includes(normalized) ||
        course.creatorName.toLowerCase().includes(normalized),
    );
  }, [catalog, query]);

  return (
    <PublicCoursesShell>
      {/* Render + Index: public catalog metadata, canonical, OG, Twitter. */}
      <SEOHead
        title="Explore Courses"
        description="Browse public XE Academy courses from global creators across development, design, business, AI, and creative skills."
        path="/courses"
        enableHreflang
      />
      {/* Index: visible FAQ content summarized for answer engines. */}
      <JsonLd
        data={faqSchema([
          { question: 'Can I preview XE Academy courses?', answer: 'Public course pages show the creator, category, lesson count, description, and enrollment call to action.' },
          { question: 'Are XE Academy courses online?', answer: 'XE Academy courses are delivered online with video lessons, live sessions, notes, and community features depending on the course.' },
        ])}
      />
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Courses', path: '/courses' }])} />

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-600">Course Catalog</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">Explore XE Academy courses</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Discover globally accessible courses from creators teaching software, design, business, AI, and modern creative skills.
          </p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search courses or creators"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
      </section>

      <section className="mt-10">
        {loading ? (
          <PublicCoursesLoading />
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-indigo-300" />
            <h2 className="mt-4 text-lg font-extrabold text-slate-950">Courses are being published</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Creator-published courses will appear here as public, crawlable pages with rich metadata.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((course) => (
              <a
                key={course.id}
                href={coursePath(course)}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/10"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
                      <GraduationCap size={42} />
                    </div>
                  )}
                  <span className="absolute right-3 top-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                    {priceLabel(course.price)}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{course.category}</p>
                  <h2 className="mt-2 line-clamp-2 text-lg font-extrabold leading-snug text-slate-950 group-hover:text-indigo-600">{course.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{course.description || 'A premium XE Academy course from a global creator.'}</p>
                  <div className="mt-4 flex items-center justify-between gap-4 text-xs font-bold text-slate-500">
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <User size={14} className="shrink-0" />
                      <span className="truncate">{course.creatorName}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen size={14} /> {course.lessons} lessons
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </PublicCoursesShell>
  );
}

export function PublicCourseDetailPage({ slug }: { slug: string }) {
  const [catalog, setCatalog] = useState<CatalogCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const id = courseIdFromSlug(slug);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/courses/list');
        const data = await response.json().catch(() => ({}));
        if (!cancelled && Array.isArray(data.catalog)) setCatalog(data.catalog);
      } catch {
        if (!cancelled) setCatalog([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const course = catalog.find((item) => item.id === id);
  const path = course ? coursePath(course) : `/courses/${slug}`;

  if (loading) {
    return (
      <PublicCoursesShell>
        <SEOHead title="Loading Course" description="Loading XE Academy course details." path={path} noindex />
        <PublicCoursesLoading />
      </PublicCoursesShell>
    );
  }

  if (!course) {
    return (
      <PublicCoursesShell>
        <SEOHead title="Course Not Found" description="This XE Academy course could not be found." path={path} noindex />
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
          <h1 className="text-3xl font-extrabold text-slate-950">Course not found</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">The course may have been unpublished or moved.</p>
          <a href="/courses" className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white">
            Browse courses <ArrowRight size={16} />
          </a>
        </div>
      </PublicCoursesShell>
    );
  }

  const syllabus = [`${course.lessons || 1} structured lessons`, 'Video learning workflow', 'Creator-led course resources'];

  return (
    <PublicCoursesShell>
      {/* Render + Index: course-specific title, description, canonical, OG. */}
      <SEOHead
        title={course.title}
        description={course.description || `Learn ${course.title} on XE Academy with ${course.creatorName}.`}
        path={path}
        image={course.thumbnail}
        enableHreflang
      />
      {/* Index: Course rich result with provider, syllabus, and pricing. */}
      <JsonLd
        data={courseSchema({
          name: course.title,
          description: course.description || `Learn ${course.title} on XE Academy.`,
          url: path,
          price: course.price,
          currency: 'INR',
          providerName: course.creatorName || 'XE Academy',
          image: course.thumbnail,
          syllabus,
        })}
      />
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Courses', path: '/courses' }, { name: course.title, path }])} />

      <article className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-600">{course.category}</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">{course.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            {course.description || 'A premium XE Academy course built for modern global learners.'}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500">
            <span className="inline-flex items-center gap-2"><User size={16} /> {course.creatorName}</span>
            <span className="inline-flex items-center gap-2"><BookOpen size={16} /> {course.lessons} lessons</span>
            <span className="inline-flex items-center gap-2"><Star size={16} className="fill-amber-400 text-amber-400" /> Premium course</span>
          </div>

          <section className="mt-10 border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-extrabold text-slate-950">What you will learn</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {syllabus.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-900/8">
            <div className="aspect-video bg-slate-100">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" loading="eager" decoding="async" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
                  <GraduationCap size={48} />
                </div>
              )}
            </div>
            <div className="p-6">
              <p className="text-3xl font-extrabold text-slate-950">{priceLabel(course.price)}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Create an account or sign in to enroll and continue learning inside your student portal.</p>
              <a href="/gateway" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:scale-[0.98]">
                Enroll now <ArrowRight size={17} />
              </a>
              <a href="/courses" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50">
                <ArrowLeft size={16} /> Back to catalog
              </a>
            </div>
          </div>
        </aside>
      </article>
    </PublicCoursesShell>
  );
}
