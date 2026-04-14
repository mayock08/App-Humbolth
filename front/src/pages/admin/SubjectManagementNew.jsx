import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Filter, MoreHorizontal, X,
    BookOpen, Clock, Users, Calendar, Save, Trash2
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

// Helper to format time strings (HH:mm:ss to HH:mm AM/PM)
const formatTime = (timeStr) => {
    if (!timeStr) return '';
    // Check if it's already in 12h format or Date object, if purely string '14:00:00'
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${suffix}`;
};

const SubjectManagementNew = () => {
    // Data State
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [levels, setLevels] = useState([]); // Levels -> Grades -> Groups
    const [formativeFields, setFormativeFields] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [selectedLevelId, setSelectedLevelId] = useState('ALL');
    const [selectedLevelName, setSelectedLevelName] = useState('Todos'); // 'Kinder', 'Primaria', etc.
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination & Sorting State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState(null);

    // Form State
    const initialFormState = {
        name: '',
        code: '',
        credits: 4,
        levelId: '', // To filter grades dropdown
        gradeId: '', // Specific grade selected (e.g. 1st Grade)
        teacherId: '',
        formativeFieldId: '',
        isComplementary: false,
        selectedGroups: [], // Array of strings "GradeName|GroupName" e.g. "1A", "1B"
        scheduleDays: [], // ['L', 'M', 'Mi', 'J', 'V']
        startTime: '08:00',
        endTime: '09:00'
    };
    const [formData, setFormData] = useState(initialFormState);

    // --- Fetch Data ---
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [coursesRes, teachersRes, levelsRes, fieldsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/Courses`),
                fetch(`${API_BASE_URL}/Teachers`),
                fetch(`${API_BASE_URL}/SchoolLevels`),
                fetch(`${API_BASE_URL}/FormativeFields`)
            ]);

            if (coursesRes.ok) setCourses(await coursesRes.json());
            if (teachersRes.ok) setTeachers(await teachersRes.json());
            if (levelsRes.ok) setLevels(await levelsRes.json());
            if (fieldsRes.ok) setFormativeFields(await fieldsRes.json());

        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- Computed Data ---
    // --- Computed Data ---

    // 1. Filter
    const filteredCourses = courses.filter(c => {
        const matchesLevel = selectedLevelId === 'ALL' ||
            (c.levelId && c.levelId.toString() === selectedLevelId.toString());

        const matchesSearch = searchTerm === '' ||
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.code && c.code.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesLevel && matchesSearch;
    });

    // 2. Sort
    const sortedCourses = [...filteredCourses].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Custom sorting for specific columns if needed
        if (sortConfig.key === 'teacher') {
            aValue = teachers.find(t => t.id === a.teacherId)?.fullName || '';
            bValue = teachers.find(t => t.id === b.teacherId)?.fullName || '';
        }

        // Handle string comparison case-insensitively
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // 3. Paginate
    const totalPages = Math.ceil(sortedCourses.length / itemsPerPage);
    const paginatedCourses = sortedCourses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedLevelId, searchTerm]);

    // Flatten Grades/Groups for Dropdowns
    // Available Groups depends on selected Level in Form
    const getAvailableGroups = () => {
        if (!formData.levelId) return [];
        const level = levels.find(l => l.id.toString() === formData.levelId.toString());
        if (!level) return [];

        // Return all groups in this level
        const groups = [];
        level.grades.forEach(g => {
            if (g.groups) {
                g.groups.forEach(grp => {
                    groups.push({
                        id: `${g.name} - ${grp.name}`, // Unique ID for selection
                        label: `${g.name} - ${grp.name}`,
                        grade: g.name,
                        group: grp.name
                    });
                });
            }
        });
        return groups;
    };

    // --- Handlers ---

    const handleOpenModal = (course = null) => {
        if (course) {
            setIsEditing(true);
            setEditingCourseId(course.id);
            // Parse existing course to form
            setFormData({
                name: course.name,
                code: course.code || '',
                credits: course.credits || 0,
                levelId: course.levelId || '', // Use explicit LevelId if available
                gradeId: '',
                teacherId: course.teacherId,
                formativeFieldId: course.formativeFieldId || '',
                isComplementary: course.isComplementary || false,
                selectedGroups: [],
                scheduleDays: course.scheduleDays ? course.scheduleDays.split(',') : [],
                startTime: course.startTime || '08:00',
                endTime: course.endTime || '09:00'
            });

            // Fallback: Try to find level from grade string if levelId is missing
            if (!course.levelId) {
                const matchedLevel = levels.find(l => course.grade.includes(l.name) || (l.grades && l.grades.some(g => course.grade.includes(g.name))));
                if (matchedLevel) {
                    setFormData(prev => ({ ...prev, levelId: matchedLevel.id }));
                }
            }

        } else {
            setIsEditing(false);
            setEditingCourseId(null);
            setFormData(initialFormState);
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        // Validation
        if (!formData.name || !formData.teacherId) {
            alert("Por favor complete el nombre y seleccione un docente.");
            return;
        }

        const teacherIdVal = parseInt(formData.teacherId);
        const creditsVal = parseInt(formData.credits) || 0;
        const levelIdVal = formData.levelId ? parseInt(formData.levelId) : null;

        if (isNaN(teacherIdVal)) {
            alert("Docente inválido");
            return;
        }

        // Helper to formatting time safety
        const formatTimePayload = (t) => {
            if (!t) return "00:00:00";
            if (t.length === 5) return `${t}:00`;
            return t;
        };

        // Prepare Payload
        // If creating new and multiple groups selected: Loop
        const groupsToProcess = formData.selectedGroups.length > 0
            ? formData.selectedGroups
            : ['Default']; // Fallback if editing single or no group logic

        // If Editing, we typically update THAT specific record, not create multiples.
        if (isEditing) {
            const payload = {
                id: editingCourseId,
                name: formData.name,
                code: formData.code,
                credits: creditsVal,
                teacherId: teacherIdVal,
                levelId: levelIdVal, // Include LevelId
                formativeFieldId: formData.formativeFieldId ? parseInt(formData.formativeFieldId) : null,
                isComplementary: formData.isComplementary,
                scheduleDays: formData.scheduleDays.join(','),
                startTime: formatTimePayload(formData.startTime),
                endTime: formatTimePayload(formData.endTime),
                grade: courses.find(c => c.id === editingCourseId)?.grade || "Unknown" // Keep existing grade string
            };

            const res = await fetch(`${API_BASE_URL}/Courses/${editingCourseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                console.error("Error saving course", await res.text());
                alert("Error al guardar la materia. Verifique los datos.");
                return;
            }

        } else {
            // Creating
            // For each selected group, create a Course
            const promises = groupsToProcess.map(groupLabel => {
                const payload = {
                    name: formData.name,
                    code: formData.code,
                    credits: creditsVal,
                    teacherId: teacherIdVal,
                    levelId: levelIdVal, // Include LevelId
                    formativeFieldId: formData.formativeFieldId ? parseInt(formData.formativeFieldId) : null,
                    isComplementary: formData.isComplementary,
                    scheduleDays: formData.scheduleDays.join(','),
                    startTime: formatTimePayload(formData.startTime),
                    endTime: formatTimePayload(formData.endTime),
                    grade: groupLabel === 'Default'
                        ? (formData.levelId ? levels.find(l => l.id == formData.levelId)?.name || "General" : "General")
                        : groupLabel
                };
                return fetch(`${API_BASE_URL}/Courses`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            });
            await Promise.all(promises);
        }

        setShowModal(false);
        fetchInitialData();
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar esta materia?')) {
            await fetch(`${API_BASE_URL}/Courses/${id}`, { method: 'DELETE' });
            fetchInitialData();
        }
    };

    const toggleDay = (day) => {
        setFormData(prev => {
            const days = prev.scheduleDays.includes(day)
                ? prev.scheduleDays.filter(d => d !== day)
                : [...prev.scheduleDays, day];
            return { ...prev, scheduleDays: days };
        });
    };

    const toggleGroup = (groupLabel) => {
        setFormData(prev => {
            const groups = prev.selectedGroups.includes(groupLabel)
                ? prev.selectedGroups.filter(g => g !== groupLabel)
                : [...prev.selectedGroups, groupLabel];
            return { ...prev, selectedGroups: groups };
        });
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="flex h-full bg-gray-50">
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-8 py-5">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Gestión de Materias</h1>
                            <p className="text-gray-500 mt-1">Configura el catálogo académico y asignaciones para el ciclo actual.</p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar materia, código..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64 text-sm"
                            />
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 mt-6">
                        {[{ id: 'ALL', name: 'Todos' }, ...levels].map(level => (
                            <button
                                key={level.id}
                                onClick={() => {
                                    setSelectedLevelId(level.id);
                                    setSelectedLevelName(level.name);
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${(selectedLevelId === level.id)
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {level.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Table Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-700">Materias ({filteredCourses.length})</h3>
                            <button
                                onClick={() => handleOpenModal()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Nueva Materia
                            </button>
                        </div>

                        {/* Table */}
                        <table className="w-full text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                                <tr>
                                    <th
                                        className="px-6 py-3 font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Materia
                                            {sortConfig.key === 'name' && (
                                                <span className="text-blue-600">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => handleSort('code')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Código
                                            {sortConfig.key === 'code' && (
                                                <span className="text-blue-600">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => handleSort('grade')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Grado/Grupo
                                            {sortConfig.key === 'grade' && (
                                                <span className="text-blue-600">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 font-semibold">Horario</th>
                                    <th className="px-6 py-3 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedCourses.map(course => (
                                    <tr key={course.id} className="hover:bg-gray-50 group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{course.name}</div>
                                            <div className="text-xs text-gray-500">{course.credits} Créditos • {teachers.find(t => t.id === course.teacherId)?.fullName || 'Sin Docente'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-mono text-sm">
                                            {course.code || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-700 py-1 px-2.5 rounded text-xs font-semibold border border-gray-200">
                                                {course.grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {course.scheduleDays ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-blue-600">{course.scheduleDays}</span>
                                                    <div className="flex items-center gap-1 text-xs">
                                                        <Clock size={12} />
                                                        {formatTime(course.startTime)} - {formatTime(course.endTime)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">No asignado</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal(course)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600"><MoreHorizontal size={18} /></button>
                                                <button onClick={() => handleDelete(course.id)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCourses.length === 0 && (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No se encontraron materias</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="mt-4 px-6 py-4 border-t border-gray-200 bg-white rounded-xl shadow-sm flex items-center justify-between flex-shrink-0">
                            <div className="text-sm text-gray-500">
                                Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredCourses.length)}</span> de <span className="font-medium">{filteredCourses.length}</span> resultados
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    Anterior
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 rounded text-sm ${currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'border border-gray-300 hover:bg-gray-100'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Drawer / Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-end">
                    <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar Materia' : 'Nueva Materia'}</h2>
                                <p className="text-sm text-gray-500">Completa los datos para dar de alta la asignatura.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* General Info */}
                            <section>
                                <div className="flex items-center gap-2 mb-4 text-blue-600 font-semibold text-sm uppercase tracking-wider">
                                    <BookOpen size={16} />
                                    Información General
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Materia</label>
                                        <input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Ej: Física Cuántica"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                                            <input
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                                                placeholder="FIS-101"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Créditos</label>
                                            <input
                                                value={formData.credits}
                                                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                                                type="number"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Académico</label>
                                        <select
                                            value={formData.levelId}
                                            onChange={(e) => setFormData({ ...formData, levelId: e.target.value, selectedGroups: [] })} // Reset groups on level change
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none bg-white"
                                        >
                                            <option value="">Seleccionar nivel...</option>
                                            {levels.map(l => (
                                                <option key={l.id} value={l.id}>{l.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Campo Formativo</label>
                                            <select
                                                value={formData.formativeFieldId}
                                                onChange={(e) => setFormData({ ...formData, formativeFieldId: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none bg-white"
                                            >
                                                <option value="">Independiente / Sin campo...</option>
                                                {formativeFields.map(f => (
                                                    <option key={f.id} value={f.id}>{f.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center mt-6">
                                            <input
                                                type="checkbox"
                                                id="isComplementary"
                                                checked={formData.isComplementary}
                                                onChange={(e) => setFormData({ ...formData, isComplementary: e.target.checked })}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300"
                                            />
                                            <label htmlFor="isComplementary" className="ml-2 text-sm text-gray-700">
                                                Materia Complementaria
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Assignment */}
                            <section>
                                <div className="flex items-center gap-2 mb-4 text-blue-600 font-semibold text-sm uppercase tracking-wider">
                                    <Users size={16} />
                                    Asignación
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Docente Titular</label>
                                        <select
                                            value={formData.teacherId}
                                            onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none bg-white"
                                        >
                                            <option value="">Seleccionar docente...</option>
                                            {teachers.map(t => (
                                                <option key={t.id} value={t.id}>{t.fullName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {!isEditing && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Grupos Asignados</label>
                                            <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
                                                {getAvailableGroups().length === 0 ? (
                                                    <p className="text-xs text-gray-500 italic">Seleccione un nivel primero.</p>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {getAvailableGroups().map(group => (
                                                            <button
                                                                key={group.id}
                                                                onClick={() => toggleGroup(group.label)}
                                                                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 ${formData.selectedGroups.includes(group.label)
                                                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                                                                    }`}
                                                            >
                                                                {group.label}
                                                                {formData.selectedGroups.includes(group.label) && <X size={12} />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Schedule */}
                            <section>
                                <div className="flex items-center gap-2 mb-4 text-blue-600 font-semibold text-sm uppercase tracking-wider">
                                    <Clock size={16} />
                                    Configurar Horario
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-2 justify-center">
                                        {['L', 'M', 'Mi', 'J', 'V', 'S'].map(day => (
                                            <button
                                                key={day}
                                                onClick={() => toggleDay(day)}
                                                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${formData.scheduleDays.includes(day)
                                                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Entrada</label>
                                            <input
                                                type="time"
                                                value={formData.startTime}
                                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none text-center font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Salida</label>
                                            <input
                                                type="time"
                                                value={formData.endTime}
                                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none text-center font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3 sticky bottom-0 z-10">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                            >
                                Guardar Materia
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectManagementNew;
