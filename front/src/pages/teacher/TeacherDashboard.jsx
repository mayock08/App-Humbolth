import React, { useState, useEffect } from 'react';
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
import {
    Users,
    Calendar,
    BookOpen,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    Plus,
    Save,
    Search,
    Brain,
    MessageSquare,
    TrendingUp,
    Clock,
    MoreHorizontal,
    ChevronDown,
    Filter
} from 'lucide-react';

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
    const [currentView, setCurrentView] = useState('asistencia');
    const [students, setStudents] = useState([]);
    const [studentProfile, setStudentProfile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [attendanceTaken, setAttendanceTaken] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Dynamic Course State
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [teacherName, setTeacherName] = useState('');

    const userId = localStorage.getItem('userId');
    const TEACHER_ID = userId ? parseInt(userId) : null;
    const TODAY = new Date().toISOString().split('T')[0];

    // Activity State
    const [activities, setActivities] = useState([]);
    const [isCreatingActivity, setIsCreatingActivity] = useState(false);
    const [newActivity, setNewActivity] = useState({
        title: '',
        description: '',
        type: 'Tarea',
        dueDate: '',
        points: 10
    });

    // POOLS STATE
    const [pools, setPools] = useState([]);
    const [selectedPool, setSelectedPool] = useState(null);
    const [isCreatingPool, setIsCreatingPool] = useState(false);
    const [newPool, setNewPool] = useState({ name: '', description: '' });

    // QUESTION STATE
    const [isAddingQuestion, setIsAddingQuestion] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        questionText: '',
        questionType: 'multiple_choice',
        points: 1,
        options: [
            { id: 1, text: '', isCorrect: false },
            { id: 2, text: '', isCorrect: false },
            { id: 3, text: '', isCorrect: false },
            { id: 4, text: '', isCorrect: false }
        ]
    });

    // INCIDENTS STATE
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
    const [selectedStudentForIncident, setSelectedStudentForIncident] = useState(null);
    const [incidentTypes, setIncidentTypes] = useState([]);
    const [newIncident, setNewIncident] = useState({
        typeId: '',
        description: '',
        severity: 'Leve'
    });
    const [incidents, setIncidents] = useState([]);

    // Attendance Data
    const [attendanceData, setAttendanceData] = useState({});
    const [emotionData, setEmotionData] = useState({});

    useEffect(() => {
        if (!TEACHER_ID) return;

        const fetchTeacherData = async () => {
            try {
                const response = await fetch(`http://institutohumboldt.mx:8080/api/Teachers/${TEACHER_ID}`);
                if (response.ok) {
                    const data = await response.json();
                    setTeacherName(data.fullName);
                    if (data.courses && data.courses.length > 0) {
                        setCourses(data.courses);
                        setSelectedCourseId(data.courses[0].id);
                    }
                }
            } catch (err) {
                console.error("Error fetching teacher:", err);
            }
        };
        fetchTeacherData();
    }, [TEACHER_ID]);

    useEffect(() => {
        if (selectedCourseId) {
            fetchStudents();
            checkAttendanceStatus();
        }
    }, [selectedCourseId]);

    const fetchStudents = async () => {
        if (!selectedCourseId) return;
        setLoading(true);
        try {
            const response = await fetch(`http://institutohumboldt.mx:8080/api/StudentProfile/List?courseId=${selectedCourseId}`);
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
                setAttendanceData({});
                setEmotionData({});
                setAttendanceTaken(false);
            }
        } catch (err) {
            console.error('Error fetching students:', err);
        } finally {
            setLoading(false);
        }
    };

    const checkAttendanceStatus = async () => {
        if (!selectedCourseId) return;
        try {
            const response = await fetch(`http://institutohumboldt.mx:8080/api/Attendances/course/${selectedCourseId}/date/${TODAY}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    setAttendanceTaken(true);
                    const newAttendance = {};
                    const newEmotion = {};
                    data.forEach(a => {
                        newAttendance[a.studentId] = a.status;
                        if (a.emotion) newEmotion[a.studentId] = a.emotion;
                    });
                    setAttendanceData(newAttendance);
                    setEmotionData(newEmotion);
                }
            }
        } catch (err) {
            console.error('Error checking attendance:', err);
        }
    };

    const saveAttendance = async () => {
        if (!confirm('¿Estás seguro de guardar la asistencia? Una vez guardada no se podrá modificar.')) return;

        setIsSaving(true);
        try {
            const attendancePayload = students.map(student => ({
                studentId: student.id,
                courseId: selectedCourseId,
                classDate: TODAY,
                status: attendanceData[student.id] || 'Asistió',
                emotion: emotionData[student.id] || null,
                note: ''
            }));

            const response = await fetch('http://institutohumboldt.mx:8080/api/Attendances/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(attendancePayload)
            });

            if (response.ok) {
                alert('Asistencia guardada correctamente.');
                setAttendanceTaken(true);
            } else {
                alert('Error al guardar la asistencia.');
            }
        } catch (err) {
            console.error('Error saving attendance:', err);
            alert('Error de conexión.');
        } finally {
            setIsSaving(false);
        }
    };

    // Placeholder vars for omitted logic
    const presentCount = Object.values(attendanceData).filter(v => v === 'Asistió').length;
    const absentCount = Object.values(attendanceData).filter(v => v === 'Falta').length;
    const radarData = null;
    const lineData = null;

    return (
        <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="text-gray-400 text-xs">Grupo Seleccionado</div>
                <div className="text-gray-800 text-lg font-semibold">
                    {courses.length > 0 ? (
                        <select
                            value={selectedCourseId || ''}
                            onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                            className="w-full bg-transparent border-none focus:ring-0 p-0 font-semibold cursor-pointer"
                        >
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.grade})</option>
                            ))}
                        </select>
                    ) : 'Sin Cursos'}
                </div>
            </div>

            {/* Students List & Attendance */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="font-bold text-gray-800">Lista de Alumnos</h2>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar alumno..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 w-64"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">Alumno</th>
                                <th className="px-4 py-3 text-center">Asistencia</th>
                                <th className="px-4 py-3 text-center">Emoción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.filter(s => s.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                {student.firstName?.charAt(0)}{student.paternalSurname?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{student.fullName}</div>
                                                <div className="text-xs text-gray-500">{student.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-1">
                                            {['Asistió', 'Retardo', 'Falta'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => setAttendanceData(prev => ({ ...prev, [student.id]: status }))}
                                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${(attendanceData[student.id] || 'Asistió') === status
                                                        ? status === 'Asistió' ? 'bg-green-100 text-green-700'
                                                            : status === 'Retardo' ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-red-100 text-red-700'
                                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <select
                                            value={emotionData[student.id] || ''}
                                            onChange={(e) => setEmotionData(prev => ({ ...prev, [student.id]: e.target.value }))}
                                            className="text-xs border-gray-200 rounded-lg py-1 px-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">--</option>
                                            <option value="Happy">Feliz</option>
                                            <option value="Neutral">Neutral</option>
                                            <option value="Sad">Triste</option>
                                            <option value="Angry">Enojado</option>
                                            <option value="Anxious">Ansioso</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-4 py-8 text-center text-gray-400">
                                        No hay alumnos registrados en este curso.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={saveAttendance}
                        disabled={isSaving || students.length === 0}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Save size={18} />
                        {isSaving ? 'Guardando...' : 'Guardar Asistencia'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeacherPanel;
