'use client';

import { Book, CheckCircle, Calendar as CalendarIcon, Play, MoreVertical, Search, Video } from 'lucide-react';
import { View } from '../types';

interface Props {
  setView: (view: View) => void;
}

export default function StudentDashboard({ setView }: Props) {
  // Simple calendar generator for current month
  const today = new Date(2024, 9, 24); // Simulating Oct 24, 2024 as in the design
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({length: 35}, (_, i) => i - 1); // Mock calendar grid

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 */}
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border/50 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
            <Book size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Courses enrolled</p>
            <h3 className="text-2xl font-bold text-text-primary mt-0.5">3</h3>
            <p className="text-xs font-medium text-primary mt-1">Keep going!</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border/50 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0 text-success">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Lessons completed</p>
            <h3 className="text-2xl font-bold text-text-primary mt-0.5">2</h3>
            <p className="text-xs font-medium text-success mt-1">Good progress!</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border/50 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0 text-warning">
            <CalendarIcon size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Next live session</p>
            <h3 className="text-lg font-bold text-text-primary mt-0.5">Oct 24, 2:00 PM</h3>
            <p className="text-xs font-medium text-warning mt-1 truncate">Web Development Q&A</p>
          </div>
        </div>

        {/* Motivation Card */}
        <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-6 shadow-md text-white relative overflow-hidden transition-transform hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-1">You&apos;re doing great! 🚀</h3>
            <p className="text-sm text-white/80 leading-relaxed">Consistency today, success tomorrow.</p>
          </div>
          <div className="absolute -bottom-4 -right-2 opacity-50 text-6xl">
            🚀
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        </div>

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Courses & Live Sessions) */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">
          
          {/* Continue Learning */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-primary">Continue learning</h2>
              <button onClick={() => setView('my-courses')} className="text-sm font-medium text-primary hover:underline">View all</button>
            </div>

            <div className="bg-surface rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col divide-y divide-border/50">
              
              {/* Course Item 1 */}
              <div className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:bg-gray-50/50 transition-colors">
                <div className="relative w-full sm:w-48 h-28 rounded-xl overflow-hidden flex-shrink-0 group cursor-pointer" onClick={() => setView('course-learning')}>
                  <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop" alt="Course" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-primary">
                      <Play size={20} className="ml-1" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Mastering React</p>
                    <button className="text-text-secondary hover:text-text-primary"><MoreVertical size={16} /></button>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-3">Intro to Hooks</h3>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-1/4 rounded-full"></div>
                    </div>
                    <span className="text-sm font-bold text-text-primary">25%</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-text-secondary">
                    <span className="flex items-center gap-1"><Book size={14} /> 8 of 32 lessons</span>
                    <span className="flex items-center gap-1"><CalendarIcon size={14} /> 4h 20m left</span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 w-full sm:w-auto flex-shrink-0">
                  <button onClick={() => setView('course-learning')} className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors shadow-sm">
                    Resume <span className="ml-1">›</span>
                  </button>
                </div>
              </div>

              {/* Course Item 2 */}
              <div className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:bg-gray-50/50 transition-colors">
                <div className="relative w-full sm:w-48 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500 to-indigo-600">
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                     <span className="text-white/80 font-bold text-lg">Modern CSS</span>
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Modern CSS</p>
                    <button className="text-text-secondary hover:text-text-primary"><MoreVertical size={16} /></button>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-3">Flexbox Mastery</h3>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-1/3 rounded-full"></div>
                    </div>
                    <span className="text-sm font-bold text-text-primary">33%</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-text-secondary">
                    <span className="flex items-center gap-1"><Book size={14} /> 12 of 36 lessons</span>
                    <span className="flex items-center gap-1"><CalendarIcon size={14} /> 6h 30m left</span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 w-full sm:w-auto flex-shrink-0">
                  <button onClick={() => setView('course-learning')} className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors shadow-sm">
                    Resume <span className="ml-1">›</span>
                  </button>
                </div>
              </div>

              {/* Course Item 3 */}
              <div className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:bg-gray-50/50 transition-colors">
                <div className="relative w-full sm:w-48 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-orange-400 to-rose-400">
                   <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-white/80 font-bold text-lg">First Course</span>
                   </div>
                </div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">My First Course</p>
                    <button className="text-text-secondary hover:text-text-primary"><MoreVertical size={16} /></button>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-3">Lesson 1</h3>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-0 rounded-full"></div>
                    </div>
                    <span className="text-sm font-bold text-text-primary">0%</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-text-secondary">
                    <span className="flex items-center gap-1"><Book size={14} /> 0 of 15 lessons</span>
                    <span className="flex items-center gap-1"><CalendarIcon size={14} /> 1h 10m left</span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 w-full sm:w-auto flex-shrink-0">
                  <button onClick={() => setView('course-learning')} className="w-full sm:w-auto px-6 py-2.5 bg-white border border-border text-text-primary rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm">
                    Start
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* Upcoming Live Sessions */}
          <section>
            <div className="flex items-center justify-between mb-4 mt-2">
              <h2 className="text-lg font-bold text-text-primary">Upcoming live sessions</h2>
              <button onClick={() => setView('live-classes')} className="text-sm font-medium text-primary hover:underline">View all</button>
            </div>

            <div className="bg-surface rounded-2xl border border-border/50 shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
               <div className="w-16 h-16 rounded-xl bg-primary/5 flex items-center justify-center text-primary flex-shrink-0">
                 <CalendarIcon size={28} />
               </div>
               <div className="flex-1">
                 <div className="flex items-center gap-3 mb-1">
                   <h3 className="text-lg font-bold text-text-primary">Web Development Q&A</h3>
                   <span className="px-2 py-0.5 bg-danger/10 text-danger text-xs font-bold rounded flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse"></span>
                     Live
                   </span>
                 </div>
                 <p className="text-sm text-text-secondary mb-2 flex items-center gap-1">
                   with <span className="font-medium text-text-primary">John Doe</span> <CheckCircle size={14} className="text-primary" />
                 </p>
                 <div className="flex items-center gap-4 text-sm font-medium text-text-secondary">
                   <span className="flex items-center gap-1"><CalendarIcon size={14} /> Oct 24, 2024</span>
                   <span className="text-gray-300">•</span>
                   <span>2:00 PM (IST)</span>
                   <span className="text-gray-300">•</span>
                   <span>60 min</span>
                 </div>
               </div>
               <div className="mt-4 sm:mt-0 w-full sm:w-auto">
                 <button onClick={() => setView('live-classes')} className="w-full sm:w-auto px-6 py-2.5 bg-white border-2 border-primary text-primary rounded-lg font-semibold text-sm hover:bg-primary/5 transition-colors">
                   Join session
                 </button>
               </div>
            </div>
          </section>

        </div>

        {/* Right Column (Widgets) */}
        <div className="col-span-1 flex flex-col gap-6">
          
          {/* Calendar Widget */}
          <div className="bg-surface rounded-2xl border border-border/50 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <button className="text-text-secondary hover:text-text-primary"><span className="text-lg">‹</span></button>
              <h3 className="font-bold text-text-primary">October 2024</h3>
              <button className="text-text-secondary hover:text-text-primary"><span className="text-lg">›</span></button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {days.map(day => (
                <div key={day} className="text-xs font-medium text-text-secondary py-1">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
              {dates.map((d, i) => {
                const isSelected = d === 24;
                const isMuted = d <= 0 || d > 31;
                const dateNum = d <= 0 ? 30 + d : d > 31 ? d - 31 : d;
                
                return (
                  <div key={i} className="flex justify-center">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium
                      ${isSelected ? 'bg-primary text-white shadow-md' : ''}
                      ${!isSelected && !isMuted ? 'text-text-primary hover:bg-gray-100 cursor-pointer' : ''}
                      ${isMuted ? 'text-gray-300' : ''}
                    `}>
                      {dateNum}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Actions Widget */}
          <div className="bg-surface rounded-2xl border border-border/50 shadow-sm p-6">
            <h3 className="font-bold text-text-primary mb-4">Quick actions</h3>
            <div className="space-y-1">
              <button onClick={() => setView('my-courses')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3 text-sm font-medium text-text-primary">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Book size={16} />
                  </div>
                  Browse courses
                </div>
                <span className="text-text-secondary group-hover:text-primary transition-colors">›</span>
              </button>
              
              <button onClick={() => setView('live-classes')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3 text-sm font-medium text-text-primary">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Video size={16} />
                  </div>
                  Join live session
                </div>
                <span className="text-text-secondary group-hover:text-primary transition-colors">›</span>
              </button>

              <button onClick={() => setView('live-classes')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3 text-sm font-medium text-text-primary">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <CalendarIcon size={16} />
                  </div>
                  View schedule
                </div>
                <span className="text-text-secondary group-hover:text-primary transition-colors">›</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
