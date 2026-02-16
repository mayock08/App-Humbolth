import React, { useState, useEffect } from 'react';
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

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://institutohumboldt.mx:8080/api/AdminDashboard/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Metric Cards Data
    const metrics = [
        { title: 'Total Alumnos', value: stats ? stats.totalStudents : '...', change: '', isPositive: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Documentos Pendientes', value: stats ? stats.pendingDocs : '...', change: 'Requiere Atención', isPositive: false, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
        // { title: 'Verified Payment', value: '120', change: '+5%', isPositive: true, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
        { title: 'Nuevos Ingresos (30d)', value: stats ? stats.newEnrollments : '...', change: '', isPositive: true, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    // Chart Data (Mock - Keeping funnel as placeholder or removing if user strictly wants DB. User said "todo dato que muestre sea de base de datos".
    // I will hide Funnel if I don't have real data for it, or use enrollment stats).
    // Let's replace Funnel with something real or remove it.
    // For now, let's keep it simple and focus on what we have.

    const enrollmentData = stats ? {
        labels: Object.keys(stats.byLevel || {}),
        datasets: [
            {
                data: Object.values(stats.byLevel || {}),
                backgroundColor: [
                    '#3B82F6', // Blue
                    '#60A5FA', // Light Blue
                    '#93C5FD', // Lighter Blue
                    '#DBEAFE', // Very Light Blue
                    '#F59E0B',
                    '#10B981'
                ],
                borderWidth: 0,
            },
        ],
    } : null;

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
                <h1 className="text-2xl font-bold text-gray-800">Panel de Administrador</h1>
                <p className="text-gray-500 text-sm">Bienvenido de nuevo, aquí está lo que sucede hoy.</p>
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

                    {/* Recent Students List (Replacing Funnel) */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Alumnos Recientes</h3>
                                <p className="text-xs text-gray-500">Últimos estudiantes registrados</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {stats?.recentStudents?.map((student, i) => (
                                <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{student.name}</p>
                                            <p className="text-xs text-gray-500">ID: {student.id}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(student.joined).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                            {(!stats?.recentStudents || stats.recentStudents.length === 0) && (
                                <p className="text-center text-gray-400 py-4">No hay alumnos recientes.</p>
                            )}
                        </div>
                    </div>

                    {/* Action Required (Placeholder or Real if we have alerts) */}
                    {/* Hiding Mock Action Required for now to avoid confusion with real data */}
                    {/*
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        ...
                    </div>
                    */}

                </div>

                {/* Right Column - Stats & Quick Actions */}
                <div className="space-y-8">
                    {/* Enrollment by Level */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Alumnos por Nivel</h3>
                        <div className="relative h-64 flex justify-center items-center">
                            {enrollmentData && <Doughnut data={enrollmentData} options={doughnutOptions} />}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                <span className="text-3xl font-bold text-gray-900">{stats?.totalStudents || 0}</span>
                                <span className="text-xs text-gray-400">Total</span>
                            </div>
                        </div>
                        <div className="mt-4 space-y-3">
                            {stats?.byLevel && Object.entries(stats.byLevel).map(([level, count], i) => (
                                <div key={level} className="flex justify-between text-sm items-center">
                                    <div className="flex items-center">
                                        <span className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#F59E0B', '#10B981'][i % 6] }}></span>
                                        <span className="text-gray-600">{level} ({((count / stats.totalStudents) * 100).toFixed(0)}%)</span>
                                    </div>
                                    <span className="font-bold text-gray-900">{count}</span>
                                </div>
                            ))}
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
