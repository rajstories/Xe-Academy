'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Play,
  Video,
  X,
} from 'lucide-react';
import { View } from '../types';
import { getUserDisplayName } from '../lib/auth';

interface Props {
  setView: (view: View) => void;
  onNotificationsClick?: () => void;
}

type CourseProgress = {
  id: number;
  eyebrow: string;
  title: string;
  image: string;
  progress: number;
  lessons: string;
  timeLeft: string;
  cta: string;
};

const courseTracks: CourseProgress[] = [
  {
    id: 1,
    eyebrow: 'Mastering React',
    title: 'Intro to Hooks',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=900&auto=format&fit=crop',
    progress: 25,
    lessons: '8 of 32 lessons',
    timeLeft: '4h 20m left',
    cta: 'Resume',
  },
  {
    id: 2,
    eyebrow: 'Modern CSS',
    title: 'Flexbox Mastery',
    image: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=900&auto=format&fit=crop',
    progress: 33,
    lessons: '12 of 36 lessons',
    timeLeft: '6h 30m left',
    cta: 'Resume',
  },
  {
    id: 3,
    eyebrow: 'Product Foundations',
    title: 'Lesson 1',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=900&auto=format&fit=crop',
    progress: 0,
    lessons: '0 of 15 lessons',
    timeLeft: '1h 10m left',
    cta: 'Start',
  },
];

const quickActions = [
  { label: 'Browse courses', icon: BookOpen, view: 'my-courses' },
  { label: 'Join live session', icon: Video, view: 'live-classes' },
  { label: 'View learning calendar', icon: CalendarDays, view: 'live-classes' },
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstDay.getDay();
  const cells: Array<{ key: string; day: number | null }> = [];

  for (let index = 0; index < leadingBlanks; index += 1) {
    cells.push({ key: `blank-start-${index}`, day: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ key: `${year}-${month}-${day}`, day });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `blank-end-${cells.length}`, day: null });
  }

  return cells;
}

function formatMonth(year: number, month: number) {
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date(year, month, 1));
}

export default function StudentDashboard({ setView, onNotificationsClick }: Props) {
  const { user } = useUser();
  const firstName = getUserDisplayName(user || undefined);
  const currentRuntimeDate = new Date(2026, 5, 25);
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 5, 1));
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const calendarCells = useMemo(() => buildCalendarDays(year, month), [month, year]);
  const isCurrentRuntimeMonth = year === currentRuntimeDate.getFullYear() && month === currentRuntimeDate.getMonth();

  const shiftMonth = (amount: number) => {
    setCalendarDate((date) => new Date(date.getFullYear(), date.getMonth() + amount, 1));
  };

  return (
    <div className="min-h-full bg-white pb-12">
      <div className="flex flex-col gap-10">
        <section className="rounded-3xl bg-slate-950 p-5 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-300 ring-1 ring-red-400/20">
                <Video size={22} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-black text-red-200 ring-1 ring-red-400/20">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    LIVE NOW
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Pinned session</span>
                </div>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">Web Development Q&A</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Your instructor is live with your cohort, {firstName}. Join before the architecture walkthrough starts.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onNotificationsClick || (() => setNotificationsOpen(true))}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 transition-all hover:bg-white/15 active:scale-[0.98]"
              >
                <Bell size={17} />
                Updates
              </button>
              <button
                onClick={() => setView('live-classes')}
                className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-[1px] hover:shadow-xl active:scale-[0.98]"
              >
                Join Session
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Courses Enrolled', value: '3', helper: 'Keep going', icon: BookOpen, iconClass: 'bg-indigo-50 text-indigo-700', tint: 'hover:ring-indigo-100' },
            { label: 'Lessons Completed', value: '20', helper: 'Strong weekly progress', icon: CheckCircle2, iconClass: 'bg-emerald-50 text-emerald-600', tint: 'hover:ring-emerald-100' },
            { label: 'Next Live Session', value: '2h 14m', helper: 'React Q&A workshop', icon: CalendarDays, iconClass: 'bg-violet-50 text-violet-700', tint: 'hover:ring-violet-100' },
          ].map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.article
                key={metric.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 220, damping: 24 }}
                className={`rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.035)] ring-1 ring-slate-100 transition-all hover:-translate-y-[1px] hover:shadow-xl ${metric.tint}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${metric.iconClass}`}>
                    <Icon size={21} />
                  </div>
                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">{metric.helper}</span>
                </div>
                <div className="mt-5">
                  <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                  <h3 className="mt-1 text-4xl font-bold tracking-tight text-slate-900">{metric.value}</h3>
                </div>
              </motion.article>
            );
          })}

          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, type: 'spring', stiffness: 220, damping: 24 }}
            className="rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-700 p-6 text-white shadow-[0_18px_45px_rgba(79,70,229,0.22)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/55">Momentum</p>
            <h3 className="mt-4 text-2xl font-bold tracking-tight">You are doing great.</h3>
            <p className="mt-3 text-sm font-medium leading-6 text-indigo-100">Small, consistent sessions are compounding into serious skill depth.</p>
          </motion.article>
        </section>

        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="flex min-w-0 flex-col gap-10">
            <section>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">Continue Learning</h2>
                  <p className="mt-1 text-sm text-slate-500">Resume the tracks that are already in motion.</p>
                </div>
                <button onClick={() => setView('my-courses')} className="text-sm font-bold text-indigo-600 transition-colors hover:text-indigo-800">
                  View all
                </button>
              </div>

              <div className="space-y-5">
                {courseTracks.map((course, index) => (
                  <motion.article
                    key={course.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05, type: 'spring', stiffness: 220, damping: 24 }}
                    className={`group rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.035)] ring-1 transition-all hover:-translate-y-[1px] hover:shadow-xl ${
                      index === 0 ? 'ring-indigo-100 bg-gradient-to-br from-white to-indigo-50/30' : 'ring-slate-100'
                    }`}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                      <button
                        onClick={() => setView('course-learning')}
                        className={`relative overflow-hidden rounded-2xl bg-slate-100 ${
                          index === 0 ? 'h-48 lg:h-40 lg:w-72' : 'h-36 lg:h-28 lg:w-52'
                        } lg:shrink-0`}
                        aria-label={`Open ${course.title}`}
                      >
                        <img src={course.image} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <span className="absolute inset-0 flex items-center justify-center bg-slate-950/25 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm">
                            <Play size={20} className="ml-0.5 fill-current" />
                          </span>
                        </span>
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {index === 0 && (
                            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
                              Continue where you left off
                            </span>
                          )}
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{course.eyebrow}</p>
                        </div>
                        <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900">{course.title}</h3>
                        <div className="mt-5 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-indigo-50">
                            <div className="h-full rounded-full bg-indigo-500/80" style={{ width: `${course.progress}%` }} />
                          </div>
                          <span className="w-10 text-right text-sm font-semibold text-slate-600">{course.progress}%</span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                          <span className="inline-flex items-center gap-1.5"><BookOpen size={14} /> {course.lessons}</span>
                          <span className="inline-flex items-center gap-1.5"><Clock3 size={14} /> {course.timeLeft}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setView('course-learning')}
                        className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-indigo-600/20 transition-all hover:-translate-y-[1px] hover:shadow-lg active:scale-[0.98]"
                      >
                        {course.cta}
                      </button>
                    </div>
                  </motion.article>
                ))}
              </div>
            </section>

          </main>

          <aside className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.035)] ring-1 ring-slate-100">
            <CalendarWidget
              year={year}
              month={month}
              cells={calendarCells}
              isCurrentRuntimeMonth={isCurrentRuntimeMonth}
              currentDay={currentRuntimeDate.getDate()}
              onPrevious={() => shiftMonth(-1)}
              onNext={() => shiftMonth(1)}
            />

            <div className="my-5 h-px bg-slate-100" />

            <section>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Quick Actions</h2>
              <div className="mt-4 space-y-1">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => setView(action.view as View)}
                      className="group flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50/80 active:scale-[0.98]"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <Icon size={17} />
                        </span>
                        <span className="text-sm font-bold text-slate-800">{action.label}</span>
                      </span>
                      <ChevronRight size={17} className="text-slate-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-indigo-600" />
                    </button>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {notificationsOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex justify-end bg-slate-950/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.aside
              initial={{ x: 380 }}
              animate={{ x: 0 }}
              exit={{ x: 380 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="h-full w-full max-w-sm bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
                <button onClick={() => setNotificationsOpen(false)} className="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3 p-6">
                {[
                  ['Live session starting', 'Web Development Q&A is live now.'],
                  ['Progress saved', 'Your React Hooks checkpoint is synced.'],
                  ['New lesson released', 'Fullstack Next.js 15 added a deployment clinic.'],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                    <p className="text-sm font-bold text-slate-900">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{body}</p>
                  </div>
                ))}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CalendarWidget({
  year,
  month,
  cells,
  isCurrentRuntimeMonth,
  currentDay,
  onPrevious,
  onNext,
}: {
  year: number;
  month: number;
  cells: Array<{ key: string; day: number | null }>;
  isCurrentRuntimeMonth: boolean;
  currentDay: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onPrevious}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-base font-bold tracking-tight text-slate-900">{formatMonth(year, month)}</h2>
        <button
          onClick={onNext}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-xs font-bold text-slate-400">{day}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const isToday = isCurrentRuntimeMonth && cell.day === currentDay;
          return (
            <div key={cell.key} className="flex h-10 items-center justify-center">
              {cell.day ? (
                <button
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition-all ${
                    isToday
                      ? 'bg-indigo-600 font-semibold text-white shadow-sm'
                      : 'font-medium text-slate-700 hover:bg-slate-50 hover:ring-1 hover:ring-slate-200'
                  }`}
                >
                  {cell.day}
                </button>
              ) : (
                <span className="h-9 w-9" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
