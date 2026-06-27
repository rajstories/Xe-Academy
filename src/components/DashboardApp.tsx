import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Bell,
  X,
  Trash2,
  CheckCircle2,
  Sparkles,
  Video,
  BookOpen,
  Users,
  Info,
  BellRing,
  ChevronRight
} from 'lucide-react';

import Sidebar from './Sidebar';
import Header from './Header';
import StudentDashboard from './StudentDashboard';
import MyCourses from './MyCourses';
import BrowseCourses from './BrowseCourses';
import CourseLearning from './CourseLearning';
import LiveClasses from './LiveClasses';
import CreatorDashboard from './CreatorDashboard';
import CreatorMyCourses from './CreatorMyCourses';
import CreatorStudents from './CreatorStudents';
import CreatorAnalytics from './CreatorAnalytics';
import CreatorLiveSessions from './CreatorLiveSessions';
import LiveStudio from './LiveStudio';
import CourseBuilder from './CourseBuilder';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminCreators from './AdminCreators';
import AdminCourses from './AdminCourses';
import AdminPayments from './AdminPayments';
import AdminAnalytics from './AdminAnalytics';
import AdminReports from './AdminReports';
import Community from './Community';
import Settings from './Settings';
import Documentation from './Documentation';
import HelpSupport from './HelpSupport';

import { Role, View } from '../types';

export type NotificationType = 'live' | 'info' | 'new-content' | 'cohort' | 'payout';

export interface XENotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: NotificationType;
  read: boolean;
  ctaView?: string;
}

interface Toast {
  id: number;
  title: string;
  body: string;
  type: NotificationType;
}

const TOAST_ICON = {
  live: <Video size={16} className="text-rose-600" />,
  'new-content': <BookOpen size={16} className="text-indigo-600" />,
  cohort: <Users size={16} className="text-violet-600" />,
  info: <Info size={16} className="text-slate-600" />,
  payout: <Sparkles size={16} className="text-emerald-600" />,
};

const TOAST_BG = {
  live: 'border-rose-100 bg-rose-50/90 text-rose-950',
  'new-content': 'border-indigo-100 bg-indigo-50/90 text-indigo-950',
  cohort: 'border-violet-100 bg-violet-50/90 text-violet-950',
  info: 'border-slate-100 bg-slate-50/90 text-slate-950',
  payout: 'border-emerald-100 bg-emerald-50/90 text-emerald-950',
};

interface DashboardAppProps {
  initialRole?: Role;
}

export function DashboardApp({ initialRole = 'student' }: DashboardAppProps) {
  const { user, isLoaded } = useUser();
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [currentRouteRole, setCurrentRouteRole] = useState<Role>(initialRole);
  const [currentView, setCurrentView] = useState<View>(() => {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    return parts[1] || 'dashboard';
  });

  // Notifications state
  const [notifications, setNotifications] = useState<XENotification[]>(() => {
    const stored = localStorage.getItem('xe_notifications');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse notifications:', e);
      }
    }
    return [
      {
        id: 'notif-welcome',
        title: 'Welcome to XE Academy',
        body: 'Explore your personalized portal, search guidelines, or application logs.',
        timestamp: 'Just now',
        type: 'info',
        read: false
      },
      {
        id: 'notif-release',
        title: 'v2.0 Documentation Released',
        body: 'Learn about course catalogs, API integrations, and webhook payloads in the resources tab.',
        timestamp: '2 hours ago',
        type: 'new-content',
        read: false,
        ctaView: 'documentation'
      }
    ];
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('xe_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Request browser Notification Permission on Mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const pushNotification = (title: string, body: string, type: NotificationType = 'info', ctaView?: string) => {
    const newNotif: XENotification = {
      id: `notif-${Date.now()}`,
      title,
      body,
      timestamp: 'Just now',
      type,
      read: false,
      ctaView
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Native Browser Push Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body });
      } catch (e) {
        console.error('Desktop notification failed:', e);
      }
    }

    // Slide-in UI Toast
    const toastId = Date.now();
    setToasts(prev => [...prev, { id: toastId, title, body, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 4500);
  };

  // Simulation effect for useful notifications added from creators / platforms
  useEffect(() => {
    const alerts = [
      {
        title: "Live Session Starting",
        body: "Sarah Chen is now live teaching 'Next.js 15 Routing Architecture'. Click to join room.",
        type: 'live',
        ctaView: 'live-classes'
      },
      {
        title: "New Lesson Added",
        body: "Jessica Lane published a new lesson: 'Advanced Keyframing and Motion Specs'.",
        type: 'new-content',
        ctaView: 'my-courses'
      },
      {
        title: "Cohort Challenge Live",
        body: "Week 3 peer-review submission pipeline is now active in the Community tab.",
        type: 'cohort',
        ctaView: 'community'
      },
      {
        title: "API Update Specs",
        body: "Webhooks webhook-signature verification specs have been updated in Developer Docs.",
        type: 'info',
        ctaView: 'documentation'
      }
    ];

    const interval = setInterval(() => {
      // Pick one randomly
      const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
      pushNotification(randomAlert.title, randomAlert.body, randomAlert.type as NotificationType, randomAlert.ctaView);
    }, 45000); // Trigger mock notification every 45 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const clerkRole = user?.publicMetadata?.role as Role | undefined;
    const resolvedRole = clerkRole || initialRole;
    setUserRole(resolvedRole);
    setCurrentRouteRole(resolvedRole);
  }, [initialRole, isLoaded, user?.publicMetadata?.role]);

  const getPathForView = (role: Role, view: View) => {
    const base = role === 'admin' ? '/admin' : role === 'creator' ? '/studio' : '/dashboard';
    if (view === 'dashboard') return base;
    return `${base}/${view}`;
  };

  const setRole = (newRole: Role) => {
    localStorage.setItem('xe_active_role', newRole);
    setUserRole(newRole);
    setCurrentRouteRole(newRole);
    setCurrentView('dashboard');
    const newPath = newRole === 'admin' ? '/admin' : newRole === 'creator' ? '/studio' : '/dashboard';
    window.history.pushState({}, '', newPath);
  };

  const setActiveView = (newView: View) => {
    setCurrentView(newView);
    const newPath = getPathForView(currentRouteRole, newView);
    window.history.pushState({}, '', newPath);
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const parts = path.split('/').filter(Boolean);
      const base = parts[0];
      const view = parts[1] || 'dashboard';
      
      const expectedBase = currentRouteRole === 'admin' ? 'admin' : currentRouteRole === 'creator' ? 'studio' : 'dashboard';
      if (base === expectedBase) {
        setCurrentView(view);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentRouteRole]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif: XENotification) => {
    // Mark as read
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    if (notif.ctaView) {
      if (notif.ctaView === 'documentation') {
        window.history.pushState({}, '', '/documentation');
        window.dispatchEvent(new PopStateEvent('popstate'));
        setNotificationsOpen(false);
        return;
      }
      setCurrentView(notif.ctaView);
      setNotificationsOpen(false);
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (currentView !== 'documentation') return;
    window.history.pushState({}, '', '/documentation');
    window.dispatchEvent(new Event('popstate'));
  }, [currentView]);

  // Prevent rendering before hydration
  if (!userRole) return null;

  // Authorization Check
  let isAuthorized = true;
  if (currentRouteRole === 'admin' && userRole !== 'admin') {
    isAuthorized = false;
  }
  if (currentRouteRole === 'creator' && userRole !== 'creator' && userRole !== 'admin') {
    isAuthorized = false;
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white text-slate-900 p-8">
        <ShieldAlert size={64} className="text-red-500 mb-6" />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-8 text-center max-w-md">
          You do not have permission to view this {currentRouteRole} panel. Please switch to an authorized role.
        </p>
        <button
          onClick={() => {
            setCurrentRouteRole(userRole);
            setCurrentView('dashboard');
          }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          Return to My Dashboard
        </button>
      </div>
    );
  }

  const renderContent = () => {
    if (currentView === 'help-support') {
      return <HelpSupport setView={setActiveView} />;
    }
    if (currentView === 'documentation') {
      return <Documentation />;
    }
    if (currentRouteRole === 'student') {
      switch (currentView) {
        case 'dashboard': return <StudentDashboard setView={setActiveView} onNotificationsClick={() => setNotificationsOpen(true)} />;
        case 'browse-courses': return <BrowseCourses setView={setActiveView} />;
        case 'my-courses': return <MyCourses setView={setActiveView} />;
        case 'course-learning': return <CourseLearning setView={setActiveView} />;
        case 'live-classes': return <LiveClasses setView={setActiveView} />;
        case 'schedule': return <div className="p-8 flex items-center justify-center text-slate-500 h-full text-lg">Schedule module coming soon.</div>;
        case 'assignments': return <div className="p-8 flex items-center justify-center text-slate-500 h-full text-lg">Assignments module coming soon.</div>;
        case 'community': return <Community setView={setActiveView} />;
        case 'settings': return <Settings setView={setActiveView} />;
        default: return <div className="p-8 flex items-center justify-center text-slate-500 h-full text-lg">Page not found in Student Panel.</div>;
      }
    } else if (currentRouteRole === 'creator') {
      switch (currentView) {
        case 'dashboard': return <CreatorDashboard setView={setActiveView} />;
        case 'my-courses': return <CreatorMyCourses setView={setActiveView} />;
        case 'course-builder': return <CourseBuilder setView={setActiveView} />;
        case 'students': return <CreatorStudents setView={setActiveView} />;
        case 'analytics': return <CreatorAnalytics setView={setActiveView} />;
        case 'live-sessions': return <CreatorLiveSessions setView={setActiveView} />;
        case 'live-studio': return <LiveStudio setView={setActiveView} />;
        case 'revenue': return <div className="p-8 flex items-center justify-center text-slate-500 h-full text-lg">Revenue module coming soon.</div>;
        case 'settings': return <Settings setView={setActiveView} />;
        default: return <div className="p-8 flex items-center justify-center text-slate-500 h-full text-lg">Page not found in Creator Panel.</div>;
      }
    } else if (currentRouteRole === 'admin') {
      switch (currentView) {
        case 'dashboard': return <AdminDashboard setView={setActiveView} />;
        case 'users': return <AdminUsers setView={setActiveView} />;
        case 'creators': return <AdminCreators setView={setActiveView} />;
        case 'courses': return <AdminCourses setView={setActiveView} />;
        case 'payments': return <AdminPayments setView={setActiveView} />;
        case 'analytics': return <AdminAnalytics setView={setActiveView} />;
        case 'reports': return <AdminReports setView={setActiveView} />;
        case 'settings': return <Settings setView={setActiveView} />;
        default: return <div className="p-8 flex items-center justify-center text-slate-500 h-full text-lg">Page not found in Admin Panel.</div>;
      }
    }
    return <StudentDashboard setView={setActiveView} onNotificationsClick={() => setNotificationsOpen(true)} />;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 w-full text-left">
      {/* Sidebar */}
      <Sidebar 
        role={currentRouteRole} 
        activeView={currentView} 
        setActiveView={(view) => {
          setActiveView(view);
          setMobileMenuOpen(false);
        }}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header
          role={currentRouteRole}
          setRole={setRole}
          activeView={currentView}
          unreadCount={unreadCount}
          onNotificationsClick={() => setNotificationsOpen(true)}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className={`flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth ${currentView === 'live-studio' || currentView === 'documentation' ? 'p-0 md:p-0' : ''}`}>
          <div className={`max-w-[1600px] mx-auto h-full ${currentView === 'live-studio' || currentView === 'documentation' ? 'max-w-none' : ''}`}>
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Global Slide-Over Notification Drawer */}
      <AnimatePresence>
        {notificationsOpen && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNotificationsOpen(false)}
              className="absolute inset-0 bg-slate-950/20 backdrop-blur-xs"
            />

            {/* Sidebar drawer card */}
            <motion.aside
              initial={{ x: 380 }}
              animate={{ x: 0 }}
              exit={{ x: 380 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="relative h-full w-full max-w-sm bg-white shadow-[0_0_50px_rgba(0,0,0,0.15)] flex flex-col border-l border-border z-10"
            >
              <div className="flex items-center justify-between border-b border-border p-6 bg-slate-50/60">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">Your platform updates feed</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-bold text-primary hover:text-primary-hover hover:underline mr-1"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors active:scale-95"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {notifications.map((notif) => {
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`relative group rounded-2xl border p-4.5 transition-all text-left shadow-sm flex items-start gap-3 cursor-pointer
                        ${notif.read
                          ? 'bg-white border-border/80 hover:border-slate-300'
                          : 'bg-primary/5 border-primary/20 ring-1 ring-primary/5 hover:border-primary/45'
                        }`}
                    >
                      {/* Unread dot */}
                      {!notif.read && (
                        <span className="absolute top-4.5 right-4 h-2 w-2 rounded-full bg-primary" />
                      )}

                      {/* Icon */}
                      <div className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-border shadow-inner`}>
                        {TOAST_ICON[notif.type] || <Info size={16} className="text-slate-600" />}
                      </div>

                      {/* Body */}
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {notif.title}
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed mt-1">
                          {notif.body}
                        </p>
                        
                        <div className="flex items-center justify-between gap-4 mt-3">
                          <span className="text-[10px] font-semibold text-text-secondary/60">
                            {notif.timestamp}
                          </span>
                          {notif.ctaView && (
                            <span className="text-[10px] font-bold text-primary flex items-center gap-0.5 hover:underline">
                              View details
                              <ChevronRight size={10} />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 absolute bottom-4.5 right-4 text-text-secondary hover:text-danger transition-opacity p-1 hover:bg-slate-100 rounded-lg"
                        title="Delete notification"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}

                {notifications.length === 0 && (
                  <div className="text-center py-20 flex flex-col items-center justify-center">
                    <div className="h-16 w-16 bg-slate-50 border border-border/80 rounded-2xl flex items-center justify-center text-text-secondary/40 mb-4 shadow-inner">
                      <BellRing size={28} />
                    </div>
                    <h3 className="font-bold text-slate-950 text-sm">All caught up!</h3>
                    <p className="text-xs text-text-secondary mt-1 max-w-[200px]">
                      We will notify you when creators upload lessons or start live workshops.
                    </p>
                  </div>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Screen Toasts Layer */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`pointer-events-auto w-full border rounded-2xl p-4.5 shadow-[0_16px_45px_rgba(0,0,0,0.1)] flex items-start gap-3 backdrop-blur-md relative overflow-hidden ${TOAST_BG[toast.type]}`}
            >
              {/* Toast Icon */}
              <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 border border-white/60 shadow-sm">
                {TOAST_ICON[toast.type]}
              </div>

              {/* Text */}
              <div className="flex-1 pr-4">
                <h4 className="text-sm font-black tracking-tight">{toast.title}</h4>
                <p className="text-xs text-current/80 mt-1 leading-normal">{toast.body}</p>
              </div>

              {/* Close button */}
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-current/50 hover:text-current transition-colors absolute top-4 right-4"
              >
                <X size={15} />
              </button>

              {/* Timer Bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: 0 }}
                transition={{ duration: 4.5, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-1 bg-primary/40 w-full"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
