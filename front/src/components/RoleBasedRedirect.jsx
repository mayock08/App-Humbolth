import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleBasedRedirect = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const hasCompletedIqTest = localStorage.getItem('hasCompletedIqTest'); // Usually needs to be fetched, but using what Login uses
    const userId = localStorage.getItem('userId');

    // If no active session, send to login
    if (!token || !role) {
        return <Navigate to="/login" replace />;
    }

    // Role-based routing defaults
    switch (role) {
        case 'Admin':
            return <Navigate to="/dashboard" replace />;
        case 'Teacher':
            return <Navigate to="/teacher-panel" replace />;
        case 'Student':
            // Logic similar to Login.jsx
            if (hasCompletedIqTest === 'true') {
                return <Navigate to="/student-dashboard" replace />;
            }
            // If we don't know, default to student dashboard which will likely handle any required IQ test redirects natively if needed
            return <Navigate to="/student-dashboard" replace />;
        default:
            return <Navigate to="/dashboard" replace />;
    }
};

export default RoleBasedRedirect;
