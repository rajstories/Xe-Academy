'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle,
  Download,
  Mail,
  MessageSquare,
  MoreVertical,
  Search,
  User,
  X,
} from 'lucide-react';
import { View } from '../types';

interface Props {
  setView: (view: View) => void;
}

type StudentStatus = 'Active' | 'Completed' | 'Inactive';

type Student = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  course: string;
  progress: number;
  lastActive: string;
  status: StudentStatus;
  phone: string;
};

const studentsSeed: Student[] = [
  {
    id: 1,
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
    course: 'Advanced React Patterns',
    progress: 75,
    lastActive: '2 hours ago',
    status: 'Active',
    phone: '+1 234 567 8900',
  },
  {
    id: 2,
    name: 'Sarah Smith',
    email: 'sarah.smith@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    course: 'UI/UX Masterclass',
    progress: 100,
    lastActive: '1 day ago',
    status: 'Completed',
    phone: '+1 987 654 3210',
  },
  {
    id: 3,
    name: 'Michael Davis',
    email: 'mdavis@example.com',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop',
    course: 'Advanced React Patterns',
    progress: 12,
    lastActive: '2 weeks ago',
    status: 'Inactive',
    phone: '+1 555 123 4567',
  },
  {
    id: 4,
    name: 'Emily Chen',
    email: 'emily.chen@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop',
    course: 'Fullstack Next.js 15',
    progress: 45,
    lastActive: 'Just now',
    status: 'Active',
    phone: '+1 444 987 6543',
  },
  {
    id: 5,
    name: 'Jordan Lee',
    email: 'jordan.lee@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan&backgroundColor=e2e8f0',
    course: 'Fullstack Next.js 15',
    progress: 88,
    lastActive: '6 hours ago',
    status: 'Active',
    phone: '+1 777 981 2114',
  },
];

export default function CreatorStudents({ setView }: Props) {
  const [students] = useState(studentsSeed);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [exporting, setExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const courses = useMemo(() => ['All Courses', ...Array.from(new Set(students.map((student) => student.course)))], [students]);

  const filteredStudents = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSearch = !normalized || `${student.name} ${student.email}`.toLowerCase().includes(normalized);
      const matchesCourse = courseFilter === 'All Courses' || student.course === courseFilter;
      const matchesStatus = statusFilter === 'All Statuses' || student.status === statusFilter;
      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [courseFilter, searchTerm, statusFilter, students]);

  const handleExport = () => {
    setExporting(true);
    setExportNotice('');
    window.setTimeout(() => {
      setExporting(false);
      setExportNotice(`Exported ${filteredStudents.length} student rows to CSV`);
      window.setTimeout(() => setExportNotice(''), 2000);
    }, 850);
  };

  const statusClass = (status: StudentStatus) => {
    if (status === 'Active') return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    if (status === 'Completed') return 'bg-indigo-50 text-indigo-700 ring-indigo-200';
    return 'bg-slate-100 text-slate-600 ring-slate-200';
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Learner CRM</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Enrolled Students</h1>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-60"
        >
          <Download size={18} />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[
          ['Total Students', students.length],
          ['Active', students.filter((student) => student.status === 'Active').length],
          ['Avg Progress', `${Math.round(students.reduce((sum, student) => sum + student.progress, 0) / students.length)}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <select
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            className="w-full lg:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            {courses.map((course) => (
              <option key={course}>{course}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full lg:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            {['All Statuses', 'Active', 'Completed', 'Inactive'].map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-400">
              <tr>
                <th className="px-6 py-4 font-bold">Student Profile</th>
                <th className="px-6 py-4 font-bold">Enrolled Course Name</th>
                <th className="px-6 py-4 font-bold">Progress</th>
                <th className="px-6 py-4 font-bold">Last Active</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={student.avatar} alt={student.name} className="h-11 w-11 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{student.name}</p>
                        <p className="text-xs font-medium text-slate-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">{student.course}</td>
                  <td className="px-6 py-4">
                    <div className="flex w-40 items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600" style={{ width: `${student.progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-500">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{student.lastActive}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusClass(student.status)}`}>{student.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="rounded-xl p-2 text-slate-400 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm active:scale-95"
                        aria-label="Student actions"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="p-12 text-center">
            <User className="mx-auto text-slate-300" size={40} />
            <h3 className="mt-4 text-lg font-bold text-slate-900">No students found</h3>
            <p className="mt-2 text-sm text-slate-500">Adjust search or filters to expand the result set.</p>
          </div>
        )}
      </section>

      <AnimatePresence>
        {selectedStudent && (
          <motion.div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/20 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.aside initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }} className="h-full w-full max-w-md bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-900">Student Actions</h2>
                <button onClick={() => setSelectedStudent(null)} className="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="flex flex-col items-center text-center">
                  <img src={selectedStudent.avatar} alt={selectedStudent.name} className="h-24 w-24 rounded-full object-cover shadow-sm" />
                  <h3 className="mt-4 text-xl font-bold text-slate-900">{selectedStudent.name}</h3>
                  <p className="text-sm text-slate-500">{selectedStudent.email}</p>
                  <div className="mt-4 flex gap-2">
                    <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-95">
                      <MessageSquare size={16} /> Message
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95">
                      <Mail size={16} /> Email
                    </button>
                  </div>
                </div>
                <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">{selectedStudent.course}</p>
                    <CheckCircle size={18} className="text-indigo-600" />
                  </div>
                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-xs font-bold text-slate-500">
                      <span>Course Progress</span>
                      <span>{selectedStudent.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-indigo-600" style={{ width: `${selectedStudent.progress}%` }} />
                    </div>
                  </div>
                  <div className="mt-5 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="font-bold text-slate-900">{selectedStudent.phone}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Last Active</span><span className="font-bold text-slate-900">{selectedStudent.lastActive}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="font-bold text-slate-900">{selectedStudent.status}</span></div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {exportNotice && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className="fixed bottom-6 right-6 z-[120] rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-xl">
            {exportNotice}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
