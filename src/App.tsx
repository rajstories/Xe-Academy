/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { AuthenticateWithRedirectCallback, useUser } from '@clerk/clerk-react';
import { ArrowRight, Play, BookOpen, Presentation, Activity, Globe, ArrowUpRight, Users, Video, UserCheck, BadgeCheck, GraduationCap, Calendar, TrendingUp, MonitorSmartphone, Award, Star, BookmarkPlus, Clock, BarChart, CreditCard, Settings, CheckCircle, Facebook, Twitter, Instagram } from 'lucide-react';
import { LiquidMetalButton } from './components/ui/liquid-metal-button';
import { GatewayScreen } from './components/GatewayScreen';
import { DashboardApp } from './components/DashboardApp';
import { AuthFlow } from './components/AuthFlow';
import { AuthRole, getRoleDashboardPath } from './lib/auth';

import { XeLogo } from './components/XeLogo';

export const NavigationContext = createContext({
  navigate: (page: string) => {}
});

export const useNavigation = () => useContext(NavigationContext);

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { navigate } = useNavigation();
  const { isSignedIn, user } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;
  const dashboardPath = getRoleDashboardPath(role || 'student');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm py-4'
          : 'bg-transparent border-b border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 items-center">
        {/* Left Zone */}
        <div className="flex justify-start">
          <a href="#" className="flex items-center">
            <XeLogo variant="full" theme={scrolled ? 'light' : 'dark'} className="h-7 md:h-8 w-auto transition-opacity duration-300" />
          </a>
        </div>
        
        {/* Center Zone */}
        <div className="hidden md:flex justify-center items-center gap-8">
          {['Courses', 'Live Sessions', 'Enterprise', 'About'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className={`text-sm font-medium transition-colors duration-300 ease-in-out ${scrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white/80 hover:text-white'}`}
            >
              {item}
            </a>
          ))}
        </div>

        {/* Right Zone */}
        <div className="flex justify-end items-center gap-6">
          {!isSignedIn && (
            <button onClick={() => navigate('gateway')} className={`hidden md:block text-sm font-medium transition-colors duration-300 ease-in-out ${scrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white/80 hover:text-white'}`}>
              Log In
            </button>
          )}
          <button
            onClick={() => navigate(isSignedIn ? dashboardPath : 'gateway')}
            className="text-sm font-semibold tracking-wide bg-gradient-to-r from-white to-[#EAE6F5] text-[#0F172A] px-5 py-2 rounded-full hover:opacity-90 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] border border-[#C4B5FD] transition-all duration-300 ease-in-out hover:-translate-y-0.5"
          >
            {isSignedIn ? 'Go to Dashboard' : 'Get Started'}
          </button>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const { navigate } = useNavigation();

  const media = [
    { type: 'video', src: '/hero-video.mp4' },
    { type: 'image', src: '/hero-img-1.jpg' },
    { type: 'image', src: '/hero-img-2.png' },
    { type: 'image', src: '/hero-img-3.png' },
    { type: 'image', src: '/hero-img-4.jpg' },
  ];

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (media[currentIndex].type === 'image') {
      timeoutId = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % media.length);
      }, 4000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentIndex]);

  useEffect(() => {
    if (currentIndex === 0 && videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // If autoplay is blocked or interrupted (e.g., low power mode), skip to the first image.
          console.warn('Video autoplay failed:', error);
          setCurrentIndex(1);
        });
      }
    }
  }, [currentIndex]);

  const handleVideoEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  return (
    <section className="relative pt-32 pb-20 px-6 min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        {media.map((item, index) => {
          const isActive = index === currentIndex;
          if (item.type === 'video') {
            return (
              <video
                key={index}
                ref={videoRef}
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnded}
                src={item.src}
                className={`absolute inset-0 h-full w-full scale-[1.12] object-cover object-center transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
              />
            );
          } else {
            return (
              <img
                key={index}
                src={item.src}
                alt={`Hero visual ${index}`}
                className={`absolute inset-0 h-full w-full scale-[1.12] object-cover object-center transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
              />
            );
          }
        })}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black via-black/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      <div className="relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Main Headline */}
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight"
        >
          <span className="inline-block whitespace-nowrap">
            Learn Smarter. Create Better.
          </span>
          <span className="block mt-1 text-[#FFD700]">Grow Global.</span>
        </h1>
        
        {/* Subheadline */}
        <p className="mt-6 text-base md:text-lg text-white/90 leading-relaxed max-w-2xl mx-auto font-medium">
          Access elite, cohort-based technical and creative paths. Master tomorrow's frameworks alongside a global collective of ambitious minds.
        </p>
        
        {/* Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('gateway')}
            className="inline-flex items-center justify-center bg-transparent border border-white/60 text-white px-7 py-3 rounded-full font-medium transition-all duration-300 ease-in-out hover:bg-white/10 w-full sm:w-auto"
          >
            Explore Curriculums
          </button>
        </div>
      </div>
    </section>
  );
}

function Metrics() {
  const stats = [
    { value: '50K+', label: 'LEARNERS', icon: Users },
    { value: '2K+', label: 'COURSES', icon: BookOpen },
    { value: '1200+', label: 'LIVE SESSIONS', icon: Video },
    { value: '300+', label: 'CREATORS', icon: UserCheck },
    { value: '98%', label: 'SUCCESS RATE', icon: BadgeCheck },
  ];

  return (
    <section className="bg-[linear-gradient(135deg,#F8FAFC_0%,#FFFCF4_48%,#F5E6A8_100%)] py-20 px-6">
      <div className="max-w-6xl mx-auto bg-white/68 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_18px_60px_rgba(15,23,42,0.08)] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div 
                key={i} 
                className="flex flex-col items-center justify-center text-center p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/5 cursor-default"
              >
                <Icon className="w-8 h-8 text-slate-950 mb-4" />
                <span className="text-4xl font-extrabold tracking-tight text-slate-950 pb-1">
                  {stat.value}
                </span>
                <span className="mt-2 text-[10px] uppercase tracking-widest text-slate-700 font-bold">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PremiumFeatureIcon({ type }: { type: 'courses' | 'sessions' | 'progress' | 'devices' | 'certificates' }) {
  const gradientId = `premium-feature-${type}`;
  const iconPaths = {
    courses: (
      <>
        <path d="M16 19.5 32 13l16 6.5-16 6.5-16-6.5Z" fill={`url(#${gradientId})`} />
        <path d="M22 25v8.5c0 2.4 4.6 4.5 10 4.5s10-2.1 10-4.5V25" fill="none" stroke="#312E81" strokeWidth="3" strokeLinecap="round" />
        <path d="M48 20.5v10" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
        <circle cx="48" cy="34" r="3" fill="#FBBF24" />
      </>
    ),
    sessions: (
      <>
        <rect x="17" y="18" width="30" height="30" rx="8" fill={`url(#${gradientId})`} />
        <path d="M24 16v7M40 16v7M22 29h20" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <path d="m29 38 5-3v6l-5-3Z" fill="#FBBF24" />
        <circle cx="46" cy="20" r="6" fill="#2DD4BF" stroke="#fff" strokeWidth="3" />
      </>
    ),
    progress: (
      <>
        <path d="M18 43 30 31l8 8 12-15" stroke={`url(#${gradientId})`} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M43 24h7v7" stroke={`url(#${gradientId})`} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14" y="44" width="40" height="4" rx="2" fill="#E0E7FF" />
        <circle cx="30" cy="31" r="4" fill="#FBBF24" />
        <circle cx="38" cy="39" r="4" fill="#2DD4BF" />
      </>
    ),
    devices: (
      <>
        <rect x="14" y="19" width="31" height="23" rx="5" fill={`url(#${gradientId})`} />
        <rect x="37" y="29" width="13" height="20" rx="4" fill="#fff" stroke="#312E81" strokeWidth="3" />
        <path d="M22 48h17" stroke="#312E81" strokeWidth="3" strokeLinecap="round" />
        <path d="M25 28h10M25 34h7" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <circle cx="43.5" cy="44" r="1.8" fill="#FBBF24" />
      </>
    ),
    certificates: (
      <>
        <path d="M32 14c4 5 9 4 12 4 .5 5 3 8 6 11-4 3-5 8-6 13-5-.4-8 1.5-12 5-4-3.5-7-5.4-12-5-1-5-2-10-6-13 3-3 5.5-6 6-11 3 0 8 1 12-4Z" fill={`url(#${gradientId})`} />
        <path d="m24 31 5 5 11-12" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m28 45-4 8 8-3 8 3-4-8" fill="#FBBF24" />
      </>
    ),
  };

  return (
    <div className="h-16 w-16 rounded-3xl bg-white shadow-[0_14px_35px_rgba(79,70,229,0.18)] ring-1 ring-indigo-100 flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-110">
      <svg className="h-11 w-11 drop-shadow-sm" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="14" y1="14" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C3AED" />
            <stop offset="1" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
        {iconPaths[type]}
      </svg>
    </div>
  );
}

function Ecosystem() {
  return (
    <section className="bg-[linear-gradient(135deg,#F8FAFC_0%,#FFFCF4_48%,#F5E6A8_100%)] pb-24 px-6">
      <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16 mt-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 text-center">
          Everything you need to learn and grow
        </h2>
        <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto text-center">
          We've built the most comprehensive toolkit for modern learners and creators. Every feature is designed with clarity and focus in mind.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Row 1 - Card 1 */}
        <div className="bg-white border border-slate-200/60 rounded-[2rem] p-10 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 group flex flex-col">
          <PremiumFeatureIcon type="courses" />
          <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-6 mb-3">Premium Courses</h3>
          <p className="text-slate-500 leading-relaxed text-sm lg:text-base">
            High-definition educational content produced by industry leaders. Structured to take you from foundational concepts to architecting scalable solutions.
          </p>
        </div>

        {/* Row 1 - Card 2 */}
        <div className="bg-white border border-slate-200/60 rounded-[2rem] p-10 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 group flex flex-col">
          <PremiumFeatureIcon type="sessions" />
          <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-6 mb-3">Live Sessions</h3>
          <p className="text-slate-500 leading-relaxed text-sm lg:text-base">
            Weekly interactive workshops where you can ask questions directly, receive real-time feedback, and collaborate with your cohort.
          </p>
        </div>

        {/* Row 1 - Card 3 */}
        <div className="bg-white border border-slate-200/60 rounded-[2rem] p-10 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 group flex flex-col">
          <PremiumFeatureIcon type="progress" />
          <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-6 mb-3">Track Progress</h3>
          <p className="text-slate-500 leading-relaxed text-sm lg:text-base">
            AI-driven analytics to monitor your learning speed, project quality, and overall knowledge retention automatically.
          </p>
        </div>

        {/* Row 2 - Card 4 (Learn Anywhere) - Spans 2 cols */}
        <div className="bg-white border border-slate-200/60 rounded-[2rem] p-10 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 group flex flex-col md:flex-row items-center md:col-span-2 overflow-hidden relative">
          <div className="flex-1 relative z-10 md:pr-8">
            <PremiumFeatureIcon type="devices" />
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-6 mb-3">Learn Anywhere</h3>
            <p className="text-slate-500 leading-relaxed text-sm lg:text-base max-w-sm">
              Our cross-platform mobile and desktop experience ensures you never lose a minute of your learning journey.
            </p>
          </div>
          <div className="w-full md:w-1/2 flex justify-end mt-8 md:mt-0 relative z-0 h-48 md:h-full pointer-events-none">
            {/* Sleek abstract mockup of devices overlapping the edge */}
            <div className="absolute right-[-20px] md:right-[-40px] top-4 md:top-[-20px] w-48 md:w-64 h-64 md:h-80 bg-slate-50 rounded-3xl border border-slate-200/60 shadow-lg transform rotate-[-5deg] group-hover:rotate-0 transition-transform duration-500 flex flex-col overflow-hidden">
              <div className="h-6 border-b border-slate-200/60 bg-slate-100 flex items-center px-4 gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
              </div>
              <div className="flex-1 p-4 flex flex-col gap-3">
                <div className="h-4 w-1/2 bg-slate-200 rounded-full"></div>
                <div className="h-24 w-full bg-indigo-50/50 rounded-xl"></div>
                <div className="h-4 w-3/4 bg-slate-200 rounded-full"></div>
              </div>
            </div>
            
            <div className="absolute right-[80px] md:right-[120px] bottom-[-10px] md:bottom-[-20px] w-24 md:w-32 h-40 md:h-56 bg-white rounded-2xl border border-slate-200/80 shadow-xl transform rotate-[5deg] group-hover:rotate-0 transition-transform duration-500 flex flex-col overflow-hidden">
              <div className="h-4 border-b border-slate-100 bg-slate-50 flex items-center justify-center">
                 <div className="w-6 h-1 rounded-full bg-slate-200"></div>
              </div>
              <div className="flex-1 p-2 flex flex-col gap-2">
                 <div className="w-full h-12 bg-violet-50/50 rounded-lg"></div>
                 <div className="w-3/4 h-2 bg-slate-100 rounded-full"></div>
                 <div className="w-1/2 h-2 bg-slate-100 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 - Card 5 (Certificates) - Spans 1 col */}
        <div className="bg-white border border-slate-200/60 rounded-[2rem] p-10 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 group flex flex-col md:col-span-1">
          <PremiumFeatureIcon type="certificates" />
          <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-6 mb-3">Certificates</h3>
          <p className="text-slate-500 leading-relaxed text-sm lg:text-base">
            Industry-recognized credentials that you can instantly add to your LinkedIn or professional portfolio.
          </p>
        </div>
      </div>
      </div>
    </section>
  );
}

function PopularCourses() {
  const { navigate } = useNavigation();
  const courses = [
    {
      title: "The Complete UI/UX Masterclass 2024",
      author: "Alex Sterling • 42 Lessons",
      rating: "4.9",
      reviews: "(2.4k)",
      price: "$89.99",
      originalPrice: "$149.99",
      badge: "Bestseller",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_lqcYHn_b50vuMaAs_-APiSMsaT1CPxhI4i5tPv2yi6c8kR2YBqUesiH1uUkYu1ciHxDMG16dgrglKH6NW8WU1DivwyiRtjyHjRs3Oa2Tnlakzd1F8tgBZaIBj9iGyp65qjzfKjih-FuoZXTT4vfjHlgx8DvZJrs4M3Tk1chql3WvwMhtISonNk-rb0akrnmgd96Oe4P-PNZdpWZtxpIesENxWwymI8RnKwGFbW6vKb7BsooX4FW369LdwjqQ_56qouFBL1O9QQ"
    },
    {
      title: "Full-Stack Development with Next.js",
      author: "Sarah Chen • 64 Lessons",
      rating: "4.8",
      reviews: "(1.2k)",
      price: "$74.99",
      originalPrice: "$129.99",
      badge: "New",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDw1onEy8p7QQIMXvm0ehZWOrI8Uu4gzKDbio5OADXAw5Gj3G0HiwfEcL2a80ccfDoe5zCE5rlSpQ6Q-GW5g3FRZNoQhmCTWu4dv_40TPxUH9W5hNNu-pftaqUjIenkzOTq-tJ4EGW4bnANDtmOtAMXYEtG6kOZZyByzJx9dNtja0an_gziC1x9ae5DSP7JFK2YyiqRkXBPuVn5a_GiriKotkqLqZXhsHgSgK3Ts6Ij6o9yyY270EpGQLPf7mlKt3tEisPvVC4PUQ"
    },
    {
      title: "AI & Machine Learning Fundamentals",
      author: "Dr. James Wilson • 38 Lessons",
      rating: "4.7",
      reviews: "(980)",
      price: "$94.99",
      originalPrice: "$199.99",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCiTWytg-MJcuCauMqCIFywJu4PUhJ8tLZEDNRAu6P1PlzkPiXi9VPwSvY3Xyf61ClPJ8MHsRDBKqu0LW-hVj41nHffp_FvQ-ktIsvyI_Q4Cy2RuACsZSOFRxDXRKVi4eGdv8-FzgTim3wqKEiTjh_k2-7lnTct9sgEFVsPFIfd_rWILgc33vSf9FSdIQiYdrafNQYwAvlTsQ68aGBEpiQ0AyevptXN8KiU4Dn-AhDQ3y-jowwNwCFgN7-BpuRojRVg1OT8poODRw"
    },
    {
      title: "Professional Photography & Editing",
      author: "Elena Rossi • 29 Lessons",
      rating: "4.9",
      reviews: "(3.1k)",
      price: "$59.99",
      originalPrice: "$99.99",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAH4pu_TqkVTL1O3K7kJhCqSn51gIq9kK-GIOzxYMAl7-ugnoRxiaFCAe6FyaNK6OnQshJbeKyNuW4GJyKvuC3scbd5tD09iOPPAACVMKo0TRZG8AFwscfCL6gFN4t1kaszbjN6VqHqgChXf721ZUZG4WfsyhcK2PQE7znZbIy2m7wEfwaoTCqR7QVOHMjb7R05lHmldDnal6NTS_Y2ZNdyUHnaTafHBBDFcQl7V3SjGov4dXr-O73ccyfkCQZV53aDAaWpoXoarg"
    }
  ];

  return (
    <section className="bg-[linear-gradient(135deg,#F8FAFC_0%,#FFFCF4_48%,#F5E6A8_100%)] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2 block">Trending Now</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Explore popular courses</h2>
          </div>
          <button onClick={() => navigate('gateway')} className="text-indigo-600 font-bold flex items-center gap-2 hover:gap-4 transition-all group">
            View all courses <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, idx) => (
            <div onClick={() => navigate('gateway')} key={idx} className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-indigo-500/10 transition-all duration-300 group cursor-pointer border border-slate-100">
              <div className="relative h-48 overflow-hidden">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={course.image} alt={course.title} />
                {course.badge && (
                  <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full">{course.badge}</div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-1.5 mb-3">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-slate-900">{course.rating}</span>
                  <span className="text-sm text-slate-500">{course.reviews}</span>
                </div>
                <h4 className="font-bold text-lg mb-2 text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">{course.title}</h4>
                <p className="text-slate-500 text-sm mb-6">{course.author}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-indigo-600">{course.price}</span>
                    <span className="text-sm text-slate-400 line-through">{course.originalPrice}</span>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-colors border border-slate-100 hover:border-indigo-600">
                    <BookmarkPlus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveSessions() {
  const { navigate } = useNavigation();
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden shadow-2xl shadow-indigo-500/20">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 text-white">
            <span className="text-xs font-bold bg-white/20 px-4 py-2 rounded-full uppercase tracking-widest mb-6 inline-block">Happening Today</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 tracking-tight">Join live interactive workshops with experts</h2>
            <p className="text-lg text-white/80 mb-10 leading-relaxed">Don't just watch videos. Participate, ask questions, and learn in real-time with the world's leading industry professionals.</p>
            <button className="bg-white text-indigo-600 px-8 py-3.5 rounded-full font-bold shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300">See Schedule</button>
          </div>
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Card 1 */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl group hover:bg-white/15 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <img className="w-12 h-12 rounded-full border-2 border-white/30 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD54VfzgdM2usr-2eHsMe8mbiEHZBZkdFIZCBv-Y_xFOIoQkL5bPnj8HgKsWNMWgGnnEUD8dikv603krYo4StXgTNcduGqLgVMZlR141cgufNx1E-g01rwzezPkxw77LXh3LE0tvceQBhQSEnTbLyUiZGiAU06XTw6rnSRm7tjTfihmBiLoeDSFB3EkATQc_onvpAvI9VHAE_vE-_8DMIQA10qrV9jhpdDci4mMm5fsHxrCmMxrjW2qLSyosiKWKp8qVdohcDugRA" alt="Mark Thompson" />
                <div>
                  <h4 className="text-white font-bold">Marketing Strategy</h4>
                  <p className="text-white/70 text-sm">with Mark Thompson</p>
                </div>
              </div>
              <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full inline-block mb-3 tracking-wider">LIVE NOW</div>
              <h3 className="text-white font-bold text-lg mb-6 leading-snug">Psychology of Conversion</h3>
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4" /> Starts in 15m
                </span>
                <button onClick={() => navigate('gateway')} className="bg-white text-indigo-600 text-sm font-bold px-5 py-2.5 rounded-full hover:bg-slate-50 transition-colors">Join Room</button>
              </div>
            </div>
            {/* Live Card 2 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl group hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <img className="w-12 h-12 rounded-full border-2 border-white/20 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBe3NquM-Cerc-PlH07Gq0XHOniThHC7HEol029Ofz5bzxzbm_RE07MtMhnupoJ6iTiCvsatje1zx7If_Kf1uI8s6CbIDKkbYs-zDhG4Ttiyhtb_u8BJUPcEFqhdV-IeJmrVI8CP5WMvi-PBgsfL7KQGIs7_GeW_TNjPrTQBEHERAujDVHXDb9QJ9RFjs3HEPcG7wdXP3YNkE0uBZokGvKsQoHIb-jt_7K2q9kK4trnnkPimjBpaWO4pms743RLXlHHqVQmKCDaSg" alt="Jessica Lane" />
                <div>
                  <h4 className="text-white font-bold">Product Design</h4>
                  <p className="text-white/70 text-sm">with Jessica Lane</p>
                </div>
              </div>
              <div className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full inline-block mb-3 tracking-wider">UPCOMING</div>
              <h3 className="text-white font-bold text-lg mb-6 leading-snug">Advanced Motion Principles</h3>
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4" /> Today, 4:00 PM
                </span>
                <button onClick={() => navigate('gateway')} className="bg-white/10 text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-white/20 transition-colors">Set Reminder</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CreatorSection() {
  const { navigate } = useNavigation();
  return (
    <section className="bg-[linear-gradient(135deg,#F8FAFC_0%,#FFFCF4_48%,#F5E6A8_100%)] py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
        <div className="flex-1 max-w-xl">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4 block">For Creators</span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">Turn your knowledge into impact</h2>
          <p className="text-lg text-slate-500 mb-8 leading-relaxed">Join our elite community of creators. We provide the tools, the platform, and the audience you need to build a global brand and scale your income through education.</p>
          <ul className="space-y-4 mb-10">
            {[
              "Dedicated creator dashboard & analytics",
              "Automated marketing & payment tools",
              "Direct access to 50k+ eager learners"
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <LiquidMetalButton onClick={() => navigate('gateway')} label="Apply as Creator" />
          </div>
        </div>
        
        <div className="flex-1 relative w-full lg:w-auto">
          <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 overflow-hidden">
            {/* Dashboard UI Mockup */}
            <div className="flex h-[400px] md:h-[450px]">
              {/* Sidebar */}
              <div className="w-16 md:w-20 bg-slate-50 border-r border-slate-100 flex flex-col items-center py-8 gap-8 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm"><Activity className="w-5 h-5" /></div>
                <div className="w-10 h-10 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"><BarChart className="w-5 h-5" /></div>
                <div className="w-10 h-10 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"><CreditCard className="w-5 h-5" /></div>
                <div className="mt-auto w-10 h-10 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"><Settings className="w-5 h-5" /></div>
              </div>
              {/* Main Content */}
              <div className="flex-1 p-6 md:p-8 overflow-hidden bg-white">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-bold text-xl text-slate-900">Overview</h3>
                  <div className="bg-slate-100 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-600">Last 30 Days</div>
                </div>
                <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
                  <div className="p-5 md:p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Revenue</p>
                    <p className="text-2xl md:text-3xl font-extrabold text-indigo-600">$12,480</p>
                    <p className="text-[10px] md:text-xs text-emerald-600 font-bold mt-2 bg-emerald-100/50 inline-block px-2 py-0.5 rounded-full">+12% vs last month</p>
                  </div>
                  <div className="p-5 md:p-6 rounded-2xl bg-violet-50/50 border border-violet-100/50">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Students</p>
                    <p className="text-2xl md:text-3xl font-extrabold text-violet-600">842</p>
                    <p className="text-[10px] md:text-xs text-emerald-600 font-bold mt-2 bg-emerald-100/50 inline-block px-2 py-0.5 rounded-full">+8% vs last month</p>
                  </div>
                </div>
                <div className="w-full h-32 relative bg-slate-50 rounded-2xl overflow-hidden p-4 border border-slate-100">
                  <div className="absolute bottom-0 left-0 w-full flex items-end justify-between h-[80%] px-6 gap-2">
                    {[30, 50, 20, 75, 100, 65, 50, 90, 35].map((height, i) => (
                      <div key={i} className="flex-1 bg-indigo-600/20 hover:bg-indigo-600 transition-colors rounded-t-sm" style={{ height: `${height}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const testimonials = [
    {
      text: "Xe Academy completely changed my career trajectory. The UI/UX cohort was so rigorous and practical, I landed a job at a top tech firm within two months of finishing.",
      name: "Sarah Jenkins",
      role: "Product Designer at Flow Inc.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
    },
    {
      text: "The live interactive arenas are the differentiator. Being able to architect solutions and get real-time feedback from industry pioneers is worth the enrollment ten times over.",
      name: "David Chen",
      role: "Lead Developer at Innovate",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
    },
    {
      text: "As a creator, I've never seen an ecosystem so intuitive. My technical execution and project quality have spiked since I joined the global network at Xe Academy.",
      name: "Marcus Li",
      role: "Digital Marketing Expert",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
    }
  ];

  return (
    <section className="bg-[linear-gradient(135deg,#F8FAFC_0%,#FFFCF4_48%,#F5E6A8_100%)] py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">The Global Collective</h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-center mt-4 mb-16 text-lg">See how ambitious minds are accelerating their trajectories through our immersive cohorts.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="bg-white p-10 rounded-[2rem] text-left relative flex flex-col border border-slate-100 shadow-sm transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10">
              <span className="absolute top-4 right-8 font-serif text-[120px] leading-none text-indigo-50/40 pointer-events-none">"</span>
              <div className="flex gap-1 mb-8 relative z-10">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 text-indigo-400 fill-indigo-400" />
                ))}
              </div>
              <p className="text-slate-700 leading-relaxed text-lg flex-1 relative z-10 font-medium">
                {testimonial.text}
              </p>
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4 relative z-10">
                <img className="w-12 h-12 rounded-full object-cover ring-2 ring-offset-2 ring-violet-50" src={testimonial.image} alt={testimonial.name} />
                <div>
                  <h4 className="text-slate-900 font-bold tracking-tight">{testimonial.name}</h4>
                  <p className="text-slate-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const { navigate } = useNavigation();
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[3rem] py-20 px-8 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">Ready to transform your future?</h2>
          <p className="text-lg text-white/80 mb-10 leading-relaxed font-medium">Join Xe Academy today and get 20% off your first 3 months. Limited time offer for the next 48 hours.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={() => navigate('gateway')} className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
              Get Started for Free
            </button>
            <button className="bg-transparent border-2 border-white/80 text-white px-8 py-3.5 rounded-full font-bold hover:bg-white/10 hover:border-white transition-all duration-300 w-full sm:w-auto">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#EAE6F5] pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12 mb-20">
          <div className="col-span-2 md:col-span-2 pr-8">
            <a href="#" className="flex items-center mb-6">
              <XeLogo variant="full" theme="light" className="h-9 w-auto" />
            </a>
            <p className="mt-4 text-slate-700 text-base leading-relaxed max-w-sm mb-8">
              Empowering the world's most curious minds through agile, high-end education.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors shadow-sm">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors shadow-sm">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors shadow-sm">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 text-base mb-6">Platform</h4>
            <ul className="space-y-4">
              {['Courses', 'Live Sessions', 'Mobile App', 'Certification', 'For Teams'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-600 text-sm hover:text-indigo-600 transition-colors font-medium">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 text-base mb-6">Creators</h4>
            <ul className="space-y-4">
              {['Apply to Teach', 'Creator Dashboard', 'Resources', 'Success Stories', 'Partnerships'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-600 text-sm hover:text-indigo-600 transition-colors font-medium">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 text-base mb-6">Company</h4>
            <ul className="space-y-4">
              {['About Us', 'Careers', 'Press Kit', 'Contact', 'Brand Assets'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-600 text-sm hover:text-indigo-600 transition-colors font-medium">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-base mb-6">Legal</h4>
            <ul className="space-y-4">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Refund Policy', 'Accessibility'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-600 text-sm hover:text-indigo-600 transition-colors font-medium">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-300 pt-10 flex flex-col md:flex-row items-center justify-end gap-6">
          <div className="text-sm font-medium text-slate-600">
            @2026 all rights reserved
          </div>
        </div>
      </div>
    </footer>
  );
}

function AppLoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-6">
      <XeLogo variant="full" theme="dark" className="h-8 w-auto" />
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-white" />
    </div>
  );
}

export default function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [currentPath, setCurrentPath] = useState(() => `${window.location.pathname}${window.location.search}`);

  const navigateTo = (target: string) => {
    const nextPath = target.startsWith('/') ? target : target === 'gateway' ? '/gateway' : '/';
    window.history.pushState({}, '', nextPath);
    setCurrentPath(`${window.location.pathname}${window.location.search}`);
  };

  useEffect(() => {
    const syncPath = () => setCurrentPath(`${window.location.pathname}${window.location.search}`);
    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const role = user?.publicMetadata?.role as string | undefined;
    const pathname = window.location.pathname;
    if (!role && (pathname.startsWith('/dashboard') || pathname.startsWith('/studio') || pathname.startsWith('/admin'))) {
      navigateTo('/onboarding');
    } else if (role && (pathname.startsWith('/auth') || pathname.startsWith('/onboarding') || pathname === '/gateway')) {
      navigateTo(getRoleDashboardPath(role));
    }
  }, [isLoaded, isSignedIn, user?.publicMetadata?.role]);

  const pathname = currentPath.split('?')[0];
  const params = new URLSearchParams(currentPath.split('?')[1] || '');
  const requestedRole = (params.get('role') as AuthRole | null) || null;
  const role = user?.publicMetadata?.role as string | undefined;

  if (pathname === '/auth/sso-callback') {
    return <AuthenticateWithRedirectCallback />;
  }

  if (!isLoaded) {
    return <AppLoadingScreen />;
  }

  if (pathname.startsWith('/auth') || pathname.startsWith('/onboarding') || (!isSignedIn && (pathname.startsWith('/dashboard') || pathname.startsWith('/studio')))) {
    return (
      <AuthFlow
        initialMode={pathname.startsWith('/onboarding') ? 'onboarding' : params.get('mode') === 'sign-up' ? 'sign-up' : 'sign-in'}
        initialRole={requestedRole}
        onBackHome={() => navigateTo('/')}
      />
    );
  }

  if (isSignedIn && !role && (pathname.startsWith('/onboarding') || pathname.startsWith('/dashboard') || pathname.startsWith('/studio') || pathname.startsWith('/admin'))) {
    return <AuthFlow initialMode="onboarding" initialRole={requestedRole} onBackHome={() => navigateTo('/')} />;
  }

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/studio') || pathname.startsWith('/admin')) {
    return <DashboardApp initialRole={(role as any) || (pathname.startsWith('/studio') ? 'creator' : 'student')} />;
  }

  return (
    <NavigationContext.Provider value={{ navigate: navigateTo }}>
      {pathname !== '/gateway' ? (
        <div className="min-h-screen bg-white font-sans selection:bg-[#004BFF] selection:text-white">
          <Navbar />
          <main>
            <Hero />
            <Metrics />
            <Ecosystem />
            <PopularCourses />
            <LiveSessions />
            <CreatorSection />
            <Testimonials />
            <FinalCTA />
          </main>
          <Footer />
        </div>
      ) : (
        <GatewayScreen onBack={() => navigateTo('/')} />
      )}
    </NavigationContext.Provider>
  );
}
