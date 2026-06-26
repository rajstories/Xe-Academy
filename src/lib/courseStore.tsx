import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

/**
 * Shared, persistent course store.
 *
 * Creator-published courses land in `catalog` and immediately appear in the
 * student marketplace. Student enrollments live in `enrolledIds`. Both are
 * persisted to localStorage so nothing is lost on navigation or reload — this
 * is what makes a course published by the creator actually show up for students.
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
  enrolledIds: string[];
  enrolledCourses: CatalogCourse[];
  publishCourse: (course: Omit<CatalogCourse, 'id' | 'publishedAt'>) => CatalogCourse;
  removeCourse: (id: string) => void;
  enroll: (id: string) => void;
  isEnrolled: (id: string) => boolean;
  getCourse: (id: string) => CatalogCourse | undefined;
  /** Session-scoped: which catalog course the student is currently viewing/watching. */
  activeCourseId: string | null;
  setActiveCourseId: (id: string | null) => void;
}

const CATALOG_KEY = 'xe.catalog.v1';
const ENROLL_KEY = 'xe.enrollments.v1';

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
  const [catalog, setCatalog] = useState<CatalogCourse[]>(() => load(CATALOG_KEY, []));
  const [enrolledIds, setEnrolledIds] = useState<string[]>(() => load(ENROLL_KEY, []));
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));
  }, [catalog]);
  useEffect(() => {
    localStorage.setItem(ENROLL_KEY, JSON.stringify(enrolledIds));
  }, [enrolledIds]);

  const publishCourse = useCallback<CourseStoreValue['publishCourse']>((course) => {
    const full: CatalogCourse = {
      ...course,
      id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      publishedAt: Date.now(),
    };
    setCatalog((current) => [full, ...current]);
    return full;
  }, []);

  const removeCourse = useCallback((id: string) => {
    setCatalog((current) => current.filter((c) => c.id !== id));
    setEnrolledIds((current) => current.filter((e) => e !== id));
  }, []);

  const enroll = useCallback((id: string) => {
    setEnrolledIds((current) => (current.includes(id) ? current : [...current, id]));
  }, []);

  const isEnrolled = useCallback((id: string) => enrolledIds.includes(id), [enrolledIds]);
  const getCourse = useCallback((id: string) => catalog.find((c) => c.id === id), [catalog]);

  const enrolledCourses = useMemo(
    () => catalog.filter((c) => enrolledIds.includes(c.id)),
    [catalog, enrolledIds],
  );

  const value = useMemo<CourseStoreValue>(
    () => ({
      catalog,
      enrolledIds,
      enrolledCourses,
      publishCourse,
      removeCourse,
      enroll,
      isEnrolled,
      getCourse,
      activeCourseId,
      setActiveCourseId,
    }),
    [catalog, enrolledIds, enrolledCourses, publishCourse, removeCourse, enroll, isEnrolled, getCourse, activeCourseId],
  );

  return <CourseStoreContext.Provider value={value}>{children}</CourseStoreContext.Provider>;
}

export function useCourseStore() {
  const ctx = useContext(CourseStoreContext);
  if (!ctx) throw new Error('useCourseStore must be used within CourseStoreProvider');
  return ctx;
}
