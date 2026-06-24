'use client';

import { useState } from 'react';
import { Settings2, X, Check, GraduationCap, PenTool, Shield } from 'lucide-react';
import { Role, View } from '../types';

interface RoleSwitcherProps {
  currentRole: Role;
  setRole: (role: Role) => void;
  setActiveView: (view: View) => void;
}

export default function RoleSwitcher({ currentRole, setRole, setActiveView }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-hover transition-transform hover:scale-105 z-50"
      >
        <Settings2 size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-64 bg-surface rounded-2xl shadow-2xl border border-border/50 p-4 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-semibold text-text-primary">Switch role</h3>
        <button onClick={() => setIsOpen(false)} className="text-text-secondary hover:text-text-primary">
          <X size={16} />
        </button>
      </div>
      
      <div className="space-y-1">
        <button 
          onClick={() => handleRoleChange('student')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${currentRole === 'student' ? 'bg-primary/5 text-primary font-medium' : 'text-text-secondary hover:bg-gray-50'}`}
        >
          <GraduationCap size={16} />
          <span className="flex-1 text-left">Student</span>
          {currentRole === 'student' && <Check size={16} />}
        </button>
        
        <button 
          onClick={() => handleRoleChange('creator')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${currentRole === 'creator' ? 'bg-primary/5 text-primary font-medium' : 'text-text-secondary hover:bg-gray-50'}`}
        >
          <PenTool size={16} />
          <span className="flex-1 text-left">Creator</span>
          {currentRole === 'creator' && <Check size={16} />}
        </button>

        <button 
          onClick={() => handleRoleChange('admin')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${currentRole === 'admin' ? 'bg-primary/5 text-primary font-medium' : 'text-text-secondary hover:bg-gray-50'}`}
        >
          <Shield size={16} />
          <span className="flex-1 text-left">Admin</span>
          {currentRole === 'admin' && <Check size={16} />}
        </button>
      </div>
    </div>
  );
}
