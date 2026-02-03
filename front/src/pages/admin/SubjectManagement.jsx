import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, X, Pencil, Trash2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubjectManagement = () => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        grade: '',
        teacherId: ''
    });

    useEffect(() => {
        fetchSubjects();
        fetchTeachers();
        fetchGrades();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5246/api/Courses');
            if (response.ok) {
                const data = await response.json();
                setSubjects(data);
            } else {
                setError('Error al cargar las materias');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
            console.error('Error fetching subjects:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await fetch('http://localhost:5246/api/Teachers');
            if (response.ok) {
                const data = await response.json();
                setTeachers(data);
            }
        } catch (err) {
            console.error('Error fetching teachers:', err);
        }
    };

    const fetchGrades = async () => {
        try {
            const response = await fetch('http://localhost:5246/api/SchoolLevels');
            if (response.ok) {
                const data = await response.json();
                // Flatten all grades from all levels
                const allGrades = data.reduce((acc, level) => {
                    if (level.grades) {
                        const levelGrades = level.grades.map(grade => ({
                            ...grade,
                            levelName: level.name,
                            groups: grade.groups || []
                        }));
                        return [...acc, ...levelGrades];
                    }
                    return acc;
                }, []);
                setGrades(allGrades);
            }
        } catch (err) {
            console.error('Error fetching grades:', err);
        }
    };

    const handleOpenModal = (subject = null) => {
        if (subject) {
            setEditingSubject(subject);
            setFormData({
                name: subject.name,
                grade: subject.grade,
                teacherId: subject.teacherId.toString()
            });
        } else {
            setEditingSubject(null);
            setFormData({
                name: '',
                grade: '',
                teacherId: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSubject(null);
        setFormData({
            name: '',
            grade: '',
            teacherId: ''
        });
        setError('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const payload = {
                name: formData.name,
                grade: formData.grade,
                teacherId: parseInt(formData.teacherId)
            };

            const url = editingSubject
                ? `http://localhost:5246/api/Courses/${editingSubject.id}`
                : 'http://localhost:5246/api/Courses';

            const method = editingSubject ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingSubject ? { ...payload, id: editingSubject.id } : payload)
            });

            if (response.ok) {
                await fetchSubjects();
                handleCloseModal();
            } else {
                setError('Error al guardar la materia');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
            console.error('Error saving subject:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar esta materia?')) return;

        try {
            const response = await fetch(`http://localhost:5246/api/Courses/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await fetchSubjects();
            } else {
                setError('Error al eliminar la materia');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
            console.error('Error deleting subject:', err);
        }
    };

    const getTeacherName = (teacherId) => {
        const teacher = teachers.find(t => t.id === teacherId);
        return teacher ? teacher.fullName : 'Sin asignar';
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen size={24} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestión de Materias</h1>
                        <p className="text-sm text-gray-500">Administra las materias del sistema escolar</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                    <Plus size={20} />
                    Agregar Materia
                </button>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Subjects Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        Cargando materias...
                    </div>
                ) : subjects.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No hay materias registradas. Haz clic en "Agregar Materia" para crear una.
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Materia
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Grado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Docente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Fecha de Creación
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {subjects.map((subject) => (
                                <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-100 rounded">
                                                <BookOpen size={16} className="text-primary" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {subject.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                            {subject.grade}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-700">
                                            {getTeacherName(subject.teacherId)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500">
                                            {new Date(subject.createdAt).toLocaleDateString('es-MX')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(subject)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(subject.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingSubject ? 'Editar Materia' : 'Agregar Materia'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Subject Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre de la Materia <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ej: Matemáticas, Español, Historia"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>

                            {/* Grade Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Grado <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="grade"
                                    value={formData.grade}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                >
                                    <option value="">Seleccionar grado...</option>
                                    {grades.map((grade) => (
                                        <optgroup key={grade.id} label={`${grade.levelName} - ${grade.name}`}>
                                            {grade.groups.map((group) => (
                                                <option key={`${grade.name}${group.name}`} value={`${grade.name}${group.name}`}>
                                                    {grade.name}{group.name} ({grade.levelName})
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    Selecciona el grado y grupo para esta materia
                                </p>
                            </div>

                            {/* Teacher Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Docente Asignado <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="teacherId"
                                    value={formData.teacherId}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                >
                                    <option value="">Seleccionar docente...</option>
                                    {teachers.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                                    {error}
                                </div>
                            )}

                            {/* Modal Actions */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                                >
                                    <Save size={16} />
                                    {editingSubject ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectManagement;
