import { useState } from 'react';
import { View } from '../types';
import { Search, Filter, Download, User, Mail, BookOpen, Clock, Activity, MoreVertical, X, CheckCircle, MessageSquare, Trash, BarChart } from 'lucide-react';

interface Props {
  setView: (view: View) => void;
}

const mockStudents = [
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
    enrollmentDate: 'Jan 15, 2024',
    assignmentsScore: 92,
    certificates: 0
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
    enrollmentDate: 'Dec 10, 2023',
    assignmentsScore: 98,
    certificates: 1
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
    enrollmentDate: 'Feb 05, 2024',
    assignmentsScore: 45,
    certificates: 0
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
    enrollmentDate: 'Mar 01, 2024',
    assignmentsScore: 88,
    certificates: 0
  }
];

export default function CreatorStudents({ setView }: Props) {
  const [students, setStudents] = useState(mockStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('All Courses');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null);

  // Derived Statistics
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'Active').length;
  const completedCourses = students.filter(s => s.status === 'Completed').length;
  const averageProgress = totalStudents > 0 
    ? Math.round(students.reduce((acc, curr) => acc + curr.progress, 0) / totalStudents)
    : 0;

  // Filtering
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = filterCourse === 'All Courses' || student.course === filterCourse;
    const matchesStatus = filterStatus === 'All Status' || student.status === filterStatus;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const uniqueCourses = ['All Courses', ...Array.from(new Set(students.map(s => s.course)))];

  const handleExport = () => {
    // In a real app, generate CSV and trigger download
    alert('Exporting student data to CSV...');
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      
      {/* Top Actions */}
      <div className="flex justify-end mb-2">
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-border text-text-primary rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="text-text-secondary text-sm font-medium">Total Students</div>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-text-primary mt-4">{totalStudents}</div>
        </div>
        <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="text-text-secondary text-sm font-medium">Active Students</div>
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
              <Activity size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-text-primary mt-4">{activeStudents}</div>
        </div>
        <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="text-text-secondary text-sm font-medium">Completed Courses</div>
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-text-primary mt-4">{completedCourses}</div>
        </div>
        <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="text-text-secondary text-sm font-medium">Average Progress</div>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
              <BarChart size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-text-primary mt-4">{averageProgress}%</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-surface border border-border/50 rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden">
        
        {/* Filters and Search */}
        <div className="p-4 md:p-6 border-b border-border/50 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search students by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={16} />
              <select 
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none"
              >
                {uniqueCourses.map(course => <option key={course} value={course}>{course}</option>)}
              </select>
            </div>
            
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full md:w-40 px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Student Table */}
        <div className="flex-1 overflow-auto">
          {filteredStudents.length > 0 ? (
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-xs uppercase tracking-wider text-text-secondary bg-gray-50/50">
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Enrolled Course</th>
                  <th className="px-6 py-4 font-medium">Progress</th>
                  <th className="px-6 py-4 font-medium">Last Active</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={student.avatar} 
                          alt={student.name} 
                          width={40} 
                          height={40} 
                          className="rounded-full object-cover"
                          unoptimized
                        />
                        <div>
                          <div className="font-medium text-text-primary text-sm">{student.name}</div>
                          <div className="text-xs text-text-secondary">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-primary max-w-[200px] truncate" title={student.course}>
                        {student.course}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 w-32">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-text-secondary">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-secondary">{student.lastActive}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                        student.status === 'Active' ? 'bg-green-100 text-green-700' :
                        student.status === 'Completed' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          student.status === 'Active' ? 'bg-green-600' :
                          student.status === 'Completed' ? 'bg-purple-600' :
                          'bg-gray-500'
                        }`}></span>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <button 
                          className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Action menu
                          }}
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <User className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-bold text-text-primary">No Students Found</h3>
              <p className="text-text-secondary mt-2 max-w-sm mb-6">
                {searchQuery || filterCourse !== 'All Courses' || filterStatus !== 'All Status' 
                  ? "We couldn't find any students matching your current filters."
                  : "Students enrolled in your courses will appear here."}
              </p>
              {(searchQuery || filterCourse !== 'All Courses' || filterStatus !== 'All Status') ? (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCourse('All Courses');
                    setFilterStatus('All Status');
                  }}
                  className="px-6 py-2.5 bg-white border border-border text-text-primary rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Clear Filters
                </button>
              ) : (
                <button 
                  onClick={() => setView('my-courses')}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-hover transition-colors shadow-sm"
                >
                  Create Your First Course
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Student Details Drawer / Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-surface h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">Student Profile</h2>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex flex-col items-center text-center mb-8">
                <img 
                  src={selectedStudent.avatar} 
                  alt={selectedStudent.name} 
                  width={96} 
                  height={96} 
                  className="rounded-full object-cover border-4 border-white shadow-sm mb-4"
                  unoptimized
                />
                <h3 className="text-xl font-bold text-text-primary">{selectedStudent.name}</h3>
                <p className="text-text-secondary">{selectedStudent.email}</p>
                
                <div className="flex items-center gap-3 mt-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
                    <MessageSquare size={16} /> Message
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border text-text-primary rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                    <Mail size={16} /> Email
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Email</span>
                      <span className="text-text-primary font-medium">{selectedStudent.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Phone</span>
                      <span className="text-text-primary font-medium">{selectedStudent.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Joined</span>
                      <span className="text-text-primary font-medium">{selectedStudent.enrollmentDate}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Course Performance</h4>
                  <div className="bg-gray-50/50 rounded-xl p-4 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-text-primary">{selectedStudent.course}</div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        selectedStudent.status === 'Active' ? 'bg-green-100 text-green-700' :
                        selectedStudent.status === 'Completed' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {selectedStudent.status}
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text-secondary">Course Progress</span>
                        <span className="font-medium text-primary">{selectedStudent.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-1000" 
                          style={{ width: `${selectedStudent.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-white p-3 rounded-lg border border-border/50 shadow-sm text-center">
                        <div className="text-xs text-text-secondary mb-1">Avg Score</div>
                        <div className="font-bold text-text-primary">{selectedStudent.assignmentsScore}%</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-border/50 shadow-sm text-center">
                        <div className="text-xs text-text-secondary mb-1">Certificates</div>
                        <div className="font-bold text-text-primary">{selectedStudent.certificates}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-border/50 bg-gray-50/50">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-danger border border-danger/20 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors">
                <Trash size={16} /> Remove Enrollment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
