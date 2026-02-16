import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const StudentCourses = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchStudentCourses();
    }, []);

    const fetchStudentCourses = async () => {
        try {
            const response = await fetch(`http://institutohumboldt.mx:8080/api/StudentProfile/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setCourses(data.courses || []);
            }
        } catch (err) {
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseActivities = async (courseId) => {
        try {
            const response = await fetch(`http://institutohumboldt.mx:8080/api/Activities?courseId=${courseId}`);
            if (response.ok) {
                const data = await response.json();
                setActivities(data);
            }
        } catch (err) {
            console.error('Error fetching activities:', err);
            // Mock data for demonstration
            setActivities([
                {
                    id: 1,
                    title: 'Tarea: Resolver ejercicios del capítulo 3',
                    description: 'Completar los ejercicios 1-10 de la página 45',
                    dueDate: '2025-12-10',
                    type: 'Tarea',
                    status: 'Pendiente',
                    grade: null
                },
                {
                    id: 2,
                    title: 'Examen: Unidad 2',
                    description: 'Examen sobre los temas vistos en la unidad 2',
                    dueDate: '2025-12-08',
                    type: 'Examen',
                    status: 'Calificado',
                    grade: 9.5
                },
                {
                    id: 3,
                    title: 'Proyecto: Investigación',
                    description: 'Investigación sobre el tema asignado en equipos',
                    dueDate: '2025-12-15',
                    type: 'Proyecto',
                    status: 'En progreso',
                    grade: null
                }
            ]);
        }
    };

    const handleCourseClick = (course) => {
        // Add evaluation structure to course
        const courseWithEvaluation = {
            ...course,
            evaluation: {
                tareas: 30,
                examenes: 40,
                proyectos: 20,
                actividades: 10
            },
            previousGrade: 8.5 // Mock previous grade
        };
        setSelectedCourse(courseWithEvaluation);
        fetchCourseActivities(course.id);
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'Tarea':
                return <FileText size={16} className="text-blue-600" />;
            case 'Examen':
                return <AlertCircle size={16} className="text-red-600" />;
            case 'Proyecto':
                return <BookOpen size={16} className="text-purple-600" />;
            default:
                return <FileText size={16} className="text-gray-600" />;
        }
    };

    const getStatusBadge = (status, grade) => {
        if (status === 'Calificado' && grade !== null) {
            return (
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                    Calificado: {grade}
                </span>
            );
        }
        if (status === 'Pendiente') {
            return (
                <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">
                    Pendiente
                </span>
            );
        }
        return (
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                {status}
            </span>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-sm text-gray-500">Cargando materias...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-4">
                <h1 className="text-xl font-bold text-gray-900">Mis Materias</h1>
                <p className="text-xs text-gray-500">Consulta tus materias y actividades asignadas</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Courses List */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <h2 className="text-sm font-semibold text-gray-800 mb-3">Materias Asignadas</h2>
                        {courses.length === 0 ? (
                            <p className="text-xs text-gray-500 text-center py-6">No tienes materias asignadas</p>
                        ) : (
                            <div className="space-y-2">
                                {courses.map((course) => (
                                    <button
                                        key={course.id}
                                        onClick={() => handleCourseClick(course)}
                                        className={`w-full text-left p-3 rounded-lg border transition-all ${selectedCourse?.id === course.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className={`p-1.5 rounded ${selectedCourse?.id === course.id ? 'bg-primary/10' : 'bg-gray-100'
                                                }`}>
                                                <BookOpen size={16} className={
                                                    selectedCourse?.id === course.id ? 'text-primary' : 'text-gray-600'
                                                } />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                    {course.name}
                                                </h3>
                                                <p className="text-xs text-gray-500">{course.teacher || 'Sin profesor'}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Activities List */}
                <div className="lg:col-span-2">
                    {selectedCourse ? (
                        <div className="space-y-4">
                            {/* Course Header */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="mb-4 pb-3 border-b border-gray-200">
                                    <h2 className="text-base font-bold text-gray-900">{selectedCourse.name}</h2>
                                    <p className="text-xs text-gray-500">Profesor: {selectedCourse.teacher || 'Sin asignar'}</p>
                                </div>

                                {/* Evaluation Structure */}
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Estructura de Evaluación</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FileText size={16} className="text-blue-600" />
                                                <span className="text-xs font-medium text-gray-600">Tareas</span>
                                            </div>
                                            <div className="text-2xl font-bold text-blue-600">{selectedCourse.evaluation?.tareas || 0}%</div>
                                        </div>
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertCircle size={16} className="text-red-600" />
                                                <span className="text-xs font-medium text-gray-600">Exámenes</span>
                                            </div>
                                            <div className="text-2xl font-bold text-red-600">{selectedCourse.evaluation?.examenes || 0}%</div>
                                        </div>
                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <BookOpen size={16} className="text-purple-600" />
                                                <span className="text-xs font-medium text-gray-600">Proyectos</span>
                                            </div>
                                            <div className="text-2xl font-bold text-purple-600">{selectedCourse.evaluation?.proyectos || 0}%</div>
                                        </div>
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckCircle2 size={16} className="text-green-600" />
                                                <span className="text-xs font-medium text-gray-600">Actividades</span>
                                            </div>
                                            <div className="text-2xl font-bold text-green-600">{selectedCourse.evaluation?.actividades || 0}%</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Previous Grade */}
                                {selectedCourse.previousGrade && (
                                    <div className="bg-gradient-to-r from-primary/10 to-blue-50 border border-primary/20 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-xs font-medium text-gray-600">Calificación Previa</span>
                                                <p className="text-xs text-gray-500 mt-0.5">Último periodo evaluado</p>
                                            </div>
                                            <div className="text-3xl font-bold text-primary">
                                                {selectedCourse.previousGrade.toFixed(1)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Activities Section */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4">

                                <h3 className="text-sm font-semibold text-gray-800 mb-3">Actividades</h3>

                                {activities.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FileText className="mx-auto text-gray-300 mb-2" size={40} />
                                        <p className="text-sm text-gray-500">No hay actividades asignadas</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {activities.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-start gap-2 flex-1">
                                                        <div className="mt-0.5">
                                                            {getActivityIcon(activity.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-semibold text-gray-900">
                                                                {activity.title}
                                                            </h4>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                {activity.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(activity.status, activity.grade)}
                                                </div>

                                                <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-100">
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <Calendar size={14} />
                                                        <span>Entrega: {formatDate(activity.dueDate)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <FileText size={14} />
                                                        <span>{activity.type}</span>
                                                    </div>
                                                </div>

                                                {activity.status === 'Pendiente' && (
                                                    <button className="mt-3 w-full px-3 py-1.5 text-xs bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                                                        Ver Detalles
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                            <BookOpen className="mx-auto text-gray-300 mb-3" size={48} />
                            <p className="text-sm text-gray-500">Selecciona una materia para ver sus actividades</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentCourses;
