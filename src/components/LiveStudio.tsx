import { useState, useEffect } from 'react';
import { View } from '../types';
import { Video, Mic, MicOff, VideoOff, ScreenShare, MessageSquare, Users, Settings, PhoneOff, Activity, MoreVertical, Send, HelpCircle, CheckCircle, Trash, Clock } from 'lucide-react';

interface Props {
  setView: (view: View) => void;
}

export default function LiveStudio({ setView }: Props) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'chat' | 'qa' | 'participants'>('chat');
  const [chatInput, setChatInput] = useState('');
  
  const [messages, setMessages] = useState([
    { id: 1, user: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop', text: 'Hello everyone!', time: '10:02 AM' },
    { id: 2, user: 'Sarah Smith', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop', text: 'Excited for this session!', time: '10:03 AM' },
  ]);

  const [questions, setQuestions] = useState([
    { id: 1, user: 'Michael Davis', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop', text: 'Can you explain the render props pattern again?', votes: 5, answered: false },
    { id: 2, user: 'Emily Chen', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop', text: 'Is this available in React 18?', votes: 2, answered: true },
  ]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages([...messages, {
      id: Date.now(),
      user: 'You (Host)',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setChatInput('');
  };

  const handleEndStream = () => {
    if (confirm('Are you sure you want to end this live session?')) {
      setView('live-sessions');
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-background animate-in fade-in duration-500 overflow-hidden rounded-2xl border border-border/50 shadow-sm relative">
      
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col relative bg-black">
        {/* Top Status Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-md animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full"></span> LIVE
            </span>
            <span className="bg-black/50 text-white backdrop-blur-md px-3 py-1 rounded-md text-xs font-medium border border-white/10 flex items-center gap-1.5">
              <Clock size={12} /> 00:24:15
            </span>
            <span className="bg-black/50 text-white backdrop-blur-md px-3 py-1 rounded-md text-xs font-medium border border-white/10 flex items-center gap-1.5">
              <Users size={12} /> 124 Viewers
            </span>
          </div>
          
          <div className="text-white font-medium text-sm drop-shadow-md">
            Advanced React Patterns Q&A
          </div>
        </div>

        {/* Video Player Placeholder */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          {isVideoOff ? (
            <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center text-white border-4 border-gray-700">
              <VideoOff size={48} />
            </div>
          ) : (
            <>
              {/* Simulated Video Feed */}
              <img 
                src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1200&auto=format&fit=crop"
                alt="Camera Feed"
                fill
                className="object-cover opacity-80"
                unoptimized
              />
              {/* Presenter Name Tag */}
              <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-white text-sm font-medium shadow-lg">
                Alex Developer (Host)
              </div>
            </>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="p-4 bg-gray-900 border-t border-gray-800 flex items-center justify-center gap-4 z-10">
          <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-2xl border border-gray-700 shadow-inner">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-xl transition-all ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button 
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-4 rounded-xl transition-all ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
              title={isVideoOff ? "Start Video" : "Stop Video"}
            >
              {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>
            <button 
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-4 rounded-xl transition-all ${isScreenSharing ? 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border border-blue-500/50' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
              title="Share Screen"
            >
              <ScreenShare size={24} />
            </button>
            <button className="p-4 bg-gray-700 text-white hover:bg-gray-600 rounded-xl transition-all">
              <Settings size={24} />
            </button>
          </div>
          
          <button 
            onClick={handleEndStream}
            className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg flex items-center gap-2 ml-4"
          >
            <PhoneOff size={20} /> End Stream
          </button>
        </div>
      </div>

      {/* Right Sidebar (Chat & Q&A) */}
      <div className="w-full md:w-96 bg-surface border-l border-border/50 flex flex-col h-full z-20">
        
        {/* Sidebar Tabs */}
        <div className="flex border-b border-border/50 bg-gray-50/50">
          <button 
            onClick={() => setActiveSidebarTab('chat')}
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex justify-center items-center gap-2 ${activeSidebarTab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            <MessageSquare size={16} /> Chat
          </button>
          <button 
            onClick={() => setActiveSidebarTab('qa')}
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex justify-center items-center gap-2 ${activeSidebarTab === 'qa' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            <HelpCircle size={16} /> Q&A
          </button>
          <button 
            onClick={() => setActiveSidebarTab('participants')}
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex justify-center items-center gap-2 ${activeSidebarTab === 'participants' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            <Users size={16} /> Users
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4">
          
          {/* Chat Tab */}
          {activeSidebarTab === 'chat' && (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.user === 'You (Host)' ? 'flex-row-reverse' : ''}`}>
                  <img 
                    src={msg.avatar} 
                    alt={msg.user} 
                    width={32} 
                    height={32} 
                    className="rounded-full object-cover flex-shrink-0 border border-border/50"
                    unoptimized
                  />
                  <div className={`flex flex-col ${msg.user === 'You (Host)' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-text-primary">{msg.user}</span>
                      <span className="text-[10px] text-text-secondary">{msg.time}</span>
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${msg.user === 'You (Host)' ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 text-text-primary rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Q&A Tab */}
          {activeSidebarTab === 'qa' && (
            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q.id} className={`p-4 rounded-xl border ${q.answered ? 'bg-gray-50 border-gray-200' : 'bg-white border-border/50 shadow-sm'}`}>
                  <div className="flex gap-3">
                    <img 
                      src={q.avatar} 
                      alt={q.user} 
                      width={32} 
                      height={32} 
                      className="rounded-full object-cover flex-shrink-0"
                      unoptimized
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-text-primary">{q.user}</span>
                        {q.answered && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <CheckCircle size={10} /> Answered
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-primary mb-3">{q.text}</p>
                      
                      <div className="flex items-center justify-between border-t border-border/50 pt-3">
                        <div className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
                          <button className="hover:text-primary transition-colors"><Activity size={14} /></button>
                          {q.votes} upvotes
                        </div>
                        {!q.answered && (
                          <div className="flex gap-2">
                            <button className="text-xs text-primary font-medium hover:underline">Mark Answered</button>
                            <button className="text-text-secondary hover:text-danger"><Trash size={14} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Participants Tab */}
          {activeSidebarTab === 'participants' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop"
                    alt="Host" 
                    width={36} 
                    height={36} 
                    className="rounded-full object-cover ring-2 ring-primary"
                    unoptimized
                  />
                  <div>
                    <div className="text-sm font-bold text-text-primary flex items-center gap-2">
                      You
                      <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Host</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Mic size={16} className={isMuted ? 'text-red-500' : ''} />
                  <Video size={16} className={isVideoOff ? 'text-red-500' : ''} />
                </div>
              </div>
              
              <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-6 mb-2">Viewers (124)</div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"
                    alt="Viewer" 
                    width={32} 
                    height={32} 
                    className="rounded-full object-cover"
                    unoptimized
                  />
                  <div className="text-sm font-medium text-text-primary">Alex Johnson</div>
                </div>
                <button className="p-1 text-text-secondary hover:text-text-primary"><MoreVertical size={16} /></button>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input Area */}
        {activeSidebarTab === 'chat' && (
          <div className="p-4 border-t border-border/50 bg-gray-50/50">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Send a message..." 
                className="w-full pl-4 pr-12 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm shadow-sm"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!chatInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
