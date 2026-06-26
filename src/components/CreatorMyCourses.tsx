'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import {
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  Edit,
  FileVideo,
  Loader2,
  MoreVertical,
  Plus,
  RotateCcw,
  Trash,
  Trash2,
  UploadCloud,
  Users,
  X,
} from 'lucide-react';
import { View } from '../types';
import { useCourseStore } from '../lib/courseStore';
import { useVideoUpload } from '../lib/useVideoUpload';
import { getFullName } from '../lib/auth';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const TOTAL_STEPS = 5;

interface Props {
  setView: (view: View) => void;
}

type CourseStatus = 'Published' | 'Draft';

type Course = {
  id: number;
  title: string;
  category: string;
  thumbnail: string;
  status: CourseStatus;
  lessons: number;
  students: number;
  updatedAt: string;
};

const starterCourses: Course[] = [
  {
    id: 1,
    title: 'Advanced React Patterns',
    category: 'Development',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200&auto=format&fit=crop',
    status: 'Published',
    lessons: 24,
    students: 1250,
    updatedAt: '2 days ago',
  },
  {
    id: 2,
    title: 'UI/UX Masterclass',
    category: 'Design',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1200&auto=format&fit=crop',
    status: 'Published',
    lessons: 18,
    students: 840,
    updatedAt: '1 week ago',
  },
  {
    id: 3,
    title: 'Fullstack Next.js 15',
    category: 'Development',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
    status: 'Draft',
    lessons: 12,
    students: 0,
    updatedAt: 'Just now',
  },
];

const categories = ['Development', 'Design', 'Business', 'Marketing'];
const thumbnails = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1200&auto=format&fit=crop',
];

const emptyDraft = {
  title: '',
  description: '',
  category: 'Development',
  thumbnail: thumbnails[0],
  status: 'Published' as CourseStatus,
  isFree: true,
  price: '',
  videoUrl: '',
};

export default function CreatorMyCourses({ setView }: Props) {
  const { user } = useUser();
  const { publishCourse: publishToCatalog } = useCourseStore();
  const video = useVideoUpload();
  const [courses, setCourses] = useState<Course[]>(starterCourses);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [draft, setDraft] = useState(emptyDraft);
  const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const handleVideoFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) return;
    video.startUpload(file, { title: draft.title, description: draft.description });
  };

  // Lock background scroll while the wizard is open so scroll gestures stay in the card.
  useEffect(() => {
    if (!wizardOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [wizardOpen]);

  const handleCustomThumbnail = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    // Use a base64 data URL so the thumbnail persists in the saved course
    // instead of going blank after the temporary blob: URL is gone.
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      setCustomThumbnail(reader.result);
      setDraft((current) => ({ ...current, thumbnail: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const stats = useMemo(
    () => [
      { label: 'Total Courses', value: courses.length },
      { label: 'Published', value: courses.filter((course) => course.status === 'Published').length },
      { label: 'Drafts', value: courses.filter((course) => course.status === 'Draft').length },
      { label: 'Students', value: courses.reduce((total, course) => total + course.students, 0).toLocaleString() },
    ],
    [courses]
  );

  // Step gating: title required on step 0; video must finish uploading before leaving step 3.
  const canContinue =
    wizardStep === 0 ? draft.title.trim().length > 3 : wizardStep === 3 ? video.uploadState === 'done' : true;

  const resetWizard = () => {
    setWizardOpen(false);
    setWizardStep(0);
    setDraft(emptyDraft);
    setCustomThumbnail(null);
    video.reset();
  };

  const publishCourse = () => {
    const title = draft.title.trim();
    const videoUrl = video.videoUrl || draft.videoUrl;
    const price = draft.isFree ? 0 : Math.max(0, Number(draft.price) || 0);

    const course: Course = {
      id: Date.now(),
      title,
      category: draft.category,
      thumbnail: draft.thumbnail,
      status: draft.status,
      lessons: videoUrl ? 1 : 0,
      students: 0,
      updatedAt: 'Just now',
    };
    setCourses((current) => [course, ...current]);

    // Publish to the shared catalog so students see it in Browse Courses (only when actually Published).
    if (draft.status === 'Published') {
      publishToCatalog({
        title,
        description: draft.description.trim(),
        category: draft.category,
        thumbnail: draft.thumbnail,
        creatorName: getFullName(user || undefined) || 'XE Creator',
        price,
        videoUrl,
        lessons: videoUrl ? 1 : 0,
      });
      setToast(`“${title}” is now live in the student portal · Browse Courses`);
    } else {
      setToast(`“${title}” saved as draft`);
    }
    window.setTimeout(() => setToast(''), 2600);
    resetWizard();
  };

  const duplicateCourse = (course: Course) => {
    setCourses((current) => [{ ...course, id: Date.now(), title: `${course.title} Copy`, status: 'Draft', updatedAt: 'Just now' }, ...current]);
    setOpenMenuId(null);
  };

  const deleteCourse = (courseId: number) => {
    setCourses((current) => current.filter((course) => course.id !== courseId));
    setOpenMenuId(null);
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Course Library</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Creator Tracks</h1>
        </div>
        <button
          onClick={() => setWizardOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-indigo-600/20 transition-all hover:shadow-lg active:scale-95"
        >
          <Plus size={18} />
          Create New Course
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        {courses.map((course) => (
          <motion.article
            key={course.id}
            layout
            className="group overflow-visible rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-xl"
          >
            <div className="relative aspect-[16/9] overflow-hidden rounded-t-2xl bg-slate-100">
              <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold shadow-sm backdrop-blur-md ${
                course.status === 'Published' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {course.status}
              </span>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">{course.category}</p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">{course.title}</h3>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === course.id ? null : course.id)}
                    className="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                    aria-label="Course actions"
                  >
                    <MoreVertical size={19} />
                  </button>
                  <AnimatePresence>
                    {openMenuId === course.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        className="absolute right-0 top-11 z-20 w-52 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl"
                      >
                        <button onClick={() => setView('course-builder')} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                          <Edit size={16} /> Edit Details
                        </button>
                        <button onClick={() => duplicateCourse(course)} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                          <Copy size={16} /> Duplicate Course
                        </button>
                        <button onClick={() => deleteCourse(course.id)} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50">
                          <Trash size={16} /> Delete Track
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-4 text-sm font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5"><BookOpen size={16} /> {course.lessons} lessons</span>
                <span className="inline-flex items-center gap-1.5"><Users size={16} /> {course.students.toLocaleString()} students</span>
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400">
                Updated {course.updatedAt}
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <AnimatePresence>
        {wizardOpen && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 22, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 240, damping: 24 }}
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 p-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Create New Course</h2>
                  <p className="mt-1 text-sm text-slate-500">Step {wizardStep + 1} of {TOTAL_STEPS}</p>
                </div>
                <button onClick={resetWizard} className="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95">
                  <X size={20} />
                </button>
              </div>

              <div className="grid shrink-0 grid-cols-5 gap-2 px-6 pt-5">
                {[0, 1, 2, 3, 4].map((step) => (
                  <div key={step} className={`h-1.5 rounded-full ${step <= wizardStep ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                ))}
              </div>

              <div className="min-h-[320px] flex-1 overflow-y-auto p-6">
                {wizardStep === 0 && (
                  <div>
                    <label className="text-sm font-bold text-slate-900">Course Title</label>
                    <input
                      value={draft.title}
                      onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                      placeholder="Advanced React Patterns"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />
                    <p className="mt-2 text-sm text-slate-500">Use a specific title learners can understand at a glance.</p>

                    <label className="mt-6 block text-sm font-bold text-slate-900">Description</label>
                    <textarea
                      value={draft.description}
                      onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                      placeholder="What will students learn? Who is this course for?"
                      rows={5}
                      className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />
                    <p className="mt-2 text-sm text-slate-500">This is what students read on the course detail page before enrolling.</p>
                  </div>
                )}

                {wizardStep === 1 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Category Selection</h3>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setDraft((current) => ({ ...current, category }))}
                          className={`rounded-2xl border p-5 text-left transition-all active:scale-95 ${
                            draft.category === category ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-700 hover:border-indigo-200'
                          }`}
                        >
                          <span className="font-bold">{category}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Course Thumbnail</h3>
                    <p className="mt-1 text-sm text-slate-500">Upload your own cover image, or pick one of our presets.</p>

                    <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={handleCustomThumbnail} />

                    {customThumbnail ? (
                      <div className="group relative mt-4 overflow-hidden rounded-2xl border-2 border-indigo-500 ring-4 ring-indigo-100">
                        <img src={customThumbnail} alt="Your uploaded thumbnail" className="aspect-video w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
                        <span className="absolute left-3 top-3 rounded-full bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white shadow">Your upload</span>
                        <button
                          onClick={() => thumbnailInputRef.current?.click()}
                          className="absolute bottom-3 right-3 rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-white/30 active:scale-95"
                        >
                          Replace
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => thumbnailInputRef.current?.click()}
                        className="mt-4 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/50"
                      >
                        <UploadCloud className="mb-2 h-10 w-10 text-slate-400" />
                        <span className="text-sm font-bold text-slate-900">Upload your own thumbnail</span>
                        <span className="mt-1 text-xs font-medium text-slate-500">PNG, JPG, or WebP · 16:9 recommended</span>
                      </button>
                    )}

                    <div className="mt-5 flex items-center gap-3">
                      <span className="h-px flex-1 bg-slate-100" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Or choose a preset</span>
                      <span className="h-px flex-1 bg-slate-100" />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {thumbnails.map((thumbnail) => (
                        <button
                          key={thumbnail}
                          onClick={() => setDraft((current) => ({ ...current, thumbnail }))}
                          className={`overflow-hidden rounded-2xl border transition-all active:scale-95 ${draft.thumbnail === thumbnail ? 'border-indigo-500 ring-4 ring-indigo-100' : 'border-slate-100 hover:border-indigo-200'}`}
                        >
                          <img src={thumbnail} alt="Course thumbnail option" className="h-28 w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Course Video</h3>
                    <p className="mt-1 text-sm text-slate-500">Upload your lesson video. It streams inside XE Academy for your students.</p>

                    <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(event) => { handleVideoFile(event.target.files?.[0]); event.target.value = ''; }} />

                    {video.uploadState === 'idle' && (
                      <div
                        onClick={() => videoInputRef.current?.click()}
                        onDrop={(event) => { event.preventDefault(); handleVideoFile(event.dataTransfer.files?.[0]); }}
                        onDragOver={(event) => event.preventDefault()}
                        className="mt-4 cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/50"
                      >
                        <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                        <p className="mt-4 text-sm font-bold text-slate-900">Drag &amp; drop your video, or click to upload</p>
                        <p className="mt-1 text-xs font-medium text-slate-500">MP4, MOV, or WebM.</p>
                      </div>
                    )}

                    {(video.uploadState === 'uploading' || video.uploadState === 'processing') && (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><FileVideo size={20} /></div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900">{video.videoFile?.name ?? 'Uploading video'}</p>
                            <p className="text-xs font-medium text-slate-500">{video.videoFile ? formatBytes(video.videoFile.size) : ''} · {video.uploadProgress}%</p>
                          </div>
                        </div>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-indigo-600 transition-all duration-200" style={{ width: `${video.uploadProgress}%` }} />
                        </div>
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-indigo-600"><Loader2 size={13} className="animate-spin" /> Uploading…</p>
                      </div>
                    )}

                    {video.uploadState === 'done' && (
                      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><CheckCircle2 size={20} /></div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900">{video.videoFile?.name ?? 'Video uploaded'}</p>
                            <p className="text-xs font-medium text-emerald-700">Ready — students will stream this inside the portal.</p>
                          </div>
                          <button onClick={() => video.reset()} className="rounded-lg p-2 text-slate-400 transition-all hover:bg-white hover:text-rose-500 active:scale-95" aria-label="Remove video"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    )}

                    {video.uploadState === 'error' && (
                      <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
                        <p className="text-sm font-bold text-rose-700">Upload failed</p>
                        <p className="mt-1 text-xs font-medium text-rose-600">{video.uploadError || 'Something went wrong. Please try again.'}</p>
                        <button onClick={() => videoInputRef.current?.click()} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-700 transition-all hover:bg-rose-50 active:scale-95"><RotateCcw size={15} /> Try again</button>
                      </div>
                    )}
                  </div>
                )}

                {wizardStep === 4 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Pricing</h3>
                    <p className="mt-1 text-sm text-slate-500">Choose whether students get this free or pay to enroll.</p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={() => setDraft((current) => ({ ...current, isFree: true }))}
                        className={`rounded-2xl border p-5 text-left transition-all active:scale-95 ${draft.isFree ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-700 hover:border-indigo-200'}`}
                      >
                        <span className="flex items-center gap-2 font-bold">{draft.isFree && <Check size={17} />} Free</span>
                        <span className="mt-1 block text-xs font-medium text-slate-500">Anyone can enroll instantly.</span>
                      </button>
                      <button
                        onClick={() => setDraft((current) => ({ ...current, isFree: false }))}
                        className={`rounded-2xl border p-5 text-left transition-all active:scale-95 ${!draft.isFree ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-700 hover:border-indigo-200'}`}
                      >
                        <span className="flex items-center gap-2 font-bold">{!draft.isFree && <Check size={17} />} Paid</span>
                        <span className="mt-1 block text-xs font-medium text-slate-500">Set a price students pay to enroll.</span>
                      </button>
                    </div>

                    {!draft.isFree && (
                      <div className="mt-4">
                        <label className="text-sm font-bold text-slate-900">Price (₹)</label>
                        <input
                          type="number"
                          min={0}
                          value={draft.price}
                          onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))}
                          placeholder="e.g. 1999"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                        />
                      </div>
                    )}

                    <div className="mt-6 border-t border-slate-100 pt-5">
                      <h3 className="text-sm font-bold text-slate-900">Visibility</h3>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {(['Published', 'Draft'] as CourseStatus[]).map((status) => (
                          <button
                            key={status}
                            onClick={() => setDraft((current) => ({ ...current, status }))}
                            className={`rounded-2xl border p-4 text-left transition-all active:scale-95 ${draft.status === status ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-700 hover:border-indigo-200'}`}
                          >
                            <span className="flex items-center gap-2 font-bold">{draft.status === status && <Check size={17} />} {status === 'Published' ? 'Publish to student portal' : 'Save as draft'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50 p-6">
                <button
                  onClick={() => setWizardStep((step) => Math.max(0, step - 1))}
                  disabled={wizardStep === 0}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-40"
                >
                  Back
                </button>
                {wizardStep < TOTAL_STEPS - 1 ? (
                  <button
                    onClick={() => setWizardStep((step) => step + 1)}
                    disabled={!canContinue}
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-40"
                  >
                    {wizardStep === 3 && video.uploadState !== 'done' ? 'Upload a video to continue' : 'Continue'}
                  </button>
                ) : (
                  <button onClick={publishCourse} className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg active:scale-95">
                    {draft.status === 'Published' ? 'Publish' : 'Save Draft'}
                  </button>
                )}
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
            className="fixed bottom-6 right-6 z-[120] rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
