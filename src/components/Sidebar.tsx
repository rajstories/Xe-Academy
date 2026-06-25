'use client';

import { LayoutDashboard, BookOpen, Calendar, Users, User, Settings, Video, FileText, BarChart3, DollarSign, HelpCircle, BookText, Sparkles } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { Role, View } from '../types';
import { XeLogo } from './XeLogo';
import { getFullName, getInitials } from '../lib/auth';

interface SidebarProps {
  role: Role;
  activeView: View;
  setActiveView: (view: View) => void;
}

export default function Sidebar({ role, activeView, setActiveView }: SidebarProps) {
  const { user } = useUser();
  const displayName = getFullName(user || undefined);
  const email = user?.primaryEmailAddress?.emailAddress || `${role}@xeacademy.com`;
  const studentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-courses', label: 'My Courses', icon: BookOpen },
    { id: 'live-classes', label: 'Live Sessions', icon: Video },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const creatorNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-courses', label: 'My Courses', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'live-sessions', label: 'Live Sessions', icon: Calendar },
  ];

  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'creators', label: 'Creators', icon: User },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
  ];

  const navItems = role === 'student' ? studentNav : role === 'creator' ? creatorNav : adminNav;

  const resourceItems = [
    { label: 'Documentation', icon: BookText },
    { label: 'Help & Support', icon: HelpCircle },
  ];

  const planLabel = role === 'creator' ? 'Creator Pro' : role === 'admin' ? 'Admin Access' : 'Student Plan';

  return (
    <div className="w-[260px] flex-shrink-0 bg-surface border-r border-border flex flex-col h-full z-10 transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center">
          <XeLogo variant="full" theme="light" className="h-7 w-auto" />
        </div>
        <p className="text-sm text-text-secondary mt-1 capitalize">{role} Portal</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id || (activeView === 'course-learning' && item.id === 'my-courses');

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as View)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                  ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                  }`}
              >
                <Icon size={20} className={isActive ? 'text-primary' : 'text-text-secondary'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <p className="px-4 pt-6 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary/60">Resources</p>
        <div className="space-y-1">
          {resourceItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium text-text-secondary hover:bg-gray-50 hover:text-text-primary"
              >
                <Icon size={18} className="text-text-secondary" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 mt-auto border-t border-border/50">
        <div className="relative rounded-xl p-4 bg-gradient-to-br from-primary/10 to-primary/5 mb-4 overflow-hidden ring-1 ring-primary/10">
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm">
              <Sparkles size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-text-primary leading-tight">{planLabel}</p>
              <p className="text-[11px] text-text-secondary">Current tier</p>
            </div>
            <button className="flex-shrink-0 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white transition-colors hover:bg-primary-hover">
              Upgrade
            </button>
          </div>
        </div>

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium text-text-primary hover:bg-gray-50">
          <div className="flex-1 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
               {getInitials(displayName)}
             </div>
             <div className="text-left">
               <p className="text-sm font-semibold text-text-primary leading-tight">{displayName}</p>
             <p className="text-xs text-text-secondary">{email}</p>
             </div>
          </div>
        </button>
      </div>
    </div>
  );
}
