'use client';

import { useMemo, useRef, useState } from 'react';
import type { PointerEvent, SyntheticEvent } from 'react';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle,
  ChevronRight,
  Circle,
  Clock3,
  Download,
  FileText,
  Maximize,
  MessageSquare,
  Pause,
  Play,
  PlayCircle,
  Send,
  Volume2,
} from 'lucide-react';
// @ts-ignore
import ReactPlayer from 'react-player';
import { View } from '../types';

interface Props {
  setView: (view: View) => void;
}

type ActiveTab = 'notes' | 'discuss' | 'files';

type Timestamp = {
  label: string;
  time: number;
};

type Lesson = {
  id: number;
  title: string;
  durationLabel: string;
  durationSeconds: number;
  completed: boolean;
  videoUrl: string;
  timestamps: Timestamp[];
};

type Module = {
  title: string;
  lessons: Lesson[];
};

type Note = {
  id: number;
  text: string;
  time: number;
  timestamp: string;
};

type PlayerHandle = HTMLVideoElement & {
  seekTo?: (amount: number, type?: 'seconds' | 'fraction') => void;
  getCurrentTime?: () => number;
};

const curriculumData: Module[] = [
  {
    title: 'Module 1: Foundations',
    lessons: [
      {
        id: 1,
        title: 'Welcome to XE Academy',
        durationLabel: '13:38',
        durationSeconds: 818,
        completed: true,
        videoUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
        timestamps: [
          { label: 'Course outcomes', time: 18 },
          { label: 'Learning workflow', time: 132 },
          { label: 'Project brief', time: 252 },
        ],
      },
      {
        id: 2,
        title: 'React Mental Models',
        durationLabel: '18:42',
        durationSeconds: 1122,
        completed: true,
        videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
        timestamps: [
          { label: 'Components as contracts', time: 44 },
          { label: 'State ownership', time: 276 },
          { label: 'Render flow', time: 511 },
        ],
      },
    ],
  },
  {
    title: 'Module 2: Hooks Deep Dive',
    lessons: [
      {
        id: 3,
        title: 'Understanding useState',
        durationLabel: '15:20',
        durationSeconds: 920,
        completed: true,
        videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0',
        timestamps: [
          { label: 'Initializer patterns', time: 86 },
          { label: 'Updater functions', time: 284 },
          { label: 'State batching', time: 508 },
        ],
      },
      {
        id: 4,
        title: 'The useEffect Hook',
        durationLabel: '22:15',
        durationSeconds: 1335,
        completed: false,
        videoUrl: 'https://www.youtube.com/watch?v=0ZJgIjIuY7U',
        timestamps: [
          { label: 'Lifecycle translation', time: 58 },
          { label: 'Dependency arrays', time: 252 },
          { label: 'Cleanup functions', time: 641 },
          { label: 'Avoiding effect traps', time: 1004 },
        ],
      },
      {
        id: 5,
        title: 'Custom Hooks',
        durationLabel: '10:40',
        durationSeconds: 640,
        completed: false,
        videoUrl: 'https://www.youtube.com/watch?v=J-g9ZJha8FE',
        timestamps: [
          { label: 'Extracting behavior', time: 33 },
          { label: 'Input/output design', time: 228 },
          { label: 'Testing hooks', time: 471 },
        ],
      },
    ],
  },
  {
    title: 'Module 3: Application State',
    lessons: [
      {
        id: 6,
        title: 'Context API Basics',
        durationLabel: '14:20',
        durationSeconds: 860,
        completed: false,
        videoUrl: 'https://www.youtube.com/watch?v=5LrDIWkK_Bc',
        timestamps: [
          { label: 'Provider shape', time: 74 },
          { label: 'Consumer ergonomics', time: 302 },
          { label: 'Performance boundaries', time: 629 },
        ],
      },
      {
        id: 7,
        title: 'Redux Toolkit Intro',
        durationLabel: '20:15',
        durationSeconds: 1215,
        completed: false,
        videoUrl: 'https://www.youtube.com/watch?v=9boMnm5X9ak',
        timestamps: [
          { label: 'Store setup', time: 119 },
          { label: 'Slices', time: 384 },
          { label: 'Async flows', time: 759 },
        ],
      },
    ],
  },
];

const speedOptions = [1, 1.5, 2];

function formatTime(totalSeconds: number) {
  const safeSeconds = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, '0');
  const seconds = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function CourseLearning({ setView }: Props) {
  const initialLesson = curriculumData[1].lessons[1];

  const [currentVideoUrl, setCurrentVideoUrl] = useState(initialLesson.videoUrl);
  const [currentLesson, setCurrentLesson] = useState<Lesson>(initialLesson);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(initialLesson.durationSeconds);
  const [volume, setVolume] = useState(0.78);
  const [activeTab, setActiveTab] = useState<ActiveTab>('notes');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      text: 'The dependency array is the decision point for when this lesson logic re-runs.',
      time: 252,
      timestamp: '@04:12',
    },
  ]);
  const [pendingSeek, setPendingSeek] = useState<number | null>(null);

  const playerRef = useRef<PlayerHandle | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingProgress = useRef(false);

  const currentSeconds = played * duration;
  const completedLessons = useMemo(
    () => curriculumData.flatMap((module) => module.lessons).filter((lesson) => lesson.completed).length,
    []
  );
  const lessonCount = useMemo(() => curriculumData.flatMap((module) => module.lessons).length, []);
  const completion = Math.round((completedLessons / lessonCount) * 100);

  const seekTo = (seconds: number) => {
    const nextTime = Math.max(0, Math.min(seconds, duration || currentLesson.durationSeconds));
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(nextTime, 'seconds');
    } else if (playerRef.current) {
      playerRef.current.currentTime = nextTime;
    }
    setPlayed(duration ? nextTime / duration : 0);
  };

  const getPlayerTime = () => {
    const exactTime = playerRef.current?.getCurrentTime?.();
    return typeof exactTime === 'number' && Number.isFinite(exactTime) ? exactTime : currentSeconds;
  };

  const handleLessonSelect = (lesson: Lesson, seekTime = 0) => {
    setCurrentLesson(lesson);
    setDuration(lesson.durationSeconds);
    setPlayed(0);
    setPlaying(true);

    if (lesson.videoUrl !== currentVideoUrl) {
      setCurrentVideoUrl(lesson.videoUrl);
      setPendingSeek(seekTime);
      return;
    }

    seekTo(seekTime);
  };

  const handlePlayerReady = () => {
    if (pendingSeek !== null) {
      seekTo(pendingSeek);
      setPendingSeek(null);
    }
  };

  const updateProgressFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextPlayed = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    setPlayed(nextPlayed);
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(nextPlayed, 'fraction');
    } else if (playerRef.current && duration) {
      playerRef.current.currentTime = nextPlayed * duration;
    }
  };

  const handleTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    if (isDraggingProgress.current) return;

    const media = event.currentTarget;
    const mediaDuration = Number.isFinite(media.duration) && media.duration > 0 ? media.duration : duration;
    if (mediaDuration) {
      setPlayed(media.currentTime / mediaDuration);
    }
  };

  const handleDurationChange = (event: SyntheticEvent<HTMLVideoElement>) => {
    const mediaDuration = event.currentTarget.duration;
    if (Number.isFinite(mediaDuration) && mediaDuration > 0) {
      setDuration(mediaDuration);
    }
  };

  const handleProgressPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    isDraggingProgress.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateProgressFromPointer(event);
  };

  const handleProgressPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (isDraggingProgress.current) {
      updateProgressFromPointer(event);
    }
  };

  const handleProgressPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    isDraggingProgress.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
    updateProgressFromPointer(event);
  };

  const handleVolumePointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextVolume = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    setVolume(nextVolume);
  };

  const saveNote = () => {
    const trimmedText = noteText.trim();
    if (!trimmedText) return;

    const time = getPlayerTime();
    setNotes((currentNotes) => [
      {
        id: Date.now(),
        text: trimmedText,
        time,
        timestamp: `@${formatTime(time)}`,
      },
      ...currentNotes,
    ]);
    setNoteText('');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen();
      return;
    }

    document.exitFullscreen();
  };

  return (
    <div className="min-h-[calc(100vh-96px)] bg-slate-50 px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('dashboard')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-700 active:scale-95"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">XE Academy</p>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Course Learning</h1>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-700 active:scale-95">
            <Bookmark size={16} />
            Bookmark Lesson
          </button>
        </div>

        <div className="grid min-h-[760px] grid-cols-1 gap-5 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
          <aside className="flex min-h-[540px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">Course Content</h2>
                  <p className="mt-1 text-sm text-slate-500">{completedLessons} of {lessonCount} lessons complete</p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{completion}%</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-indigo-600" style={{ width: `${completion}%` }} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {curriculumData.map((module) => (
                <section key={module.title} className="mb-5 last:mb-0">
                  <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    {module.title}
                  </h3>
                  <div className="space-y-1.5">
                    {module.lessons.map((lesson) => {
                      const isActive = lesson.id === currentLesson.id;

                      return (
                        <div key={lesson.id} className="rounded-xl">
                          <button
                            onClick={() => handleLessonSelect(lesson, 0)}
                            className={`flex w-full gap-3 rounded-xl px-3 py-3 text-left transition-all active:scale-95 ${
                              isActive
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <span className="mt-0.5">
                              {lesson.completed ? (
                                <CheckCircle size={17} className="text-emerald-500" />
                              ) : isActive ? (
                                <PlayCircle size={17} className="text-indigo-600" />
                              ) : (
                                <Circle size={17} className="text-slate-300" />
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold leading-snug">{lesson.title}</span>
                              <span className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                <Clock3 size={13} />
                                {lesson.durationLabel}
                              </span>
                            </span>
                            <ChevronRight size={16} className={isActive ? 'text-indigo-500' : 'text-slate-300'} />
                          </button>

                          {isActive && (
                            <div className="ml-9 mt-1 space-y-1 border-l border-indigo-100 pl-3">
                              {lesson.timestamps.map((timestamp) => (
                                <button
                                  key={`${lesson.id}-${timestamp.time}`}
                                  onClick={() => handleLessonSelect(lesson, timestamp.time)}
                                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs font-medium text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-700 active:scale-95"
                                >
                                  <span>{timestamp.label}</span>
                                  <span className="font-semibold text-indigo-500">@{formatTime(timestamp.time)}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </aside>

          <main className="flex min-w-0 flex-col gap-4">
            <section
              ref={playerContainerRef}
              className="group relative aspect-video min-h-[360px] overflow-hidden rounded-2xl bg-black shadow-[0_24px_70px_rgba(15,23,42,0.22)] ring-1 ring-slate-900/5"
            >
              <ReactPlayer
                ref={playerRef as any}
                src={currentVideoUrl}
                width="100%"
                height="100%"
                playing={playing}
                volume={volume}
                playbackRate={playbackRate}
                controls={false}
                config={{
                  youtube: {
                    playerVars: {
                      modestbranding: 1,
                      rel: 0,
                      showinfo: 0,
                      controls: 0,
                      disablekb: 1,
                    },
                  },
                } as any}
                onReady={handlePlayerReady}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onDurationChange={handleDurationChange}
                onEnded={() => setPlaying(false)}
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
              />

              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-black via-black/70 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-black via-black/95 to-transparent" />

              <button
                onClick={() => setPlaying((isPlaying) => !isPlaying)}
                className="absolute inset-0 z-20 cursor-default"
                aria-label={playing ? 'Pause video' : 'Play video'}
              />

              {!playing && (
                <button
                  onClick={() => setPlaying(true)}
                  className="absolute left-1/2 top-1/2 z-30 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 ring-8 ring-white/10 transition-all hover:scale-105 hover:bg-indigo-500 active:scale-95"
                  aria-label="Play video"
                >
                  <Play size={40} className="ml-1 fill-current" />
                </button>
              )}

              <div className={`absolute inset-x-0 bottom-0 z-40 p-4 transition-all duration-300 ${playing ? 'translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100' : 'translate-y-0 opacity-100'}`}>
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-white shadow-2xl backdrop-blur-sm">
                  <div
                    className="relative mb-4 h-2 cursor-pointer rounded-full bg-white/15"
                    onPointerDown={handleProgressPointerDown}
                    onPointerMove={handleProgressPointerMove}
                    onPointerUp={handleProgressPointerUp}
                    role="slider"
                    aria-label="Video progress"
                    aria-valuemin={0}
                    aria-valuemax={Math.round(duration)}
                    aria-valuenow={Math.round(currentSeconds)}
                    tabIndex={0}
                  >
                    <div className="absolute inset-y-0 left-0 rounded-full bg-indigo-500" style={{ width: `${played * 100}%` }} />
                    <div
                      className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-indigo-500 shadow-lg transition-transform group-hover:scale-110"
                      style={{ left: `calc(${played * 100}% - 8px)` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <button
                        onClick={() => setPlaying((isPlaying) => !isPlaying)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-950 transition-all hover:bg-indigo-100 active:scale-95"
                        aria-label={playing ? 'Pause video' : 'Play video'}
                      >
                        {playing ? <Pause size={20} className="fill-current" /> : <Play size={20} className="ml-0.5 fill-current" />}
                      </button>

                      <div className="flex items-center gap-2">
                        <Volume2 size={18} className="text-white/80" />
                        <div
                          className="h-2 w-20 cursor-pointer rounded-full bg-white/15 sm:w-28"
                          onPointerDown={handleVolumePointer}
                          onPointerMove={(event) => {
                            if (event.buttons === 1) handleVolumePointer(event);
                          }}
                          role="slider"
                          aria-label="Volume"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={Math.round(volume * 100)}
                        >
                          <div className="h-full rounded-full bg-white" style={{ width: `${volume * 100}%` }} />
                        </div>
                      </div>

                      <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-white/85">
                        {formatTime(currentSeconds)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={playbackRate}
                        onChange={(event) => setPlaybackRate(Number(event.target.value))}
                        className="h-10 rounded-full border border-white/10 bg-white/10 px-3 text-sm font-bold text-white outline-none transition-all hover:bg-white/15 active:scale-95"
                        aria-label="Playback speed"
                      >
                        {speedOptions.map((speed) => (
                          <option key={speed} value={speed} className="text-slate-900">
                            {speed}x
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={toggleFullscreen}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 active:scale-95"
                        aria-label="Toggle fullscreen"
                      >
                        <Maximize size={19} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Now Playing</p>
              <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">{currentLesson.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Premium React architecture course with chapter-level seeking and personal notes.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">
                  {currentLesson.durationLabel}
                </span>
              </div>
            </section>
          </main>

          <aside className="flex min-h-[540px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-3 border-b border-slate-200">
              {[
                { id: 'notes' as const, label: 'Notes', icon: FileText },
                { id: 'discuss' as const, label: 'Discuss', icon: MessageSquare },
                { id: 'files' as const, label: 'Files', icon: Download },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex flex-col items-center gap-1 px-3 py-4 text-xs font-bold uppercase tracking-[0.12em] transition-all active:scale-95 ${
                      activeTab === tab.id ? 'text-indigo-700' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                    {activeTab === tab.id && <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-indigo-600" />}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/60 p-4">
              {activeTab === 'notes' && (
                <div className="flex h-full flex-col">
                  <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {notes.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
                        <FileText className="mx-auto text-slate-300" size={32} />
                        <p className="mt-3 text-sm font-semibold text-slate-700">No notes yet</p>
                        <p className="mt-1 text-xs text-slate-500">Capture ideas at the exact frame you are watching.</p>
                      </div>
                    ) : (
                      notes.map((note) => (
                        <article key={note.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <button
                            onClick={() => seekTo(note.time)}
                            className="text-sm font-bold text-indigo-600 transition-all hover:text-indigo-800 active:scale-95"
                          >
                            {note.timestamp}
                          </button>
                          <p className="mt-2 text-sm leading-6 text-slate-700">{note.text}</p>
                        </article>
                      ))
                    )}
                  </div>

                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <textarea
                      value={noteText}
                      onChange={(event) => setNoteText(event.target.value)}
                      placeholder={`Take a note at ${formatTime(currentSeconds)}...`}
                      className="h-28 w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />
                    <button
                      onClick={saveNote}
                      className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!noteText.trim()}
                    >
                      <Send size={16} />
                      Save Note
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'discuss' && (
                <div className="flex h-full flex-col">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                        <MessageSquare size={19} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Lesson Discussion</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          Ask a question, compare notes, and follow mentor replies for this lesson.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-3">
                    {['How do you decide whether logic belongs in an effect or an event handler?', 'Can cleanup functions also cancel async requests?'].map((question, index) => (
                      <div key={question} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-sm font-semibold leading-6 text-slate-800">{question}</p>
                        <p className="mt-2 text-xs font-medium text-slate-400">{index + 4} replies</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'files' && (
                <div className="space-y-3">
                  {[
                    { name: 'Lesson Cheat Sheet.pdf', meta: 'PDF · 1.8 MB', color: 'bg-rose-50 text-rose-600' },
                    { name: 'Starter Code.zip', meta: 'ZIP · 4.2 MB', color: 'bg-blue-50 text-blue-600' },
                    { name: 'Architecture Checklist.md', meta: 'Markdown · 32 KB', color: 'bg-emerald-50 text-emerald-600' },
                  ].map((file) => (
                    <a
                      key={file.name}
                      href="#"
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md active:scale-95"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${file.color}`}>
                          <FileText size={18} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-slate-800">{file.name}</span>
                          <span className="text-xs font-medium text-slate-400">{file.meta}</span>
                        </span>
                      </span>
                      <Download size={17} className="shrink-0 text-slate-400" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
