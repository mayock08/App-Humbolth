import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import Login from './pages/auth/Login';

// Admin
import AdministratorLayout from './layouts/AdministratorLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClassGrouping from './pages/admin/ClassGrouping';
import ScheduleBuilder from './pages/admin/ScheduleBuilder';
import Settings from './pages/admin/Settings';
import AddStudent from './pages/admin/AddStudent';
import TeacherManagement from './pages/admin/TeacherManagement';
import SubjectManagement from './pages/admin/SubjectManagement';
import SubjectProfile from './pages/admin/SubjectProfile';
import FinanceDashboard from './pages/admin/FinanceDashboard';
import MobileAccess from './pages/admin/MobileAccess';

// Teacher
// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherGrades from './pages/teacher/TeacherGrades';

// Coordinator
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard';
import CoordinatorAdmin from './pages/admin/CoordinatorAdmin';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';
import StudentActivities from './pages/student/StudentActivities';
import IqTest from './pages/student/IqTest';

// Shared
import AIPanel from './pages/shared/AIPanel';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import StudentLayout from './layouts/StudentLayout';
import TeacherLayout from './layouts/TeacherLayout';
import CoordinatorLayout from './layouts/CoordinatorLayout';
import './i18n';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route path="/dashboard" element={<AdministratorLayout><AdminDashboard /></AdministratorLayout>} />
        <Route path="/class-grouping" element={<AdministratorLayout><ClassGrouping /></AdministratorLayout>} />
        <Route path="/schedule" element={<AdministratorLayout><ScheduleBuilder /></AdministratorLayout>} />
        <Route path="/settings" element={<AdministratorLayout><Settings /></AdministratorLayout>} />
        <Route path="/add-student" element={<AdministratorLayout><AddStudent /></AdministratorLayout>} />
        <Route path="/teachers" element={<AdministratorLayout><TeacherManagement /></AdministratorLayout>} />
        <Route path="/subjects" element={<AdministratorLayout><SubjectManagement /></AdministratorLayout>} />
        <Route path="/subjects/new" element={<AdministratorLayout><SubjectProfile /></AdministratorLayout>} />
        <Route path="/finance" element={<AdministratorLayout><FinanceDashboard /></AdministratorLayout>} />
        <Route path="/mobile-access" element={<AdministratorLayout><MobileAccess /></AdministratorLayout>} />
        <Route path="/coordinators" element={<AdministratorLayout><CoordinatorAdmin /></AdministratorLayout>} />

        {/* Teacher */}
        <Route path="/teacher-panel" element={<TeacherLayout><TeacherDashboard /></TeacherLayout>} />
        <Route path="/teacher-grades" element={<TeacherLayout><TeacherGrades /></TeacherLayout>} />

        {/* Coordinator */}
        <Route path="/coordinator/dashboard" element={<CoordinatorLayout><CoordinatorDashboard /></CoordinatorLayout>} />

        {/* Student */}
        <Route path="/student-dashboard" element={<StudentLayout><StudentDashboard /></StudentLayout>} />
        <Route path="/student-courses" element={<StudentLayout><StudentCourses /></StudentLayout>} />
        <Route path="/student-activities" element={<StudentLayout><StudentActivities /></StudentLayout>} />
        <Route path="/student/iq-test/:id" element={<IqTest />} />

        {/* Shared */}
        <Route path="/ai-panel" element={<DashboardLayout><AIPanel /></DashboardLayout>} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
