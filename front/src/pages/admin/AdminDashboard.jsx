import React from 'react';
import {
    Users,
    FileText,
    CheckCircle,
    TrendingUp,
    AlertCircle,
    MoreHorizontal,
    ArrowRight,
    UserPlus,
    Mail
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const AdminDashboard = () => {

    // Metric Cards Data
    const metrics = [
        { title: 'Total Applications', value: '1,240', change: '+12%', isPositive: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Pending Documents', value: '45', change: 'Needs Attention', isPositive: false, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
        { title: 'Verified Payment', value: '120', change: '+5%', isPositive: true, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
        { title: 'Confirmed Enrollments', value: '850', change: '+8%', isPositive: true, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    // Chart Data (Mock)
    const funnelData = {
        labels: ['Inquiry', 'Application Started', 'Docs Submitted', 'Verified', 'Enrolled'],
        datasets: [
            {
                label: 'Students',
                data: [2000, 1240, 1000, 850, 850],
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const enrollmentData = {
        labels: ['Primary', 'High School', 'Middle School', 'Kinder'],
        datasets: [
            {
                data: [255, 212, 255, 128],
                backgroundColor: [
                    '#3B82F6', // Blue
                    '#60A5FA', // Light Blue
                    '#93C5FD', // Lighter Blue
                    '#DBEAFE', // Very Light Blue
                ],
                borderWidth: 0,
            },
        ],
    };

    const funnelOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            y: { grid: { display: false }, beginAtZero: true },
            x: { grid: { display: false } }
        }
    };

    const doughnutOptions = {
        plugins: {
            legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } },
        },
        cutout: '70%',
    };


    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Registrar Dashboard</h1>
                <p className="text-gray-500 text-sm">Welcome back, here's what's happening today.</p>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                        <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{metric.value}</h3>
                                </div>
                                <div className={`p-3 rounded-xl ${metric.bg}`}>
                                    <Icon size={20} className={metric.color} />
                                </div>
                            </div>
                            <div className="flex items-center text-sm">
                                <span className={`font-medium ${metric.isPositive ? 'text-green-600' : 'text-orange-600'}`}>
                                    {metric.change}
                                </span>
                                {metric.isPositive && <span className="text-gray-400 ml-1">vs last week</span>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Funnel & Action Items */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Enrollment Funnel */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Enrollment Funnel Conversion</h3>
                                <p className="text-xs text-gray-500">Tracking applicants from initial inquiry to final enrollment</p>
                            </div>
                            <button className="text-sm text-blue-600 font-medium hover:underline">View Report</button>
                        </div>

                        {/* Custom Progress Bars simulating Funnel from Image */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">Inquiry</span>
                                    <span className="font-bold text-gray-900">2,000</span>
                                </div>
                                <div className="w-full bg-blue-50 rounded-full h-8 flex items-center px-3 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 h-full bg-blue-200 w-full opacity-50"></div>
                                    <span className="relative z-10 text-xs font-bold text-blue-800">100%</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">Application Started</span>
                                    <span className="font-bold text-gray-900">1,240</span>
                                </div>
                                <div className="w-full bg-blue-50 rounded-full h-8 flex items-center px-3 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 h-full bg-blue-400 w-[62%]"></div>
                                    <span className="relative z-10 text-xs font-bold text-blue-900">62%</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">Docs Submitted</span>
                                    <span className="font-bold text-gray-900">1,000</span>
                                </div>
                                <div className="w-full bg-blue-50 rounded-full h-8 flex items-center px-3 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 h-full bg-blue-500 w-[50%]"></div>
                                    <span className="relative z-10 text-xs font-bold text-white">50%</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">Verified for Payment</span>
                                    <span className="font-bold text-gray-900">850</span>
                                </div>
                                <div className="w-full bg-blue-50 rounded-full h-8 flex items-center px-3 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 h-full bg-blue-600 w-[42.5%]"></div>
                                    <span className="relative z-10 text-xs font-bold text-white">42.5%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Required */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0">
                            <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-bold text-gray-800">Action Required</h3>
                                <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full">5 New</span>
                            </div>
                            <button className="p-2 hover:bg-gray-50 rounded-full text-gray-400">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                            LS
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">Liam Smith</h4>
                                            <p className="text-xs text-gray-500">ID: #2024-091</p>
                                        </div>
                                    </div>

                                    <div className="hidden md:block">
                                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${i === 0 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                                            {i === 0 ? 'ID Scan Blurred' : 'Missing Signature'}
                                        </span>
                                    </div>

                                    <div className="text-xs text-gray-400">
                                        2 hours ago
                                    </div>

                                    <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Review</button>
                                </div>
                            ))}

                        </div>
                    </div>

                </div>

                {/* Right Column - Stats & Quick Actions */}
                <div className="space-y-8">
                    {/* Enrollment by Level */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Enrollment by Level</h3>
                        <div className="relative h-64 flex justify-center items-center">
                            <Doughnut data={enrollmentData} options={doughnutOptions} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                <span className="text-3xl font-bold text-gray-900">850</span>
                                <span className="text-xs text-gray-400">Students</span>
                            </div>
                        </div>
                        <div className="mt-4 space-y-3">
                            <div className="flex justify-between text-sm items-center">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                                    <span className="text-gray-600">Primary (30%)</span>
                                </div>
                                <span className="font-bold text-gray-900">255</span>
                            </div>
                            <div className="flex justify-between text-sm items-center">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
                                    <span className="text-gray-600">High School (25%)</span>
                                </div>
                                <span className="font-bold text-gray-900">212</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                        <div className="space-y-4">
                            <button className="w-full flex items-center p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all group text-left">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 group-hover:bg-white group-hover:scale-110 transition-transform">
                                    <UserPlus size={20} />
                                </div>
                                <div className="ml-4">
                                    <h4 className="text-sm font-bold text-gray-900">New Application</h4>
                                    <p className="text-xs text-gray-500">Manually add student</p>
                                </div>
                            </button>

                            <button className="w-full flex items-center p-4 border border-gray-100 rounded-xl hover:border-purple-200 hover:bg-purple-50 transition-all group text-left">
                                <div className="bg-purple-100 p-2 rounded-lg text-purple-600 group-hover:bg-white group-hover:scale-110 transition-transform">
                                    <Mail size={20} />
                                </div>
                                <div className="ml-4">
                                    <h4 className="text-sm font-bold text-gray-900">Email Blast</h4>
                                    <p className="text-xs text-gray-500">Send updates to applicants</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
