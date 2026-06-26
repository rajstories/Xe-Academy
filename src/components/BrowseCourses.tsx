'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Check, CheckCircle2, PlayCircle, Search, ShoppingCart, Sparkles, User, X } from 'lucide-react';
import { View } from '../types';
import { CatalogCourse, useCourseStore } from '../lib/courseStore';

interface Props {
  setView: (view: View) => void;
}

function priceLabel(price: number) {
  return price <= 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`;
}

export default function BrowseCourses({ setView }: Props) {
  const { catalog, enroll, isEnrolled, setActiveCourseId } = useCourseStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CatalogCourse | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [toast, setToast] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (c) => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.creatorName.toLowerCase().includes(q),
    );
  }, [catalog, search]);

  const flashToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const completeEnrollment = (course: CatalogCourse) => {
    enroll(course.id);
    setCheckout(false);
    setSelected(null);
    flashToast(`Enrolled in “${course.title}” — find it in My Courses.`);
  };

  const handlePrimary = (course: CatalogCourse) => {
    if (isEnrolled(course.id)) {
      setActiveCourseId(course.id);
      setSelected(null);
      setView('course-learning');
      return;
    }
    if (course.price > 0) {
      setCheckout(true);
      return;
    }
    completeEnrollment(course);
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Discover</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Browse Courses</h1>
          <p className="mt-1 text-sm text-slate-500">Courses published by creators across XE Academy.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search courses, creators…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-center">
          <Sparkles className="h-10 w-10 text-slate-300" />
          <p className="mt-4 text-sm font-bold text-slate-900">No courses yet</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            When a creator publishes a course, it shows up here for you to explore and enroll.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => {
            const enrolled = isEnrolled(course.id);
            return (
              <motion.article
                key={course.id}
                layout
                onClick={() => setSelected(course)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-[2px] hover:shadow-xl"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                  <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute right-3 top-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                    {priceLabel(course.price)}
                  </span>
                  {enrolled && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white">
                      <Check size={13} /> Enrolled
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">{course.category}</p>
                  <h3 className="mt-2 line-clamp-2 text-lg font-bold text-slate-900">{course.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{course.description || 'No description provided.'}</p>
                  <div className="mt-4 flex items-center justify-between text-sm font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1.5"><User size={15} /> {course.creatorName}</span>
                    <span className="inline-flex items-center gap-1.5"><BookOpen size={15} /> {course.lessons} lesson{course.lessons === 1 ? '' : 's'}</span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Course detail slide-over */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[120] flex justify-end bg-slate-950/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelected(null);
              setCheckout(false);
            }}
          >
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 28 }}
              onClick={(event) => event.stopPropagation()}
              className="flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-2xl"
            >
              <div className="relative aspect-[16/9] shrink-0 bg-slate-100">
                <img src={selected.thumbnail} alt={selected.title} className="h-full w-full object-cover" />
                <button
                  onClick={() => {
                    setSelected(null);
                    setCheckout(false);
                  }}
                  className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-700 shadow transition-all hover:bg-white active:scale-95"
                >
                  <X size={18} />
                </button>
                <span className="absolute bottom-4 right-4 rounded-full bg-slate-950/80 px-3 py-1 text-sm font-bold text-white backdrop-blur">
                  {priceLabel(selected.price)}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">{selected.category}</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{selected.title}</h2>
                <div className="mt-3 flex items-center gap-4 text-sm font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1.5"><User size={15} /> {selected.creatorName}</span>
                  <span className="inline-flex items-center gap-1.5"><BookOpen size={15} /> {selected.lessons} lesson{selected.lessons === 1 ? '' : 's'}</span>
                </div>

                <h3 className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-slate-400">About this course</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {selected.description || 'The creator has not added a description for this course yet.'}
                </p>

                <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <PlayCircle size={18} className="text-indigo-600" />
                    {selected.videoUrl ? 'Includes streaming video lessons' : 'Course content coming soon'}
                  </p>
                </div>

                <div className="mt-auto pt-6">
                  {isEnrolled(selected.id) ? (
                    <button
                      onClick={() => handlePrimary(selected)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-4 font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      <PlayCircle size={18} /> Continue learning
                    </button>
                  ) : checkout ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-sm font-bold text-slate-900">Confirm enrollment</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Simulated checkout for {priceLabel(selected.price)}. (Real payment processing isn’t wired up — enrolling grants access for now.)
                      </p>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => setCheckout(false)}
                          className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => completeEnrollment(selected)}
                          className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white transition-all hover:shadow-lg active:scale-95"
                        >
                          Pay {priceLabel(selected.price)}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePrimary(selected)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      {selected.price > 0 ? (
                        <><ShoppingCart size={18} /> Buy for {priceLabel(selected.price)}</>
                      ) : (
                        <><CheckCircle2 size={18} /> Enroll for free</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 right-6 z-[140] inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-2xl"
          >
            <CheckCircle2 size={18} className="text-emerald-600" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
