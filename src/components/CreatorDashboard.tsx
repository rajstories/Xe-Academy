'use client';

import { useMemo, useState } from 'react';
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
  avatar: string;
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
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ava&backgroundColor=e2e8f0',
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
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah&backgroundColor=e2e8f0',
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
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=e2e8f0',
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
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan&backgroundColor=e2e8f0',
    course: 'Advanced React Patterns',
    amount: 129,
    fee: 8.16,
    date: 'Yesterday, 2:40 PM',
    method: 'Mastercard ending 1891',
  },
];

export default function CreatorDashboard({ setView }: Props) {
  const [range, setRange] = useState<RangeKey>('Last 30 Days');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const chartTotal = useMemo(
    () => revenueData[range].reduce((total, point) => total + point.revenue, 0),
    [range]
  );

  const metrics = [
    { label: 'Total Revenue', value: `$${chartTotal.toLocaleString()}`, change: '+18.4%', icon: DollarSign },
    { label: 'Total Students', value: '1,284', change: '+7.8%', icon: Users },
    { label: 'Active Courses', value: '4', change: '+1', icon: BookOpen },
    { label: 'Avg. Watch Time', value: '4h 32m', change: '+22%', icon: Clock },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Creator OS</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Studio Performance</h1>
        </div>
        <button
          onClick={() => setView('my-courses')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-indigo-600/20 transition-all hover:shadow-lg active:scale-95"
        >
          <Plus size={18} />
          Create Course
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, type: 'spring', stiffness: 220, damping: 22 }}
              className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon size={21} />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  {metric.change}
                  <ArrowUpRight size={13} />
                </span>
              </div>
              <div className="mt-5">
                <h3 className="text-3xl font-bold tracking-tight text-slate-900">{metric.value}</h3>
                <p className="mt-1 text-sm font-medium text-slate-500">{metric.label}</p>
              </div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${72 + index * 6}%` }}
                  transition={{ delay: 0.18 + index * 0.05, duration: 0.7 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
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
              <AreaChart data={revenueData[range]} margin={{ left: -20, right: 12, top: 18, bottom: 8 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 8" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
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
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                  activeDot={{ r: 6, strokeWidth: 3, stroke: '#ffffff', fill: '#4f46e5' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Recent Sales</h2>
            <div className="mt-5 space-y-3">
              {sales.map((sale) => (
                <button
                  key={sale.id}
                  onClick={() => setSelectedSale(sale)}
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all hover:bg-slate-50 active:scale-[0.99]"
                >
                  <img src={sale.avatar} alt={sale.name} className="h-11 w-11 rounded-full bg-slate-100" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-slate-900">{sale.name}</span>
                    <span className="block truncate text-xs font-medium text-slate-500">{sale.course}</span>
                  </span>
                  <span className="text-sm font-bold text-emerald-600">+${sale.amount}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <ReceiptText size={19} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Payout Health</h3>
                <p className="text-sm text-slate-500">Next payout clears in 3 business days.</p>
              </div>
            </div>
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Available balance</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">$4,250.00</p>
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
                  <img src={selectedSale.avatar} alt={selectedSale.name} className="h-20 w-20 rounded-full bg-slate-100" />
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

                <div className="mt-8 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
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
