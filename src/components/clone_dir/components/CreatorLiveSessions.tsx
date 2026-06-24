import { useState } from 'react';
import { View } from '@/types';
import { Video, Calendar, Users, Activity, Plus, PlayCircle, MoreVertical, Clock, Settings, X, Edit, Trash, Download, Eye } from 'lucide-react';
import Image from 'next/image';

interface Props {
  setView: (view: View) => void;
}

export default function CreatorLiveSessions({ setView }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recorded'>('upcoming');

  const stats = [
    { label: 'Upcoming Sessions', value: '3', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { label: 'Live Now', value: '0', icon: Activity, color: 'text-red-600', bg: 'bg-red-500/10' },
    { label: 'Total Attendees', value: '1.2k', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Avg. Attendance Rate', value: '68%', icon: PlayCircle, color: 'text-green-600', bg: 'bg-green-500/10' },
  ];

  const upcomingSessions = [
    {
      id: 1,
      title: 'Advanced React Patterns Q&A',
      course: 'Advanced React Patterns',
      date: 'Tomorrow',
      time: '10:00 AM EST',
      duration: '60 min',
      expectedStudents: 45,
      status: 'Scheduled',
    },
    {
      id: 2,
      title: 'UI/UX Masterclass Workshop',
      course: 'UI/UX Masterclass',
      date: 'Next Week',
      time: '2:00 PM EST',
      duration: '90 min',
      expectedStudents: 120,
      status: 'Scheduled',
    }
  ];

  const recordedSessions = [
    {
      id: 3,
      title: 'Next.js 15 Deep Dive',
      course: 'Fullstack Next.js 15',
      date: 'Last Week',
      duration: '1h 15m',
      views: 340,
      status: 'Recorded',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=300&auto=format&fit=crop'
    }
  ];

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div></div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm"
        >
          <Video size={20} />
          Create Live Session
        </button>
      </div>

      {/* Hero Section: Go Live */}
      <div className="bg-gradient-to-br from-primary/10 via-purple-500/5 to-background border border-primary/20 rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-text-primary mb-4">Start a Live Class</h2>
          <p className="text-text-secondary text-lg mb-8 leading-relaxed">
            Launch a live session instantly and interact with your students in real time. Share your screen, answer questions, and build a stronger community.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={() => setView('live-studio')}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Activity size={20} /> Go Live Now
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-white border-2 border-primary/20 text-text-primary hover:border-primary/40 hover:bg-gray-50 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Calendar size={20} /> Schedule Session
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="text-text-secondary text-sm font-medium mb-1">{stat.label}</div>
            <div className="text-3xl font-bold text-text-primary">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Sessions Content */}
      <div className="bg-surface border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex border-b border-border/50">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`px-8 py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'upcoming' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            Upcoming Sessions
          </button>
          <button 
            onClick={() => setActiveTab('recorded')}
            className={`px-8 py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'recorded' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            Recorded Sessions
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'upcoming' && (
            <div className="space-y-4">
              {upcomingSessions.map(session => (
                <div key={session.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border border-border/50 rounded-xl hover:border-primary/30 transition-colors bg-background/50">
                  <div className="flex items-start gap-4 mb-4 sm:mb-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-1">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary text-lg">{session.title}</h4>
                      <div className="text-sm text-text-secondary mt-1">{session.course}</div>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-text-secondary">
                        <div className="flex items-center gap-1.5"><Calendar size={14} /> {session.date}</div>
                        <div className="flex items-center gap-1.5"><Clock size={14} /> {session.time}</div>
                        <div className="flex items-center gap-1.5"><Activity size={14} /> {session.duration}</div>
                        <div className="flex items-center gap-1.5"><Users size={14} /> {session.expectedStudents} Expected</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => setView('live-studio')}
                      className="flex-1 sm:flex-none px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors text-center"
                    >
                      Start Session
                    </button>
                    <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors border border-border/50">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'recorded' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recordedSessions.map(session => (
                <div key={session.id} className="bg-background border border-border/50 rounded-xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                  <div className="relative h-40 w-full bg-gray-100">
                    <Image 
                      src={session.thumbnail} 
                      alt={session.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                        <PlayCircle size={24} />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-md backdrop-blur-md">
                      {session.duration}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="font-bold text-text-primary line-clamp-1">{session.title}</h4>
                    <div className="text-xs text-text-secondary mt-1">{session.course}</div>
                    <div className="flex items-center gap-4 mt-4 text-xs text-text-secondary mb-4">
                      <div className="flex items-center gap-1.5"><Calendar size={14} /> {session.date}</div>
                      <div className="flex items-center gap-1.5"><Eye size={14} /> {session.views} views</div>
                    </div>
                    <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                      <button className="text-primary hover:text-primary-hover text-sm font-medium">Watch</button>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"><Download size={16} /></button>
                        <button className="p-1.5 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg transition-colors"><Trash size={16} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Session Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border/50 bg-gray-50/50">
              <h2 className="text-xl font-bold text-text-primary">Schedule Live Session</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Session Title</label>
                <input type="text" placeholder="e.g. Weekly Q&A Session" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Course (Optional)</label>
                <select className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option>Select a course to link</option>
                  <option>Advanced React Patterns</option>
                  <option>UI/UX Masterclass</option>
                </select>
                <p className="text-xs text-text-secondary mt-1">Linking to a course will notify enrolled students.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Date</label>
                  <input type="date" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Time</label>
                  <input type="time" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
                <textarea rows={3} placeholder="What will be covered in this session?" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
              </div>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <h4 className="text-sm font-bold text-text-primary">Session Settings</h4>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <div className="block bg-primary w-10 h-6 rounded-full transition-colors group-hover:bg-primary-hover"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                  </div>
                  <span className="text-sm text-text-primary font-medium">Record this session</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <div className="block bg-primary w-10 h-6 rounded-full transition-colors group-hover:bg-primary-hover"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                  </div>
                  <span className="text-sm text-text-primary font-medium">Allow student chat</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <div className="block bg-primary w-10 h-6 rounded-full transition-colors group-hover:bg-primary-hover"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                  </div>
                  <span className="text-sm text-text-primary font-medium">Enable Q&A moderation</span>
                </label>
              </div>

            </div>
            
            <div className="p-6 border-t border-border/50 flex justify-end gap-3 bg-gray-50/50">
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-border text-text-primary rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-hover transition-colors shadow-sm"
              >
                Schedule Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
