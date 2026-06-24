'use client';

import { useState } from 'react';
import { Calendar, Clock, Users, Play, Video, ChevronRight } from 'lucide-react';
import { View } from '@/types';

interface Props {
  setView: (view: View) => void;
}

export default function LiveClasses({ setView }: Props) {
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcoming = [
    { id: 1, title: 'Web Development Q&A', instructor: 'John Doe', date: 'Oct 24, 2024', time: '2:00 PM', duration: '60 min', isLive: true, attendees: 145 },
    { id: 2, title: 'React Performance Tuning', instructor: 'Sarah Smith', date: 'Oct 26, 2024', time: '10:00 AM', duration: '90 min', isLive: false, attendees: 89 },
    { id: 3, title: 'Career Advice for Devs', instructor: 'Mike Johnson', date: 'Oct 28, 2024', time: '5:00 PM', duration: '45 min', isLive: false, attendees: 210 },
  ];

  const recordings = [
    { id: 4, title: 'CSS Grid vs Flexbox', date: 'Oct 20, 2024', duration: '55 min', thumbnail: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=600&auto=format&fit=crop' },
    { id: 5, title: 'State Management 2024', date: 'Oct 15, 2024', duration: '1h 20m', thumbnail: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=600&auto=format&fit=crop' },
    { id: 6, title: 'Figma to Code', date: 'Oct 10, 2024', duration: '60 min', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop' },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-12 max-w-6xl w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
        
        <div className="bg-surface border border-border/50 p-1 rounded-xl flex">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'upcoming' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setActiveTab('past')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'past' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Past Recordings
          </button>
        </div>
      </div>

      {/* Upcoming Sessions */}
      {activeTab === 'upcoming' && (
        <section className="animate-in fade-in duration-300">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            Upcoming Sessions
            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{upcoming.length}</span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcoming.map(session => (
              <div key={session.id} className={`bg-surface rounded-2xl p-5 border ${session.isLive ? 'border-primary/30 shadow-md ring-1 ring-primary/10' : 'border-border/50 shadow-sm'} flex flex-col sm:flex-row gap-5 items-start sm:items-center`}>
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${session.isLive ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-text-secondary'}`}>
                  {session.isLive ? <Video size={28} /> : <Calendar size={28} />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-text-primary">{session.title}</h3>
                    {session.isLive && (
                      <span className="px-2 py-0.5 bg-danger/10 text-danger text-xs font-bold rounded flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-danger"></span> Live Now
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mb-2">with <span className="font-medium text-text-primary">{session.instructor}</span></p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-text-secondary">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {session.date}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {session.time} ({session.duration})</span>
                    <span className="flex items-center gap-1"><Users size={14} /> {session.attendees} attending</span>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-0 w-full sm:w-auto">
                  <button className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors ${session.isLive ? 'bg-primary text-white hover:bg-primary-hover shadow-sm' : 'bg-white border-2 border-primary text-primary hover:bg-primary/5'}`}>
                    {session.isLive ? 'Join Live' : 'Remind me'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Past Recordings */}
      {activeTab === 'past' && (
        <section className="animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">Past Recordings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recordings.map(rec => (
              <div key={rec.id} className="bg-surface border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer" onClick={() => setView('course-learning')}>
                <div className="relative h-48 w-full overflow-hidden flex-shrink-0">
                  <img src={rec.thumbnail} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center text-primary shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
                      <Play size={28} className="ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm">
                    {rec.duration}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-text-primary text-lg mb-2">{rec.title}</h3>
                  <p className="text-sm text-text-secondary flex items-center gap-2"><Calendar size={14} /> {rec.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
