'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  ChevronUp,
  Filter,
  Hash,
  Image as ImageIcon,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Search,
  Send,
  Share2,
  Sparkles,
} from 'lucide-react';
import { View } from '../types';

interface Props {
  setView: (view: View) => void;
}

type SortTab = 'All Discussions' | 'Popular';

type Post = {
  id: string;
  authorName: string;
  authorAvatar: string;
  timeAgo: string;
  category: string;
  title: string;
  content: string;
  upvotes: number;
  commentsCount: number;
  createdAt: number;
  hasUpvoted: boolean;
  syncStatus?: 'syncing' | 'synced';
};

const currentUser = {
  name: 'John Doe',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=e2e8f0',
};

const initialPosts: Post[] = [
  {
    id: 'post-1',
    authorName: 'Sarah Jenkins',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=e2e8f0',
    timeAgo: '12 min ago',
    category: '#React',
    title: 'What is your cleanest pattern for complex form state?',
    content:
      'I am splitting a large enrollment form into smaller sections and trying to keep validation, dirty state, and submission status understandable. Curious how senior teams are structuring this now.',
    upvotes: 48,
    commentsCount: 16,
    createdAt: Date.now() - 12 * 60 * 1000,
    hasUpvoted: false,
  },
  {
    id: 'post-2',
    authorName: 'Mike Chen',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike&backgroundColor=e2e8f0',
    timeAgo: '42 min ago',
    category: '#Next.js',
    title: 'App Router caching finally clicked for me',
    content:
      'The piece I was missing was separating data freshness from render location. Once I mapped route segments by mutation frequency, the architecture became much easier to reason about.',
    upvotes: 86,
    commentsCount: 29,
    createdAt: Date.now() - 42 * 60 * 1000,
    hasUpvoted: true,
  },
  {
    id: 'post-3',
    authorName: 'Emma Wilson',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=e2e8f0',
    timeAgo: '2 hours ago',
    category: '#Career',
    title: 'How do you describe project impact in interviews?',
    content:
      'I can explain what I built, but I want to get better at connecting technical decisions to business or user outcomes without sounding rehearsed.',
    upvotes: 132,
    commentsCount: 45,
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    hasUpvoted: false,
  },
  {
    id: 'post-4',
    authorName: 'Priya Nair',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=e2e8f0',
    timeAgo: '4 hours ago',
    category: '#UI',
    title: 'Small UI details that made your dashboards feel premium',
    content:
      'I am collecting examples of restrained interaction polish: density, hover states, empty states, keyboard focus, subtle motion, and better information hierarchy.',
    upvotes: 74,
    commentsCount: 21,
    createdAt: Date.now() - 4 * 60 * 60 * 1000,
    hasUpvoted: false,
  },
  {
    id: 'post-5',
    authorName: 'Alex Turner',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=e2e8f0',
    timeAgo: '1 day ago',
    category: '#TypeScript',
    title: 'When do you stop modeling types and ship the feature?',
    content:
      'I love strong types, but I sometimes over-invest in perfect abstractions before product behavior is stable. What rules of thumb do you use?',
    upvotes: 59,
    commentsCount: 18,
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
    hasUpvoted: true,
  },
];

const popularTopics = ['#React', '#Next.js', '#UI', '#TypeScript', '#Career', '#CSS', '#Freelancing'];

export default function Community({ setView }: Props) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [activeTab, setActiveTab] = useState<SortTab>('All Discussions');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftCategory, setDraftCategory] = useState('#React');

  const filteredPosts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const nextPosts = posts
      .filter((post) => activeCategory === 'All' || post.category === activeCategory)
      .filter((post) => {
        if (!normalizedSearch) return true;
        return [post.title, post.content, post.authorName, post.category].some((value) =>
          value.toLowerCase().includes(normalizedSearch)
        );
      });

    if (activeTab === 'Popular') {
      return [...nextPosts].sort((a, b) => b.upvotes - a.upvotes);
    }

    return [...nextPosts].sort((a, b) => b.createdAt - a.createdAt);
  }, [activeCategory, activeTab, posts, searchQuery]);

  const handleCreatePost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = draftTitle.trim();
    const content = draftContent.trim();
    if (!title || !content) return;

    const optimisticPost: Post = {
      id: `temp-${Date.now()}`,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      timeAgo: 'Just now',
      category: draftCategory,
      title,
      content,
      upvotes: 0,
      commentsCount: 0,
      createdAt: Date.now(),
      hasUpvoted: false,
      syncStatus: 'syncing',
    };

    setPosts((currentPosts) => [optimisticPost, ...currentPosts]);
    setDraftTitle('');
    setDraftContent('');

    window.setTimeout(() => {
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === optimisticPost.id
            ? { ...post, id: `post-${optimisticPost.createdAt}`, syncStatus: 'synced' }
            : post
        )
      );
    }, 900);
  };

  const handleUpvote = (postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id !== postId) return post;

        const nextHasUpvoted = !post.hasUpvoted;
        return {
          ...post,
          hasUpvoted: nextHasUpvoted,
          upvotes: post.upvotes + (nextHasUpvoted ? 1 : -1),
        };
      })
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Community</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">XE Academy Forum</h1>
        </div>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              type="text"
              placeholder="Search discussions..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <button
            onClick={() => setView('my-courses')}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95"
          >
            <MessageSquare size={18} />
            Courses
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="flex min-w-0 flex-col gap-6">
          <form
            onSubmit={handleCreatePost}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <div className="flex gap-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-11 w-11 shrink-0 rounded-full bg-slate-100"
              />
              <div className="min-w-0 flex-1">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
                  <input
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    type="text"
                    placeholder="Start a discussion with a clear title..."
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:font-medium placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                  <select
                    value={draftCategory}
                    onChange={(event) => setDraftCategory(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  >
                    {popularTopics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={draftContent}
                  onChange={(event) => setDraftContent(event.target.value)}
                  placeholder="Share context, code decisions, what you tried, or what you want feedback on..."
                  className="mt-3 h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />

                <div className="mt-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
                    aria-label="Attach image"
                  >
                    <ImageIcon size={20} />
                  </button>
                  <button
                    type="submit"
                    disabled={!draftTitle.trim() || !draftContent.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={16} />
                    Post
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {(['All Discussions', 'Popular'] as SortTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-all active:scale-95 ${
                    activeTab === tab
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Filter size={16} />
              {activeCategory === 'All' ? 'Showing all topics' : `Filtered by ${activeCategory}`}
            </div>
          </div>

          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
                <Hash className="mx-auto text-slate-300" size={36} />
                <h3 className="mt-4 text-lg font-bold text-slate-900">No discussions found</h3>
                <p className="mt-2 text-sm text-slate-500">Try another topic, clear search, or start the thread this space needs.</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="h-11 w-11 shrink-0 rounded-full bg-slate-100"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{post.authorName}</h4>
                          {post.syncStatus === 'syncing' && (
                            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-600">
                              Posting...
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {post.timeAgo} in{' '}
                          <button
                            onClick={() => setActiveCategory(post.category)}
                            className="font-bold text-indigo-600 transition-all hover:text-indigo-800 active:scale-95"
                          >
                            {post.category}
                          </button>
                        </p>
                      </div>
                    </div>

                    <button
                      className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-700 active:scale-95"
                      aria-label="More options"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-lg font-bold tracking-tight text-slate-900">{post.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{post.content}</p>
                  </div>

                  <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => handleUpvote(post.id)}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold transition-all active:scale-95 ${
                        post.hasUpvoted
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                      }`}
                    >
                      <ChevronUp size={18} className={post.hasUpvoted ? 'fill-current text-indigo-600' : ''} />
                      {post.upvotes}
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-slate-500 transition-all hover:bg-slate-50 hover:text-indigo-600 active:scale-95">
                      <MessageCircle size={18} />
                      {post.commentsCount}
                    </button>
                    <button className="ml-auto inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-slate-500 transition-all hover:bg-slate-50 hover:text-indigo-600 active:scale-95">
                      <Share2 size={18} />
                      Share
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </main>

        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-600" />
              <h3 className="font-bold text-slate-900">Popular Topics</h3>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('All')}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                  activeCategory === 'All'
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-indigo-200 hover:text-indigo-700'
                }`}
              >
                All
              </button>
              {popularTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setActiveCategory(topic)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                    activeCategory === topic
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-indigo-200 hover:text-indigo-700'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-900">Top Contributors</h3>
            <div className="mt-4 space-y-4">
              {[
                { name: 'David Kim', pts: '1.2k', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=e2e8f0' },
                { name: 'Lisa Wang', pts: '850', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa&backgroundColor=e2e8f0' },
                { name: 'Alex Turner', pts: '620', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=e2e8f0' },
              ].map((user) => (
                <div key={user.name} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full bg-slate-100" />
                    <span className="truncate text-sm font-bold text-slate-900">{user.name}</span>
                  </div>
                  <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700">{user.pts} pts</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
