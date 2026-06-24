import { Users, Video, BookOpen, DollarSign, Activity, Server, AlertTriangle, ShieldCheck, CheckCircle2, MoreVertical, CreditCard, PlayCircle, PlusCircle, Flag } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { View } from '../types';

interface Props {
  setView: (view: View) => void;
}

const data = [
  { name: 'Jan', revenue: 4000, users: 2400 },
  { name: 'Feb', revenue: 5000, users: 3500 },
  { name: 'Mar', revenue: 8000, users: 5000 },
  { name: 'Apr', revenue: 12000, users: 7800 },
  { name: 'May', revenue: 16000, users: 10500 },
  { name: 'Jun', revenue: 22000, users: 15000 },
];

const activities = [
  { id: 1, type: 'creator', title: 'New Creator Joined', desc: 'Sarah Jenkins verified as UI/UX Creator.', time: '2 mins ago', icon: <Users size={16} /> },
  { id: 2, type: 'course', title: 'New Course Published', desc: 'Advanced Framer Motion 101 goes live.', time: '1 hour ago', icon: <PlayCircle size={16} /> },
  { id: 3, type: 'payment', title: 'Payment Received', desc: 'Subscription batch processed ($14,200).', time: '3 hours ago', icon: <CreditCard size={16} /> },
  { id: 4, type: 'report', title: 'Refund Requested', desc: 'User ID #892 requested refund for Course #12.', time: '5 hours ago', icon: <AlertTriangle size={16} /> },
];

export default function AdminDashboard({ setView }: Props) {
  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Overview</h1>
          <p className="text-slate-500">Monitor platform health and key performance metrics.</p>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between h-40">
           <div className="flex justify-between items-start">
             <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
               <Users size={24} />
             </div>
             <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">+12.5%</span>
           </div>
           <div>
             <h3 className="text-3xl font-bold text-slate-900">45,231</h3>
             <p className="text-sm font-medium text-slate-500">Total Students</p>
           </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between h-40">
           <div className="flex justify-between items-start">
             <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
               <Video size={24} />
             </div>
             <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">+8.2%</span>
           </div>
           <div>
             <h3 className="text-3xl font-bold text-slate-900">1,204</h3>
             <p className="text-sm font-medium text-slate-500">Verified Creators</p>
           </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between h-40">
           <div className="flex justify-between items-start">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
               <BookOpen size={24} />
             </div>
             <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">+24%</span>
           </div>
           <div>
             <h3 className="text-3xl font-bold text-slate-900">8,430</h3>
             <p className="text-sm font-medium text-slate-500">Active Courses</p>
           </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between h-40">
           <div className="flex justify-between items-start">
             <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
               <DollarSign size={24} />
             </div>
             <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">+18.4%</span>
           </div>
           <div>
             <h3 className="text-3xl font-bold text-slate-900">$2.4M</h3>
             <p className="text-sm font-medium text-slate-500">Total Revenue</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Platform Growth</h3>
              <p className="text-sm text-slate-500">Revenue and user acquisition over time.</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2 outline-none">
              <option>Last 6 months</option>
              <option>This Year</option>
              <option>All Time</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-1">Recent Activity</h3>
          <p className="text-sm text-slate-500 mb-8">Latest events across the platform.</p>
          
          <div className="space-y-6">
            {activities.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className={`mt-0.5 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                  ${item.type === 'creator' ? 'bg-indigo-50 text-indigo-600' : 
                    item.type === 'course' ? 'bg-emerald-50 text-emerald-600' :
                    item.type === 'payment' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                  <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
            View All Activity
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Platform Health */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Server size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Platform Health</h3>
              <p className="text-sm text-slate-500">All systems operational</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700">API Gateway</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">99.99%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[99%]"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700">Database Cluster</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">Healthy</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[95%]"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700">Video Streaming</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">Operational</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[90%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700">Payment Gateway</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">Secure</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[98%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <PlusCircle size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Quick Actions</h3>
              <p className="text-sm text-slate-500">Shortcuts to common admin tasks.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => setView('creators')} className="flex items-start p-4 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 rounded-2xl transition-all text-left group">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Users size={18} />
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-900 mb-0.5">Manage Creators</span>
                <span className="block text-xs text-slate-500">Review 12 pending</span>
              </div>
            </button>

            <button onClick={() => setView('courses')} className="flex items-start p-4 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 rounded-2xl transition-all text-left group">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Video size={18} />
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-900 mb-0.5">Review Courses</span>
                <span className="block text-xs text-slate-500">5 waiting for approval</span>
              </div>
            </button>

            <button onClick={() => setView('reports')} className="flex items-start p-4 border border-slate-100 hover:border-rose-200 hover:bg-rose-50/50 rounded-2xl transition-all text-left group">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Flag size={18} />
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-900 mb-0.5">Moderation</span>
                <span className="block text-xs text-slate-500">3 new reports</span>
              </div>
            </button>

            <button onClick={() => setView('analytics')} className="flex items-start p-4 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 rounded-2xl transition-all text-left group">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Activity size={18} />
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-900 mb-0.5">Generate Report</span>
                <span className="block text-xs text-slate-500">Export monthly data</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

