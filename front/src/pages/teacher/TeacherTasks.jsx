import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, FileText, CheckSquare, Link as LinkIcon, MessageSquare, Video, ArrowLeft, Users } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const submissionTypes = [
    { value: 'FileUpload', label: 'Archivos', icon: <FileText size={18} /> },
    { value: 'OnlineText', label: 'Texto en Línea', icon: <MessageSquare size={18} /> },
    { value: 'ExternalLink', label: 'Enlace Externo', icon: <LinkIcon size={18} /> },
    { value: 'Multimedia', label: 'Multimedia (Video/Audio)', icon: <Video size={18} /> },
    { value: 'Discussion', label: 'Discusión / Foro', icon: <MessageSquare size={18} /> },
    { value: 'Checklist', label: 'Lista de Verificación', icon: <CheckSquare size={18} /> }
];

const TeacherTasks = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        submissionType: 'FileUpload',
        maxScore: 100,
        dueDate: '',
        checklistItemsJson: ''
    });

    const [checklistItems, setChecklistItems] = useState(['']);

    useEffect(() => {
        fetchTasks();
    }, [courseId]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/CourseTasks/course/${courseId}`);
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            let finalChecklistJson = null;
            if (formData.submissionType === 'Checklist') {
                const validItems = checklistItems.filter(i => i.trim() !== '');
                finalChecklistJson = JSON.stringify(validItems);
            }

            const payload = {
                courseId: parseInt(courseId),
                title: formData.title,
                description: formData.description,
                submissionType: formData.submissionType,
                maxScore: parseFloat(formData.maxScore),
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                checklistItemsJson: finalChecklistJson
            };

            const res = await fetch(`${API_BASE_URL}/CourseTasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowModal(false);
                setFormData({
                    title: '', description: '', submissionType: 'FileUpload', maxScore: 100, dueDate: '', checklistItemsJson: ''
                });
                setChecklistItems(['']);
                fetchTasks();
            } else {
                alert("Error al crear tarea");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta tarea?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/CourseTasks/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchTasks();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando tareas...</div>;

    return (
        <div className="flex flex-col h-full space-y-6 max-w-5xl mx-auto w-full">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Tareas del Curso</h2>
                        <p className="text-gray-500 text-sm">Gestiona asignaciones dinámicas y evaluaciones</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus size={18} /> Nueva Tarea
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {tasks.map(task => {
                        const typeInfo = submissionTypes.find(t => t.value === task.submissionType) || submissionTypes[0];
                        return (
                            <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors flex justify-between items-center group">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                        {typeInfo.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">{task.title}</h3>
                                        <p className="text-gray-500 text-sm mb-2">{task.description}</p>
                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-gray-600">
                                                {typeInfo.label}
                                            </span>
                                            {task.dueDate && (
                                                <span>Entrega: {new Date(task.dueDate).toLocaleDateString()}</span>
                                            )}
                                            <span>Pts: {task.maxScore}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => navigate(`/teacher-tasks/${courseId}/submissions/${task.id}`)}
                                        className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                                    >
                                        <Users size={16} /> Entregas
                                    </button>
                                    <button onClick={() => handleDelete(task.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {tasks.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                            No hay tareas creadas en este curso.
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Crear Nueva Tarea</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título de Tarea</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Instrucciones</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none h-24"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Entrega</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={formData.submissionType}
                                        onChange={e => setFormData({ ...formData, submissionType: e.target.value })}
                                    >
                                        {submissionTypes.map(st => (
                                            <option key={st.value} value={st.value}>{st.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Puntuación Máxima</label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={formData.maxScore}
                                        onChange={e => setFormData({ ...formData, maxScore: e.target.value })}
                                        required
                                        min="1"
                                    />
                                </div>
                            </div>

                            {formData.submissionType === 'Checklist' && (
                                <div className="border border-blue-100 bg-blue-50 p-4 rounded-xl space-y-3">
                                    <label className="block text-sm font-medium text-blue-800">Elementos de la Lista de Verificación</label>
                                    {checklistItems.map((item, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 border border-blue-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder={`Elemento ${index + 1}`}
                                                value={item}
                                                onChange={e => {
                                                    const newItems = [...checklistItems];
                                                    newItems[index] = e.target.value;
                                                    setChecklistItems(newItems);
                                                }}
                                            />
                                            {checklistItems.length > 1 && (
                                                <button type="button" onClick={() => setChecklistItems(checklistItems.filter((_, i) => i !== index))} className="text-red-500 hover:text-red-700">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setChecklistItems([...checklistItems, ''])} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                        <Plus size={14} /> Agregar Elemento
                                    </button>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega (Opcional)</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.dueDate}
                                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cancelar</button>
                                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-colors">Guardar Tarea</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherTasks;
