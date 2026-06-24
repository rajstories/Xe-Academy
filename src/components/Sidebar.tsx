'use client';

import { LayoutDashboard, BookOpen, Calendar, Award, Users, Download, User, Settings, Video, FileText, BarChart3, DollarSign, Activity } from 'lucide-react';
import { Role, View } from '../types';

interface SidebarProps {
  role: Role;
  activeView: View;
  setActiveView: (view: View) => void;
}

export default function Sidebar({ role, activeView, setActiveView }: SidebarProps) {
  const studentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-courses', label: 'My Courses', icon: BookOpen },
    { id: 'live-classes', label: 'Live Sessions', icon: Video },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const creatorNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-courses', label: 'My Courses', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'live-sessions', label: 'Live Sessions', icon: Calendar },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
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

  return (
    <div className="w-[260px] flex-shrink-0 bg-surface border-r border-border flex flex-col h-full z-10 transition-all duration-300">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary tracking-tight">
          Learn<span className="text-text-primary">Space</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1 capitalize">{role} Portal</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
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

      <div className="p-4 mt-auto border-t border-border/50">
        <div className="relative rounded-xl p-4 bg-primary/5 mb-4 overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-50"></div>
           <div className="relative z-10 flex flex-col items-center text-center">
             <div className="w-16 h-16 rounded-full bg-white mb-2 shadow-sm flex items-center justify-center overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e2e8f0" alt="Avatar" className="w-14 h-14 object-cover" />
             </div>
           </div>
        </div>

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium text-text-primary hover:bg-gray-50">
          <div className="flex-1 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
               JD
             </div>
             <div className="text-left">
               <p className="text-sm font-semibold text-text-primary leading-tight">John Doe</p>
               <p className="text-xs text-text-secondary">{role}@learnspace.edu</p>
             </div>
          </div>
        </button>
      </div>
    </div>
  );
}
