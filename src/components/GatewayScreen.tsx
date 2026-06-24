import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Video, ArrowRight, ArrowLeft } from 'lucide-react';
import { XeLogo } from './XeLogo';

interface GatewayScreenProps {
  onBack: () => void;
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
            <XeLogo className="h-12 text-indigo-600" />
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
            onClick={() => window.location.href = '/login.html?role=student'}
          >
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center border border-indigo-100 mb-8 bg-indigo-50 text-indigo-600 transition-transform duration-300 group-hover:scale-105">
              <GraduationCap className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Student Portal</h2>
            <p className="text-slate-500 leading-relaxed flex-1">
              Access your elite cohorts, track your velocity, and attend live synchronous arenas.
            </p>

            <div 
              className="mt-8 w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md group-hover:-translate-y-0.5 group-hover:shadow-lg"
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
            onClick={() => window.location.href = '/login.html?role=creator'}
          >
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center border border-indigo-100 mb-8 bg-indigo-50 text-indigo-600 transition-transform duration-300 group-hover:scale-105">
              <Video className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Creator Protocol</h2>
            <p className="text-slate-500 leading-relaxed flex-1">
              Architect curriculums, host live interactive sessions, and scale your global audience.
            </p>

            <div 
              className="mt-8 w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md group-hover:-translate-y-0.5 group-hover:shadow-lg"
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
