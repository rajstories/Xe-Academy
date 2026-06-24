'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, PlayCircle, CheckCircle, Circle, FileText, MessageSquare, Bookmark, Download, Settings, Maximize, Volume2, Pause, Play } from 'lucide-react';
import { View } from '@/types';
// @ts-ignore
import ReactPlayer from 'react-player';

interface Props {
  setView: (view: View) => void;
}

const curriculumData = [
  {
    module: 'Module 1: Introduction',
    lessons: [
      { id: 1, title: 'Welcome to the Course', duration: '2:15', completed: true, videoUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
      { id: 2, title: 'What is React?', duration: '5:10', completed: true, videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0' },
      { id: 3, title: 'Setting up the environment', duration: '12:30', completed: true, videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0' },
    ]
  },
  {
    module: 'Module 2: Hooks Deep Dive',
    lessons: [
      { id: 4, title: 'Understanding useState', duration: '15:20', completed: true, videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0' },
      { id: 5, title: 'The useEffect Hook', duration: '22:15', completed: false, videoUrl: 'https://www.youtube.com/watch?v=0ZJgIjIuY7U' },
      { id: 6, title: 'Custom Hooks', duration: '10:40', completed: false, videoUrl: 'https://www.youtube.com/watch?v=J-g9ZJha8FE' },
      { id: 7, title: 'useMemo & useCallback', duration: '8:00', completed: false, videoUrl: 'https://www.youtube.com/watch?v=THL1OPn72vo' },
    ]
  },
  {
    module: 'Module 3: State Management',
    lessons: [
      { id: 8, title: 'Context API Basics', duration: '14:20', completed: false, videoUrl: 'https://www.youtube.com/watch?v=5LrDIWkK_Bc' },
      { id: 9, title: 'Redux Toolkit Intro', duration: '20:15', completed: false, videoUrl: 'https://www.youtube.com/watch?v=9boMnm5X9ak' },
    ]
  }
];

export default function CourseLearning({ setView }: Props) {
  const [activeTab, setActiveTab] = useState('notes');
  const [activeLesson, setActiveLesson] = useState(curriculumData[1].lessons[1]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const playerRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const target = e.currentTarget;
    if (target.duration) {
      setPlayed(target.currentTime / target.duration);
    }
  };

  const handleDurationChange = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setDuration(e.currentTarget.duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const fraction = Math.max(0, Math.min(1, x / bounds.width));
    setPlayed(fraction);
    if (playerRef.current) {
      playerRef.current.currentTime = fraction * duration;
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const fraction = Math.max(0, Math.min(1, x / bounds.width));
    setVolume(fraction);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error(`Error attempting to exit full-screen mode: ${err.message}`);
      });
    }
  };

  const togglePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    setPlaybackRate(rates[(currentIndex + 1) % rates.length]);
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-in fade-in duration-500">
      
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Left: Curriculum Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 bg-surface border border-border/50 rounded-2xl flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border/50 bg-gray-50/50">
            <h3 className="font-bold text-text-primary mb-2">Course Content</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-success w-[40%] rounded-full"></div>
              </div>
              <span className="text-xs font-bold text-text-primary">40%</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {curriculumData.map((mod, idx) => (
              <div key={idx}>
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider px-2 mb-2">{mod.module}</h4>
                <div className="space-y-1">
                  {mod.lessons.map(lesson => (
                    <button 
                      key={lesson.id}
                      onClick={() => {
                        setActiveLesson(lesson as any);
                        setIsPlaying(true);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex gap-3 transition-colors ${activeLesson.id === lesson.id ? 'bg-primary/10' : 'hover:bg-gray-50'}`}
                    >
                      <div className="mt-0.5">
                        {lesson.completed ? (
                          <CheckCircle size={16} className="text-success" />
                        ) : activeLesson.id === lesson.id ? (
                          <PlayCircle size={16} className="text-primary" />
                        ) : (
                          <Circle size={16} className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium leading-tight mb-1 ${activeLesson.id === lesson.id ? 'text-primary' : 'text-text-primary'}`}>
                          {lesson.id}. {lesson.title}
                        </p>
                        <p className="text-xs text-text-secondary">{lesson.duration}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Video Player */}
        <div ref={playerContainerRef} className="flex-1 flex flex-col min-w-0 bg-black rounded-2xl overflow-hidden shadow-lg relative group">
          {/* Video Container */}
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
             <ReactPlayer
                ref={playerRef}
                src={activeLesson.videoUrl}
                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                playing={isPlaying}
                volume={volume}
                playbackRate={playbackRate}
                onTimeUpdate={handleTimeUpdate}
                onDurationChange={handleDurationChange}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                controls={false}
             />
          </div>
          
          {/* Custom Overlay Controls */}
          <div className={`absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-transparent to-black/40 transition-opacity duration-300 flex flex-col justify-between p-6 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
            <div className="flex justify-between items-start">
               <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm font-medium border border-white/10 shadow-sm">
                 {activeLesson.title}
               </div>
               <button className="bg-black/50 backdrop-blur-md p-2.5 rounded-xl text-white hover:bg-white/20 transition-all border border-white/10 shadow-sm hover:scale-105">
                 <Bookmark size={20} />
               </button>
            </div>
            
            <div className="w-full">
              {/* Progress Bar */}
              <div 
                className="group/progress relative h-2 bg-white/20 rounded-full mb-6 cursor-pointer overflow-visible"
                onClick={handleSeek}
              >
                 <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-100 ease-linear" style={{ width: `${played * 100}%` }}></div>
                 <div 
                   className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow border-2 border-primary opacity-0 group-hover/progress:opacity-100 transform scale-50 group-hover/progress:scale-100 transition-all"
                   style={{ left: `calc(${played * 100}% - 8px)` }}
                 ></div>
              </div>
              
              <div className="flex justify-between items-center text-white">
                <div className="flex items-center gap-6">
                  <button onClick={togglePlay} className="hover:text-primary transition-colors transform hover:scale-110">
                    {isPlaying ? <Pause size={28} className="fill-current" /> : <Play size={28} className="fill-current" />}
                  </button>
                  <div className="flex items-center gap-3">
                    <button className="hover:text-primary transition-colors"><Volume2 size={22} /></button>
                    <div className="w-20 h-1.5 bg-white/30 rounded-full cursor-pointer" onClick={handleVolumeChange}>
                      <div className="h-full bg-white hover:bg-primary rounded-full transition-colors" style={{ width: `${volume * 100}%` }}></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium tabular-nums tracking-wide">{formatTime(played * duration)} / {formatTime(duration)}</span>
                </div>
                
                <div className="flex items-center gap-5">
                  <button onClick={togglePlaybackRate} className="text-sm font-bold hover:text-primary transition-colors bg-white/10 px-2 py-1 rounded">{playbackRate}x</button>
                  <button className="hover:text-primary transition-colors transform hover:rotate-45 duration-300"><Settings size={22} /></button>
                  <button onClick={toggleFullscreen} className="hover:text-primary transition-colors transform hover:scale-110"><Maximize size={22} /></button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Big Play Button Overlay (when paused) */}
          {!isPlaying && (
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
              <div 
                onClick={togglePlay}
                className="w-24 h-24 rounded-full bg-primary/90 backdrop-blur-md text-white flex items-center justify-center shadow-2xl shadow-primary/30 pointer-events-auto cursor-pointer hover:scale-110 transition-all duration-300 border border-white/20"
              >
                <Play size={40} className="fill-current text-white ml-2" />
              </div>
            </div>
          )}
        </div>

        {/* Right: Interaction Panel */}
        <div className="w-full lg:w-80 flex-shrink-0 bg-surface border border-border/50 rounded-2xl flex flex-col overflow-hidden shadow-sm">
          
          <div className="flex border-b border-border/50">
            {[
              { id: 'notes', icon: FileText, label: 'Notes' },
              { id: 'discuss', icon: MessageSquare, label: 'Discuss' },
              { id: 'resources', icon: Download, label: 'Files' },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-sm font-medium flex flex-col items-center gap-1 transition-colors relative
                  ${activeTab === tab.id ? 'text-primary' : 'text-text-secondary hover:bg-gray-50'}`}
              >
                <tab.icon size={18} />
                <span className="text-[10px] uppercase tracking-wider">{tab.label}</span>
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
            {activeTab === 'notes' && (
              <div className="h-full flex flex-col">
                <div className="flex-1 space-y-4">
                  <div className="bg-white p-3 rounded-xl border border-border/50 shadow-sm">
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="text-primary font-bold">@04:12</span>
                      <span className="text-text-secondary">Just now</span>
                    </div>
                    <p className="text-sm text-text-primary leading-relaxed">The dependency array is crucial. Empty array [] means it runs only once on mount.</p>
                  </div>
                </div>
                <div className="mt-4">
                  <textarea 
                    placeholder="Take a note at 09:54..." 
                    className="w-full h-24 p-3 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  ></textarea>
                  <button className="w-full mt-2 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
                    Save Note
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'discuss' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                  <MessageSquare size={24} />
                </div>
                <h4 className="font-bold text-text-primary mb-1">Join the conversation</h4>
                <p className="text-sm text-text-secondary mb-4">Ask questions and discuss with 1,240 other students.</p>
                <button className="px-4 py-2 bg-white border border-border text-text-primary rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                  View Discussions
                </button>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-2">
                <a href="#" className="flex items-center justify-between p-3 bg-white border border-border/50 rounded-xl hover:border-primary/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">Cheat_Sheet.pdf</span>
                  </div>
                  <Download size={16} className="text-text-secondary" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 bg-white border border-border/50 rounded-xl hover:border-primary/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">Starter_Code.zip</span>
                  </div>
                  <Download size={16} className="text-text-secondary" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
