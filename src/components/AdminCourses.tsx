import { useState } from 'react';
import { Search, Filter, MoreHorizontal, CheckCircle, XCircle, Eye, Star, Clock } from 'lucide-react';
import { View } from '../types';

interface Props {
  setView: (view: View) => void;
}

const DEMO_COURSES = [
  { id: '1', title: 'Advanced Next.js Architecture', creator: 'Wade Warren', status: 'published', students: 3420, price: 99, rating: 4.9 },
  { id: '2', title: 'UI/UX Design Systems', creator: 'Eleanor Pena', status: 'published', students: 8200, price: 149, rating: 4.8 },
  { id: '3', title: 'Python for Data Science', creator: 'Dianne Russell', status: 'pending', students: 0, price: 89, rating: 0 },
  { id: '4', title: 'Mastering Framer Motion', creator: 'Guy Hawkins', status: 'published', students: 1250, price: 49, rating: 4.7 },
  { id: '5', title: 'Intro to Machine Learning', creator: 'Dianne Russell', status: 'rejected', students: 0, price: 199, rating: 0 },
  { id: '6', title: 'Digital Marketing 101', creator: 'Brooklyn Simmons', status: 'draft', students: 0, price: 59, rating: 0 },
];

export default function AdminCourses({ setView }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Courses</h1>
          <p className="text-slate-500">Review, approve, and manage platform curriculum.</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
        <button className="px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap bg-indigo-600 text-white shadow-sm">All Courses</button>
        <button className="px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap bg-white text-slate-600 border border-slate-200 hover:bg-slate-50">Published (8,430)</button>
        <button className="px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap bg-white text-slate-600 border border-slate-200 hover:bg-slate-50">Pending Review (45)</button>
        <button className="px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap bg-white text-slate-600 border border-slate-200 hover:bg-slate-50">Drafts (1,200)</button>
        <button className="px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap bg-white text-slate-600 border border-slate-200 hover:bg-slate-50">Rejected (128)</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4 justify-between bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search courses by title or creator..." 
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
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Course Info</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Creator</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Students</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Price</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEMO_COURSES.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.creator.toLowerCase().includes(searchTerm.toLowerCase())).map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                        <Star className="text-slate-400" size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 line-clamp-1">{course.title}</div>
                        {course.rating > 0 ? (
                          <div className="flex items-center gap-1 mt-1 text-xs font-medium text-amber-500">
                            <Star size={12} className="fill-amber-500" />
                            {course.rating}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                            No ratings yet
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{course.creator}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                      ${course.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        course.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        course.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {course.status === 'pending' && <Clock size={12} />}
                      {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{course.students.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-semibold">${course.price}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {course.status === 'pending' && (
                        <>
                          <button className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors" title="Approve">
                            <CheckCircle size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors" title="Reject">
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors" title="View Course">
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
        </div>
      </div>
    </div>
  );
}
