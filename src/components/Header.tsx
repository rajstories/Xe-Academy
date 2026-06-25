'use client';

import { Bell, ChevronDown, LogOut } from 'lucide-react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { Role, View } from '../types';
import { getUserDisplayName } from '../lib/auth';

interface HeaderProps {
  role: Role;
  setRole: (role: Role) => void;
  activeView: View;
  unreadCount?: number;
  onNotificationsClick?: () => void;
}

export default function Header({ role, setRole, activeView, unreadCount, onNotificationsClick }: HeaderProps) {
  const { signOut } = useClerk();
  const { user } = useUser();
  const firstName = getUserDisplayName(user || undefined);

  const getHeaderInfo = (view: string, currentRole: Role) => {
    if (view === 'help-support') {
      return { title: 'Help & Support', subtitle: "We're here to help you learn without friction." };
    }
    if (view === 'documentation') {
      return { title: 'Documentation', subtitle: 'Developer guides, API references, and manuals.' };
    }

    if (currentRole === 'student') {
      switch (view) {
        case 'dashboard': return { title: `Welcome back, ${firstName}`, subtitle: 'Your learning command center.' };
        case 'my-courses': return { title: 'My Courses', subtitle: 'Continue your learning journey.' };
        case 'live-classes': return { title: 'Live Sessions', subtitle: 'Manage and join your upcoming live classes.' };
        case 'schedule': return { title: 'Schedule', subtitle: 'Organize your learning calendar.' };
        case 'assignments': return { title: 'Assignments', subtitle: 'Track your assignments.' };
        case 'community': return { title: 'Community', subtitle: 'Connect and collaborate with learners.' };
        case 'settings': return { title: 'Settings', subtitle: 'Manage your account preferences.' };
        case 'course-learning': return { title: 'Course Learning', subtitle: 'Mastering your currently selected course.' };
        default: return { title: 'Dashboard', subtitle: `Welcome back, ${firstName}` };
      }
    } else if (currentRole === 'creator') {
      switch (view) {
        case 'dashboard': return { title: `Welcome back, ${firstName}`, subtitle: 'Revenue, sales, students, and watch-time intelligence.' };
        case 'my-courses': return { title: 'My Courses', subtitle: 'Create, publish, duplicate, and manage premium course tracks.' };
        case 'course-builder': return { title: 'Course Builder', subtitle: 'Structure and edit your course contents.' };
        case 'students': return { title: 'Students', subtitle: 'Search, filter, export, and manage enrolled learners.' };
        case 'analytics': return { title: 'Analytics', subtitle: 'View course performance metrics.' };
        case 'live-sessions': return { title: 'Live Sessions', subtitle: 'Broadcast command cockpit for live teaching.' };
        case 'live-studio': return { title: 'Live Studio', subtitle: 'You are currently live.' };
        case 'revenue': return { title: 'Revenue', subtitle: 'Track your earnings and payouts.' };
        case 'settings': return { title: 'Settings', subtitle: 'Manage your creator profile.' };
        default: return { title: 'Creator Studio', subtitle: `Welcome back, ${firstName}.` };
      }
    } else if (currentRole === 'admin') {
      switch (view) {
        case 'dashboard': return { title: 'Admin Center', subtitle: 'Platform overview and system health.' };
        case 'users': return { title: 'Users', subtitle: 'Manage platform users.' };
        case 'creators': return { title: 'Creators', subtitle: 'Manage platform creators.' };
        case 'courses': return { title: 'Courses', subtitle: 'Manage all platform courses.' };
        case 'payments': return { title: 'Payments', subtitle: 'Monitor platform transactions.' };
        case 'analytics': return { title: 'Analytics', subtitle: 'Platform-wide analytics.' };
        case 'reports': return { title: 'Reports', subtitle: 'System reports and moderation.' };
        case 'settings': return { title: 'Platform Settings', subtitle: 'Configure platform parameters.' };
        default: return { title: 'Admin Center', subtitle: 'Platform overview and system health.' };
      }
    }
    return { title: 'Dashboard', subtitle: 'Welcome back.' };
  };

  const { title, subtitle } = getHeaderInfo(activeView, role);

  return (
    <header className="flex-shrink-0 bg-transparent flex items-center justify-between px-4 md:px-8 py-6 z-10 border-b border-border/10 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary capitalize">
          {title}
        </h2>
        <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onNotificationsClick}
          className="relative w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
        >
          <Bell size={20} className="text-text-primary" />
          {unreadCount !== undefined && unreadCount > 0 ? (
            <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger border-2 border-background"></span>
            </span>
          ) : null}
        </button>

        <div className="relative group">
          <button className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 bg-primary/10 text-primary rounded-full font-medium text-sm transition-colors hover:bg-primary/15">
            {user?.hasImage ? (
              <img src={user.imageUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                {role.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="capitalize">{role} Profile</span>
            <ChevronDown size={16} />
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-lg border border-border/50 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <button
              onClick={async () => {
                localStorage.removeItem('xe_active_role');
                await signOut({ redirectUrl: '/' });
              }}
              className="flex w-full items-center gap-2 text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors font-medium"
            >
              <LogOut size={15} />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
