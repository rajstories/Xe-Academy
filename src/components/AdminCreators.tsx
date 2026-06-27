import { useState } from 'react';
import { Search, Filter, MoreHorizontal, ShieldAlert, ShieldCheck, Eye, Download, Star } from 'lucide-react';
import { View } from '../types';

interface Props {
  setView: (view: View) => void;
}

const DEMO_CREATORS = [
  { id: '1', name: 'Eleanor Pena', niche: 'Design & UI/UX', status: 'verified', students: 12400, courses: 8, revenue: 145000 },
  { id: '2', name: 'Wade Warren', niche: 'Software Engineering', status: 'verified', students: 8500, courses: 4, revenue: 98000 },
  { id: '3', name: 'Brooklyn Simmons', niche: 'Digital Marketing', status: 'pending', students: 0, courses: 1, revenue: 0 },
  { id: '4', name: 'Guy Hawkins', niche: 'Video Production', status: 'verified', students: 15600, courses: 12, revenue: 210000 },
  { id: '5', name: 'Dianne Russell', niche: 'Data Science', status: 'verified', students: 4200, courses: 3, revenue: 56000 },
  { id: '6', name: 'Cody Fisher', niche: 'Music Production', status: 'suspended', students: 1200, courses: 2, revenue: 15000 },
];

export default function AdminCreators({ setView }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Creators</h1>
          <p className="text-slate-500">Manage instructors, review applications, and monitor performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
           <h3 className="text-slate-500 text-sm font-medium mb-1">Total Creators</h3>
           <p className="text-3xl font-bold text-slate-900">1,204</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
           <h3 className="text-slate-500 text-sm font-medium mb-1">Pending Approval</h3>
           <p className="text-3xl font-bold text-slate-900 text-indigo-600">12</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
           <h3 className="text-slate-500 text-sm font-medium mb-1">Total Payouts</h3>
           <p className="text-3xl font-bold text-slate-900">$1.8M</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
           <h3 className="text-slate-500 text-sm font-medium mb-1">Avg Rating</h3>
           <div className="flex items-center gap-2">
             <p className="text-3xl font-bold text-slate-900">4.8</p>
             <Star className="text-amber-400 fill-amber-400" size={24} />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4 justify-between bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search creators by name or niche..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 outline-none">
              <option>All Status</option>
              <option>Verified</option>
              <option>Pending</option>
              <option>Suspended</option>
            </select>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Creator</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Students</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Courses</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Revenue</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEMO_CREATORS.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.niche.toLowerCase().includes(searchTerm.toLowerCase())).map((creator) => (
                <tr key={creator.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                        {creator.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{creator.name}</div>
                        <div className="text-sm text-slate-500">{creator.niche}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                      ${creator.status === 'verified' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 
                        creator.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {creator.status.charAt(0).toUpperCase() + creator.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{creator.students.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{creator.courses}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">${creator.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {creator.status === 'pending' && (
                        <>
                          <button className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors" title="Approve">
                            <ShieldCheck size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors" title="Reject">
                            <ShieldAlert size={18} />
                          </button>
                        </>
                      )}
                      <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors" title="View Profile">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
            <div>Showing 1 to 6 of 1,204 creators</div>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50" disabled>Prev</button>
              <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white bg-white text-indigo-600 border-indigo-200 font-medium">1</button>
              <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
