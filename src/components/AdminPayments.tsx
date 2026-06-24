import { useState } from 'react';
import { Search, Download, ArrowUpRight, ArrowDownRight, MoreHorizontal, DollarSign } from 'lucide-react';
import { View } from '../types';

interface Props {
  setView: (view: View) => void;
}

const DEMO_TRANSACTIONS = [
  { id: 'TRX-10293', user: 'Alex Thompson', creator: 'Eleanor Pena', item: 'UI/UX Design Systems', amount: 149, date: '2026-06-24 14:20', type: 'purchase', status: 'completed' },
  { id: 'TRX-10292', user: 'Maria Garcia', creator: 'Wade Warren', item: 'Advanced Next.js Architecture', amount: 99, date: '2026-06-24 13:45', type: 'purchase', status: 'completed' },
  { id: 'PAY-8821', user: 'Platform', creator: 'Guy Hawkins', item: 'Monthly Creator Payout', amount: -4250, date: '2026-06-24 10:00', type: 'payout', status: 'processing' },
  { id: 'TRX-10291', user: 'James Wilson', creator: 'Dianne Russell', item: 'Python for Data Science', amount: 89, date: '2026-06-24 09:15', type: 'refund', status: 'completed' },
  { id: 'TRX-10290', user: 'Linda Chen', creator: 'Eleanor Pena', item: 'UI/UX Design Systems', amount: 149, date: '2026-06-23 22:30', type: 'purchase', status: 'completed' },
  { id: 'TRX-10289', user: 'Robert Fox', creator: 'Guy Hawkins', item: 'Mastering Framer Motion', amount: 49, date: '2026-06-23 19:40', type: 'purchase', status: 'completed' },
];

export default function AdminPayments({ setView }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Payments</h1>
          <p className="text-slate-500">Manage transactions, creator payouts, and refunds.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
            Run Payouts
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-5">
             <DollarSign size={80} />
           </div>
           <h3 className="text-slate-500 text-sm font-medium mb-1">Gross Volume (30d)</h3>
           <div className="flex items-end gap-3 mb-2">
             <p className="text-3xl font-bold text-slate-900">$245,890</p>
             <span className="flex items-center text-sm font-medium text-emerald-600 mb-1">
               <ArrowUpRight size={16} /> 12%
             </span>
           </div>
           <p className="text-xs text-slate-400">vs. previous 30 days</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden">
           <h3 className="text-slate-500 text-sm font-medium mb-1">Net Revenue (30d)</h3>
           <div className="flex items-end gap-3 mb-2">
             <p className="text-3xl font-bold text-slate-900">$49,178</p>
             <span className="flex items-center text-sm font-medium text-emerald-600 mb-1">
               <ArrowUpRight size={16} /> 15%
             </span>
           </div>
           <p className="text-xs text-slate-400">Platform fee collected</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden">
           <h3 className="text-slate-500 text-sm font-medium mb-1">Pending Payouts</h3>
           <div className="flex items-end gap-3 mb-2">
             <p className="text-3xl font-bold text-slate-900">$18,450</p>
           </div>
           <p className="text-xs text-slate-400">To 42 creators</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4 justify-between bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, user, or item..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 outline-none">
              <option>All Types</option>
              <option>Purchases</option>
              <option>Payouts</option>
              <option>Refunds</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Transaction</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Type</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEMO_TRANSACTIONS.filter(t => t.id.toLowerCase().includes(searchTerm.toLowerCase()) || t.user.toLowerCase().includes(searchTerm.toLowerCase())).map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 text-sm">{trx.item}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{trx.id} • {trx.user}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{trx.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border
                      ${trx.type === 'purchase' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 
                        trx.type === 'payout' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {trx.type.charAt(0).toUpperCase() + trx.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                      ${trx.status === 'completed' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {trx.status.charAt(0).toUpperCase() + trx.status.slice(1)}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-semibold text-sm ${trx.amount < 0 ? 'text-slate-900' : 'text-emerald-600'}`}>
                    {trx.amount > 0 ? '+' : ''}{trx.amount < 0 ? `-$${Math.abs(trx.amount)}` : `$${trx.amount}`}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal size={18} />
                    </button>
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
