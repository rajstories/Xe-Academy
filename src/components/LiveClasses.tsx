'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Video,
  X,
  BellRing,
  BellPlus,
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  CheckCircle2,
  MessageSquare,
  Send,
  Pin,
} from 'lucide-react';
import { View } from '../types';
import { useAuth } from '../hooks/useAuth';

interface Props {
  setView: (view: View) => void;
}

type SessionStatus = 'live' | 'scheduled' | 'ended';
type TabKey = 'upcoming' | 'live' | 'past';

interface LiveSession {
  sessionId: string;
  creatorId: string;
  creatorName: string;
  courseId: string;
  courseTitle: string;
  status: SessionStatus;
  startTime: string;
  durationMinutes: number;
  title: string;
  attendeeCount: number;
  thumbnail?: string;
}

interface WebRTCToken {
  sessionId: string;
  token: string;
  roomUrl: string;
}

interface ToastState {
  id: number;
  message: string;
}

// Mock backend call. Swap for a real LiveKit/Agora token endpoint later.
function fetchWebRTCToken(sessionId: string): Promise<WebRTCToken> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        sessionId,
        token: `mock-rtc-token-${sessionId}-${Date.now()}`,
        roomUrl: `wss://live.xeacademy.dev/rooms/${sessionId}`,
      });
    }, 1400);
  });
}

const SEED_SESSIONS: LiveSession[] = [
  {
    sessionId: 'sess_101',
    creatorId: 'creator_42',
    creatorName: 'John Doe',
    courseId: 'course_react_advanced',
    courseTitle: 'Advanced React Patterns',
    status: 'live',
    startTime: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    durationMinutes: 60,
    title: 'Live Q&A: Server Components & Suspense',
    attendeeCount: 154,
  },
  {
    sessionId: 'sess_102',
    creatorId: 'creator_17',
    creatorName: 'Sarah Smith',
    courseId: 'course_ui_systems',
    courseTitle: 'Design Systems at Scale',
    status: 'scheduled',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 90,
    title: 'Building Tokenized Component Libraries',
    attendeeCount: 89,
  },
  {
    sessionId: 'sess_103',
    creatorId: 'creator_09',
    creatorName: 'Mike Johnson',
    courseId: 'course_node_backend',
    courseTitle: 'Node.js for Production',
    status: 'scheduled',
    startTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 45,
    title: 'Career Advice: Backend Interviews',
    attendeeCount: 210,
  },
  {
    sessionId: 'sess_104',
    creatorId: 'creator_55',
    creatorName: 'Elena Cruz',
    courseId: 'course_growth_marketing',
    courseTitle: 'Growth Marketing Bootcamp',
    status: 'live',
    startTime: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    durationMinutes: 60,
    title: 'Unauthorized stream — must NOT render',
    attendeeCount: 12,
  },
  {
    sessionId: 'sess_105',
    creatorId: 'creator_42',
    creatorName: 'John Doe',
    courseId: 'course_react_advanced',
    courseTitle: 'Advanced React Patterns',
    status: 'ended',
    startTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 55,
    title: 'CSS Grid vs Flexbox Deep Dive',
    attendeeCount: 312,
    thumbnail:
      'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=600&auto=format&fit=crop',
  },
  {
    sessionId: 'sess_106',
    creatorId: 'creator_17',
    creatorName: 'Sarah Smith',
    courseId: 'course_ui_systems',
    courseTitle: 'Design Systems at Scale',
    status: 'ended',
    startTime: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 80,
    title: 'State Management Patterns in 2024',
    attendeeCount: 198,
    thumbnail:
      'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=600&auto=format&fit=crop',
  },
];

function formatStartTime(iso: string) {
  const date = new Date(iso);
  return {
    date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    time: date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
  };
}

export default function LiveClasses({ setView }: Props) {
  const { enrolledCourseIds } = useAuth();
  const [liveSessions] = useState<LiveSession[]>(SEED_SESSIONS);
  const [activeTab, setActiveTab] = useState<TabKey>('live');
  const [joiningSessionId, setJoiningSessionId] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<{ session: LiveSession; token: WebRTCToken } | null>(null);
  const [remindersSet, setRemindersSet] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // STRICT RBAC: only sessions whose courseId is in the student's enrolledCourseIds may render.
  const authorizedSessions = useMemo(
    () => liveSessions.filter((session) => enrolledCourseIds.includes(session.courseId)),
    [liveSessions, enrolledCourseIds]
  );

  const upcoming = authorizedSessions.filter((s) => s.status === 'scheduled');
  const live = authorizedSessions.filter((s) => s.status === 'live');
  const past = authorizedSessions.filter((s) => s.status === 'ended');

  const tabSessions: Record<TabKey, LiveSession[]> = { upcoming, live, past };

  async function handleJoinSession(sessionId: string) {
    const session = authorizedSessions.find((s) => s.sessionId === sessionId);
    if (!session) return;

    setJoiningSessionId(sessionId);
    try {
      const token = await fetchWebRTCToken(sessionId);
      setActiveRoom({ session, token });
    } finally {
      setJoiningSessionId(null);
    }
  }

  function handleRemindMe(session: LiveSession) {
    setRemindersSet((prev) => ({ ...prev, [session.sessionId]: true }));
    setToast({ id: Date.now(), message: `Reminder set for "${session.title}"` });
  }

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-6xl w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Sessions</h1>
          <p className="text-sm text-slate-500 mt-1">Sessions from your enrolled cohorts only.</p>
        </div>

        <div className="bg-white border border-slate-100 p-1 rounded-xl flex shadow-sm self-start">
          {([
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'live', label: 'Live Now' },
            { key: 'past', label: 'Past Recordings' },
          ] as { key: TabKey; label: string }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.key ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.key === 'live' && live.length > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 animate-pulse" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              )}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'upcoming' && (
        <SessionSection
          emptyTitle="Nothing on the calendar"
          emptyMessage="No live sessions scheduled for your enrolled cohorts right now."
          sessions={tabSessions.upcoming}
          render={(session) => (
            <UpcomingCard
              key={session.sessionId}
              session={session}
              reminderSet={!!remindersSet[session.sessionId]}
              onRemindMe={() => handleRemindMe(session)}
            />
          )}
        />
      )}

      {activeTab === 'live' && (
        <SessionSection
          emptyTitle="No one is live right now"
          emptyMessage="No live sessions scheduled for your enrolled cohorts right now."
          sessions={tabSessions.live}
          render={(session) => (
            <LiveCard
              key={session.sessionId}
              session={session}
              isJoining={joiningSessionId === session.sessionId}
              onJoin={() => handleJoinSession(session.sessionId)}
            />
          )}
        />
      )}

      {activeTab === 'past' && (
        <SessionSection
          emptyTitle="No recordings yet"
          emptyMessage="Recordings from your enrolled cohorts will show up here after each session ends."
          sessions={tabSessions.past}
          render={(session) => (
            <RecordingCard key={session.sessionId} session={session} onWatch={() => setView('course-learning')} />
          )}
        />
      )}

      {activeRoom && (
        <VideoRoomOverlay
          session={activeRoom.session}
          token={activeRoom.token}
          onClose={() => setActiveRoom(null)}
        />
      )}

      {toast && <Toast message={toast.message} />}
    </div>
  );
}

function SessionSection({
  sessions,
  render,
  emptyTitle,
  emptyMessage,
}: {
  sessions: LiveSession[];
  render: (session: LiveSession) => React.ReactNode;
  emptyTitle: string;
  emptyMessage: string;
}) {
  if (sessions.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{sessions.map(render)}</div>;
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center bg-white border border-slate-100 rounded-2xl py-16 px-8 shadow-sm">
      <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
        <Video size={24} />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm">{message}</p>
    </div>
  );
}

function LiveCard({
  session,
  isJoining,
  onJoin,
}: {
  session: LiveSession;
  isJoining: boolean;
  onJoin: () => void;
}) {
  const { date, time } = formatStartTime(session.startTime);
  return (
    <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-md ring-1 ring-indigo-50 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
      <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-50 text-indigo-600">
        <Video size={28} />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-lg font-bold text-slate-900">{session.title}</h3>
          <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-bold rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live Now
          </span>
        </div>
        <p className="text-sm text-slate-500 mb-2">
          {session.courseTitle} · with <span className="font-medium text-slate-900">{session.creatorName}</span>
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar size={14} /> {date}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} /> {time}
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} /> {session.attendeeCount} attending
          </span>
        </div>
      </div>

      <div className="mt-4 sm:mt-0 w-full sm:w-auto">
        <button
          onClick={onJoin}
          disabled={isJoining}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isJoining ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Connecting…
            </>
          ) : (
            'Join Live'
          )}
        </button>
      </div>
    </div>
  );
}

function UpcomingCard({
  session,
  reminderSet,
  onRemindMe,
}: {
  session: LiveSession;
  reminderSet: boolean;
  onRemindMe: () => void;
}) {
  const { date, time } = formatStartTime(session.startTime);
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center">
      <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50 text-slate-400">
        <Calendar size={28} />
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-900 mb-1">{session.title}</h3>
        <p className="text-sm text-slate-500 mb-2">
          {session.courseTitle} · with <span className="font-medium text-slate-900">{session.creatorName}</span>
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar size={14} /> {date}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} /> {time} ({session.durationMinutes} min)
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} /> {session.attendeeCount} attending
          </span>
        </div>
      </div>

      <div className="mt-4 sm:mt-0 w-full sm:w-auto">
        <button
          onClick={onRemindMe}
          disabled={reminderSet}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
            reminderSet
              ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100 cursor-default'
              : 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          {reminderSet ? (
            <>
              <BellRing size={16} /> Reminder Set
            </>
          ) : (
            <>
              <BellPlus size={16} /> Remind Me
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function RecordingCard({ session, onWatch }: { session: LiveSession; onWatch: () => void }) {
  const { date } = formatStartTime(session.startTime);
  return (
    <div
      onClick={onWatch}
      className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col sm:flex-row"
    >
      <div className="relative w-full sm:w-48 h-32 overflow-hidden flex-shrink-0">
        {session.thumbnail ? (
          <img
            src={session.thumbnail}
            alt={session.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-slate-100" />
        )}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-indigo-600 shadow-lg">
            <Video size={18} />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm">
          {session.durationMinutes} min
        </div>
      </div>
      <div className="p-5 flex-1">
        <h3 className="font-bold text-slate-900 text-base mb-1">{session.title}</h3>
        <p className="text-sm text-slate-500 mb-2">{session.courseTitle}</p>
        <p className="text-xs text-slate-400 flex items-center gap-2">
          <Calendar size={12} /> {date}
        </p>
      </div>
    </div>
  );
}

interface ChatMessage {
  id: number;
  author: string;
  initials: string;
  color: string;
  text: string;
  time: string;
}

const CHAT_AUTHOR_POOL: { author: string; initials: string; color: string }[] = [
  { author: 'Priya N.', initials: 'PN', color: 'bg-fuchsia-500' },
  { author: 'Daniel K.', initials: 'DK', color: 'bg-sky-500' },
  { author: 'Aisha R.', initials: 'AR', color: 'bg-amber-500' },
  { author: 'Tom W.', initials: 'TW', color: 'bg-emerald-500' },
  { author: 'Lucia M.', initials: 'LM', color: 'bg-rose-500' },
];

const CHAT_MESSAGE_POOL = [
  'This explanation of Suspense boundaries is so clear 🔥',
  'Can you share the slides after the session?',
  'Loving the live demo, very practical!',
  'Quick question — does this work with server actions too?',
  'Greetings from the Toronto cohort 👋',
  'The diagram really helped it click for me',
];

function timeNow() {
  return new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function VideoRoomOverlay({
  session,
  token,
  onClose,
}: {
  session: LiveSession;
  token: WebRTCToken;
  onClose: () => void;
}) {
  const [micOn, setMicOn] = useState(true);
  const [sharingScreen, setSharingScreen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      author: session.creatorName,
      initials: session.creatorName
        .split(' ')
        .map((n) => n[0])
        .join(''),
      color: 'bg-indigo-500',
      text: `Welcome everyone, we're starting "${session.title}" now!`,
      time: timeNow(),
    },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const author = CHAT_AUTHOR_POOL[Math.floor(Math.random() * CHAT_AUTHOR_POOL.length)];
      const text = CHAT_MESSAGE_POOL[Math.floor(Math.random() * CHAT_MESSAGE_POOL.length)];
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), author: author.author, initials: author.initials, color: author.color, text, time: timeNow() },
      ]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSendMessage() {
    const text = chatInput.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: Date.now(), author: 'You', initials: 'Y', color: 'bg-slate-500', text, time: timeNow() }]);
    setChatInput('');
  }

  const creatorInitials = session.creatorName
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-6xl h-[90vh] md:h-[85vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col md:flex-row">
        {/* Main stage */}
        <div className="flex-1 flex flex-col min-w-0 min-h-[40vh] md:min-h-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/95">
            <div className="flex items-center gap-3 text-white min-w-0">
              <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded flex items-center gap-1 flex-shrink-0">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-300 animate-pulse" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                LIVE
              </span>
              <span className="font-semibold text-sm truncate">{session.title}</span>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <span className="flex items-center gap-1.5 text-slate-300 text-xs font-medium bg-slate-800 px-2.5 py-1 rounded-full">
                <Users size={13} /> {session.attendeeCount}
              </span>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="relative flex-1 bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center overflow-hidden">
            <div className="flex flex-col items-center gap-3">
              <div className="w-28 h-28 rounded-full bg-indigo-600/90 ring-4 ring-indigo-500/20 flex items-center justify-center text-white text-3xl font-bold">
                {creatorInitials}
              </div>
              <p className="text-slate-300 text-sm font-medium">{session.creatorName}</p>
              <p className="text-slate-500 text-xs font-mono">{token.roomUrl}</p>
            </div>

            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-slate-200 text-xs font-medium px-2.5 py-1 rounded-md">
              {session.creatorName} (Host)
            </div>

            {/* Picture-in-picture screen share */}
            {sharingScreen && (
              <div className="absolute bottom-5 right-5 w-52 sm:w-64 aspect-video bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/60 text-slate-200 text-[10px] font-medium px-1.5 py-0.5 rounded">
                  <ScreenShare size={10} /> Your screen
                </div>
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <ScreenShare size={28} />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 px-5 py-4 border-t border-slate-800 bg-slate-900/95">
            <button
              onClick={() => setMicOn((v) => !v)}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                micOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {micOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <button
              onClick={() => setSharingScreen((v) => !v)}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                sharingScreen ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              {sharingScreen ? <ScreenShare size={18} /> : <ScreenShareOff size={18} />}
            </button>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <PhoneOff size={18} />
            </button>
          </div>
        </div>

        {/* Live chat sidebar */}
        <div className="w-full md:w-72 lg:w-80 flex-1 md:flex-none border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/60 flex flex-col min-h-0">
          <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-800 text-white">
            <MessageSquare size={16} className="text-indigo-400" />
            <span className="font-semibold text-sm">Live Chat</span>
            <span className="ml-auto text-xs text-slate-500 flex items-center gap-1">
              <Pin size={12} /> {session.attendeeCount} watching
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-2.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${msg.color}`}
                >
                  {msg.initials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-slate-200">{msg.author}</span>
                    <span className="text-[10px] text-slate-500">{msg.time}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-snug break-words">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="px-3 py-3 border-t border-slate-800 flex items-center gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Say something…"
              className="flex-1 bg-slate-800 text-sm text-white placeholder:text-slate-500 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSendMessage}
              className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white border border-slate-100 shadow-lg rounded-xl px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
      <p className="text-sm font-medium text-slate-900">{message}</p>
    </div>
  );
}
