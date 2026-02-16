import React, { useState, useEffect } from 'react';
import { Calendar, FileText, AlertCircle, BookOpen, Filter, ChevronDown } from 'lucide-react';

const StudentActivities = () => {
    const [activities, setActivities] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('Todas');
    const [filterType, setFilterType] = useState('Todos');
    const [filterCourse, setFilterCourse] = useState('Todas');

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(`http://institutohumboldt.mx:8080/api/StudentProfile/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setCourses(data.courses || []);
                // Generate mock activities for all courses
                generateMockActivities(data.courses || []);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            // Use mock data
            const mockCourses = [
                { id: 1, name: 'Matemáticas', teacher: 'Prof. García' },
                { id: 2, name: 'Español', teacher: 'Prof. Martínez' },
                { id: 3, name: 'Ciencias', teacher: 'Prof. López' }
            ];
            setCourses(mockCourses);
            generateMockActivities(mockCourses);
        } finally {
            setLoading(false);
        }
    };

    const generateMockActivities = (coursesList) => {
        const mockActivities = [];
        coursesList.forEach((course, idx) => {
            mockActivities.push(
                {
                    id: `${course.id}-1`,
                    courseId: course.id,
                    courseName: course.name,
                    title: 'Tarea: Resolver ejercicios',
                    description: `Completar los ejercicios del capítulo ${idx + 1}`,
                    dueDate: new Date(Date.now() + (idx + 1) * 86400000).toISOString(),
                    type: 'Tarea',
                    status: 'Pendiente',
                    grade: null
                },
                {
                    id: `${course.id}-2`,
                    courseId: course.id,
                    courseName: course.name,
                    title: 'Examen: Unidad 2',
                    description: 'Examen sobre los temas de la unidad 2',
                    dueDate: new Date(Date.now() + (idx + 3) * 86400000).toISOString(),
                    type: 'Examen',
                    status: idx === 0 ? 'Calificado' : 'Pendiente',
                    grade: idx === 0 ? 9.5 : null
                },
                {
                    id: `${course.id}-3`,
                    courseId: course.id,
                    courseName: course.name,
                    title: 'Proyecto: Investigación',
                    description: 'Proyecto de investigación en equipos',
                    dueDate: new Date(Date.now() + (idx + 7) * 86400000).toISOString(),
                    type: 'Proyecto',
                    status: 'En progreso',
                    grade: null
                }
            );
        });
        setActivities(mockActivities);
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'Tarea':
                return <FileText size={18} className="text-blue-600" />;
            case 'Examen':
                return <AlertCircle size={18} className="text-red-600" />;
            case 'Proyecto':
                return <BookOpen size={18} className="text-purple-600" />;
            default:
                return <FileText size={18} className="text-gray-600" />;
        }
    };

    const getStatusBadge = (status, grade) => {
        if (status === 'Calificado' && grade !== null) {
            return (
                <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">
                    Calificado: {grade}
                </span>
            );
        }
        if (status === 'Pendiente') {
            return (
                <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                    Pendiente
                </span>
            );
        }
        return (
            <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-semibold">
                {status}
            </span>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getDaysUntilDue = (dateString) => {
        const dueDate = new Date(dateString);
        const today = new Date();
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const filteredActivities = activities
        .filter(activity => {
            if (filterStatus !== 'Todas' && activity.status !== filterStatus) return false;
            if (filterType !== 'Todos' && activity.type !== filterType) return false;
            if (filterCourse !== 'Todas' && activity.courseName !== filterCourse) return false;
            return true;
        })
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-sm text-gray-500">Cargando actividades...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Mis Actividades y Tareas</h1>
                <p className="text-sm text-gray-500 mt-1">Gestiona todas tus actividades académicas</p>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={18} className="text-gray-600" />
                    <h2 className="text-sm font-semibold text-gray-800">Filtros</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                            <option>Todas</option>
                            <option>Pendiente</option>
                            <option>En progreso</option>
                            <option>Calificado</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                            <option>Todos</option>
                            <option>Tarea</option>
                            <option>Examen</option>
                            <option>Proyecto</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Materia</label>
                        <select
                            value={filterCourse}
                            onChange={(e) => setFilterCourse(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                            <option>Todas</option>
                            {courses.map(course => (
                                <option key={course.id}>{course.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Activities Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-gray-900">{activities.length}</div>
                    <div className="text-xs text-gray-500">Total Actividades</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-yellow-600">
                        {activities.filter(a => a.status === 'Pendiente').length}
                    </div>
                    <div className="text-xs text-gray-500">Pendientes</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">
                        {activities.filter(a => a.status === 'En progreso').length}
                    </div>
                    <div className="text-xs text-gray-500">En Progreso</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">
                        {activities.filter(a => a.status === 'Calificado').length}
                    </div>
                    <div className="text-xs text-gray-500">Calificadas</div>
                </div>
            </div>

            {/* Activities List */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-base font-bold text-gray-900">
                        Actividades ({filteredActivities.length})
                    </h2>
                </div>

                {filteredActivities.length === 0 ? (
                    <div className="text-center py-12">
                        <ClipboardList className="mx-auto text-gray-300 mb-3" size={48} />
                        <p className="text-sm text-gray-500">No hay actividades que coincidan con los filtros</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredActivities.map((activity) => {
                            const daysUntilDue = getDaysUntilDue(activity.dueDate);
                            const isUrgent = daysUntilDue <= 2 && activity.status === 'Pendiente';

                            return (
                                <div
                                    key={activity.id}
                                    className={`p-4 hover:bg-gray-50 transition-colors ${isUrgent ? 'bg-red-50/50' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="mt-1">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h3 className="text-sm font-semibold text-gray-900">
                                                        {activity.title}
                                                    </h3>
                                                    {getStatusBadge(activity.status, activity.grade)}
                                                </div>
                                                <p className="text-xs text-gray-600 mb-2">
                                                    {activity.description}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <BookOpen size={14} />
                                                        <span className="font-medium">{activity.courseName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        <span>Entrega: {formatDate(activity.dueDate)}</span>
                                                        {isUrgent && (
                                                            <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-semibold">
                                                                ¡Urgente!
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <FileText size={14} />
                                                        <span>{activity.type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {activity.status === 'Pendiente' && (
                                            <button className="px-4 py-2 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap">
                                                Ver Detalles
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentActivities;
