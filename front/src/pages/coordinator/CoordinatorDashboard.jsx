import React, { useState, useEffect } from 'react';
import {
    Users,
    AlertTriangle,
    UserX,
    Smile,
    Meh,
    Frown,
    Activity,
    BookOpen
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const CoordinatorDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    setError('No se encontró información de usuario. Inicie sesión nuevamente.');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`http://institutohumboldt.mx:8080/api/Coordinators/dashboard/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                } else {
                    setError('Error al cargar estadísticas');
                }
            } catch (err) {
                console.error(err);
                setError('Error de conexión');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center">Cargando tablero...</div>;
    if (error) return <div className="p-8 text-center text-red-600 font-bold">{error}</div>;
    if (!stats) return null;

    // --- Chart Data ---
    const emotionData = {
        labels: ['Feliz', 'Neutral', 'Triste', 'Enojado', 'Ansioso'],
        datasets: [
            {
                label: 'Estudiantes',
                data: [
                    stats.emotionSummary['Feliz'] || 0,
                    stats.emotionSummary['Neutral'] || 0,
                    stats.emotionSummary['Triste'] || 0,
                    stats.emotionSummary['Enojado'] || 0,
                    stats.emotionSummary['Ansioso'] || 0,
                ],
                backgroundColor: [
                    'rgba(74, 222, 128, 0.6)', // Green
                    'rgba(148, 163, 184, 0.6)', // Gray
                    'rgba(96, 165, 250, 0.6)', // Blue
                    'rgba(248, 113, 113, 0.6)', // Red
                    'rgba(251, 191, 36, 0.6)',  // Amber
                ],
                borderColor: [
                    'rgb(74, 222, 128)',
                    'rgb(148, 163, 184)',
                    'rgb(96, 165, 250)',
                    'rgb(248, 113, 113)',
                    'rgb(251, 191, 36)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Resumen Emocional del Día' },
        },
        scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Tablero de Coordinación</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Estudiantes Total</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.totalStudents}</p>
                        <p className="text-xs text-blue-500 mt-1">{stats.assignedGroupsCount} Grupos Asignados</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                        <Users size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Faltas (Hoy)</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.absencesToday}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-full text-red-600">
                        <UserX size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Incidencias (Hoy)</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.incidentsToday}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-full text-amber-600">
                        <AlertTriangle size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Alumnos en Riesgo</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.atRiskStudents.length}</p>
                        <p className="text-xs text-orange-500 mt-1">Identificados</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-full text-orange-600">
                        <Activity size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Emotion Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Smile className="text-emerald-500" />
                        Actitud Académica (Emociones)
                    </h2>
                    <div className="h-64 flex items-center justify-center">
                        {Object.keys(stats.emotionSummary).length > 0 ? (
                            <Bar options={chartOptions} data={emotionData} />
                        ) : (
                            <p className="text-gray-400 italic">No hay registros de emociones hoy</p>
                        )}
                    </div>
                </div>

                {/* At Risk List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertTriangle className="text-red-500" />
                        Alumnos en Riesgo (Prioridad)
                    </h2>
                    <div className="overflow-y-auto max-h-64 pr-2 space-y-3">
                        {stats.atRiskStudents.length > 0 ? (
                            stats.atRiskStudents.map(student => (
                                <div key={student.id} className="p-3 rounded-lg border border-red-100 bg-red-50 flex justify-between items-center group hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-bold text-xs">
                                            {student.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
                                            <p className="text-xs text-red-600 flex items-center gap-1">
                                                <BookOpen size={10} />
                                                Grupo {student.group}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="text-xs bg-white border border-red-200 text-red-600 px-2 py-1 rounded hover:bg-red-600 hover:text-white transition-colors">
                                        Ver Perfil
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <CheckCircle className="mx-auto mb-2 text-green-400" size={32} />
                                <p>No se han detectado alumnos en situación crítica reciente.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoordinatorDashboard;
