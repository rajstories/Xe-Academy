'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Rocket,
  BookOpen,
  Video,
  CreditCard,
  User,
  Award,
  ChevronDown,
  MessageSquare,
  Mail,
  Activity,
  ArrowRight,
  LifeBuoy
} from 'lucide-react';
import { View } from '../types';

interface Props {
  setView: (view: View) => void;
}

interface Category {
  id: string;
  title: string;
  description: string;
  icon: any;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'New here? Learn the basics and set up your account.',
    icon: Rocket,
  },
  {
    id: 'courses-lessons',
    title: 'Courses & Lessons',
    description: 'Track progress, download assets, and take notes.',
    icon: BookOpen,
  },
  {
    id: 'live-sessions',
    title: 'Live Sessions',
    description: 'Schedules, calendar sync, and interactive workspace rooms.',
    icon: Video,
  },
  {
    id: 'billing-plans',
    title: 'Billing & Plans',
    description: 'Manage subscriptions, update cards, or request a refund.',
    icon: CreditCard,
  },
  {
    id: 'account-settings',
    title: 'Account & Settings',
    description: 'Edit profile info, switch login methods, or change passkey.',
    icon: User,
  },
  {
    id: 'certificates',
    title: 'Certificates',
    description: 'View credentials, export certificates, or share to LinkedIn.',
    icon: Award,
  },
];

const FAQS: FAQItem[] = [
  {
    id: 1,
    category: 'account-settings',
    question: 'How do I reset my password?',
    answer: 'You can reset your password by going to the Settings page, clicking the Security tab, and selecting "Reset Password". Alternatively, you can request a password reset link from the login page.',
  },
  {
    id: 2,
    category: 'courses-lessons',
    question: 'Can I download lessons for offline viewing?',
    answer: 'Yes, individual resources like source code, slides, and cheat sheets can be downloaded. Video playback requires an active internet connection to stream high-definition content securely.',
  },
  {
    id: 3,
    category: 'certificates',
    question: 'How do certificates work?',
    answer: 'Once you complete 100% of the lessons in a course, a "Download Certificate" option will appear on your course learning page. You can download the PDF or directly add it to your LinkedIn profile.',
  },
  {
    id: 4,
    category: 'live-sessions',
    question: 'What happens if I miss a live session?',
    answer: 'Don\'t worry! All live sessions are recorded and uploaded to the "Past Recordings" section of the Live Sessions page within 2-4 hours after the live stream ends.',
  },
  {
    id: 5,
    category: 'billing-plans',
    question: 'How do I update my billing information?',
    answer: 'You can update your payment cards or subscription details from the Settings page, under the Billing & Plans tab, where you can modify details handled securely via Clerk and Stripe.',
  },
  {
    id: 6,
    category: 'courses-lessons',
    question: 'Is there a limit to how many courses I can take?',
    answer: 'Under the Student Plan, you can enroll in any number of courses available in our catalog. There is no restriction on parallel course learning or progress tracking.',
  },
  {
    id: 7,
    category: 'account-settings',
    question: 'Can I switch roles from Student to Creator?',
    answer: 'Yes! If you want to start creating courses, click on your profile icon in the top right, go to Profile settings, and submit an application to become a Creator. Our review team checks submissions within 24 hours.',
  },
];

export default function HelpSupport({ setView }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  // Filter FAQs based on search input and selected category
  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesSearch =
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? faq.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Filter Categories based on search input
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return CATEGORIES;
    return CATEGORIES.filter(
      (cat) =>
        cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      // Toggle off
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
      // Automatically clear search if it doesn't match the category to prevent empty state confusion
      setSearchTerm('');
    }
  };

  const toggleFaq = (id: number) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-10 pb-16 max-w-6xl mx-auto w-full px-1"
    >
      {/* Search Section */}
      <section className="relative w-full">
        <div className="relative flex items-center w-full">
          <Search className="absolute left-5 text-text-secondary h-5 w-5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for answers, e.g. 'reset password', 'certificate', 'live session'..."
            className="w-full bg-white border border-border/80 text-text-primary placeholder:text-text-secondary/60 rounded-2xl py-4.5 pl-14 pr-6 text-base shadow-[0_8px_30px_rgb(0,0,0,0.02)] outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-5 text-text-secondary hover:text-text-primary text-xs font-semibold px-2 py-1 rounded bg-slate-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-text-primary">Browse by Category</h3>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
            >
              Show all categories
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`group text-left p-6 rounded-2xl border transition-all duration-300 flex items-start gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5
                  ${isSelected
                    ? 'bg-primary/5 border-primary ring-1 ring-primary/20'
                    : 'bg-white border-border/60 hover:border-slate-300'
                  }`}
              >
                <div className={`flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-105
                  ${isSelected
                    ? 'bg-primary text-white'
                    : 'bg-primary/10 text-primary'
                  }`}
                >
                  <Icon size={22} className="transition-transform duration-500 group-hover:rotate-6" />
                </div>
                <div className="space-y-1">
                  <h4 className={`font-bold text-sm tracking-tight transition-colors ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                    {category.title}
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-10 bg-white border border-border/50 rounded-2xl">
            <LifeBuoy size={40} className="mx-auto text-text-secondary/45 mb-3 animate-spin duration-[4000ms]" />
            <p className="text-sm font-medium text-text-secondary">No categories found matching your search term.</p>
          </div>
        )}
      </section>

      {/* FAQ Accordion Section */}
      <section className="space-y-5">
        <h3 className="text-xl font-bold text-text-primary tracking-tight">Frequently Asked Questions</h3>

        <div className="bg-white border border-border/60 rounded-2xl overflow-hidden divide-y divide-border/60 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div key={faq.id} className="transition-all duration-200">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <span className="font-bold text-sm md:text-base text-text-primary tracking-tight leading-snug">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0 ml-2">
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className={`h-8 w-8 flex items-center justify-center rounded-full transition-colors ${isOpen ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-text-secondary hover:text-text-primary'}`}
                    >
                      <ChevronDown size={18} />
                    </motion.div>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden bg-slate-50/30"
                    >
                      <div className="px-5 pb-6 pt-1 md:px-6 text-sm text-text-secondary leading-relaxed max-w-4xl">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-14 p-6">
              <LifeBuoy size={48} className="mx-auto text-text-secondary/40 mb-4" />
              <h4 className="font-bold text-text-primary text-base">No matching questions found</h4>
              <p className="text-sm text-text-secondary mt-1.5 max-w-sm mx-auto">
                Try searching for other terms like 'reset', 'password', 'lesson', or browse by categories above.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Still need help? Contact Section */}
      <section className="relative rounded-3xl overflow-hidden border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-surface p-6 md:p-8 shadow-[0_12px_40px_rgba(108,92,231,0.06)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-text-primary tracking-tight">Can't find what you're looking for?</h3>
            <p className="text-sm text-text-secondary max-w-xl leading-relaxed">
              Our dedicated support collective is always ready to assist you on your learning or teaching journey. Reach out through our direct options.
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 md:shrink-0">
            <a
              href="mailto:info@xelabs.in?subject=XE%20Academy%20Support%20Request"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-sm font-bold text-text-primary hover:bg-slate-50 active:scale-[0.98] transition-all shadow-sm"
            >
              <Mail size={16} className="text-text-secondary" />
              Email us
            </a>
            <a
              href="https://wa.me/919958262272?text=Hello%20XE%20Academy%20Support%2C%20I%20need%20assistance."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all"
            >
              <MessageSquare size={16} />
              Chat with Support
            </a>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-primary/10 flex items-center gap-2 text-xs font-semibold text-text-secondary">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Avg. response time: under 2 hours
        </div>
      </section>

      {/* Status Footer Strip */}
      <footer className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <a
          href="https://status.xeacademy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 rounded-full bg-slate-50 border border-border/80 px-4 py-1.5 text-xs font-bold text-text-secondary transition-all hover:bg-slate-100 hover:text-text-primary"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          All systems operational
          <ArrowRight size={12} className="text-text-secondary/60 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </a>
        <div className="text-xs font-medium text-text-secondary/50">
          XE Academy Support Center
        </div>
      </footer>
    </motion.div>
  );
}
