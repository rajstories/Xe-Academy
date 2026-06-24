'use client';

import { useState } from 'react';
import { User, Bell, Lock, CreditCard, Monitor, Save, Settings as SettingsIcon } from 'lucide-react';
import { View } from '@/types';

interface Props {
  setView: (view: View) => void;
}

export default function Settings({ setView }: Props) {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'appearance', label: 'Appearance', icon: Monitor },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-12 max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-left
                  ${isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                  }`}
              >
                <tab.icon size={18} className={isActive ? 'text-primary' : 'text-text-secondary'} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-surface border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
          
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-1">Profile Information</h3>
                <p className="text-sm text-text-secondary mb-6">Update your personal information and public profile.</p>
                
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-border">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e2e8f0" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm">
                      Change Avatar
                    </button>
                    <button className="px-4 py-2 bg-white border border-border text-text-primary rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                      Remove
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">First Name</label>
                    <input type="text" defaultValue="John" className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Last Name</label>
                    <input type="text" defaultValue="Doe" className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-primary mb-2">Email Address</label>
                    <input type="email" defaultValue="student@learnspace.edu" className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-secondary" readOnly />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-primary mb-2">Bio</label>
                    <textarea rows={4} defaultValue="Frontend developer learning React and modern web technologies." className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"></textarea>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/50">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm">
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab !== 'profile' && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
               <div className="w-16 h-16 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-4">
                 <SettingsIcon size={32} />
               </div>
               <h3 className="text-lg font-bold text-text-primary mb-2 capitalize">{activeTab} Settings</h3>
               <p className="text-sm text-text-secondary max-w-sm">This section is currently under construction. Please check back later.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
