export interface AuthUser {
  studentId: string;
  enrolledCourseIds: string[];
}

// Mock auth hook. Replace with real session/auth provider integration later.
export function useAuth(): AuthUser {
  return {
    studentId: 'student_8841',
    enrolledCourseIds: ['course_react_advanced', 'course_ui_systems', 'course_node_backend'],
  };
}
