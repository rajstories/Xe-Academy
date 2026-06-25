'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  BookOpen,
  Clock,
  DollarSign,
  Mail,
  MessageSquare,
  Plus,
  ReceiptText,
  User,
  Users,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { View } from '../types';

interface Props {
  setView: (view: View) => void;
}

type RangeKey = 'Last 30 Days' | 'Last 7 Days' | 'Last 12 Weeks';

type Sale = {
  id: string;
  name: string;
  email: string;
  course: string;
  amount: number;
  fee: number;
  date: string;
  method: string;
};

const revenueData: Record<RangeKey, Array<{ label: string; revenue: number }>> = {
  'Last 30 Days': [
    { label: 'Jun 1', revenue: 820 },
    { label: 'Jun 5', revenue: 1280 },
    { label: 'Jun 9', revenue: 1100 },
    { label: 'Jun 13', revenue: 1750 },
    { label: 'Jun 17', revenue: 1540 },
    { label: 'Jun 21', revenue: 2280 },
    { label: 'Jun 25', revenue: 2640 },
  ],
  'Last 7 Days': [
    { label: 'Fri', revenue: 320 },
    { label: 'Sat', revenue: 480 },
    { label: 'Sun', revenue: 410 },
    { label: 'Mon', revenue: 760 },
    { label: 'Tue', revenue: 690 },
    { label: 'Wed', revenue: 980 },
    { label: 'Thu', revenue: 1240 },
  ],
  'Last 12 Weeks': [
    { label: 'W1', revenue: 2900 },
    { label: 'W2', revenue: 3600 },
    { label: 'W3', revenue: 3300 },
    { label: 'W4', revenue: 4200 },
    { label: 'W5', revenue: 4700 },
    { label: 'W6', revenue: 4400 },
    { label: 'W7', revenue: 5100 },
    { label: 'W8', revenue: 5700 },
    { label: 'W9', revenue: 6200 },
    { label: 'W10', revenue: 5900 },
    { label: 'W11', revenue: 6900 },
    { label: 'W12', revenue: 7400 },
  ],
};

const sales: Sale[] = [
  {
    id: 'sale-1',
    name: 'Ava Thompson',
    email: 'ava.thompson@example.com',
    course: 'Advanced React Patterns',
    amount: 129,
    fee: 8.16,
    date: 'Today, 10:42 AM',
    method: 'Visa ending 4242',
  },
  {
    id: 'sale-2',
    name: 'Noah Singh',
    email: 'noah.singh@example.com',
    course: 'Fullstack Next.js 15',
    amount: 149,
    fee: 9.42,
    date: 'Today, 9:08 AM',
    method: 'Stripe Checkout',
  },
  {
    id: 'sale-3',
    name: 'Mia Chen',
    email: 'mia.chen@example.com',
    course: 'UI/UX Masterclass',
    amount: 99,
    fee: 6.34,
    date: 'Yesterday, 6:14 PM',
    method: 'Apple Pay',
  },
  {
    id: 'sale-4',
    name: 'Ethan Brooks',
    email: 'ethan.brooks@example.com',
    course: 'Advanced React Patterns',
    amount: 129,
    fee: 8.16,
    date: 'Yesterday, 2:40 PM',
    method: 'Mastercard ending 1891',
  },
];

const AVATAR_PALETTE = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
];

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function paletteIndex(seed: string) {
  const sum = seed.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  return sum % AVATAR_PALETTE.length;
}

// Clean initials avatar — keeps profile/sale rows credible next to real dollar figures.
function InitialsAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const dimensions = size === 'lg' ? 'h-20 w-20 text-xl' : size === 'sm' ? 'h-9 w-9 text-xs' : 'h-11 w-11 text-sm';
  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-bold ${dimensions} ${AVATAR_PALETTE[paletteIndex(name)]}`}
    >
      {getInitials(name)}
    </div>
  );
}

// Subtle ease-out count-up — runs once per mounted value, not a flashy ticker.
function AnimatedNumber({ value, formatter, duration = 1000 }: { value: number; formatter: (n: number) => string; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{formatter(display)}</>;
}

// Rounds a max value up to a clean step (1/2/5 x 10^n) and returns evenly spaced axis ticks.
function getNiceTicks(maxValue: number, tickCount = 4) {
  if (maxValue <= 0) return [0, 1];
  const rawStep = maxValue / tickCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;
  const niceResidual = residual > 5 ? 10 : residual > 2 ? 5 : residual > 1 ? 2 : 1;
  const step = niceResidual * magnitude;
  return Array.from({ length: tickCount + 1 }, (_, i) => Math.round(i * step));
}

export default function CreatorDashboard({ setView }: Props) {
  const [range, setRange] = useState<RangeKey>('Last 30 Days');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const chartTotal = useMemo(
    () => revenueData[range].reduce((total, point) => total + point.revenue, 0),
    [range]
  );

  const yTicks = useMemo(() => {
    const max = Math.max(...revenueData[range].map((point) => point.revenue));
    return getNiceTicks(max);
  }, [range]);

  const secondaryMetrics = [
    { label: 'Total Students', value: 1284, format: (n: number) => n.toLocaleString(), change: '+7.8%', icon: Users, animate: true },
    { label: 'Active Courses', value: 4, format: (n: number) => `${n}`, change: '+1', icon: BookOpen, animate: false },
    { label: 'Avg. Watch Time', value: '4h 32m', change: '+22%', icon: Clock, animate: false },
  ];

  return (
    <div className="flex flex-col gap-10 pb-12">
      <div className="flex justify-end">
        <button
          onClick={() => setView('my-courses')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-indigo-600/20 transition-all hover:shadow-lg active:scale-95"
        >
          <Plus size={18} />
          Create Course
        </button>
      </div>

      {/* Featured metric — Total Revenue is the one number creators check first. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-7 shadow-sm"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
              <DollarSign size={26} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Total Revenue</p>
              <h3 className="mt-1 text-4xl font-bold tracking-tight text-slate-900">
                <AnimatedNumber value={chartTotal} formatter={(n) => `$${n.toLocaleString()}`} />
              </h3>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                +18.4%
                <ArrowUpRight size={13} />
              </span>
              <span className="ml-2 text-xs font-medium text-slate-400">vs previous period</span>
            </div>
          </div>

          <div className="h-16 w-full sm:w-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData[range]} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
                <defs>
                  <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="natural"
                  dataKey="revenue"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  fill="url(#sparklineGradient)"
                  isAnimationActive
                  animationDuration={1100}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Secondary metrics — equal weight, no decorative fake-progress bars. */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {secondaryMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + index * 0.06, type: 'spring', stiffness: 220, damping: 22 }}
              className="rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Icon size={20} />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  {metric.change}
                  <ArrowUpRight size={13} />
                </span>
              </div>
              <div className="mt-5">
                <h3 className="text-3xl font-bold tracking-tight text-slate-900">
                  {metric.animate
                    ? <AnimatedNumber value={metric.value as number} formatter={metric.format as (n: number) => string} />
                    : typeof metric.value === 'number' ? metric.format!(metric.value) : metric.value}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500">{metric.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Revenue Overview</h2>
              <p className="mt-1 text-sm text-slate-500">Revenue recognized from creator course sales.</p>
            </div>
            <select
              value={range}
              onChange={(event) => setRange(event.target.value as RangeKey)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            >
              {Object.keys(revenueData).map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart key={range} data={revenueData[range]} margin={{ left: -8, right: 12, top: 18, bottom: 8 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 8" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  ticks={yTicks}
                  domain={[0, yTicks[yTicks.length - 1]]}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value: number) => value.toLocaleString()}
                />
                <Tooltip
                  cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                  contentStyle={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 14,
                    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)',
                  }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="natural"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                  activeDot={{ r: 6, strokeWidth: 3, stroke: '#ffffff', fill: '#4f46e5' }}
                  isAnimationActive
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Recent Sales</h2>
            <div className="mt-4 divide-y divide-slate-100">
              {sales.map((sale) => (
                <button
                  key={sale.id}
                  onClick={() => setSelectedSale(sale)}
                  className="flex w-full items-center gap-3 px-1 py-3 text-left transition-colors hover:bg-slate-50 active:scale-[0.99]"
                >
                  <InitialsAvatar name={sale.name} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-slate-900">{sale.name}</span>
                    <span className="block truncate text-xs font-medium text-slate-500">{sale.course}</span>
                  </span>
                  <span className="text-sm font-bold tabular-nums text-emerald-600">+${sale.amount}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Elevated balance card — banking-app treatment for the numbers creators check most. */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-lg shadow-indigo-900/20">
            <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <ReceiptText size={19} />
              </div>
              <div>
                <h3 className="font-bold">Payout Health</h3>
                <p className="text-sm text-indigo-100/80">Next payout clears in 3 business days.</p>
              </div>
            </div>
            <div className="relative z-10 mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-100/70">Available balance</p>
              <p className="mt-2 text-3xl font-bold">
                <AnimatedNumber value={4250} formatter={(n) => `$${n.toLocaleString()}.00`} />
              </p>
            </div>
          </section>
        </aside>
      </div>

      <AnimatePresence>
        {selectedSale && (
          <motion.div
            className="fixed inset-0 z-[100] flex justify-end bg-slate-950/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.aside
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-900">Transaction Details</h2>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="flex flex-col items-center text-center">
                  <InitialsAvatar name={selectedSale.name} size="lg" />
                  <h3 className="mt-4 text-xl font-bold text-slate-900">{selectedSale.name}</h3>
                  <p className="text-sm text-slate-500">{selectedSale.email}</p>
                  <div className="mt-4 flex gap-2">
                    <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-95">
                      <MessageSquare size={16} />
                      Message
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95">
                      <Mail size={16} />
                      Email
                    </button>
                  </div>
                </div>

                <div className="mt-8 space-y-3 rounded-2xl bg-slate-50 p-4">
                  {[
                    ['Course', selectedSale.course],
                    ['Purchase date', selectedSale.date],
                    ['Payment method', selectedSale.method],
                    ['Platform fee', `$${selectedSale.fee.toFixed(2)}`],
                    ['Net revenue', `$${(selectedSale.amount - selectedSale.fee).toFixed(2)}`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-right font-bold text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>

                <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition-all hover:bg-slate-50 active:scale-95">
                  <User size={16} />
                  Open Student Contact Portal
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
