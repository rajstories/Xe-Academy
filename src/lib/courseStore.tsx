import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';

/**
 * Shared course store, backed by a server catalog (Redis via api/courses/*.ts)
 * so a course published on one device shows up for every student on any
 * device — localStorage alone can't do that, it's per-browser.
 *
 * Enrollments store a full snapshot of the course at enroll time, separate
 * from the live catalog. This is what guarantees that when a creator deletes
 * a course from the catalog (so it disappears from Browse Courses), students
 * who already enrolled keep access to it in My Courses.
 *
 * localStorage is still used as an instant-paint cache (so the UI isn't blank
 * while the first network request is in flight), but the server response is
 * always treated as the source of truth once it arrives.
 */

export interface CatalogCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  creatorName: string;
  price: number; // 0 = free
  videoUrl: string;
  lessons: number;
  publishedAt: number;
}

interface CourseStoreValue {
  catalog: CatalogCourse[];
  enrolledCourses: CatalogCourse[];
  publishCourse: (course: Omit<CatalogCourse, 'id' | 'publishedAt'>) => Promise<CatalogCourse>;
  removeCourse: (id: string) => Promise<void>;
  enroll: (id: string) => Promise<void>;
  isEnrolled: (id: string) => boolean;
  /** Looks in the live catalog first, then in the student's own enrolled snapshots
   *  (so a course removed from the catalog is still viewable for those enrolled). */
  getCourse: (id: string) => CatalogCourse | undefined;
  /** Session-scoped: which catalog course the student is currently viewing/watching. */
  activeCourseId: string | null;
  setActiveCourseId: (id: string | null) => void;
}

const CATALOG_KEY = 'xe.catalog.v1';
const ENROLL_KEY = 'xe.enrollments.v2';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const CourseStoreContext = createContext<CourseStoreValue | null>(null);

export function CourseStoreProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [catalog, setCatalog] = useState<CatalogCourse[]>(() => load(CATALOG_KEY, []));
  const [enrolledCourses, setEnrolledCourses] = useState<CatalogCourse[]>(() => load(ENROLL_KEY, []));
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));
  }, [catalog]);
  useEffect(() => {
    localStorage.setItem(ENROLL_KEY, JSON.stringify(enrolledCourses));
  }, [enrolledCourses]);

  // Pull the shared catalog from the server on mount so every device sees the same courses.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/courses/list');
        const data = await res.json().catch(() => ({}));
        if (!cancelled && Array.isArray(data.catalog)) setCatalog(data.catalog);
      } catch {
        // Network/server hiccup — keep showing the cached local catalog.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Pull this student's enrollment snapshots from the server so they follow the account, not the browser.
  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/courses/enrollments', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && Array.isArray(data.enrolledCourses)) setEnrolledCourses(data.enrolledCourses);
      } catch {
        // Network/server hiccup — keep showing the cached local enrollments.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, getToken]);

  const publishCourse = useCallback<CourseStoreValue['publishCourse']>(
    async (course) => {
      const token = await getToken();
      const res = await fetch('/api/courses/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(course),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to publish the course.');
      if (Array.isArray(data.catalog)) setCatalog(data.catalog);
      return data.course as CatalogCourse;
    },
    [getToken],
  );

  const removeCourse = useCallback(
    async (id: string) => {
      // Optimistic: hide it from the catalog immediately. Enrolled snapshots are untouched on purpose.
      setCatalog((current) => current.filter((c) => c.id !== id));
      const token = await getToken();
      const res = await fetch('/api/courses/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ courseId: id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to remove the course.');
      if (Array.isArray(data.catalog)) setCatalog(data.catalog);
    },
    [getToken],
  );

  const enroll = useCallback(
    async (id: string) => {
      // Optimistic: copy the catalog course into enrolled snapshots immediately.
      setEnrolledCourses((current) => {
        if (current.some((c) => c.id === id)) return current;
        const fromCatalog = catalog.find((c) => c.id === id);
        return fromCatalog ? [...current, fromCatalog] : current;
      });
      try {
        const token = await getToken();
        const res = await fetch('/api/courses/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ courseId: id }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && Array.isArray(data.enrolledCourses)) setEnrolledCourses(data.enrolledCourses);
      } catch {
        // Optimistic update already applied; will reconcile on next load.
      }
    },
    [getToken, catalog],
  );

  const isEnrolled = useCallback((id: string) => enrolledCourses.some((c) => c.id === id), [enrolledCourses]);
  const getCourse = useCallback(
    (id: string) => catalog.find((c) => c.id === id) ?? enrolledCourses.find((c) => c.id === id),
    [catalog, enrolledCourses],
  );

  const value = useMemo<CourseStoreValue>(
    () => ({
      catalog,
      enrolledCourses,
      publishCourse,
      removeCourse,
      enroll,
      isEnrolled,
      getCourse,
      activeCourseId,
      setActiveCourseId,
    }),
    [catalog, enrolledCourses, publishCourse, removeCourse, enroll, isEnrolled, getCourse, activeCourseId],
  );

  return <CourseStoreContext.Provider value={value}>{children}</CourseStoreContext.Provider>;
}

export function useCourseStore() {
  const ctx = useContext(CourseStoreContext);
  if (!ctx) throw new Error('useCourseStore must be used within CourseStoreProvider');
  return ctx;
}
