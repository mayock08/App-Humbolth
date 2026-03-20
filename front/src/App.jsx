import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import Login from './pages/auth/Login';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import RoleBasedRedirect from './components/RoleBasedRedirect';

// Error Handling & Shared
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/shared/NotFound';
import ServerError from './pages/shared/ServerError';

// Admin
import AdministratorLayout from './layouts/AdministratorLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClassGrouping from './pages/admin/ClassGrouping';
import ScheduleBuilder from './pages/admin/ScheduleBuilder';
import Settings from './pages/admin/Settings';
import AddStudent from './pages/admin/AddStudent';
import TeacherManagement from './pages/admin/TeacherManagement';
import SchoolPeriods from './pages/admin/SchoolPeriods';
import SubjectManagement from './pages/admin/SubjectManagementNew';
import SubjectProfile from './pages/admin/SubjectProfile';
import FinanceDashboard from './pages/admin/FinanceDashboard';
import MobileAccess from './pages/admin/MobileAccess';
import StudentsList from './pages/admin/StudentsList';
import Admissions from './pages/admin/Admissions';
import ReportsMenu from './pages/admin/ReportsMenu';
import ClassListReport from './pages/admin/ClassListReport';

// Teacher
// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherGrades from './pages/teacher/TeacherGrades';
import TeacherActivities from './pages/teacher/TeacherActivities';
import ContinuousEvaluation from './pages/teacher/ContinuousEvaluation';
import QuestionPools from './pages/teacher/QuestionPools';
import TeacherTasks from './pages/teacher/TeacherTasks';
import TaskSubmissions from './pages/teacher/TaskSubmissions';

// Coordinator
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard';
import CoordinatorAdmin from './pages/admin/CoordinatorAdmin';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import StudentSchedule from './pages/student/StudentSchedule';
import StudentCourses from './pages/student/StudentCourses';
import StudentActivities from './pages/student/StudentActivities';
import IqTest from './pages/student/IqTest';
import StudentTasks from './pages/student/StudentTasks';

// Shared
import AIPanel from './pages/shared/AIPanel';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import StudentLayout from './layouts/StudentLayout';
import TeacherLayout from './layouts/TeacherLayout';
import CoordinatorLayout from './layouts/CoordinatorLayout';
import './i18n';

import { Toaster } from 'sonner';

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <ErrorBoundary>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />

          {/* Admin */}
          <Route path="/dashboard" element={<ProtectedRoute><AdministratorLayout><AdminDashboard /></AdministratorLayout></ProtectedRoute>} />
          <Route path="/class-grouping" element={<ProtectedRoute><AdministratorLayout><ClassGrouping /></AdministratorLayout></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><AdministratorLayout><ScheduleBuilder /></AdministratorLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AdministratorLayout><Settings /></AdministratorLayout></ProtectedRoute>} />
          <Route path="/add-student" element={<ProtectedRoute><AdministratorLayout><AddStudent /></AdministratorLayout></ProtectedRoute>} />
          <Route path="/teachers" element={<ProtectedRoute><AdministratorLayout><TeacherManagement /></AdministratorLayout></ProtectedRoute>} />
          <Route path="/school-periods" element={<ProtectedRoute><AdministratorLayout><SchoolPeriods /></AdministratorLayout></ProtectedRoute>} />
          <Route path="/subjects" element={<ProtectedRoute><AdministratorLayout><SubjectManagement /></AdministratorLayout></ProtectedRoute>} />
          <Route path="/subjects/new" element={<ProtectedRoute><AdministratorLayout><SubjectProfile /></AdministratorLayout></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><AdministratorLayout><FinanceDashboard /></AdministratorLayout></ProtectedRoute>} />
          <Route path="/mobile-access" element={<ProtectedRoute><AdministratorLayout><MobileAccess /></AdministratorLayout></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><AdministratorLayout><StudentsList /></AdministratorLayout></ProtectedRoute>} />
          <Route path="/admissions" element={<ProtectedRoute><AdministratorLayout><Admissions /></AdministratorLayout></ProtectedRoute>} />
          <Route path="/coordinators" element={<ProtectedRoute><AdministratorLayout><CoordinatorAdmin /></AdministratorLayout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><AdministratorLayout><ReportsMenu /></AdministratorLayout></ProtectedRoute>} />
          <Route path="/reports/class-lists" element={<ProtectedRoute><AdministratorLayout><ClassListReport /></AdministratorLayout></ProtectedRoute>} />

          {/* Teacher */}
          <Route path="/teacher-panel" element={<ProtectedRoute><TeacherLayout><TeacherDashboard /></TeacherLayout></ProtectedRoute>} />
          <Route path="/teacher-grades" element={<ProtectedRoute><TeacherLayout><TeacherGrades /></TeacherLayout></ProtectedRoute>} />
          <Route path="/teacher-activities" element={<ProtectedRoute><TeacherLayout><TeacherActivities /></TeacherLayout></ProtectedRoute>} />
          <Route path="/teacher-continuous-evaluation" element={<ProtectedRoute><TeacherLayout><ContinuousEvaluation /></TeacherLayout></ProtectedRoute>} />
          <Route path="/teacher-question-pools" element={<ProtectedRoute><TeacherLayout><QuestionPools /></TeacherLayout></ProtectedRoute>} />
          <Route path="/teacher-tasks/:courseId" element={<ProtectedRoute><TeacherLayout><TeacherTasks /></TeacherLayout></ProtectedRoute>} />
          <Route path="/teacher-tasks/:courseId/submissions/:taskId" element={<ProtectedRoute><TeacherLayout><TaskSubmissions /></TeacherLayout></ProtectedRoute>} />

          {/* Coordinator */}
          <Route path="/coordinator/dashboard" element={<ProtectedRoute><CoordinatorLayout><CoordinatorDashboard /></CoordinatorLayout></ProtectedRoute>} />

          {/* Student */}
          <Route path="/student-dashboard" element={<ProtectedRoute><StudentLayout><StudentDashboard /></StudentLayout></ProtectedRoute>} />
          <Route path="/student-schedule" element={<ProtectedRoute><StudentLayout><StudentSchedule /></StudentLayout></ProtectedRoute>} />
          <Route path="/student-courses" element={<ProtectedRoute><StudentLayout><StudentCourses /></StudentLayout></ProtectedRoute>} />
          <Route path="/student-activities" element={<ProtectedRoute><StudentLayout><StudentActivities /></StudentLayout></ProtectedRoute>} />
          <Route path="/student/iq-test/:id" element={<ProtectedRoute><IqTest /></ProtectedRoute>} />
          <Route path="/student-tasks/:courseId" element={<ProtectedRoute><StudentLayout><StudentTasks /></StudentLayout></ProtectedRoute>} />

          {/* Shared */}
          <Route path="/ai-panel" element={<ProtectedRoute><DashboardLayout><AIPanel /></DashboardLayout></ProtectedRoute>} />
          <Route path="/500" element={<ServerError />} />

          {/* Default - Catch All */}
          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
