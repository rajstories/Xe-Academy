'use client';

import { Search, Filter, Play, MoreVertical, Book } from 'lucide-react';
import { View } from '@/types';

interface Props {
  setView: (view: View) => void;
}

export default function MyCourses({ setView }: Props) {
  const courses = [
    { id: 1, title: 'Intro to Hooks', category: 'Mastering React', progress: 25, total: 32, completed: 8, image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop' },
    { id: 2, title: 'Flexbox Mastery', category: 'Modern CSS', progress: 33, total: 36, completed: 12, bg: 'from-purple-500 to-indigo-600' },
    { id: 3, title: 'Lesson 1', category: 'My First Course', progress: 0, total: 15, completed: 0, bg: 'from-orange-400 to-rose-400' },
    { id: 4, title: 'Advanced Patterns', category: 'Node.js Backend', progress: 100, total: 24, completed: 24, bg: 'from-emerald-400 to-teal-500' },
    { id: 5, title: 'UI Fundamentals', category: 'Framer Motion', progress: 60, total: 20, completed: 12, bg: 'from-blue-500 to-cyan-500' },
    { id: 6, title: 'Database Design', category: 'PostgreSQL', progress: 10, total: 40, completed: 4, bg: 'from-slate-600 to-slate-800' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search courses..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium text-text-primary hover:bg-gray-50 transition-colors">
            <Filter size={18} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
        {['All', 'In Progress', 'Completed', 'Live Courses'].map((filter, i) => (
          <button key={filter} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${i === 0 ? 'bg-text-primary text-white' : 'bg-white border border-border text-text-secondary hover:text-text-primary hover:border-gray-300'}`}>
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-surface border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col cursor-pointer" onClick={() => setView('course-learning')}>
            
            <div className={`relative h-40 w-full overflow-hidden flex-shrink-0 ${course.bg ? `bg-gradient-to-br ${course.bg}` : ''}`}>
              {course.image && (
                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              )}
              {!course.image && (
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-white/80 font-bold text-xl group-hover:scale-105 transition-transform duration-500">{course.category}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-primary shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
                  <Play size={24} className="ml-1" />
                </div>
              </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">{course.category}</p>
                <button className="text-text-secondary hover:text-text-primary -mt-1 -mr-2 p-1"><MoreVertical size={16} /></button>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-4 leading-tight">{course.title}</h3>
              
              <div className="mt-auto">
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="font-medium text-text-secondary">{course.completed}/{course.total} lessons</span>
                  <span className="font-bold text-text-primary">{course.progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${course.progress === 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${course.progress}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
