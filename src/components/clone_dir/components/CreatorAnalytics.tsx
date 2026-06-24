import { useState } from 'react';
import { View } from '@/types';
import { 
  Download, Users, BookOpen, CheckCircle, DollarSign, 
  TrendingUp, TrendingDown, Calendar, BarChart3, 
  PlayCircle, Activity, Lightbulb, Plus
} from 'lucide-react';
import Image from 'next/image';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

interface Props {
  setView: (view: View) => void;
}

const revenueData = [
  { name: 'Jan', revenue: 2400 },
  { name: 'Feb', revenue: 3500 },
  { name: 'Mar', revenue: 3200 },
  { name: 'Apr', revenue: 4800 },
  { name: 'May', revenue: 5600 },
  { name: 'Jun', revenue: 8500 },
  { name: 'Jul', revenue: 10200 },
];

const activityData = [
  { name: 'Mon', students: 120 },
  { name: 'Tue', students: 150 },
  { name: 'Wed', students: 180 },
  { name: 'Thu', students: 140 },
  { name: 'Fri', students: 210 },
  { name: 'Sat', students: 280 },
  { name: 'Sun', students: 240 },
];

const coursePerformanceData = [
  { name: 'React Patterns', enrollments: 1250 },
  { name: 'UI/UX Masterclass', enrollments: 840 },
  { name: 'Next.js 15', enrollments: 450 },
  { name: 'TypeScript', enrollments: 320 },
];

const completionData = [
  { name: 'Completed', value: 45 },
  { name: 'In Progress', value: 40 },
  { name: 'Not Started', value: 15 },
];

const COLORS = ['#8B5CF6', '#C4B5FD', '#E5E7EB'];

const coursesTableData = [
  {
    id: 1,
    title: 'Advanced React Patterns',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=150&auto=format&fit=crop',
    enrollments: 1250,
    completionRate: 68,
    avgWatchTime: '4h 12m',
    revenue: '$62,500',
    rating: 4.8,
    status: 'Published'
  },
  {
    id: 2,
    title: 'UI/UX Masterclass',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=150&auto=format&fit=crop',
    enrollments: 840,
    completionRate: 54,
    avgWatchTime: '3h 45m',
    revenue: '$41,900',
    rating: 4.9,
    status: 'Published'
  },
  {
    id: 3,
    title: 'Fullstack Next.js 15',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=150&auto=format&fit=crop',
    enrollments: 450,
    completionRate: 32,
    avgWatchTime: '1h 20m',
    revenue: '$22,500',
    rating: 4.7,
    status: 'Published'
  }
];

export default function CreatorAnalytics({ setView }: Props) {
  const [dateRange, setDateRange] = useState('Last 30 Days');
  
  // Use length of table data to determine if we show the empty state or not
  const hasData = coursesTableData.length > 0;

  if (!hasData) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <BarChart3 className="text-primary w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Start publishing courses to unlock analytics.</h2>
        <p className="text-text-secondary text-center max-w-md mb-8">
          Once you create and publish your first course, you&apos;ll be able to track enrollments, revenue, and student engagement here.
        </p>
        <button 
          onClick={() => setView('course-builder')}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-sm"
        >
          <Plus size={20} />
          Create First Course
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div></div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium shadow-sm appearance-none"
            >
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-border text-text-primary rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={16} />
            Export Analytics
          </button>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/10 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="text-primary" size={20} />
          <h3 className="font-bold text-text-primary">Quick Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-secondary">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            <p><span className="font-medium text-text-primary">React Patterns</span> generated 42% of total revenue.</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
            <p>Student engagement <span className="text-green-600 font-medium">increased by 18%</span> this month.</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
            <p>Course completion rate <span className="text-blue-600 font-medium">improved by 12%</span>.</p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Users size={20} />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUp size={14} /> +12.5%
            </div>
          </div>
          <div className="text-text-secondary text-sm font-medium mb-1">Total Students</div>
          <div className="text-3xl font-bold text-text-primary">2,540</div>
          <div className="text-xs text-text-secondary mt-2">vs. previous 30 days</div>
        </div>

        {/* Total Courses */}
        <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen size={20} />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUp size={14} /> +1
            </div>
          </div>
          <div className="text-text-secondary text-sm font-medium mb-1">Total Courses</div>
          <div className="text-3xl font-bold text-text-primary">3</div>
          <div className="text-xs text-text-secondary mt-2">vs. previous 30 days</div>
        </div>

        {/* Completion Rate */}
        <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
              <CheckCircle size={20} />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUp size={14} /> +4.2%
            </div>
          </div>
          <div className="text-text-secondary text-sm font-medium mb-1">Completion Rate</div>
          <div className="text-3xl font-bold text-text-primary">54.8%</div>
          <div className="text-xs text-text-secondary mt-2">vs. previous 30 days</div>
        </div>

        {/* Total Revenue */}
        <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
              <DollarSign size={20} />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUp size={14} /> +24.8%
            </div>
          </div>
          <div className="text-text-secondary text-sm font-medium mb-1">Total Revenue</div>
          <div className="text-3xl font-bold text-text-primary">$126.9K</div>
          <div className="text-xs text-text-secondary mt-2">vs. previous 30 days</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Growth Chart */}
        <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-text-primary">Revenue Growth</h3>
            <span className="text-sm text-text-secondary">Monthly</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `$${value/1000}k`} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Activity Chart */}
        <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-text-primary">Student Activity</h3>
            <span className="text-sm text-text-secondary">Daily Active Users</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="students" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Performance Bar Chart */}
        <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-text-primary">Course Performance</h3>
            <span className="text-sm text-text-secondary">Enrollments</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coursePerformanceData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} width={120} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="enrollments" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Completion Donut Chart */}
        <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-text-primary mb-2">Course Completion</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full mt-4 space-y-2">
              {completionData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                    <span className="text-text-secondary">{item.name}</span>
                  </div>
                  <span className="font-medium text-text-primary">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Micro-Analytics Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <Activity size={16} className="text-blue-500" /> Student Engagement
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Weekly Active Students</span>
              <span className="font-medium text-text-primary">1,420</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Avg. Session Duration</span>
              <span className="font-medium text-text-primary">24m 15s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Lessons Completed</span>
              <span className="font-medium text-text-primary">12,504</span>
            </div>
          </div>
        </div>
        
        <div className="bg-surface border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <PlayCircle size={16} className="text-red-500" /> Video Analytics
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Total Video Views</span>
              <span className="font-medium text-text-primary">45.2K</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Avg. Watch Percentage</span>
              <span className="font-medium text-text-primary">68%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Engagement Rate</span>
              <span className="font-medium text-text-primary">14.2%</span>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500" /> Enrollment Trends
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">New Enrollments (30d)</span>
              <span className="font-medium text-green-600">+245</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Refund Rate</span>
              <span className="font-medium text-text-primary">1.2%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Avg. Order Value</span>
              <span className="font-medium text-text-primary">$54.50</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Courses Table */}
      <div className="bg-surface border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <h3 className="font-bold text-text-primary">Top Performing Courses</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-xs uppercase tracking-wider text-text-secondary bg-gray-50/50">
                <th className="px-6 py-4 font-medium">Course Name</th>
                <th className="px-6 py-4 font-medium">Enrollments</th>
                <th className="px-6 py-4 font-medium">Completion Rate</th>
                <th className="px-6 py-4 font-medium">Avg Watch Time</th>
                <th className="px-6 py-4 font-medium">Revenue Generated</th>
                <th className="px-6 py-4 font-medium text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {coursesTableData.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Image 
                        src={course.thumbnail} 
                        alt={course.title} 
                        width={48} 
                        height={36} 
                        className="rounded-md object-cover border border-border/50 shadow-sm"
                        unoptimized
                      />
                      <div>
                        <div className="font-medium text-text-primary text-sm line-clamp-1">{course.title}</div>
                        <div className="text-xs text-text-secondary mt-0.5">
                          <span className="inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            {course.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary text-sm">{course.enrollments.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${course.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-text-secondary w-8">{course.completionRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-text-primary">{course.avgWatchTime}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-green-600">{course.revenue}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                      ★ {course.rating}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
