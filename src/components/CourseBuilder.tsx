import { ChangeEvent, DragEvent, RefObject, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileVideo,
  GripVertical,
  Loader2,
  PlayCircle,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Trash2,
  UploadCloud,
  Video,
  X,
} from 'lucide-react';
import { View } from '../types';

type UploadState = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

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

export default function CourseBuilder({ setView }: Props) {
  const { getToken } = useAuth();
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
  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // Video upload state (white-labeled — backed by the YouTube Data API server-side).
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const uploadAbortRef = useRef<AbortController | null>(null);

  const updateForm = (key: keyof ModuleFormState, value: string) => {
    setModuleForm((current) => ({ ...current, [key]: value }));
  };

  // YouTube's upload endpoint doesn't support direct browser-to-Google CORS requests,
  // so each chunk is relayed through our own same-origin server route instead of
  // PUTing the file straight to Google from the browser.
  // Google's resumable upload protocol requires every chunk except the final one
  // to be an exact multiple of 256 KiB (262,144 bytes) — anything else gets rejected.
  const CHUNK_SIZE = 16 * 262_144; // 4 MiB, comfortably under Vercel's ~4.5MB request limit

  const startVideoUpload = async (file: File) => {
    setVideoFile(file);
    setUploadError('');
    setUploadProgress(0);
    setUploadState('uploading');

    const controller = new AbortController();
    uploadAbortRef.current = controller;

    try {
      const token = await getToken();
      const initResponse = await fetch('/api/youtube/create-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: moduleForm.title.trim() || file.name.replace(/\.[^.]+$/, ''),
          description: moduleForm.description.trim(),
          contentType: file.type || 'video/*',
          contentLength: file.size,
        }),
        signal: controller.signal,
      });

      const rawBody = await initResponse.text();
      let initData: { error?: string; uploadUrl?: string } = {};
      try {
        initData = JSON.parse(rawBody);
      } catch {
        initData = {};
      }
      if (!initResponse.ok) {
        const detail = initData.error || rawBody.slice(0, 180) || 'No response from the upload service.';
        throw new Error(`Upload service error (${initResponse.status}): ${detail}`);
      }
      const uploadUrl: string = initData.uploadUrl ?? '';
      if (!uploadUrl) {
        throw new Error('Upload service did not return an upload URL.');
      }

      let start = 0;
      let videoId = '';

      while (start < file.size) {
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const chunkResponse = await fetch(
          `/api/youtube/upload-chunk?uploadUrl=${encodeURIComponent(uploadUrl)}&start=${start}&end=${end}&total=${file.size}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: chunk,
            signal: controller.signal,
          },
        );

        const chunkRaw = await chunkResponse.text();
        let chunkData: { error?: string; detail?: string; done?: boolean; id?: string } = {};
        try {
          chunkData = JSON.parse(chunkRaw);
        } catch {
          chunkData = {};
        }

        if (!chunkResponse.ok) {
          const base = chunkData.error || `Upload failed while sending bytes ${start}-${end} (status ${chunkResponse.status}).`;
          throw new Error(chunkData.detail ? `${base} ${chunkData.detail.slice(0, 200)}` : base);
        }

        start = end;
        setUploadProgress(Math.round((start / file.size) * 100));

        if (chunkData.done) {
          if (!chunkData.id) throw new Error('Upload finished but no video id was returned.');
          videoId = chunkData.id;
          break;
        }
      }

      if (!videoId) throw new Error('Upload did not complete.');

      const playbackUrl = `https://www.youtube.com/watch?v=${videoId}`;
      setModuleForm((current) => ({ ...current, videoUrl: playbackUrl }));
      setUploadProgress(100);
      setUploadState('done');
    } catch (error) {
      uploadAbortRef.current = null;
      if (error instanceof DOMException && error.name === 'AbortError') {
        setUploadState('idle');
        return;
      }
      setUploadState('error');
      setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    }
  };

  const handleVideoInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setUploadError('Please choose a video file.');
      setUploadState('error');
      return;
    }
    startVideoUpload(file);
  };

  const handleVideoDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) startVideoUpload(file);
  };

  const removeVideo = () => {
    if (uploadAbortRef.current) {
      uploadAbortRef.current.abort();
      uploadAbortRef.current = null;
    }
    setVideoFile(null);
    setUploadState('idle');
    setUploadProgress(0);
    setUploadError('');
    setModuleForm((current) => ({ ...current, videoUrl: '' }));
  };

  const handleThumbnailFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;

    // Read as a base64 data URL (not a blob: URL) so the thumbnail persists in
    // the saved module instead of breaking after a reload/re-render.
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') updateForm('thumbnailUrl', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleThumbnailInput = (event: ChangeEvent<HTMLInputElement>) => {
    handleThumbnailFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingThumbnail(false);
    handleThumbnailFile(event.dataTransfer.files?.[0]);
  };

  const resetPanel = () => {
    if (uploadAbortRef.current) {
      uploadAbortRef.current.abort();
      uploadAbortRef.current = null;
    }
    setIsModulePanelOpen(false);
    setModuleForm(initialModuleForm);
    setIsDraggingThumbnail(false);
    setIsPublishing(false);
    setVideoFile(null);
    setUploadState('idle');
    setUploadProgress(0);
    setUploadError('');
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
                  Add modules with custom thumbnails and upload your lesson videos directly. Published modules become available in the student portal.
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
            isPublishing={isPublishing}
            fileInputRef={fileInputRef}
            videoInputRef={videoInputRef}
            videoFile={videoFile}
            uploadState={uploadState}
            uploadProgress={uploadProgress}
            uploadError={uploadError}
            onClose={resetPanel}
            onUpdate={updateForm}
            onDrop={handleDrop}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDraggingThumbnail(true);
            }}
            onDragLeave={() => setIsDraggingThumbnail(false)}
            onFileInput={handleThumbnailInput}
            onPublish={publishModule}
            onBrowse={() => fileInputRef.current?.click()}
            onVideoBrowse={() => videoInputRef.current?.click()}
            onVideoInput={handleVideoInput}
            onVideoDrop={handleVideoDrop}
            onRemoveVideo={removeVideo}
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
  isPublishing,
  fileInputRef,
  videoInputRef,
  videoFile,
  uploadState,
  uploadProgress,
  uploadError,
  onClose,
  onUpdate,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileInput,
  onPublish,
  onBrowse,
  onVideoBrowse,
  onVideoInput,
  onVideoDrop,
  onRemoveVideo,
}: {
  form: ModuleFormState;
  isDraggingThumbnail: boolean;
  isPublishing: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  videoInputRef: RefObject<HTMLInputElement | null>;
  videoFile: File | null;
  uploadState: UploadState;
  uploadProgress: number;
  uploadError: string;
  onClose: () => void;
  onUpdate: (key: keyof ModuleFormState, value: string) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onFileInput: (event: ChangeEvent<HTMLInputElement>) => void;
  onPublish: () => void;
  onBrowse: () => void;
  onVideoBrowse: () => void;
  onVideoInput: (event: ChangeEvent<HTMLInputElement>) => void;
  onVideoDrop: (event: DragEvent<HTMLDivElement>) => void;
  onRemoveVideo: () => void;
}) {
  const videoReady = uploadState === 'done' && form.videoUrl.trim().length > 0;
  const canPublish = form.title.trim().length > 0 && videoReady && !isPublishing;

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
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">Lesson Video</h3>
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={onVideoInput} />

            {uploadState === 'idle' && (
              <div
                onClick={onVideoBrowse}
                onDrop={onVideoDrop}
                onDragOver={(event) => event.preventDefault()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/50"
              >
                <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                <p className="mt-4 text-sm font-bold text-slate-900">Drag &amp; drop your lesson video, or click to upload</p>
                <p className="mt-1 text-xs font-medium text-slate-500">MP4, MOV, or WebM. Your video is hosted securely and streamed inside XE Academy.</p>
              </div>
            )}

            {(uploadState === 'uploading' || uploadState === 'processing') && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FileVideo size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{videoFile?.name ?? 'Uploading video'}</p>
                    <p className="text-xs font-medium text-slate-500">
                      {videoFile ? formatBytes(videoFile.size) : ''}
                      {uploadState === 'processing' ? ' · Finalizing…' : ` · ${uploadProgress}%`}
                    </p>
                  </div>
                  <button onClick={onRemoveVideo} className="rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-rose-500 active:scale-95" aria-label="Cancel upload">
                    <X size={18} />
                  </button>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-indigo-600 transition-all duration-200" style={{ width: `${uploadState === 'processing' ? 100 : uploadProgress}%` }} />
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-indigo-600">
                  <Loader2 size={13} className="animate-spin" />
                  {uploadState === 'processing' ? 'Processing your video…' : 'Uploading…'}
                </p>
              </div>
            )}

            {uploadState === 'done' && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{videoFile?.name ?? 'Video uploaded'}</p>
                    <p className="text-xs font-medium text-emerald-700">Ready — this video will stream inside the student portal.</p>
                  </div>
                  <button onClick={onRemoveVideo} className="rounded-lg p-2 text-slate-400 transition-all hover:bg-white hover:text-rose-500 active:scale-95" aria-label="Remove video">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}

            {uploadState === 'error' && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
                <p className="text-sm font-bold text-rose-700">Upload failed</p>
                <p className="mt-1 text-xs font-medium text-rose-600">{uploadError || 'Something went wrong. Please try again.'}</p>
                <button
                  onClick={onVideoBrowse}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-700 transition-all hover:bg-rose-50 active:scale-95"
                >
                  <RotateCcw size={15} /> Try again
                </button>
              </div>
            )}

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
