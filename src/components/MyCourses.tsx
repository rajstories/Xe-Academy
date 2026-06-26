'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Play, Search } from 'lucide-react';
import { View } from '../types';
import { useCourseStore } from '../lib/courseStore';

interface Props {
  setView: (view: View) => void;
}

type CourseStatus = 'in-progress' | 'completed' | 'not-started';
type FilterKey = 'All' | 'In Progress' | 'Completed';

interface Course {
  id: number | string;
  title: string;
  category: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  status: CourseStatus;
  thumbnailUrl: string;
  /** Set for courses enrolled from the marketplace; used to play the right video. */
  catalogId?: string;
}

const filterToStatus: Record<Exclude<FilterKey, 'All'>, CourseStatus> = {
  'In Progress': 'in-progress',
  Completed: 'completed',
};

export default function MyCourses({ setView }: Props) {
  const { enrolledCourses, setActiveCourseId } = useCourseStore();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [demoCourses] = useState<Course[]>([
    {
      id: 1,
      title: 'Architecting Agentic Workflows',
      category: 'Agentic Systems',
      progress: 50,
      completedLessons: 12,
      totalLessons: 24,
      status: 'in-progress',
      thumbnailUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 2,
      title: 'Large Language Models Fundamentals',
      category: 'AI Engineering',
      progress: 100,
      completedLessons: 28,
      totalLessons: 28,
      status: 'completed',
      thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 3,
      title: 'Computer Vision & Edge AI',
      category: 'Applied ML',
      progress: 18,
      completedLessons: 5,
      totalLessons: 28,
      status: 'in-progress',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 4,
      title: 'Autonomous SOC Automation',
      category: 'Security Operations',
      progress: 0,
      completedLessons: 0,
      totalLessons: 22,
      status: 'not-started',
      thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 5,
      title: 'Distributed Systems for AI Products',
      category: 'Systems Design',
      progress: 72,
      completedLessons: 18,
      totalLessons: 25,
      status: 'in-progress',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 6,
      title: 'Production RAG Evaluation',
      category: 'LLM Ops',
      progress: 100,
      completedLessons: 16,
      totalLessons: 16,
      status: 'completed',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
    },
  ]);

  // Courses the student enrolled in from the marketplace, shown above the demo tracks.
  const courses = useMemo<Course[]>(() => {
    const enrolled: Course[] = enrolledCourses.map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      progress: 0,
      completedLessons: 0,
      totalLessons: c.lessons || 1,
      status: 'not-started',
      thumbnailUrl: c.thumbnail,
      catalogId: c.id,
    }));
    return [...enrolled, ...demoCourses];
  }, [enrolledCourses, demoCourses]);

  const openCourse = (course: Course) => {
    if (course.catalogId) setActiveCourseId(course.catalogId);
    else setActiveCourseId(null);
    setView('course-learning');
  };

  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesFilter = activeFilter === 'All' || course.status === filterToStatus[activeFilter];
      const matchesSearch =
        !normalizedSearch ||
        `${course.title} ${course.category}`.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, courses, searchTerm]);

  return (
    <div className="min-h-full bg-white pb-12">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Student Library</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              My Courses
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Continue your elite engineering cohort tracks with cinematic course cards and real progress visibility.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              type="text"
              placeholder="Search courses..."
              className="w-full rounded-full border border-slate-100 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.02)] outline-none transition-all placeholder:text-slate-400 focus:border-indigo-200 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['All', 'In Progress', 'Completed'] as FilterKey[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all active:scale-[0.98] ${
                activeFilter === filter
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} onOpen={() => openCourse(course)} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredCourses.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <BookOpen className="mx-auto text-slate-300" size={42} />
            <h3 className="mt-4 text-lg font-bold text-slate-900">No courses found</h3>
            <p className="mt-2 text-sm text-slate-500">Try another filter or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course, onOpen }: { course: Course; onOpen: () => void }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 240, damping: 24 }}
      className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all hover:-translate-y-[2px] hover:shadow-xl"
    >
      <button
        onClick={onOpen}
        className="aspect-video w-full relative overflow-hidden bg-slate-900 group"
        aria-label={`Open ${course.title}`}
      >
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent" />

        <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md">
          {course.status === 'in-progress' ? 'In Progress' : course.status === 'completed' ? 'Completed' : 'Not Started'}
        </div>

        {course.status === 'completed' && (
          <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
            <CheckCircle2 size={16} />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-full border border-white/30 bg-white/20 p-4 text-white opacity-0 shadow-2xl backdrop-blur-md transition-all duration-300 scale-90 group-hover:scale-100 group-hover:opacity-100">
            <Play size={24} className="ml-0.5 fill-current" />
          </span>
        </div>
      </button>

      <div className="p-6">
        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-indigo-600">
          {course.category}
        </p>
        <h3 className="mb-4 line-clamp-1 text-lg font-bold tracking-tight text-slate-900">
          {course.title}
        </h3>

        <div>
          <div className="h-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-indigo-600 transition-all duration-700" style={{ width: `${course.progress}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{course.completedLessons}/{course.totalLessons} lessons</span>
            <span>{course.progress}%</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
