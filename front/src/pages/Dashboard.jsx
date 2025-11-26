import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatsSection from '../components/Dashboard/StatsSection';
import FiltersSection from '../components/Dashboard/FiltersSection';
import StudentList from '../components/Dashboard/StudentList';

const Dashboard = () => {
    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <StatsSection />
                <FiltersSection />
                <StudentList />
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
