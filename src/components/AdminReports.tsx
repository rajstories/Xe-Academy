import { useState } from 'react';
import { Flag, Search, Filter, AlertTriangle, ShieldCheck, UserX, XCircle } from 'lucide-react';
import { View } from '../types';

interface Props {
  setView: (view: View) => void;
}

const DEMO_REPORTS = [
  { id: 'R-1002', type: 'Course Content', target: 'Crypto Trading Masterclass', reportedBy: 'Alex Thompson', reason: 'Misleading information', status: 'pending', date: '2026-06-24 10:15' },
  { id: 'R-1001', type: 'User Comment', target: 'Comment ID #8921', reportedBy: 'Maria Garcia', reason: 'Spam / Promotion', status: 'pending', date: '2026-06-23 18:40' },
  { id: 'R-1000', type: 'User Profile', target: 'Creator ID #142', reportedBy: 'System', reason: 'Suspicious activity', status: 'resolved', date: '2026-06-22 14:20' },
  { id: 'R-0999', type: 'Course Content', target: 'React Native 101', reportedBy: 'James Wilson', reason: 'Copyright violation', status: 'pending', date: '2026-06-22 09:10' },
];

export default function AdminReports({ setView }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Moderation Center</h1>
          <p className="text-slate-500">Review community reports and enforce platform guidelines.</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
        <button className="px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap bg-indigo-600 text-white shadow-sm">Pending (3)</button>
        <button className="px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap bg-white text-slate-600 border border-slate-200 hover:bg-slate-50">Courses</button>
        <button className="px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap bg-white text-slate-600 border border-slate-200 hover:bg-slate-50">Comments</button>
        <button className="px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap bg-white text-slate-600 border border-slate-200 hover:bg-slate-50">Users</button>
        <button className="px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap bg-white text-slate-600 border border-slate-200 hover:bg-slate-50">Resolved</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4 justify-between bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search reports..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Report Details</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Target</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEMO_REPORTS.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                        <Flag size={14} />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 text-sm">{report.reason}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{report.id} • by {report.reportedBy}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{report.target}</div>
                    <div className="text-xs text-slate-500">{report.type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                      ${report.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{report.date}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {report.status === 'pending' && (
                        <>
                          <button className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors" title="Dismiss / Resolve">
                            <ShieldCheck size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors" title="Take Action (Delete/Suspend)">
                            <AlertTriangle size={18} />
                          </button>
                        </>
                      )}
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
