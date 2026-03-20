import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Plus, Edit, Trash2, CheckCircle, AlertCircle, Save, X } from 'lucide-react';

import { API_BASE_URL } from '../../config';

const TeacherActivities = () => {
    const navigate = useNavigate();
    const [activePeriod, setActivePeriod] = useState(null);
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCriteriaModal, setShowCriteriaModal] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);

    // Form States
    const [criteriaForm, setCriteriaForm] = useState({ componentType: '', weightPercentage: '', description: '' });
    const [activityForm, setActivityForm] = useState({ criteriaId: '', title: '', description: '', maxScore: '10', startDate: '', endDate: '' });

    const userId = localStorage.getItem('userId');
    const teacherId = userId ? parseInt(userId) : null;

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedCourseId) {
            fetchCourseDetails(selectedCourseId);
        }
    }, [selectedCourseId]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            // 1. Fetch Active Period
            const periodRes = await fetch(`${API_BASE_URL}/SchoolPeriods/active`);
            if (periodRes.ok) {
                const periodData = await periodRes.json();
                setActivePeriod(periodData);

                // 2. Fetch Teacher Courses (Fetch ALL, filter client-side)
                if (teacherId) {
                    const coursesRes = await fetch(`${API_BASE_URL}/Teachers/${teacherId}`);
                    if (coursesRes.ok) {
                        const teacherData = await coursesRes.json();
                        const allCourses = teacherData.courses || [];

                        // Filter Logic
                        let filteredCourses = allCourses;
                        if (periodData.id) {
                            const periodCourses = allCourses.filter(c => c.periodId === periodData.id || c.periodId === null);
                            filteredCourses = periodCourses;
                        }

                        setCourses(filteredCourses);

                        // Auto-select first
                        if (filteredCourses.length > 0) {
                            setSelectedCourseId(filteredCourses[0].id);
                        }
                    }
                }
            } else {
                console.warn("No active period found");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseDetails = async (courseId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/Courses/${courseId}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedCourse(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Edit State
    const [editingCriteriaId, setEditingCriteriaId] = useState(null);

    const handleSaveCriteria = async (e) => {
        e.preventDefault();
        if (!selectedCourseId) return;

        try {
            const payload = {
                id: editingCriteriaId || 0, // 0 for new
                courseId: selectedCourseId,
                componentType: criteriaForm.componentType,
                weightPercentage: parseFloat(criteriaForm.weightPercentage),
                description: criteriaForm.description
            };

            let response;
            if (editingCriteriaId) {
                // Update
                response = await fetch(`${API_BASE_URL}/CourseGrading/criteria/${editingCriteriaId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                // Create
                response = await fetch(`${API_BASE_URL}/CourseGrading/criteria`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (response.ok) {
                setShowCriteriaModal(false);
                setCriteriaForm({ componentType: '', weightPercentage: '', description: '' });
                setEditingCriteriaId(null);
                fetchCourseDetails(selectedCourseId);
            } else {
                console.error("Error saving criteria");
                alert("Error al guardar el criterio. Verifica los datos.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditCriteria = (criteria) => {
        setEditingCriteriaId(criteria.id);
        setCriteriaForm({
            componentType: criteria.componentType,
            weightPercentage: criteria.weightPercentage,
            description: criteria.description || ''
        });
        setShowCriteriaModal(true);
    };

    const handleDeleteCriteria = async (criteriaId) => {
        if (!window.confirm('¿Estás seguro de eliminar este criterio? Se eliminarán todas las actividades asociadas.')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/CourseGrading/criteria/${criteriaId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchCourseDetails(selectedCourseId);
            } else {
                console.error("Failed to delete criteria");
                alert("Error al eliminar el criterio.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateActivity = async (e) => {
        e.preventDefault();
        if (!selectedCourseId) return;

        try {
            const payload = {
                criteriaId: parseInt(activityForm.criteriaId),
                title: activityForm.title,
                description: activityForm.description,
                maxScore: parseFloat(activityForm.maxScore),
                startDate: activityForm.startDate || new Date().toISOString(),
                endDate: activityForm.endDate || new Date().toISOString()
            };

            // Assuming standard endpoint based on controller analysis
            const response = await fetch(`${API_BASE_URL}/CourseGrading/evaluations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setShowActivityModal(false);
                setActivityForm({ criteriaId: '', title: '', description: '', maxScore: '10', startDate: '', endDate: '' });
                fetchCourseDetails(selectedCourseId);
            } else {
                console.error("Error creating activity");
                alert("Error al crear la actividad.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteActivity = async (activityId) => {
        if (!window.confirm('¿Estás seguro de eliminar esta actividad?')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/CourseGrading/evaluations/${activityId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchCourseDetails(selectedCourseId);
            } else {
                console.error("Error deleting activity");
                alert("Error al eliminar la actividad.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Actividades y Evaluación</h2>
                    <p className="text-gray-500 text-sm">Gestiona la ponderación y asignación de tareas.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2">
                        <Calendar size={18} className="text-blue-600" />
                        <span className="font-semibold text-gray-700">{activePeriod ? activePeriod.name : 'Ciclo General'}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-6 h-full overflow-hidden">
                {/* Sidebar - Subjects */}
                <div className="w-64 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-y-auto hidden md:block">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-700">Mis Materias</h3>
                    </div>
                    <div className="p-2 space-y-1">
                        {courses.map(course => (
                            <button
                                key={course.id}
                                onClick={() => setSelectedCourseId(course.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${selectedCourseId === course.id
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="truncate">{course.name}</div>
                                <div className="text-xs opacity-70">{course.grade}</div>
                            </button>
                        ))}
                        {courses.length === 0 && (
                            <div className="p-4 text-center text-gray-400 text-sm">
                                No tienes materias asignadas en este ciclo.
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto pr-2">
                    {selectedCourse ? (
                        <div className="space-y-6">
                            {/* Ponderación General (Grading Criteria) */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg text-gray-800">Criterios de Evaluación</h3>
                                    <button
                                        onClick={() => setShowCriteriaModal(true)}
                                        className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                    >
                                        <Plus size={16} /> Agregar Criterio
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                                        {selectedCourse.gradingCriteria?.map((criteria, idx) => (
                                            <div
                                                key={criteria.id}
                                                className={`h-full ${['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'][idx % 4]}`}
                                                style={{ width: `${criteria.weightPercentage}%` }}
                                                title={`${criteria.componentType}: ${criteria.weightPercentage}%`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                                        <span>Total asignado: {selectedCourse.gradingCriteria?.reduce((acc, curr) => acc + curr.weightPercentage, 0) || 0}%</span>
                                        <span>Meta: 100%</span>
                                    </div>
                                </div>

                                {/* Criteria Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {selectedCourse.gradingCriteria?.map((criteria, idx) => (
                                        <div key={criteria.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50 relative group">
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                <button onClick={() => handleEditCriteria(criteria)} className="p-1 hover:bg-white rounded text-gray-500"><Edit size={14} /></button>
                                                <button onClick={() => handleDeleteCriteria(criteria.id)} className="p-1 hover:bg-white rounded text-red-500"><Trash2 size={14} /></button>
                                            </div>
                                            <h4 className="font-bold text-gray-800">{criteria.componentType}</h4>
                                            <div className="text-3xl font-black text-blue-600 my-2">{criteria.weightPercentage}%</div>
                                            <p className="text-xs text-gray-500">{criteria.description || 'Sin descripción'}</p>
                                        </div>
                                    ))}
                                    {(!selectedCourse.gradingCriteria || selectedCourse.gradingCriteria.length === 0) && (
                                        <div className="col-span-full text-center py-4 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                                            No hay criterios definidos. Agrega uno para comenzar.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Activities / Tasks */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-lg text-gray-800">Actividades y Tareas</h3>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => navigate(`/teacher-tasks/${selectedCourseId}`)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                            Gestor de Tareas Dinámicas
                                        </button>
                                        <button
                                            onClick={() => setShowActivityModal(true)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                                        >
                                            <Plus size={18} /> Nueva Actividad
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {selectedCourse.gradingCriteria?.map(criteria => (
                                        <div key={criteria.id}>
                                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                {criteria.componentType}
                                            </h4>
                                            <div className="space-y-2">
                                                {criteria.evaluations?.map(evaluation => (
                                                    <div key={evaluation.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-colors flex justify-between items-center group bg-white">
                                                        <div className="flex items-start gap-3">
                                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg text-center min-w-[3rem]">
                                                                <span className="block text-xs font-bold text-blue-700 tracking-wide uppercase">Pts</span>
                                                                <span className="text-base font-black">{evaluation.maxScore}</span>
                                                            </div>
                                                            <div>
                                                                <h5 className="font-semibold text-gray-800">{evaluation.title}</h5>
                                                                <p className="text-sm text-gray-500 line-clamp-1">{evaluation.description}</p>
                                                                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                                                                    <span>{new Date(evaluation.startDate).toLocaleDateString()} - {new Date(evaluation.endDate).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => navigate('/teacher-grades', { state: { courseId: selectedCourseId } })}
                                                                className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg">
                                                                Calificar
                                                            </button>
                                                            <button onClick={() => handleDeleteActivity(evaluation.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!criteria.evaluations || criteria.evaluations.length === 0) && (
                                                    <div className="text-sm text-gray-400 italic pl-4 border-l-2 border-gray-100">
                                                        No hay actividades asignadas.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedCourse.gradingCriteria || selectedCourse.gradingCriteria.length === 0) && (
                                        <div className="text-center py-8 text-gray-400">
                                            Primero crea criterios de evaluación para asignar actividades.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <BookOpen size={48} className="mb-4 opacity-20" />
                            <p>Selecciona una materia para ver sus actividades.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Criteria Modal */}
            {
                showCriteriaModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800">{editingCriteriaId ? 'Editar Criterio' : 'Nuevo Criterio de Evaluación'}</h3>
                                <button onClick={() => {
                                    setShowCriteriaModal(false);
                                    setEditingCriteriaId(null);
                                    setCriteriaForm({ componentType: '', weightPercentage: '', description: '' });
                                }}><X className="text-gray-400" /></button>
                            </div>
                            <form onSubmit={handleSaveCriteria} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (Categoría)</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Exámenes, Tareas, Proyectos"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={criteriaForm.componentType}
                                        onChange={e => setCriteriaForm({ ...criteriaForm, componentType: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje (%)</label>
                                    <input
                                        type="number"
                                        placeholder="Ej. 40"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={criteriaForm.weightPercentage}
                                        onChange={e => setCriteriaForm({ ...criteriaForm, weightPercentage: e.target.value })}
                                        required
                                        min="1"
                                        max="100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        placeholder="Descripción opcional..."
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-24"
                                        value={criteriaForm.description}
                                        onChange={e => setCriteriaForm({ ...criteriaForm, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => {
                                        setShowCriteriaModal(false);
                                        setEditingCriteriaId(null);
                                        setCriteriaForm({ componentType: '', weightPercentage: '', description: '' });
                                    }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancelar</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Activity Modal */}
            {
                showActivityModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Nueva Actividad</h3>
                                <button onClick={() => setShowActivityModal(false)}><X className="text-gray-400" /></button>
                            </div>
                            <form onSubmit={handleCreateActivity} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría (Criterio)</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={activityForm.criteriaId}
                                        onChange={e => setActivityForm({ ...activityForm, criteriaId: e.target.value })}
                                        required
                                    >
                                        <option value="">Selecciona una categoría...</option>
                                        {selectedCourse?.gradingCriteria?.map(c => (
                                            <option key={c.id} value={c.id}>{c.componentType} ({c.weightPercentage}%)</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Examen Parcial 1"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={activityForm.title}
                                        onChange={e => setActivityForm({ ...activityForm, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Puntaje Máximo</label>
                                        <input
                                            type="number"
                                            placeholder="Ej. 10"
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={activityForm.maxScore}
                                            onChange={e => setActivityForm({ ...activityForm, maxScore: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        {/* Spacer or additional logic */}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        placeholder="Instrucciones o detalles..."
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-20"
                                        value={activityForm.description}
                                        onChange={e => setActivityForm({ ...activityForm, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={activityForm.startDate}
                                            onChange={e => setActivityForm({ ...activityForm, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={activityForm.endDate}
                                            onChange={e => setActivityForm({ ...activityForm, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setShowActivityModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancelar</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium">Guardar Actividad</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default TeacherActivities;
