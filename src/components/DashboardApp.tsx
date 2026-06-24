import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import StudentDashboard from './StudentDashboard';
import MyCourses from './MyCourses';
import CourseLearning from './CourseLearning';
import LiveClasses from './LiveClasses';
import CreatorDashboard from './CreatorDashboard';
import CreatorMyCourses from './CreatorMyCourses';
import CreatorStudents from './CreatorStudents';
import CreatorAnalytics from './CreatorAnalytics';
import CreatorLiveSessions from './CreatorLiveSessions';
import LiveStudio from './LiveStudio';
import CourseBuilder from './CourseBuilder';
import AdminDashboard from './AdminDashboard';
import RoleSwitcher from './RoleSwitcher';
import Community from './Community';
import Settings from './Settings';
import { ShieldAlert } from 'lucide-react';

import { Role, View } from '../types';

export function DashboardApp() {
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [currentRouteRole, setCurrentRouteRole] = useState<Role>('student');
  const [currentView, setCurrentView] = useState<View>('dashboard');

  useEffect(() => {
    // Read user identity from local storage
    const savedRole = (localStorage.getItem('xe_active_role') as Role) || 'student';
    setUserRole(savedRole);
    setCurrentRouteRole(savedRole);
  }, []);

  const setRole = (newRole: Role) => {
    localStorage.setItem('xe_active_role', newRole);
    setUserRole(newRole);
    setCurrentRouteRole(newRole);
    setCurrentView('dashboard');
  };

  const setActiveView = (newView: View) => {
    setCurrentView(newView);
  };

  // Prevent rendering before hydration
  if (!userRole) return null;

  // Authorization Check
  let isAuthorized = true;
  if (currentRouteRole === 'admin' && userRole !== 'admin') {
    isAuthorized = false;
  }
  if (currentRouteRole === 'creator' && userRole !== 'creator' && userRole !== 'admin') {
    isAuthorized = false;
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white text-slate-900 p-8">
        <ShieldAlert size={64} className="text-red-500 mb-6" />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-8 text-center max-w-md">
          You do not have permission to view this {currentRouteRole} panel. Please switch to an authorized role.
        </p>
        <button 
          onClick={() => {
            setCurrentRouteRole(userRole);
            setCurrentView('dashboard');
          }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          Return to My Dashboard
        </button>
        <RoleSwitcher currentRole={userRole} setRole={setRole} setActiveView={setActiveView} />
      </div>
    );
  }

  const renderContent = () => {
    if (currentRouteRole === 'student') {
      switch (currentView) {
        case 'dashboard': return <StudentDashboard setView={setActiveView} />;
        case 'my-courses': return <MyCourses setView={setActiveView} />;
        case 'course-learning': return <CourseLearning setView={setActiveView} />;
        case 'live-classes': return <LiveClasses setView={setActiveView} />;
        case 'schedule': return <div className="p-8 flex items-center justify-center text-slate-500 h-full text-lg">Schedule module coming soon.</div>;
        case 'assignments': return <div className="p-8 flex items-center justify-center text-slate-500 h-full text-lg">Assignments module coming soon.</div>;
        case 'community': return <Community setView={setActiveView} />;
        case 'settings': return <Settings setView={setActiveView} />;
        default: return <div className="p-8 flex items-center justify-center text-slate-500 h-full text-lg">Page not found in Student Panel.</div>;
      }
    } else if (currentRouteRole === 'creator') {
      switch (currentView) {
        case 'dashboard': return <CreatorDashboard setView={setActiveView} />;
        case 'my-courses': return <CreatorMyCourses setView={setActiveView} />;
        case 'course-builder': return <CourseBuilder setView={setActiveView} />;
        case 'students': return <CreatorStudents setView={setActiveView} />;
        case 'analytics': return <CreatorAnalytics setView={setActiveView} />;
        case 'live-sessions': return <CreatorLiveSessions setView={setActiveView} />;
        case 'live-studio': return <LiveStudio setView={setActiveView} />;
        case 'revenue': return <div className="p-8 flex items-center justify-center text-slate-500 h-full text-lg">Revenue module coming soon.</div>;
        case 'settings': return <Settings setView={setActiveView} />;
        default: return <div className="p-8 flex items-center justify-center text-slate-500 h-full text-lg">Page not found in Creator Panel.</div>;
      }
    } else if (currentRouteRole === 'admin') {
      switch (currentView) {
        case 'dashboard': return <AdminDashboard setView={setActiveView} />;
        case 'users': return <div className="p-8 flex items-center justify-center text-slate-500 h-full text-lg">Users management module coming soon.</div>;
        case 'creators': return <div className="p-8 flex items-center justify-center text-slate-500 h-full text-lg">Creators management module coming soon.</div>;
        case 'courses': return <div className="p-8 flex items-center justify-center text-slate-500 h-full text-lg">Platform Courses module coming soon.</div>;
        case 'payments': return <div className="p-8 flex items-center justify-center text-slate-500 h-full text-lg">Payments module coming soon.</div>;
        case 'analytics': return <div className="p-8 flex items-center justify-center text-slate-500 h-full text-lg">Platform Analytics coming soon.</div>;
        case 'reports': return <div className="p-8 flex items-center justify-center text-slate-500 h-full text-lg">Reports module coming soon.</div>;
        case 'settings': return <Settings setView={setActiveView} />;
        default: return <div className="p-8 flex items-center justify-center text-slate-500 h-full text-lg">Page not found in Admin Panel.</div>;
      }
    }
    return <StudentDashboard setView={setActiveView} />;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 w-full text-left">
      {/* Sidebar */}
      <Sidebar role={currentRouteRole} activeView={currentView} setActiveView={setActiveView} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header role={currentRouteRole} setRole={setRole} activeView={currentView} />
        
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth ${currentView === 'live-studio' ? 'p-0 md:p-0' : ''}`}>
          <div className={`max-w-[1600px] mx-auto h-full ${currentView === 'live-studio' ? 'max-w-none' : ''}`}>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
