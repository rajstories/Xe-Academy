'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Calendar,
  Camera,
  CheckCircle2,
  MessageSquare,
  Mic,
  MicOff,
  MonitorPlay,
  Radio,
  RadioTower,
  Users,
  Video,
  VideoOff,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { View } from '../types';

interface Props {
  setView: (view: View) => void;
}

type StreamStatus = 'idle' | 'preview' | 'live';
type ChatMessage = { id: number; name: string; text: string; time: string };

const scheduledClasses = [
  { id: 1, title: 'Advanced React Patterns Q&A', course: 'Advanced React Patterns', time: 'Today, 7:00 PM', expected: 145 },
  { id: 2, title: 'Design Systems Critique', course: 'UI/UX Masterclass', time: 'Tomorrow, 11:00 AM', expected: 88 },
  { id: 3, title: 'Next.js Deployment Clinic', course: 'Fullstack Next.js 15', time: 'Friday, 5:30 PM', expected: 112 },
];

const syntheticChat = [
  'Audio is crystal clear.',
  'Can you revisit the caching diagram?',
  'The preview is smooth on my end.',
  'This explanation finally made Suspense click.',
  'Will the recording be available after class?',
  'Love the architecture breakdown.',
];

const idleMetrics: Array<{ label: string; value: string | number; icon: LucideIcon }> = [
  { label: 'Scheduled Classes', value: scheduledClasses.length, icon: Calendar },
  { label: 'Expected Viewers', value: 345, icon: Users },
  { label: 'Avg Attendance', value: '71%', icon: Activity },
];

function formatDuration(seconds: number) {
  const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

export default function CreatorLiveSessions({ setView }: Props) {
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('idle');
  const [isInitializing, setIsInitializing] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [duration, setDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, name: 'System', text: 'Chat monitor standing by.', time: 'Now' },
  ]);
  const [studentLiveFlag, setStudentLiveFlag] = useState(false);

  useEffect(() => {
    if (streamStatus !== 'live') return;

    const durationTimer = window.setInterval(() => setDuration((value) => value + 1), 1000);
    const chatTimer = window.setInterval(() => {
      setChatMessages((messages) => [
        {
          id: Date.now(),
          name: ['Ava', 'Noah', 'Mia', 'Jordan', 'Priya'][Math.floor(Math.random() * 5)],
          text: syntheticChat[Math.floor(Math.random() * syntheticChat.length)],
          time: 'Just now',
        },
        ...messages,
      ].slice(0, 9));
    }, 2600);

    return () => {
      window.clearInterval(durationTimer);
      window.clearInterval(chatTimer);
    };
  }, [streamStatus]);

  const initializeBroadcast = () => {
    setIsInitializing(true);
    window.setTimeout(() => {
      setIsInitializing(false);
      setStreamStatus('preview');
    }, 1100);
  };

  const goLive = () => {
    setDuration(0);
    setStudentLiveFlag(true);
    setStreamStatus('live');
    setChatMessages([{ id: Date.now(), name: 'System', text: 'Broadcast is live. Student portal Join Live Now is active.', time: 'Now' }]);
  };

  const endStream = () => {
    setStreamStatus('idle');
    setStudentLiveFlag(false);
    setDuration(0);
  };

  const statusLabel = useMemo(() => {
    if (streamStatus === 'live') return 'LIVE';
    if (streamStatus === 'preview') return 'PREVIEW READY';
    return 'OFFLINE';
  }, [streamStatus]);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Broadcast Command</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Live Sessions Cockpit</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${streamStatus === 'live' ? 'animate-pulse bg-red-500' : streamStatus === 'preview' ? 'bg-amber-500' : 'bg-slate-300'}`} />
          {statusLabel}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <main className="flex flex-col gap-6">
          <section className="aspect-video rounded-3xl bg-slate-950 flex flex-col justify-center items-center text-white relative overflow-hidden shadow-2xl shadow-slate-950/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.25),transparent_30%)]" />
            <div className="absolute inset-x-6 top-6 z-10 flex items-center justify-between">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] backdrop-blur-md">
                Studio Monitor
              </span>
              {streamStatus === 'live' && <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-black tracking-[0.16em]">LIVE {formatDuration(duration)}</span>}
            </div>

            {streamStatus === 'idle' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-lg text-center">
                <RadioTower className="mx-auto text-indigo-300" size={58} />
                <h2 className="mt-5 text-3xl font-bold tracking-tight">Broadcast node offline</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">Initialize the studio environment, validate devices, then push your class live to enrolled students.</p>
                <button
                  onClick={initializeBroadcast}
                  disabled={isInitializing}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:shadow-xl active:scale-95 disabled:opacity-70"
                >
                  {isInitializing ? <Activity className="animate-spin" size={18} /> : <Zap size={18} />}
                  {isInitializing ? 'Initializing...' : 'Initialize Broadcast Node'}
                </button>
              </motion.div>
            )}

            {streamStatus === 'preview' && (
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 flex w-full max-w-3xl flex-col items-center px-8">
                <div className="flex aspect-video w-full items-center justify-center rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl">
                  {cameraEnabled ? (
                    <div className="text-center">
                      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200">
                        <Video size={42} />
                      </div>
                      <p className="mt-4 text-sm font-bold text-slate-200">Mock camera preview active</p>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      <VideoOff className="mx-auto" size={42} />
                      <p className="mt-3 text-sm font-bold">Camera disabled</p>
                    </div>
                  )}
                </div>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <button onClick={() => setCameraEnabled((value) => !value)} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-md transition-all hover:bg-white/20 active:scale-95">
                    {cameraEnabled ? <Camera size={17} /> : <VideoOff size={17} />}
                    {cameraEnabled ? 'Camera On' : 'Camera Off'}
                  </button>
                  <button onClick={() => setMicEnabled((value) => !value)} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-md transition-all hover:bg-white/20 active:scale-95">
                    {micEnabled ? <Mic size={17} /> : <MicOff size={17} />}
                    {micEnabled ? 'Mic On' : 'Muted'}
                  </button>
                  <button onClick={goLive} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-black text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-500 active:scale-95">
                    <Radio size={17} />
                    GO LIVE
                  </button>
                </div>
              </motion.div>
            )}

            {streamStatus === 'live' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 text-center">
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-red-500/20 text-red-200 ring-8 ring-red-500/10">
                  <MonitorPlay size={52} />
                </div>
                <h2 className="mt-6 text-4xl font-black tracking-tight">Advanced React Patterns Q&A</h2>
                <p className="mt-3 text-slate-300">Streaming to enrolled students. WebRTC join state is active.</p>
                <button onClick={endStream} className="mt-8 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition-all hover:bg-slate-100 active:scale-95">
                  End Broadcast
                </button>
              </motion.div>
            )}
          </section>

          {streamStatus === 'idle' && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {idleMetrics.map(({ label, value, icon: MetricIcon }) => {
                return (
                  <div key={label} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <MetricIcon className="text-indigo-600" size={22} />
                    <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
                    <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
                  </div>
                );
              })}
            </div>
          )}

          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">Scheduled Classes</h2>
            <div className="mt-4 space-y-3">
              {scheduledClasses.map((session) => (
                <div key={session.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{session.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{session.course} · {session.time}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                    <Users size={14} />
                    {session.expected} expected
                  </span>
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">Control Panel</h2>
            <div className="mt-5 space-y-3">
              {[
                ['Camera Connected', streamStatus !== 'idle'],
                ['Microphone Active', streamStatus !== 'idle' && micEnabled],
                ['Stream Key Synced', streamStatus !== 'idle'],
                ['Student Join Flag', studentLiveFlag],
              ].map(([label, active]) => (
                <div key={String(label)} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-bold text-slate-700">{label}</span>
                  <CheckCircle2 size={18} className={active ? 'text-emerald-500' : 'text-slate-300'} />
                </div>
              ))}
            </div>
          </section>

          <section className="flex min-h-[420px] flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Live Chat Monitor</h2>
              <MessageSquare size={18} className="text-indigo-600" />
            </div>
            <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
              {chatMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">{message.name}</p>
                    <span className="text-[11px] font-semibold text-slate-400">{message.time}</span>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{message.text}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
