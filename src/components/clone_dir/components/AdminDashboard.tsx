'use client';

import { Shield, Users, Database, Server, Settings, AlertTriangle } from 'lucide-react';
import { View } from '@/types';

interface Props {
  setView: (view: View) => void;
}

export default function AdminDashboard({ setView }: Props) {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border/50 flex flex-col items-center text-center justify-center min-h-[200px]">
           <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
             <Users size={32} />
           </div>
           <h3 className="text-3xl font-bold text-text-primary mb-1">24.5k</h3>
           <p className="text-sm font-medium text-text-secondary">Total Active Users</p>
        </div>
        
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border/50 flex flex-col items-center text-center justify-center min-h-[200px]">
           <div className="w-16 h-16 rounded-2xl bg-success/10 text-success flex items-center justify-center mb-4">
             <Database size={32} />
           </div>
           <h3 className="text-3xl font-bold text-text-primary mb-1">$452k</h3>
           <p className="text-sm font-medium text-text-secondary">Platform Volume</p>
        </div>
        
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border/50 flex flex-col items-center text-center justify-center min-h-[200px]">
           <div className="w-16 h-16 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mb-4">
             <AlertTriangle size={32} />
           </div>
           <h3 className="text-3xl font-bold text-text-primary mb-1">12</h3>
           <p className="text-sm font-medium text-text-secondary">Pending Moderations</p>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border/50 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Server size={24} className="text-primary" />
          <h3 className="font-bold text-lg text-text-primary">System Health</h3>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-text-primary">API Gateway</span>
              <span className="text-sm font-bold text-success">Online (99.99%)</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-success w-[99%]"></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-text-primary">Database Cluster</span>
              <span className="text-sm font-bold text-success">Healthy</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-success w-[95%]"></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-text-primary">Video Streaming Engine</span>
              <span className="text-sm font-bold text-warning">High Load</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-warning w-[85%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
