'use client';

import { useState } from 'react';
import { Search, Filter, MessageSquare, ThumbsUp, MessageCircle, Share2, MoreHorizontal, Image as ImageIcon } from 'lucide-react';
import { View } from '../types';

interface Props {
  setView: (view: View) => void;
}

export default function Community({ setView }: Props) {
  const [activeTab, setActiveTab] = useState('All Discussions');

  const posts = [
    {
      id: 1,
      author: 'Sarah Jenkins',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=e2e8f0',
      time: '2 hours ago',
      category: 'React Native',
      title: 'How to handle complex navigation state?',
      content: 'I am struggling with nested navigators in React Navigation v6. Any best practices or patterns you all recommend for a large scale app?',
      likes: 24,
      comments: 12,
      isLiked: false,
    },
    {
      id: 2,
      author: 'Mike Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike&backgroundColor=e2e8f0',
      time: '5 hours ago',
      category: 'UI/UX Design',
      title: 'Framer vs Figma for prototyping',
      content: 'For those who have used both extensively, which one do you prefer for interactive prototyping and why? I feel like Framer is getting much better recently.',
      likes: 56,
      comments: 34,
      isLiked: true,
    },
    {
      id: 3,
      author: 'Emma Wilson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=e2e8f0',
      time: '1 day ago',
      category: 'Career Advice',
      title: 'Just landed my first junior dev role! 🎉',
      content: 'After 8 months of learning through this platform, I finally passed the technical interviews at a great startup. Thanks to everyone here who helped me with my questions along the way!',
      likes: 142,
      comments: 45,
      isLiked: true,
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search discussions..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm">
            <MessageSquare size={18} />
            <span className="hidden sm:inline">New Post</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Content Area */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Create Post Input */}
          <div className="bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e2e8f0" alt="Avatar" className="w-full h-full" />
              </div>
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Share something with the community..." 
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <div className="flex items-center justify-between mt-3">
                  <button className="text-text-secondary hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/5">
                    <ImageIcon size={20} />
                  </button>
                  <button className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
            {['All Discussions', 'My Posts', 'Following', 'Popular'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab ? 'bg-text-primary text-white shadow-sm' : 'bg-white border border-border text-text-secondary hover:text-text-primary hover:border-gray-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Feed */}
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-surface border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img src={post.avatar} alt={post.author} className="w-full h-full" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">{post.author}</h4>
                      <p className="text-xs text-text-secondary">{post.time} in <span className="text-primary font-medium cursor-pointer hover:underline">{post.category}</span></p>
                    </div>
                  </div>
                  <button className="text-text-secondary hover:text-text-primary p-1">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">{post.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-4">{post.content}</p>
                </div>
                
                <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                  <button className={`flex items-center gap-2 text-sm font-medium transition-colors ${post.isLiked ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}>
                    <ThumbsUp size={18} className={post.isLiked ? 'fill-current text-primary' : ''} />
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors">
                    <MessageCircle size={18} />
                    {post.comments}
                  </button>
                  <button className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors ml-auto">
                    <Share2 size={18} />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
          <div className="bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-text-primary mb-4">Popular Topics</h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'UI Design', 'Career', 'Next.js', 'Typescript', 'CSS', 'Freelancing'].map((tag) => (
                <button key={tag} className="px-3 py-1.5 bg-gray-50 border border-border rounded-lg text-xs font-medium text-text-secondary hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-colors">
                  #{tag}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-surface border border-border/50 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-text-primary mb-4">Top Contributors</h3>
            <div className="space-y-4">
              {[
                { name: 'David Kim', pts: '1.2k', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=e2e8f0' },
                { name: 'Lisa Wang', pts: '850', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa&backgroundColor=e2e8f0' },
                { name: 'Alex Turner', pts: '620', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=e2e8f0' }
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img src={user.avatar} alt={user.name} className="w-full h-full" />
                    </div>
                    <span className="text-sm font-bold text-text-primary">{user.name}</span>
                  </div>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">{user.pts} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
