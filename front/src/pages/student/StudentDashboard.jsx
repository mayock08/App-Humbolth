import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, TrendingUp } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Radar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }
        fetchStudentData();
    }, [userId]);

    const fetchStudentData = async () => {
        try {
            const response = await fetch(`http://institutohumboldt.mx:8080/api/StudentProfile/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setStudentData(data);
                setCourses(data.courses || []);
            }
        } catch (err) {
            console.error('Error fetching student data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Radar Chart Data
    const radarData = {
        labels: studentData?.grades?.map(g => g.subject) || [],
        datasets: [
            {
                label: 'Calificaciones',
                data: studentData?.grades?.map(g => g.average) || [],
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
            }
        ]
    };

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                beginAtZero: true,
                max: 10,
                ticks: {
                    stepSize: 2,
                    font: { size: 10 }
                },
                pointLabels: {
                    font: { size: 11 }
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    };

    // Line Chart Data (Academic History)
    // Line Chart Data (Academic History - Real Data)
    // Extract unique evaluation titles for labels (e.g., "Parcial 1", "Examen Final")
    // If no evaluations, default to empty
    const uniqueEvaluationTitles = Array.from(new Set(
        studentData?.grades?.flatMap(g => g.evaluations?.map(e => e.title) || [])
    ));

    // Sort titles if needed (or just use them as they appear)
    // For now, simple unique list
    const chartLabels = uniqueEvaluationTitles.length > 0 ? uniqueEvaluationTitles : ['Sin Evaluaciones'];

    const lineData = {
        labels: chartLabels,
        datasets: studentData?.grades?.slice(0, 5).map((grade, idx) => {
            // Map evaluations to the labels
            const dataPoints = chartLabels.map(label => {
                const ev = grade.evaluations?.find(e => e.title === label);
                return ev ? ev.score : null; // null for missing evaluations
            });

            return {
                label: grade.subject,
                data: dataPoints,
                borderColor: `hsl(${idx * 60}, 70%, 50%)`,
                backgroundColor: `hsla(${idx * 60}, 70%, 50%, 0.1)`,
                tension: 0.1, // Less tension for point-to-point grades
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                spanGaps: true // Connect lines if some intermediate data is missing
            };
        }) || []
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 10,
                ticks: {
                    stepSize: 2,
                    font: { size: 10 }
                }
            },
            x: {
                ticks: {
                    font: { size: 10 }
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    font: { size: 10 },
                    padding: 10,
                    usePointStyle: true
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-gray-500">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-4">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg p-4 shadow-sm">
                <h1 className="text-2xl font-bold mb-1">¡Bienvenido, {username}!</h1>
                <p className="text-sm text-blue-100">
                    {studentData?.grade}{studentData?.group} · {studentData?.level}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BookOpen className="text-primary" size={20} />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-800">{courses.length}</div>
                            <div className="text-xs text-gray-500">Materias</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Award className="text-green-600" size={20} />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-800">
                                {studentData?.grades?.length > 0
                                    ? (studentData.grades.reduce((sum, g) => sum + g.average, 0) / studentData.grades.length).toFixed(1)
                                    : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">Promedio General</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <TrendingUp className="text-purple-600" size={20} />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-800">
                                {studentData?.grades?.filter(g => g.average >= 8).length || 0}
                            </div>
                            <div className="text-xs text-gray-500">Materias Aprobadas</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            {studentData?.grades && studentData.grades.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Radar Chart */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Rendimiento por Materia</h3>
                        <div style={{ height: '250px' }}>
                            <Radar data={radarData} options={radarOptions} />
                        </div>
                    </div>

                    {/* Line Chart */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Progreso Académico</h3>
                        <div style={{ height: '250px' }}>
                            <Line data={lineData} options={lineOptions} />
                        </div>
                    </div>
                </div>
            )}

            {/* My Courses */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h2 className="text-base font-bold text-gray-800 mb-3">Mis Materias</h2>
                {courses.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">No tienes materias asignadas aún.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {courses.map((course, idx) => {
                            const gradeInfo = studentData?.grades?.find(g => g.subject === course.name);
                            return (
                                <div key={idx} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-800">{course.name}</h3>
                                            <p className="text-xs text-gray-500">{course.grade}</p>
                                        </div>
                                        {gradeInfo && (
                                            <div className="text-right">
                                                <div className="text-base font-bold text-primary">
                                                    {gradeInfo.average.toFixed(1)}
                                                </div>
                                                <div className="text-xs text-gray-500">Promedio</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-600 mb-2">
                                        <span className="font-medium">Profesor:</span> {course.teacher || 'Por asignar'}
                                    </div>
                                    <button className="w-full px-2 py-1.5 text-xs bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                                        Ver Detalles
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Recent Grades */}
            {studentData?.grades && studentData.grades.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h2 className="text-base font-bold text-gray-800 mb-3">Calificaciones Recientes</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold">Materia</th>
                                    <th className="px-3 py-2 text-center font-semibold">Promedio</th>
                                    <th className="px-3 py-2 text-center font-semibold">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {studentData.grades.map((grade, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 font-medium text-gray-800">{grade.subject}</td>
                                        <td className="px-3 py-2 text-center font-semibold text-primary">
                                            {grade.average.toFixed(1)}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${grade.average >= 8
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {grade.average >= 8 ? 'Aprobado' : 'En mejora'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
