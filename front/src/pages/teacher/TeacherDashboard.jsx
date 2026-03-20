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
    Filter,
    Smile,
    Meh,
    Frown,
    Bell,
    Eye,
    FileWarning,
    X
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

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
    // State
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [attendanceTaken, setAttendanceTaken] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [observation, setObservation] = useState('');

    // Dynamic Course State
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [teacherName, setTeacherName] = useState('');

    // Attendance & Emotion Data
    const [attendanceData, setAttendanceData] = useState({});
    const [emotionData, setEmotionData] = useState({});

    // Modals & Data
    const [incidentTypes, setIncidentTypes] = useState([]);

    // Student Detail Modal
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Incident Modal
    const [showIncidentModal, setShowIncidentModal] = useState(false);
    const [incidentData, setIncidentData] = useState({
        studentId: null,
        studentName: '',
        typeId: '',
        title: '',
        description: '',
        severity: 'Leve'
    });

    const userId = localStorage.getItem('userId');
    const TEACHER_ID = userId ? parseInt(userId) : null;
    const TODAY = new Date().toISOString().split('T')[0];

    // Initial Load
    useEffect(() => {
        if (!TEACHER_ID) return;
        fetchTeacherData();
        fetchIncidentTypes();
    }, [TEACHER_ID]);

    useEffect(() => {
        if (selectedCourseId) {
            fetchStudents();
            checkAttendanceStatus();
        }
    }, [selectedCourseId]);

    const fetchTeacherData = async () => {
        try {
            // 1. Fetch Active Period
            let activePeriodId = null;
            try {
                const periodResp = await fetch(`${API_BASE_URL}/SchoolPeriods/active`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (periodResp.ok) {
                    const periodData = await periodResp.json();
                    activePeriodId = periodData.id;
                }
            } catch (e) {
                console.warn('Could not fetch active period, showing all courses.', e);
            }

            // 2. Fetch Teacher Data
            const response = await fetch(`${API_BASE_URL}/Teachers/${TEACHER_ID}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setTeacherName(data.fullName);
                let teacherCourses = data.courses || [];
                // 3. Filter by Active Period if available
                // If the course has a PeriodId, it must match. If it's null, we assume it's valid for all periods or legacy.
                // Also, if strict filtering removes all courses, we might want to show them anyway for debugging.
                if (activePeriodId) {
                    const periodCourses = teacherCourses.filter(c => c.periodId === activePeriodId || c.periodId === null);
                    teacherCourses = periodCourses;
                }

                if (teacherCourses.length > 0) {
                    setCourses(teacherCourses);
                    setSelectedCourseId(teacherCourses[0].id);
                } else {
                    setCourses([]);
                    setSelectedCourseId(null);
                }
            }
        } catch (err) {
            console.error("Error fetching teacher:", err);
        }
    };

    const fetchIncidentTypes = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/Incidents/types`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setIncidentTypes(data);
            }
        } catch (err) {
            console.error("Error fetching incident types:", err);
        }
    };

    const fetchStudents = async () => {
        if (!selectedCourseId) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/StudentProfile/List?courseId=${selectedCourseId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
                // Reset states
                setAttendanceData({});
                setEmotionData({});
                setObservation('');
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
            const response = await fetch(`${API_BASE_URL}/Attendances/course/${selectedCourseId}/date/${TODAY}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
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

            // Also fetch observation registry
            const regResponse = await fetch(`${API_BASE_URL}/AttendanceRegistries/course/${selectedCourseId}/date/${TODAY}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (regResponse.ok) {
                const regData = await regResponse.json();
                if (regData && regData.observation) {
                    setObservation(regData.observation);
                }
            }
        } catch (err) {
            console.error('Error checking attendance:', err);
        }
    };

    const handleEmotionClick = (studentId, emotion) => {
        setEmotionData(prev => ({
            ...prev,
            [studentId]: emotion
        }));
    };

    const openStudentDetail = async (student) => {
        setSelectedStudentDetail(null);
        setShowDetailModal(true);
        setLoadingDetail(true);
        try {
            const response = await fetch(`${API_BASE_URL}/Students/${student.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSelectedStudentDetail(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingDetail(false);
        }
    };

    const openIncidentModal = (student) => {
        setIncidentData({
            studentId: student.id,
            studentName: student.fullName,
            typeId: '',
            title: '',
            description: '',
            severity: 'Leve'
        });
        setShowIncidentModal(true);
    };

    const handleCreateIncident = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/Incidents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    studentId: incidentData.studentId,
                    typeId: parseInt(incidentData.typeId),
                    reporterId: TEACHER_ID,
                    title: incidentData.title,
                    description: incidentData.description,
                    severity: incidentData.severity,
                    date: new Date().toISOString()
                })
            });

            if (response.ok) {
                alert('Reporte enviado al coordinador correctamente.');
                setShowIncidentModal(false);
            } else {
                alert('Error al enviar el reporte.');
            }
        } catch (err) {
            console.error(err);
            alert('Error de conexión.');
        }
    };

    const saveAttendance = async () => {
        if (!confirm('¿Estás seguro de guardar la asistencia?')) return;

        setIsSaving(true);
        try {
            const attendancePayload = students.map(student => ({
                studentId: student.id,
                courseId: selectedCourseId,
                classDate: TODAY,
                status: attendanceData[student.id] || 'Asistió',
                emotion: emotionData[student.id] || 'Neutral', // Default to Neutral if not set
                note: ''
            }));

            const response = await fetch(`${API_BASE_URL}/Attendances/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(attendancePayload)
            });

            if (response.ok) {
                // Also save the attendance registry with observation
                const selectedCourse = courses.find(c => c.id === selectedCourseId);
                const registryPayload = {
                    courseId: selectedCourseId,
                    schoolPeriodId: selectedCourse?.periodId || null,
                    registryDate: TODAY,
                    teacherId: TEACHER_ID,
                    observation: observation
                };

                const regResponse = await fetch(`${API_BASE_URL}/AttendanceRegistries`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(registryPayload)
                });

                if (regResponse.ok) {
                    alert('Asistencia y registro guardados correctamente.');
                    setAttendanceTaken(true);
                } else {
                    alert('Asistencia guardada, pero hubo un error al guardar el registro de observación.');
                }
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

    // Emotion Icon Helper
    const EmotionIcon = ({ icon: Icon, color, selected, onClick }) => (
        <button
            onClick={onClick}
            className={`p-1.5 rounded-full transition-all ${selected
                ? `bg-${color}-100 text-${color}-600 ring-2 ring-${color}-400 ring-offset-1`
                : 'text-gray-300 hover:bg-gray-100'
                }`}
            title={selected ? 'Seleccionado' : 'Seleccionar'}
        >
            <Icon size={20} className={selected ? 'fill-current' : ''} />
        </button>
    );

    return (
        <div className="space-y-4">
            {/* Header / Course Selector */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex justify-between items-center">
                <div>
                    <div className="text-gray-400 text-xs">Materia Seleccionada</div>
                    <div className="text-gray-800 text-lg font-semibold">
                        {courses.length > 0 ? (
                            <select
                                value={selectedCourseId || ''}
                                onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                                className="bg-transparent border-none focus:ring-0 p-0 font-semibold cursor-pointer text-lg"
                            >
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.grade} {c.group})</option>
                                ))}
                            </select>
                        ) : 'Sin Cursos'}
                    </div>
                </div>
                <div className="text-sm text-gray-500">
                    Fecha: <span className="font-medium text-gray-900">{new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Students List */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="font-bold text-gray-800">Lista de Alumnos</h2>
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

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">Alumno</th>
                                <th className="px-4 py-3 text-center">Asistencia</th>
                                <th className="px-4 py-3 text-center">Emoción del Día</th>
                                <th className="px-4 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.filter(s => s.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map((student) => {
                                const currentEmotion = emotionData[student.id] || 'Neutral';
                                return (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                    {student.firstName?.charAt(0)}{student.paternalSurname?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{student.fullName}</div>
                                                    <div className="text-xs text-gray-500">{student.email || 'Sin correo'}</div>
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
                                        <td className="px-4 py-3">
                                            <div className="flex justify-center items-center gap-2">
                                                <EmotionIcon
                                                    icon={Smile}
                                                    color="green"
                                                    selected={currentEmotion === 'Happy'}
                                                    onClick={() => handleEmotionClick(student.id, 'Happy')}
                                                />
                                                <EmotionIcon
                                                    icon={Meh}
                                                    color="gray"
                                                    selected={currentEmotion === 'Neutral'}
                                                    onClick={() => handleEmotionClick(student.id, 'Neutral')}
                                                />
                                                <EmotionIcon
                                                    icon={Frown}
                                                    color="blue"
                                                    selected={currentEmotion === 'Sad'}
                                                    onClick={() => handleEmotionClick(student.id, 'Sad')}
                                                />
                                                <EmotionIcon
                                                    icon={AlertCircle}
                                                    color="orange"
                                                    selected={currentEmotion === 'Anxious'}
                                                    onClick={() => handleEmotionClick(student.id, 'Anxious')}
                                                />
                                                <EmotionIcon
                                                    icon={FileWarning}
                                                    color="red"
                                                    selected={currentEmotion === 'Angry'}
                                                    onClick={() => handleEmotionClick(student.id, 'Angry')}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => openStudentDetail(student)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Ver Detalle"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openIncidentModal(student)}
                                                    className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                                                    title="Notificar Coordinador"
                                                >
                                                    <Bell size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {students.length === 0 && !loading && (
                        <div className="p-8 text-center text-gray-400">
                            No hay alumnos registrados en este curso.
                        </div>
                    )}
                </div>

                {/* Observation Section */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/30">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Observaciones de la clase (Opcional)</label>
                    <textarea
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none"
                        rows="3"
                        placeholder="Escribe alguna observación general sobre la sesión de hoy..."
                        value={observation}
                        onChange={(e) => setObservation(e.target.value)}
                    ></textarea>
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

            {/* Student Detail Modal */}
            {showDetailModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 relative">
                        <button
                            onClick={() => setShowDetailModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-xl font-bold text-gray-900 mb-6">Detalle del Alumno</h3>

                        {loadingDetail ? (
                            <div className="text-center py-8 text-gray-500">Cargando información...</div>
                        ) : selectedStudentDetail ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                        <h4 className="font-semibold text-gray-800 mb-2">Información Personal</h4>
                                        <p className="text-sm text-gray-600"><span className="font-medium">Nombre:</span> {selectedStudentDetail.firstName} {selectedStudentDetail.paternalSurname} {selectedStudentDetail.maternalSurname}</p>
                                        <p className="text-sm text-gray-600"><span className="font-medium">Matrícula:</span> {selectedStudentDetail.matricula || 'N/A'}</p>
                                        <p className="text-sm text-gray-600"><span className="font-medium">Email:</span> {selectedStudentDetail.email || 'N/A'}</p>
                                        <p className="text-sm text-gray-600"><span className="font-medium">Teléfono:</span> {selectedStudentDetail.phone || 'N/A'}</p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-blue-800 mb-2">Información Académica</h4>
                                        <p className="text-sm text-blue-700"><span className="font-medium">Materia:</span> {selectedStudentDetail.group ? `${selectedStudentDetail.group.grade?.name} ${selectedStudentDetail.group.name}` : 'Sin asignación'}</p>
                                        <p className="text-sm text-blue-700"><span className="font-medium">Ciclo:</span> {selectedStudentDetail.admissionCycle}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                        <Users size={16} /> Familiares / Tutores
                                    </h4>
                                    <div className="space-y-3 max-h-60 overflow-y-auto">
                                        {/* Family Info */}
                                        {selectedStudentDetail.family && (
                                            <div className="border border-gray-100 rounded-lg p-3">
                                                <p className="font-medium text-sm text-gray-900">Familia: {selectedStudentDetail.family.name}</p>
                                            </div>
                                        )}
                                        {/* Guardians Info if available from separate endpoint or included */}
                                        {selectedStudentDetail.studentGuardians && selectedStudentDetail.studentGuardians.length > 0 ? (
                                            selectedStudentDetail.studentGuardians.map((sg, idx) => (
                                                <div key={idx} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                                                    <p className="font-medium text-sm text-gray-900">{sg.guardian.firstName} {sg.guardian.lastName}</p>
                                                    <p className="text-xs text-gray-500">{sg.relationship}</p>
                                                    <p className="text-xs text-gray-500">{sg.guardian.phone} • {sg.guardian.email}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">No hay tutores registrados.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-red-500">No se pudo cargar la información.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Create Incident Modal */}
            {showIncidentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Notificar a Coordinador</h3>
                            <button onClick={() => setShowIncidentModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateIncident} className="space-y-4">
                            <div className="bg-orange-50 p-3 rounded-lg text-sm text-orange-800 mb-4">
                                Reportando incidente para: <strong>{incidentData.studentName}</strong>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Incidencia</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={incidentData.typeId}
                                    onChange={(e) => setIncidentData({ ...incidentData, typeId: e.target.value })}
                                    required
                                >
                                    <option value="">Selecciona un tipo...</option>
                                    {incidentTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.name} ({type.severity})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={incidentData.title}
                                    onChange={(e) => setIncidentData({ ...incidentData, title: e.target.value })}
                                    required
                                    placeholder="Resumen breve..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Detallada</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none h-24 resize-none"
                                    value={incidentData.description}
                                    onChange={(e) => setIncidentData({ ...incidentData, description: e.target.value })}
                                    required
                                    placeholder="Describe lo sucedido..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowIncidentModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 flex items-center gap-2"
                                >
                                    <Bell size={16} />
                                    Enviar Reporte
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherPanel;
