import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale
} from 'chart.js';
import { Radar, Line } from 'react-chartjs-2';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale
);

const TeacherPanel = () => {
    const { t, i18n } = useTranslation();
    const [currentView, setCurrentView] = useState('asistencia'); // asistencia, materias, perfil
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentProfile, setStudentProfile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch students on mount
    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch('http://localhost:5246/api/StudentProfile/List?grade=1&group=B');
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            }
        } catch (err) {
            console.error('Error fetching students:', err);
        }
    };

    const fetchStudentProfile = async (studentId) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5246/api/StudentProfile/${studentId}`);
            if (response.ok) {
                const data = await response.json();
                setStudentProfile(data);
                setSelectedStudent(studentId);
                setCurrentView('perfil');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Attendance summary
    const [attendanceData, setAttendanceData] = useState({});
    const presentCount = Object.values(attendanceData).filter(v => v === 'Asistió').length;
    const absentCount = Object.values(attendanceData).filter(v => v === 'Falta').length;
    const lateCount = Object.values(attendanceData).filter(v => v === 'Retardo').length;

    const handleAttendanceChange = (studentId, value) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: value }));
    };

    const markAllAs = (status) => {
        const newData = {};
        students.forEach(s => {
            newData[s.id] = status;
        });
        setAttendanceData(newData);
    };

    const exportCSV = () => {
        const headers = ['Alumno', 'Grupo', 'Asistencia'];
        const rows = students.map(s => [
            s.fullName,
            `${s.grade}${s.group}`,
            attendanceData[s.id] || 'Asistió'
        ]);
        const csv = [headers, ...rows].map(row => row.join(',')).join('\\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `asistencia_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Radar chart data for student profile
    const radarData = studentProfile ? {
        labels: ['Matemáticas', 'Español', 'Inglés', 'Ciencias', 'Historia'],
        datasets: [{
            label: 'Desempeño',
            data: studentProfile.grades.slice(0, 5).map(g => g.average),
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
        }]
    } : null;

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            r: {
                beginAtZero: true,
                max: 10,
                min: 0,
                ticks: {
                    stepSize: 2,
                    color: '#fff',
                    backdropColor: 'transparent'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)'
                },
                angleLines: {
                    color: 'rgba(255, 255, 255, 0.2)'
                },
                pointLabels: {
                    color: '#fff',
                    font: {
                        size: 12
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#fff'
                }
            }
        }
    };

    // Line chart for academic history
    const lineData = {
        labels: ['1° Prim', '2° Prim', '3° Prim', '4° Prim', '5° Prim', '6° Prim', '1° Sec', '2° Sec', '3° Sec'],
        datasets: [{
            label: 'Promedio General',
            data: [7.2, 7.8, 8.1, 8.5, 8.3, 8.7, 8.4, 8.6, 8.6],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
        }]
    };

    return (
        <div className="space-y-4">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-gray-400 text-xs">Grupo</div>
                    <div className="text-gray-800 text-lg font-semibold">1° Secundaria · B</div>
                    <div className="text-gray-500 text-sm">Materia: Matemáticas</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-gray-400 text-xs">Resumen de hoy</div>
                    <div className="flex items-center gap-6 mt-2">
                        <div className="text-center">
                            <div className="text-2xl font-semibold">{presentCount}</div>
                            <div className="text-xs text-gray-500">Asistieron</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-semibold">{absentCount}</div>
                            <div className="text-xs text-gray-500">Faltas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-semibold">{lateCount}</div>
                            <div className="text-xs text-gray-500">Retardos</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-gray-400 text-xs">Vista actual</div>
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => setCurrentView('asistencia')}
                            className={`px-3 py-1.5 text-sm rounded-xl ${currentView === 'asistencia' ? 'bg-primary text-white' : 'border hover:bg-gray-50'}`}
                        >
                            Asistencia
                        </button>
                        <button
                            onClick={() => setCurrentView('materias')}
                            className={`px-3 py-1.5 text-sm rounded-xl ${currentView === 'materias' ? 'bg-primary text-white' : 'border hover:bg-gray-50'}`}
                        >
                            Materias
                        </button>
                    </div>
                </div>
            </div>

            {/* ATTENDANCE VIEW */}
            {currentView === 'asistencia' && (
                <div className="space-y-4">
                    {/* Tools */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Buscar alumno..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64 px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button onClick={() => setSearchTerm('')} className="px-3 py-2 text-sm border rounded-xl hover:bg-gray-50">
                                Limpiar
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Marcar todos como</label>
                            <select
                                onChange={(e) => e.target.value && markAllAs(e.target.value)}
                                className="px-3 py-2 text-sm border rounded-xl"
                            >
                                <option value="">Selecciona…</option>
                                <option value="Asistió">Asistió</option>
                                <option value="Falta">Falta</option>
                                <option value="Retardo">Retardo</option>
                                <option value="Justificada">Justificada</option>
                            </select>
                            <button onClick={exportCSV} className="px-3 py-2 text-sm bg-white border rounded-xl hover:bg-gray-50">
                                Exportar CSV
                            </button>
                        </div>
                    </div>

                    {/* Student Table */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Alumno</th>
                                        <th className="px-4 py-3 text-left">Grupo</th>
                                        <th className="px-4 py-3 text-left">Asistencia</th>
                                        <th className="px-4 py-3 text-left">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredStudents.map(student => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={student.photoUrl || `https://ui-avatars.com/api/?name=${student.fullName}`}
                                                        alt={student.fullName}
                                                        className="w-10 h-10 rounded-xl object-cover border"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-800">{student.fullName}</div>
                                                        <div className="text-xs text-gray-500">Tel.: {student.phone || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{student.grade}{student.group}</td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={attendanceData[student.id] || 'Asistió'}
                                                    onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                                                    className="px-2 py-1.5 text-sm border rounded-lg"
                                                >
                                                    <option value="Asistió">Asistió</option>
                                                    <option value="Falta">Falta</option>
                                                    <option value="Retardo">Retardo</option>
                                                    <option value="Justificada">Justificada</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => fetchStudentProfile(student.id)}
                                                    className="px-3 py-1.5 text-xs rounded-lg bg-primary text-white hover:bg-primary/90"
                                                >
                                                    Ver Perfil
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* SUBJECTS VIEW */}
            {currentView === 'materias' && (
                <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                        <h2 className="text-gray-800 font-semibold mb-3">Resumen de materias asignadas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Subject cards */}
                            <article className="border rounded-2xl p-4 hover:shadow-sm transition">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                                    <h3 className="font-medium text-gray-800">Español</h3>
                                </div>
                                <p className="text-sm text-gray-600">Comprensión lectora y redacción.</p>
                                <ul className="mt-2 text-xs text-gray-500 space-y-1">
                                    <li><span className="font-medium text-gray-700">Grupo:</span> 1°A</li>
                                    <li><span className="font-medium text-gray-700">Horario:</span> Lun · Mié · Vie</li>
                                </ul>
                            </article>
                            <article className="border rounded-2xl p-4 hover:shadow-sm transition">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                                    <h3 className="font-medium text-gray-800">Matemáticas</h3>
                                </div>
                                <p className="text-sm text-gray-600">Álgebra básica y resolución de problemas.</p>
                                <ul className="mt-2 text-xs text-gray-500 space-y-1">
                                    <li><span className="font-medium text-gray-700">Grupo:</span> 1°B</li>
                                    <li><span className="font-medium text-gray-700">Horario:</span> Mar · Jue</li>
                                </ul>
                            </article>
                            <article className="border rounded-2xl p-4 hover:shadow-sm transition">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                                    <h3 className="font-medium text-gray-800">Inglés</h3>
                                </div>
                                <p className="text-sm text-gray-600">Vocabulario y present simple.</p>
                                <ul className="mt-2 text-xs text-gray-500 space-y-1">
                                    <li><span className="font-medium text-gray-700">Grupo:</span> 1°B</li>
                                    <li><span className="font-medium text-gray-700">Horario:</span> Mié</li>
                                </ul>
                            </article>
                        </div>
                    </div>
                </div>
            )}

            {/* PROFILE VIEW */}
            {currentView === 'perfil' && studentProfile && (
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-gray-800 font-semibold">Perfil de Alumno — Radar de Tendencias</h2>
                        <button
                            onClick={() => setCurrentView('asistencia')}
                            className="px-3 py-1.5 text-sm border rounded-xl hover:bg-gray-50"
                        >
                            Volver a lista
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Student Info & Radar */}
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <img
                                    src={studentProfile.photoUrl || `https://ui-avatars.com/api/?name=${studentProfile.fullName}`}
                                    className="w-20 h-20 rounded-xl object-cover border"
                                    alt={studentProfile.fullName}
                                />
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <span className="font-medium text-gray-800">Nombre:</span>
                                        <span className="text-gray-700">{studentProfile.fullName}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-medium text-gray-800">Grado:</span>
                                        <span className="text-gray-700">{studentProfile.grade}{studentProfile.group}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-medium text-gray-800">Email:</span>
                                        <span className="text-gray-700">{studentProfile.email}</span>
                                    </div>
                                </div>
                            </div>
                            {radarData && (
                                <div className="bg-gray-900 rounded-2xl p-4">
                                    <div style={{ height: '150px', position: 'relative' }}>
                                        <Radar data={radarData} options={radarOptions} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-xl p-4 border">
                                <h3 className="font-semibold text-primary mb-2 text-sm">Datos personales</h3>
                                <ul className="text-xs text-gray-700 space-y-1">
                                    <li><span className="font-medium">CURP:</span> {studentProfile.curp || 'N/A'}</li>
                                    <li><span className="font-medium">Teléfono:</span> {studentProfile.phone || 'N/A'}</li>
                                    <li><span className="font-medium">Género:</span> {studentProfile.gender || 'N/A'}</li>
                                </ul>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 border">
                                <h3 className="font-semibold text-primary mb-2 text-sm">Familia</h3>
                                <ul className="text-xs text-gray-700 space-y-1">
                                    {studentProfile.guardians.map((g, idx) => (
                                        <li key={idx}>
                                            <span className="font-medium">{g.relationship}:</span> {g.fullName} · {g.phone}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 border">
                                <h3 className="font-semibold text-primary mb-2 text-sm">Dirección</h3>
                                <ul className="text-xs text-gray-700 space-y-1">
                                    <li><span className="font-medium">Calle:</span> {studentProfile.streetAddress || 'N/A'}</li>
                                    <li><span className="font-medium">Ciudad:</span> {studentProfile.city || 'N/A'}</li>
                                    <li><span className="font-medium">Estado:</span> {studentProfile.state || 'N/A'}</li>
                                    <li><span className="font-medium">CP:</span> {studentProfile.zipCode || 'N/A'}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Grades Table */}
                    <div>
                        <h3 className="text-gray-800 font-semibold mb-4">Calificaciones Parciales por Materia</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead className="bg-blue-50 text-primary">
                                    <tr>
                                        <th className="border border-gray-200 px-4 py-2 text-left">Materia</th>
                                        <th className="border border-gray-200 px-4 py-2 text-center">Promedio</th>
                                        <th className="border border-gray-200 px-4 py-2 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentProfile.grades.map((grade, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="border border-gray-200 px-4 py-2 font-medium text-gray-800">{grade.subject}</td>
                                            <td className="border border-gray-200 px-4 py-2 text-center font-semibold text-primary">
                                                {grade.average.toFixed(1)}
                                            </td>
                                            <td className="border border-gray-200 px-4 py-2 text-center">
                                                <span className={`px-2 py-1 text-xs rounded-full ${grade.average >= 8 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {grade.average >= 8 ? 'Aprobado' : 'En mejora'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Academic History Chart */}
                    <div>
                        <h3 className="text-gray-800 font-semibold mb-4">Seguimiento de Calificaciones (Primaria - Secundaria)</h3>
                        <div className="bg-white border border-gray-200 rounded-2xl p-4">
                            <div style={{ height: '200px', position: 'relative' }}>
                                <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 shadow-xl">
                        <div className="text-center">Cargando perfil...</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherPanel;
