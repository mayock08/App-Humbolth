import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, BookOpen, CheckCircle, XCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5246';

export default function StudyPlans() {
    const [plans, setPlans] = useState([]);
    const [courses, setCourses] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Draft states for forms
    const [isCreating, setIsCreating] = useState(false);
    const [newPlanName, setNewPlanName] = useState('');
    const [newPlanPeriodId, setNewPlanPeriodId] = useState('');

    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [courseToAdd, setCourseToAdd] = useState('');
    const [isOfficialSep, setIsOfficialSep] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeaders();
            
            const [plansRes, coursesRes, periodsRes] = await Promise.all([
                fetch(`${API_URL}/api/PlanStudings`, { headers }),
                fetch(`${API_URL}/api/Courses`, { headers }).catch(() => ({ ok: false })),
                fetch(`${API_URL}/api/SchoolPeriods`, { headers }).catch(() => ({ ok: false }))
            ]);

            if (plansRes.ok) {
                const data = await plansRes.json();
                setPlans(data);
            } else {
                throw new Error(`Error en la respuesta del servidor: ${plansRes.status}`);
            }
            if (coursesRes && coursesRes.ok) {
                const cData = await coursesRes.json();
                setCourses(cData);
            }
            if (periodsRes && periodsRes.ok) {
                const pData = await periodsRes.json();
                setPeriods(pData);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/PlanStudings`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ name: newPlanName, periodId: parseInt(newPlanPeriodId) })
            });
            if (res.ok) {
                setIsCreating(false);
                setNewPlanName('');
                setNewPlanPeriodId('');
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeletePlan = async (planId) => {
        if (!window.confirm('¿Eliminar este plan de estudios?')) return;
        try {
            const res = await fetch(`${API_URL}/api/PlanStudings/${planId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/PlanStudings/${selectedPlanId}/courses`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ courseId: parseInt(courseToAdd), isOfficialSep })
            });
            if (res.ok) {
                setSelectedPlanId(null);
                setCourseToAdd('');
                setIsOfficialSep(false);
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveCourse = async (planCourseId) => {
         if (!window.confirm('¿Remover materia del plan?')) return;
         try {
             const res = await fetch(`${API_URL}/api/PlanStudings/courses/${planCourseId}`, {
                 method: 'DELETE',
                 headers: getAuthHeaders()
             });
             if (res.ok) fetchData();
         } catch (err) {
             console.error(err);
         }
    };

    const handleToggleSep = async (planCourse) => {
         try {
             const res = await fetch(`${API_URL}/api/PlanStudings/courses/${planCourse.id}`, {
                 method: 'PUT',
                 headers: getAuthHeaders(),
                 body: JSON.stringify({ isOfficialSep: !planCourse.isOfficialSep })
             });
             if (res.ok) fetchData();
         } catch (err) {
             console.error(err);
         }
    }

    if (loading) return <div className="p-8">Cargando planes de estudio...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Planes de Estudio</h1>
                    <p className="text-gray-500">Gestión de planes académicos y configuración oficial de la SEP</p>
                </div>
                <button 
                    onClick={() => setIsCreating(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={20} className="mr-2" />
                    Nuevo Plan
                </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

            {isCreating && (
                <form onSubmit={handleCreatePlan} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Crear Nuevo Plan de Estudios</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plan</label>
                            <input 
                                required
                                type="text" 
                                value={newPlanName}
                                onChange={(e) => setNewPlanName(e.target.value)}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Ej. Plan Semestral 2025"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Periodo Escolar</label>
                            <select 
                                required
                                value={newPlanPeriodId}
                                onChange={(e) => setNewPlanPeriodId(e.target.value)}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Seleccione un periodo</option>
                                {periods.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar Plan</button>
                    </div>
                </form>
            )}

            <div className="space-y-6">
                {plans.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No hay planes de estudio</h3>
                        <p className="text-gray-500 mt-1">Comienza creando el primer plan escolar.</p>
                    </div>
                ) : plans.map(plan => (
                    <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">{plan.name}</h2>
                                <p className="text-sm text-gray-500">Periodo: {plan.periodName || 'N/A'}</p>
                            </div>
                            <button onClick={() => handleDeletePlan(plan.id)} className="text-red-500 hover:text-red-700 p-2 border border-red-200 bg-white rounded-md hover:bg-red-50">
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-md font-semibold text-gray-700">Materias Asignadas</h3>
                                <button 
                                    onClick={() => setSelectedPlanId(plan.id)}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100"
                                >
                                    <Plus size={16} className="mr-1" />
                                    Agregar Materia
                                </button>
                            </div>

                            {selectedPlanId === plan.id && (
                                <form onSubmit={handleAddCourse} className="mb-6 bg-gray-50 p-4 rounded-lg flex items-end gap-4 border border-blue-100">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Materia (Curso)</label>
                                        <select required value={courseToAdd} onChange={e => setCourseToAdd(e.target.value)} className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2">
                                            <option value="">Seleccione...</option>
                                            {courses.map(c => <option key={c.id} value={c.id}>{c.name} - {c.grade}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-center mb-2 pb-1">
                                        <input type="checkbox" id={`sep-${plan.id}`} checked={isOfficialSep} onChange={e => setIsOfficialSep(e.target.checked)} className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-2" />
                                        <label htmlFor={`sep-${plan.id}`} className="text-sm text-gray-700 font-medium cursor-pointer">Oficial SEP</label>
                                    </div>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 shadow-sm transition-colors">Agregar</button>
                                    <button type="button" onClick={() => setSelectedPlanId(null)} className="px-4 py-2 text-gray-600 text-sm hover:bg-gray-200 bg-white border border-gray-200 rounded-md transition-colors shadow-sm">Cancelar</button>
                                </form>
                            )}

                            {plan.courses && plan.courses.length > 0 ? (
                                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-100 text-gray-600 font-medium border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3">Materia</th>
                                                <th className="px-4 py-3 text-center">Oficial SEP</th>
                                                <th className="px-4 py-3 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {plan.courses.map(pc => (
                                                <tr key={pc.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-800">
                                                        {pc.courseName} <span className="text-gray-400 text-xs ml-2">({pc.grade})</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center cursor-pointer" onClick={() => handleToggleSep(pc)} title="Hacer click para cambiar status SEP">
                                                        {pc.isOfficialSep ? (
                                                            <CheckCircle size={20} className="text-blue-500 mx-auto transition-transform hover:scale-110" />
                                                        ) : (
                                                            <XCircle size={20} className="text-gray-300 mx-auto transition-transform hover:scale-110 hover:text-gray-400" />
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button onClick={() => handleRemoveCourse(pc.id)} className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="bg-white border border-dashed border-gray-200 rounded-lg p-6 text-center">
                                    <p className="text-sm text-gray-500 italic">No hay materias vinculadas en este plan aún.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
