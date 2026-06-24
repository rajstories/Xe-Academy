'use client';

import { Users, DollarSign, BookOpen, Clock, ArrowUpRight, Plus, MoreVertical, Activity } from 'lucide-react';
import { View } from '@/types';

interface Props {
  setView: (view: View) => void;
}

export default function CreatorDashboard({ setView }: Props) {
  const stats = [
    { label: 'Total Revenue', value: '$12,450', change: '+14%', positive: true, icon: DollarSign },
    { label: 'Total Students', value: '1,240', change: '+5%', positive: true, icon: Users },
    { label: 'Active Courses', value: '4', change: '0%', positive: true, icon: BookOpen },
    { label: 'Avg. Watch Time', value: '4h 12m', change: '+22%', positive: true, icon: Clock },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm">
          <Plus size={18} />
          Create Course
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-surface rounded-2xl p-6 shadow-sm border border-border/50">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <stat.icon size={20} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${stat.positive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {stat.change} <ArrowUpRight size={12} />
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text-primary">{stat.value}</h3>
              <p className="text-sm font-medium text-text-secondary mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart Area (Mock) */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div className="bg-surface rounded-2xl border border-border/50 shadow-sm p-6 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-text-primary">Revenue Overview</h3>
              <select className="bg-gray-50 border border-border text-sm rounded-lg px-3 py-1.5 focus:outline-none">
                <option>Last 30 days</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="flex-1 flex items-end gap-2 text-center text-xs text-text-secondary pb-4 relative">
              {/* Mock Bar Chart */}
              <div className="absolute left-0 top-0 h-full w-full flex flex-col justify-between pb-8 pointer-events-none">
                 <div className="border-b border-border border-dashed w-full h-0"></div>
                 <div className="border-b border-border border-dashed w-full h-0"></div>
                 <div className="border-b border-border border-dashed w-full h-0"></div>
                 <div className="border-b border-border border-dashed w-full h-0"></div>
              </div>
              {[40, 60, 45, 80, 55, 90, 75, 100, 85, 65, 50, 70].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end gap-2 z-10 group">
                  <div className="w-full bg-primary/20 group-hover:bg-primary transition-colors rounded-t-sm" style={{ height: `${h}%` }}></div>
                  <span className="hidden sm:block">Week {i+1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Area */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="bg-surface rounded-2xl border border-border/50 shadow-sm p-6">
            <h3 className="font-bold text-text-primary mb-4">Recent Sales</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Sale${i}&backgroundColor=e2e8f0`} alt="Avatar" className="w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-text-primary">New Student {i}</p>
                    <p className="text-xs text-text-secondary">Mastering React</p>
                  </div>
                  <span className="font-bold text-success text-sm">+$99</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm font-medium text-primary hover:underline">View all transactions</button>
          </div>
          
          <div className="bg-surface rounded-2xl border border-border/50 shadow-sm p-6">
             <div className="flex items-center gap-3 mb-2">
                <Activity size={20} className="text-warning" />
                <h3 className="font-bold text-text-primary">System Status</h3>
             </div>
             <p className="text-sm text-text-secondary mb-4">Your next payout is scheduled for Nov 1, 2024.</p>
             <div className="bg-gray-50 rounded-xl p-4 border border-border">
                <p className="text-xs text-text-secondary mb-1">Available balance</p>
                <p className="text-2xl font-bold text-text-primary">$4,250.00</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
