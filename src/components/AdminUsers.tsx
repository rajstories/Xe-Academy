import { useState } from 'react';
import { Search, Filter, MoreHorizontal, UserX, UserCheck, Eye, Download } from 'lucide-react';
import { View } from '../types';

interface Props {
  setView: (view: View) => void;
}

const DEMO_USERS = [
  { id: '1', name: 'Alex Thompson', email: 'alex@example.com', joinDate: '2023-10-12', status: 'active', courses: 4, spent: 450 },
  { id: '2', name: 'Maria Garcia', email: 'maria@example.com', joinDate: '2023-11-05', status: 'active', courses: 2, spent: 180 },
  { id: '3', name: 'James Wilson', email: 'james.w@example.com', joinDate: '2023-11-20', status: 'suspended', courses: 1, spent: 45 },
  { id: '4', name: 'Linda Chen', email: 'linda.c@example.com', joinDate: '2024-01-15', status: 'active', courses: 7, spent: 890 },
  { id: '5', name: 'Robert Fox', email: 'robert.fox@example.com', joinDate: '2024-02-02', status: 'active', courses: 3, spent: 210 },
  { id: '6', name: 'Esther Howard', email: 'esther@example.com', joinDate: '2024-02-18', status: 'active', courses: 5, spent: 620 },
  { id: '7', name: 'Jenny Wilson', email: 'jenny.w@example.com', joinDate: '2024-03-01', status: 'inactive', courses: 0, spent: 0 },
];

export default function AdminUsers({ setView }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Users</h1>
          <p className="text-slate-500">Manage all students and their platform access.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4 justify-between bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 outline-none">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
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
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">User</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Joined</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Courses</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Total Spent</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEMO_USERS.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{user.name}</div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(user.joinDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.courses}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">${user.spent}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                      ${user.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        user.status === 'inactive' ? 'bg-slate-100 text-slate-700 border-slate-200' : 
                        'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors" title="View Profile">
                        <Eye size={18} />
                      </button>
                      {user.status === 'suspended' ? (
                        <button className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors" title="Restore User">
                          <UserCheck size={18} />
                        </button>
                      ) : (
                        <button className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors" title="Suspend User">
                          <UserX size={18} />
                        </button>
                      )}
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
            <div>Showing 1 to 7 of 2,453 users</div>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50" disabled>Prev</button>
              <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white bg-white text-indigo-600 border-indigo-200 font-medium">1</button>
              <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white">2</button>
              <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white">3</button>
              <span className="px-2 py-1">...</span>
              <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
