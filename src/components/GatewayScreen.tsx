import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { XeLogo } from './XeLogo';

interface GatewayScreenProps {
  onBack: () => void;
}

// Layered, two-tone icon so the portal cards read as polished product art rather than a flat line glyph.
function StudentPortalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M32 12 60 24 32 36 4 24Z" fill="#4F46E5" />
      <path d="M32 36 60 24V40c0 2-12.5 10-28 10S4 42 4 40V24Z" fill="#6366F1" />
      <path d="M16 30.6V42c4 2.4 9.7 4 16 4s12-1.6 16-4V30.6L32 36Z" fill="#312E81" opacity="0.15" />
      <rect x="56" y="24" width="3" height="18" rx="1.5" fill="#312E81" />
      <circle cx="57.5" cy="44" r="3.4" fill="#FBBF24" />
    </svg>
  );
}

// Clapperboard + play accent for the creator/broadcast portal.
function CreatorPortalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="22" width="52" height="34" rx="5" fill="#6366F1" />
      <path d="M6 22 14 12h9l-7 10Zm16 0 7-10h9l-7 10Zm16 0 7-10h7a6 6 0 0 1 6 6v4Z" fill="#4F46E5" />
      <rect x="6" y="22" width="52" height="7" fill="#312E81" opacity="0.18" />
      <path d="M27 33v14l13-7Z" fill="#FBBF24" />
    </svg>
  );
}

export function GatewayScreen({ onBack }: GatewayScreenProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-white flex flex-col relative overflow-hidden">
      {/* Top Nav / Back button */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex justify-center mb-6"
          >
            <XeLogo variant="icon" theme="light" className="h-12 w-auto" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4"
          >
            Welcome to Xe Academy
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-slate-500 text-lg"
          >
            Select your portal to continue your journey.
          </motion.p>
        </div>

        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Student Portal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className={`
              bg-white rounded-[2rem] border border-slate-100 p-10 flex flex-col h-full
              transition-all duration-500 ease-out cursor-pointer group
              ${hoveredCard === 1 ? '-translate-y-2 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]' : ''}
              ${hoveredCard === 2 ? 'opacity-50 grayscale-[20%]' : ''}
            `}
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => window.location.href = '/auth?role=student&mode=sign-up'}
          >
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center border border-indigo-100 mb-8 bg-indigo-50 transition-transform duration-300 group-hover:scale-105">
              <StudentPortalIcon className="w-9 h-9" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-3">Student Portal</h2>
            <p className="text-slate-500 leading-relaxed flex-1">
              Access your elite cohorts, track your velocity, and attend live synchronous arenas.
            </p>

            <div
              className="mt-8 w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 bg-gradient-to-r from-amber-50 via-amber-100 to-amber-200 text-slate-900 border border-amber-200/80 shadow-sm group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:from-amber-100 group-hover:to-amber-300"
            >
              Enter as Student
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </motion.div>

          {/* Card 2: Creator Protocol */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className={`
              bg-white rounded-[2rem] border border-slate-100 p-10 flex flex-col h-full
              transition-all duration-500 ease-out cursor-pointer group
              ${hoveredCard === 2 ? '-translate-y-2 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]' : ''}
              ${hoveredCard === 1 ? 'opacity-50 grayscale-[20%]' : ''}
            `}
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => window.location.href = '/auth?role=creator&mode=sign-up'}
          >
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center border border-indigo-100 mb-8 bg-indigo-50 transition-transform duration-300 group-hover:scale-105">
              <CreatorPortalIcon className="w-9 h-9" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-3">Creator Protocol</h2>
            <p className="text-slate-500 leading-relaxed flex-1">
              Architect curriculums, host live interactive sessions, and scale your global audience.
            </p>

            <div
              className="mt-8 w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 bg-gradient-to-r from-amber-50 via-amber-100 to-amber-200 text-slate-900 border border-amber-200/80 shadow-sm group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:from-amber-100 group-hover:to-amber-300"
            >
              Enter as Creator
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-50/50 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-50/50 blur-[100px] pointer-events-none" />
    </div>
  );
}
