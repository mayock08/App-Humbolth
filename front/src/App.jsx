import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import Login from './pages/auth/Login';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import Settings from './pages/admin/Settings';
import AddStudent from './pages/admin/AddStudent';
import SubjectManagement from './pages/admin/SubjectManagement';

// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherGrades from './pages/teacher/TeacherGrades';

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
import './i18n';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
        <Route path="/add-student" element={<DashboardLayout><AddStudent /></DashboardLayout>} />
        <Route path="/subjects" element={<DashboardLayout><SubjectManagement /></DashboardLayout>} />

        {/* Teacher */}
        <Route path="/teacher-panel" element={<TeacherLayout><TeacherDashboard /></TeacherLayout>} />
        <Route path="/teacher-grades" element={<TeacherLayout><TeacherGrades /></TeacherLayout>} />

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
