import { useState } from 'react';
import { View } from '@/types';
import { PlayCircle, MoreVertical, Plus, Edit, Trash, Settings, BarChart, BookOpen, Clock, Users, X, UploadCloud, Eye, Video } from 'lucide-react';
import Image from 'next/image';

interface Props {
  setView: (view: View) => void;
}

export default function CreatorMyCourses({ setView }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('Development');
  
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: 'Advanced React Patterns',
      category: 'Development',
      lessons: 24,
      students: 1250,
      status: 'Published',
      lastUpdated: '2 days ago',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 2,
      title: 'UI/UX Masterclass',
      category: 'Design',
      lessons: 18,
      students: 840,
      status: 'Published',
      lastUpdated: '1 week ago',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 3,
      title: 'Fullstack Next.js 15',
      category: 'Development',
      lessons: 12,
      students: 0,
      status: 'Draft',
      lastUpdated: 'Just now',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop',
    }
  ]);

  const handleCreateCourse = () => {
    const newCourse = {
      id: Date.now(),
      title: newCourseTitle || 'Untitled Course',
      category: newCourseCategory,
      lessons: 0,
      students: 0,
      status: 'Draft',
      lastUpdated: 'Just now',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop',
    };
    setCourses([newCourse, ...courses]);
    setIsModalOpen(false);
    setNewCourseTitle('');
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          {/* Header is handled by Header component, but we can have sub-actions here if needed */}
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus size={20} />
          Create New Course
        </button>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="text-text-secondary text-sm font-medium">Total Courses</div>
          <div className="text-3xl font-bold text-text-primary mt-2">{courses.length}</div>
        </div>
        <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="text-text-secondary text-sm font-medium">Published Courses</div>
          <div className="text-3xl font-bold text-text-primary mt-2">{courses.filter(c => c.status === 'Published').length}</div>
        </div>
        <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="text-text-secondary text-sm font-medium">Draft Courses</div>
          <div className="text-3xl font-bold text-text-primary mt-2">{courses.filter(c => c.status === 'Draft').length}</div>
        </div>
        <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="text-text-secondary text-sm font-medium">Total Students</div>
          <div className="text-3xl font-bold text-text-primary mt-2">
            {courses.reduce((acc, curr) => acc + curr.students, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        {courses.map((course) => (
          <div key={course.id} className="bg-surface border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
            <div className="relative h-48 w-full bg-gray-100">
              <Image 
                src={course.thumbnail} 
                alt={course.title}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-sm ${
                  course.status === 'Published' ? 'bg-green-500/90 text-white' : 
                  course.status === 'Draft' ? 'bg-orange-500/90 text-white' : 
                  'bg-gray-500/90 text-white'
                }`}>
                  {course.status}
                </span>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="text-xs font-medium text-primary mb-2">{course.category}</div>
              <h3 className="text-lg font-bold text-text-primary mb-3 line-clamp-2">{course.title}</h3>
              
              <div className="flex items-center gap-4 text-sm text-text-secondary mb-4">
                <div className="flex items-center gap-1.5">
                  <PlayCircle size={16} />
                  <span>{course.lessons} Lessons</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={16} />
                  <span>{course.students} Students</span>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                <div className="text-xs text-text-secondary">
                  Updated {course.lastUpdated}
                </div>
                
                {/* 3-Dot Menu / Quick Actions */}
                <div className="relative group/menu">
                  <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-50 rounded-lg transition-colors">
                    <MoreVertical size={18} />
                  </button>
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-surface rounded-xl shadow-lg border border-border/50 py-1 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                    <button onClick={() => setView('course-builder')} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-gray-50 flex items-center gap-2">
                      <Edit size={16} /> Edit Details
                    </button>
                    <button onClick={() => setView('course-builder')} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-gray-50 flex items-center gap-2">
                      <BookOpen size={16} /> Manage Lessons
                    </button>
                    <button onClick={() => setView('course-builder')} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-gray-50 flex items-center gap-2">
                      <Video size={16} /> Upload Videos
                    </button>
                    <button onClick={() => setView('analytics')} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-gray-50 flex items-center gap-2">
                      <BarChart size={16} /> Analytics
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-gray-50 flex items-center gap-2">
                      <Eye size={16} /> {course.status === 'Published' ? 'Unpublish' : 'Publish'} Course
                    </button>
                    <div className="h-px bg-border/50 my-1"></div>
                    <button className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 flex items-center gap-2">
                      <Trash size={16} /> Delete Course
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h2 className="text-xl font-bold text-text-primary">Create New Course</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Course Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Advanced React Patterns" 
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
                <textarea rows={3} placeholder="What is this course about?" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
                  <select 
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value)}
                  >
                    <option>Development</option>
                    <option>Design</option>
                    <option>Business</option>
                    <option>Marketing</option>
                    <option>Music</option>
                    <option>Photography</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Difficulty</label>
                  <select className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Price ($)</label>
                  <input type="number" placeholder="49.99" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Tags</label>
                  <input type="text" placeholder="e.g. react, web dev (comma separated)" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Course Status</label>
                <select className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option>Draft</option>
                  <option>Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Course Thumbnail</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-xl bg-background/50 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-text-secondary justify-center">
                      <span className="relative rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none">
                        Upload a file
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="p-6 border-t border-border/50 flex justify-end gap-3 bg-gray-50/50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-border text-text-primary rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateCourse}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-hover transition-colors shadow-sm"
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
