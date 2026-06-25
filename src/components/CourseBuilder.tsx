import { ChangeEvent, DragEvent, RefObject, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  GripVertical,
  Link,
  Loader2,
  PlayCircle,
  Plus,
  Save,
  Settings,
  UploadCloud,
  Video,
  X,
} from 'lucide-react';
import { View } from '../types';

interface Props {
  setView: (view: View) => void;
}

type ModuleStatus = 'Published' | 'Draft';

interface CourseModule {
  id: number;
  title: string;
  description: string;
  duration: string;
  status: ModuleStatus;
  thumbnailUrl: string;
  videoUrl: string;
}

interface ModuleFormState {
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  thumbnailUrl: string;
}

const initialModuleForm: ModuleFormState = {
  title: '',
  description: '',
  videoUrl: '',
  duration: '12:00',
  thumbnailUrl: '',
};

const isLikelyYouTubeUrl = (value: string) => {
  try {
    const url = new URL(value);
    return ['youtube.com', 'www.youtube.com', 'youtu.be', 'www.youtu.be'].some((host) => url.hostname === host);
  } catch {
    return false;
  }
};

export default function CourseBuilder({ setView }: Props) {
  const [activeTab, setActiveTab] = useState<'details' | 'lessons'>('lessons');
  const [courseTitle, setCourseTitle] = useState('Advanced React Patterns');
  const [courseStatus, setCourseStatus] = useState('Draft');
  const [modules, setModules] = useState<CourseModule[]>([
    {
      id: 1,
      title: 'Introduction to React Patterns',
      description: 'A strategic overview of reusable architecture patterns.',
      duration: '5:30',
      status: 'Published',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
    },
    {
      id: 2,
      title: 'Higher Order Components',
      description: 'Compositional patterns for cross-cutting behavior.',
      duration: '12:45',
      status: 'Published',
      thumbnailUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1000&auto=format&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
    },
    {
      id: 3,
      title: 'Render Props and Custom Hooks',
      description: 'Modern stateful abstraction techniques.',
      duration: '18:20',
      status: 'Draft',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0',
    },
  ]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isModulePanelOpen, setIsModulePanelOpen] = useState(false);
  const [moduleForm, setModuleForm] = useState<ModuleFormState>(initialModuleForm);
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);
  const [linkStatus, setLinkStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateForm = (key: keyof ModuleFormState, value: string) => {
    setModuleForm((current) => ({ ...current, [key]: value }));
    if (key === 'videoUrl') setLinkStatus('idle');
  };

  const handleThumbnailFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;

    if (moduleForm.thumbnailUrl.startsWith('blob:')) {
      URL.revokeObjectURL(moduleForm.thumbnailUrl);
    }

    updateForm('thumbnailUrl', URL.createObjectURL(file));
  };

  const handleThumbnailInput = (event: ChangeEvent<HTMLInputElement>) => {
    handleThumbnailFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingThumbnail(false);
    handleThumbnailFile(event.dataTransfer.files?.[0]);
  };

  const verifyVideoLink = () => {
    setLinkStatus('checking');
    window.setTimeout(() => {
      setLinkStatus(isLikelyYouTubeUrl(moduleForm.videoUrl) ? 'valid' : 'invalid');
    }, 700);
  };

  const resetPanel = () => {
    setIsModulePanelOpen(false);
    setModuleForm(initialModuleForm);
    setIsDraggingThumbnail(false);
    setLinkStatus('idle');
    setIsPublishing(false);
  };

  const publishModule = () => {
    if (!moduleForm.title.trim() || !moduleForm.videoUrl.trim()) return;

    setIsPublishing(true);
    window.setTimeout(() => {
      const fallbackThumbnail = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop';
      const newModule: CourseModule = {
        id: Date.now(),
        title: moduleForm.title.trim(),
        description: moduleForm.description.trim(),
        duration: moduleForm.duration.trim() || '12:00',
        status: 'Published',
        thumbnailUrl: moduleForm.thumbnailUrl || fallbackThumbnail,
        videoUrl: moduleForm.videoUrl.trim(),
      };

      setModules((current) => [...current, newModule]);
      resetPanel();
      setToastMessage('Module published successfully. Students can now view this in their portal.');
      window.setTimeout(() => setToastMessage(''), 3200);
    }, 950);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOverModule = (event: DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reorderedModules = [...modules];
    const [draggedModule] = reorderedModules.splice(draggedIndex, 1);
    reorderedModules.splice(index, 0, draggedModule);
    setDraggedIndex(index);
    setModules(reorderedModules);
  };

  return (
    <div className="flex h-full flex-col space-y-6 pb-12">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('my-courses')}
            className="rounded-xl p-2 text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
            aria-label="Back to courses"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">{courseTitle}</h2>
            <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${courseStatus === 'Published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {courseStatus}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95">
            <Eye size={16} /> Preview
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95">
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'details' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <span className="flex items-center gap-2"><Settings size={16} /> Course Details</span>
        </button>
        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'lessons' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <span className="flex items-center gap-2"><Video size={16} /> Course Modules</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'details' && (
          <div className="max-w-3xl rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-900">Course Title</label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(event) => setCourseTitle(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-900">Description</label>
                <textarea
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20"
                  defaultValue="Learn advanced React patterns like HOCs, Render Props, and custom hooks to build scalable applications."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-900">Status</label>
                <select
                  value={courseStatus}
                  onChange={(event) => setCourseStatus(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option>Draft</option>
                  <option>Published</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-slate-900">Curriculum</h3>
                  <p className="mt-1 text-sm text-slate-500">{modules.length} modules configured</p>
                </div>
                <button
                  onClick={() => setIsModulePanelOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
                >
                  <Plus size={17} />
                  Add Module
                </button>
              </div>

              <div className="space-y-3">
                {modules.map((module, index) => (
                  <div
                    key={module.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(event) => handleDragOverModule(event, index)}
                    onDragEnd={() => setDraggedIndex(null)}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm transition-all hover:border-indigo-200 ${
                      draggedIndex === index ? 'border-indigo-400 opacity-60' : 'border-slate-100'
                    }`}
                  >
                    <GripVertical size={16} className="shrink-0 text-slate-300" />
                    <img src={module.thumbnailUrl} alt={module.title} className="h-14 w-20 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">{module.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <PlayCircle size={13} /> {module.duration}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${module.status === 'Published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {module.status}
                    </span>
                  </div>
                ))}

                <button
                  onClick={() => setIsModulePanelOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-4 text-sm font-bold text-slate-500 transition-all hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-600 active:scale-[0.99]"
                >
                  <Plus size={17} />
                  Add New Video/Module
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
              <div className="flex min-h-[460px] flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <Video size={38} />
                </div>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900">Build a polished learning sequence</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Add modules with custom thumbnails and unlisted YouTube source links. Published modules become available in the student portal.
                </p>
                <button
                  onClick={() => setIsModulePanelOpen(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
                >
                  <Plus size={17} />
                  Add New Video/Module
                </button>
              </div>
            </section>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModulePanelOpen && (
          <ModuleSlideOver
            form={moduleForm}
            isDraggingThumbnail={isDraggingThumbnail}
            linkStatus={linkStatus}
            isPublishing={isPublishing}
            fileInputRef={fileInputRef}
            onClose={resetPanel}
            onUpdate={updateForm}
            onDrop={handleDrop}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDraggingThumbnail(true);
            }}
            onDragLeave={() => setIsDraggingThumbnail(false)}
            onFileInput={handleThumbnailInput}
            onVerify={verifyVideoLink}
            onPublish={publishModule}
            onBrowse={() => fileInputRef.current?.click()}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            className="fixed bottom-6 right-6 z-[120] max-w-sm rounded-2xl border border-slate-100 bg-white p-4 text-sm font-bold text-slate-900 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-500" />
              <span>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModuleSlideOver({
  form,
  isDraggingThumbnail,
  linkStatus,
  isPublishing,
  fileInputRef,
  onClose,
  onUpdate,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileInput,
  onVerify,
  onPublish,
  onBrowse,
}: {
  form: ModuleFormState;
  isDraggingThumbnail: boolean;
  linkStatus: 'idle' | 'checking' | 'valid' | 'invalid';
  isPublishing: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onUpdate: (key: keyof ModuleFormState, value: string) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onFileInput: (event: ChangeEvent<HTMLInputElement>) => void;
  onVerify: () => void;
  onPublish: () => void;
  onBrowse: () => void;
}) {
  const canPublish = form.title.trim().length > 0 && form.videoUrl.trim().length > 0;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex justify-end bg-slate-950/25 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.aside
        initial={{ x: 560 }}
        animate={{ x: 0 }}
        exit={{ x: 560 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 p-6 backdrop-blur">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Course Module</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Add New Video/Module</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
            aria-label="Close module form"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-8 p-6">
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">Module Metadata</h3>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-900">Module Title</label>
              <input
                value={form.title}
                onChange={(event) => onUpdate('title', event.target.value)}
                placeholder="e.g. Agentic Planning Patterns"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-900">Description</label>
              <textarea
                value={form.description}
                onChange={(event) => onUpdate('description', event.target.value)}
                rows={4}
                placeholder="What will students learn in this module?"
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">Premium Thumbnail</h3>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileInput} />

            {form.thumbnailUrl ? (
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm">
                <img src={form.thumbnailUrl} alt="Uploaded thumbnail preview" className="aspect-video w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                <button
                  onClick={onBrowse}
                  className="absolute bottom-4 right-4 rounded-xl border border-white/30 bg-white/20 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30 active:scale-95"
                >
                  Replace Image
                </button>
              </div>
            ) : (
              <div
                onClick={onBrowse}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
                  isDraggingThumbnail
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <UploadCloud className={`mx-auto h-12 w-12 ${isDraggingThumbnail ? 'text-indigo-600' : 'text-slate-400'}`} />
                <p className="mt-4 text-sm font-bold text-slate-900">Drag & drop your custom thumbnail, or click to browse</p>
                <p className="mt-1 text-xs font-medium text-slate-500">PNG, JPG, or WebP recommended at 16:9.</p>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">Video Source Linker</h3>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-900">Video Source URL (Unlisted YouTube Link)</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Link size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={form.videoUrl}
                    onChange={(event) => onUpdate('videoUrl', event.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <button
                  onClick={onVerify}
                  disabled={!form.videoUrl.trim() || linkStatus === 'checking'}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition-all hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {linkStatus === 'checking' && <Loader2 size={16} className="animate-spin" />}
                  Verify Link
                </button>
              </div>
              {linkStatus === 'valid' && <p className="mt-2 text-xs font-bold text-emerald-600">Verified YouTube source. Ready for white-labeled playback.</p>}
              {linkStatus === 'invalid' && <p className="mt-2 text-xs font-bold text-rose-600">Please enter a valid YouTube or youtu.be URL.</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-900">Duration</label>
              <input
                value={form.duration}
                onChange={(event) => onUpdate('duration', event.target.value)}
                placeholder="e.g. 13:38"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-200 bg-white p-6 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onPublish}
            disabled={!canPublish || isPublishing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPublishing && <Loader2 size={17} className="animate-spin" />}
            Publish Module
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
}
