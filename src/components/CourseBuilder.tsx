import { useState } from 'react';
import { View } from '../types';
import { ArrowLeft, Save, Plus, Settings, Video, UploadCloud, GripVertical, PlayCircle, Eye, EyeOff, LayoutDashboard } from 'lucide-react';

interface Props {
  setView: (view: View) => void;
}

export default function CourseBuilder({ setView }: Props) {
  const [activeTab, setActiveTab] = useState<'details' | 'lessons'>('lessons');
  const [courseTitle, setCourseTitle] = useState('Advanced React Patterns');
  const [courseStatus, setCourseStatus] = useState('Draft');

  const [lessons, setLessons] = useState([
    { id: 1, title: 'Introduction to React Patterns', duration: '5:30', status: 'Published' },
    { id: 2, title: 'Higher Order Components (HOC)', duration: '12:45', status: 'Published' },
    { id: 3, title: 'Render Props and Custom Hooks', duration: '18:20', status: 'Draft' }
  ]);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isAddingLesson, setIsAddingLesson] = useState(false);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newLessons = [...lessons];
    const draggedItem = newLessons[draggedIndex];
    newLessons.splice(draggedIndex, 1);
    newLessons.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setLessons(newLessons);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('my-courses')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-text-secondary"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-text-primary">{courseTitle}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${courseStatus === 'Published' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {courseStatus}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-white border border-border text-text-primary rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
            <Eye size={16} /> Preview
          </button>
          <button className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-hover transition-colors shadow-sm flex items-center gap-2">
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50">
        <button 
          onClick={() => setActiveTab('details')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
        >
          <div className="flex items-center gap-2"><Settings size={16} /> Course Details</div>
        </button>
        <button 
          onClick={() => setActiveTab('lessons')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'lessons' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
        >
          <div className="flex items-center gap-2"><Video size={16} /> Curriculum & Lessons</div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-12">
        {activeTab === 'details' && (
          <div className="max-w-3xl space-y-8 bg-surface p-6 rounded-2xl border border-border/50 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Course Title</label>
                <input type="text" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
                <textarea rows={4} className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" defaultValue="Learn advanced React patterns like HOCs, Render Props, and custom hooks to build scalable applications." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
                  <select className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option>Development</option>
                    <option>Design</option>
                    <option>Business</option>
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
                  <input type="number" defaultValue="49.99" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
                  <select value={courseStatus} onChange={(e) => setCourseStatus(e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option>Draft</option>
                    <option>Published</option>
                  </select>
                </div>
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
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Lesson List Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-text-primary">Curriculum</h3>
                <button 
                  onClick={() => setIsAddingLesson(true)}
                  className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              
              <div className="space-y-3">
                {lessons.map((lesson, idx) => (
                  <div 
                    key={lesson.id} 
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 bg-surface p-3 rounded-xl border ${draggedIndex === idx ? 'border-primary shadow-md opacity-50' : 'border-border/50 shadow-sm'} cursor-pointer hover:border-primary/30 transition-colors group`}
                  >
                    <div className="cursor-grab text-gray-400 hover:text-gray-600">
                      <GripVertical size={16} />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-text-secondary flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">{lesson.title}</div>
                      <div className="text-xs text-text-secondary flex items-center gap-2">
                        <PlayCircle size={12} /> {lesson.duration}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => setIsAddingLesson(true)}
                  className="w-full py-3 border-2 border-dashed border-border rounded-xl text-sm font-medium text-text-secondary hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add Lesson
                </button>
              </div>
            </div>

            {/* Lesson Editor Area */}
            <div className="lg:col-span-2">
              <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm">
                {!isAddingLesson ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Video className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary">Select a lesson to edit</h3>
                    <p className="text-text-secondary mt-2 max-w-sm">Choose a lesson from the curriculum list or create a new one to start adding video content.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border/50 pb-4">
                      <h3 className="text-lg font-bold text-text-primary">New Lesson</h3>
                      <button onClick={() => setIsAddingLesson(false)} className="text-sm text-text-secondary hover:text-text-primary">Cancel</button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-text-primary mb-1">Lesson Title</label>
                          <input type="text" placeholder="e.g. Introduction to the course" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1">Duration</label>
                          <input type="text" placeholder="e.g. 10:30" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">Video Source</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-xl bg-background/50 hover:bg-gray-50 transition-colors cursor-pointer mb-3">
                          <div className="space-y-1 text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-text-secondary justify-center">
                              <span className="relative rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none">
                                Upload Video File
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">MP4, WebM up to 2GB</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-surface text-text-secondary">Or link to video</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <input type="text" placeholder="YouTube, Vimeo, or Cloudflare Stream URL" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">Description (Optional)</label>
                        <textarea rows={3} placeholder="What will students learn in this lesson?" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-border/50 flex justify-end">
                      <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-sm flex items-center gap-2">
                        <Save size={16} /> Save Lesson
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
