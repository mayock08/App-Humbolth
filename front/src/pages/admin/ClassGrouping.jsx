import React, { useState, useEffect } from 'react';
import {
    Users,
    MoreHorizontal,
    Plus,
    FileText,
    AlertCircle,
    Search,
    X,
    Save,
    Edit2
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const ClassGrouping = () => {
    // State
    const [unassignedStudents, setUnassignedStudents] = useState([]);
    const [groups, setGroups] = useState([]);
    const [levels, setLevels] = useState([]); // For Create Group Modal
    const [teachers, setTeachers] = useState([]); // For Assign Teacher Modal
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [draggedStudent, setDraggedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter State
    const [selectedGroupFilter, setSelectedGroupFilter] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [newGroupData, setNewGroupData] = useState({ gradeId: '', name: '' });

    // List Modal State
    const [showListModal, setShowListModal] = useState(false);
    const [selectedGroupForList, setSelectedGroupForList] = useState(null);

    // Teacher Modal State
    const [showTeacherModal, setShowTeacherModal] = useState(false);
    const [selectedGroupForTeacher, setSelectedGroupForTeacher] = useState(null);
    const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);

    const handleOpenListModal = (group) => {
        setSelectedGroupForList(group);
        setShowListModal(true);
    };

    const handleOpenTeacherModal = (group) => {
        setSelectedGroupForTeacher(group);
        // Map existing groupTeachers to IDs if available, or fallback to teacherId (legacy)
        const currentIds = group.groupTeachers && group.groupTeachers.length > 0
            ? group.groupTeachers.map(gt => gt.teacherId.toString())
            : (group.teacherId ? [group.teacherId.toString()] : []);
        setSelectedTeacherIds(currentIds);
        setShowTeacherModal(true);
    };

    // Initial Load
    useEffect(() => {
        fetchData();
        fetchLevels();
        fetchTeachers();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await Promise.all([
                fetchUnassignedStudents(token),
                fetchGroups(token),
                fetchLevels(token),
                fetchTeachers(token)
            ]);
        } catch (err) {
            console.error(err);
            setError('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnassignedStudents = async (token) => {
        if (!token) token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/Students?groupId=0&pageSize=100`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            setUnassignedStudents(data);
        }
    };

    const fetchGroups = async (token) => {
        if (!token) token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/SchoolGroups`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            setGroups(data);
        }
    };

    const fetchLevels = async (token) => {
        if (!token) token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/SchoolLevels`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            setLevels(data);
        }
    };

    const fetchTeachers = async (token) => {
        if (!token) token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/Teachers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            setTeachers(data);
        }
    };

    // Drag & Drop Handlers
    const handleDragStart = (e, student) => {
        setDraggedStudent(student);
        e.dataTransfer.setData('studentId', student.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, targetGroupId) => {
        e.preventDefault();
        const studentId = e.dataTransfer.getData('studentId');

        if (!studentId || !draggedStudent) return;

        // Optimistic Update
        const student = draggedStudent;

        // Remove from source
        setUnassignedStudents(prev => prev.filter(s => s.id !== student.id));

        // Add to target group locally for instant feedback
        setGroups(prev => prev.map(g => {
            if (g.id === targetGroupId) {
                return { ...g, students: [...(g.students || []), student] };
            }
            return g;
        }));

        setDraggedStudent(null);

        // API Call
        try {
            const studentResp = await fetch(`${API_BASE_URL}/Students/${studentId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!studentResp.ok) throw new Error('Failed to fetch student for update');
            const studentData = await studentResp.json();

            const updatedStudent = { ...studentData, groupId: targetGroupId };

            const updateResp = await fetch(`${API_BASE_URL}/Students/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updatedStudent)
            });

            if (!updateResp.ok) {
                throw new Error('Failed to assign group');
            }

            // Refresh to ensure sync
            fetchUnassignedStudents();
            fetchGroups();

        } catch (err) {
            console.error('Drop error:', err);
            setError('Error al asignar grupo. Revertiendo...');
            fetchData(); // Revert on error
        }
    };

    // Create Group Logic
    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/SchoolGroups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    gradeId: parseInt(newGroupData.gradeId),
                    name: newGroupData.name
                })
            });

            if (response.ok) {
                setShowModal(false);
                setNewGroupData({ gradeId: '', name: '' });
                fetchGroups();
            } else {
                alert('Error al crear grupo');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Assign Teacher Logic
    const handleAssignTeacher = async (e) => {
        e.preventDefault();
        if (!selectedGroupForTeacher) return;

        try {
            // Construct groupTeachers list
            // First selected is "Titular", others "Auxiliar"
            const groupTeachers = selectedTeacherIds.map((id, index) => ({
                teacherId: parseInt(id),
                role: index === 0 ? "Titular" : "Auxiliar"
            }));

            const payload = {
                id: selectedGroupForTeacher.id,
                gradeId: selectedGroupForTeacher.gradeId,
                name: selectedGroupForTeacher.name,
                groupTeachers: groupTeachers,
                createdAt: selectedGroupForTeacher.createdAt
            };

            const response = await fetch(`${API_BASE_URL}/SchoolGroups/${selectedGroupForTeacher.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setShowTeacherModal(false);
                fetchGroups();
            } else {
                const errorText = await response.text();
                alert('Error al asignar maestros: ' + errorText);
            }
        } catch (err) {
            console.error(err);
            alert('Error al asignar maestros: ' + err.message);
        }
    };


    // Filter Logic
    const filteredGroups = groups.filter(group => {
        if (!selectedGroupFilter) return true;
        return group.id === parseInt(selectedGroupFilter);
    });

    const filteredUnassigned = unassignedStudents.filter(s =>
        (s && (s.firstName || '') + ' ' + (s.paternalSurname || '')).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper: Calculate Gender Stats
    const getGenderStats = (studentsList) => {
        if (!studentsList) return { boys: 0, girls: 0, total: 0 };
        const boys = studentsList.filter(s => s.gender === 'Masculino').length;
        const girls = studentsList.filter(s => s.gender === 'Femenino').length;
        return { boys, girls, total: studentsList.length };
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-6">
            {/* Left Panel: Unassigned Students */}
            <div className="w-full md:w-80 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-gray-800">Sin Grupo ({unassignedStudents.length})</h2>
                </div>

                {/* Search */}
                <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar alumno..."
                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-50 rounded-xl pl-9 pr-4 py-2 text-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Student List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {filteredUnassigned.map((student) => (
                        <div
                            key={student.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, student)}
                            className="p-3 border border-gray-100 rounded-xl hover:border-blue-400 hover:shadow-md cursor-grab active:cursor-grabbing bg-white group transition-all"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                    {student.firstName ? student.firstName[0] : ''}{student.paternalSurname ? student.paternalSurname[0] : ''}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800">{student.firstName} {student.paternalSurname}</h4>
                                    <p className="text-xs text-gray-400">{student.matricula || 'S/M'}</p>
                                    <p className="text-[10px] text-gray-500 font-medium">
                                        {student.educationLevel || 'N/A'} - {student.currentGrade || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredUnassigned.length === 0 && (
                        <p className="text-center text-sm text-gray-400 mt-4">No hay alumnos</p>
                    )}
                </div>
            </div>

            {/* Right Panel: Class Groups */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Asignación de Grupos</h1>
                        <p className="text-gray-500 text-sm">Arrastra alumnos a los grupos correspondientes</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        {/* Group Filter */}
                        <div className="relative">
                            <select
                                value={selectedGroupFilter}
                                onChange={(e) => setSelectedGroupFilter(e.target.value)}
                                className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-8 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 shadow-sm"
                            >
                                <option value="">Todos los Grupos</option>
                                {groups
                                    .filter(g => g && g.grade && g.grade.level) // Ensure data integrity
                                    .sort((a, b) => {
                                        // Sort by Level Name, then Grade Name, then Group Name
                                        const levelA = a.grade?.level?.id || 0;
                                        const levelB = b.grade?.level?.id || 0;

                                        if (levelA !== levelB) return levelA - levelB;

                                        const gradeA = a.grade?.name || '';
                                        const gradeB = b.grade?.name || '';
                                        const gradeComp = gradeA.localeCompare(gradeB, undefined, { numeric: true });
                                        if (gradeComp !== 0) return gradeComp;

                                        return (a.name || '').localeCompare(b.name || '');
                                    })
                                    .map(group => (
                                        <option key={group.id} value={group.id}>
                                            {group.grade?.level?.name || 'N/A'} - {group.grade?.name || 'N/A'} - {group.name || 'N/A'}
                                        </option>
                                    ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-md shadow-blue-200 transition-colors"
                        >
                            <Plus size={16} className="mr-2" /> Crear Grupo
                        </button>
                    </div>
                </div>

                {/* Grid of Classes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-8 p-1">

                    {filteredGroups.length === 0 && !loading && (
                        <div className="col-span-full py-10 text-center text-gray-400">
                            <p>No se encontraron grupos.</p>
                            <p className="text-xs mt-1">Intenta cambiar el filtro o crear uno nuevo.</p>
                        </div>
                    )}

                    {filteredGroups.map((group) => {
                        const stats = getGenderStats(group.students);
                        return (
                            <div
                                key={group.id}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, group.id)}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative group hover:shadow-md transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">Grupo {group.name}</h3>
                                        <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                                            ID: {group.id} • {group.grade?.level?.name} - {group.grade?.name}
                                        </p>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>

                                {/* Teacher Row */}
                                <div className="flex items-center justify-between gap-2 mb-4 p-2 bg-gray-50 rounded-lg group/teacher min-h-[60px]">
                                    <div className="flex items-center gap-2 w-full">
                                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <Users size={14} />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-xs text-gray-400 font-medium">Maestros Asignados</p>
                                            {group.groupTeachers && group.groupTeachers.length > 0 ? (
                                                <div className="flex flex-col gap-0.5">
                                                    {group.groupTeachers.slice(0, 2).map((gt, idx) => (
                                                        <div key={idx} className="flex items-center justify-between w-full">
                                                            <p className="text-sm font-semibold text-gray-700 truncate" title={gt.teacher?.fullName}>
                                                                {gt.teacher?.fullName?.split(' ')[0]} {gt.teacher?.fullName?.split(' ')[1]}
                                                            </p>
                                                            <span className="text-[9px] bg-white border border-gray-200 px-1.5 rounded-full text-gray-500 ml-1 flex-shrink-0">
                                                                {gt.role === 'Titular' ? 'TIT' : 'AUX'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {group.groupTeachers.length > 2 && (
                                                        <p className="text-[10px] text-blue-500 font-bold mt-0.5">+{group.groupTeachers.length - 2} más</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm font-semibold text-gray-700 truncate" title={group.teacher ? group.teacher.fullName : "Sin Asignar"}>
                                                    {group.teacher ? group.teacher.fullName : "Sin Asignar"}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleOpenTeacherModal(group)}
                                        className="flex-shrink-0 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors opacity-0 group-hover/teacher:opacity-100 self-start mt-1"
                                        title="Asignar Maestro"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                </div>

                                {/* Stats */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-gray-500">Alumnos</span>
                                        <span className="font-bold text-gray-900">{stats.total}</span>
                                    </div>
                                    <div className="flex w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${(stats.boys / (stats.total || 1)) * 100}%` }} title={`Niños: ${stats.boys}`}></div>
                                        <div className="h-full bg-pink-500" style={{ width: `${(stats.girls / (stats.total || 1)) * 100}%` }} title={`Niñas: ${stats.girls}`}></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                        <span>{stats.boys} Niños</span>
                                        <span>{stats.girls} Niñas</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                    <div className="text-xs text-gray-400 flex items-center">
                                        Arrastra estudiantes aquí
                                    </div>
                                    <button
                                        onClick={() => handleOpenListModal(group)}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        Ver Lista
                                    </button>
                                </div>
                            </div>
                        )
                    })}

                    {/* Create New Group Card (Shortcut) */}
                    <div
                        onClick={() => setShowModal(true)}
                        className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all min-h-[200px]"
                    >
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                            <Plus size={24} />
                        </div>
                        <h3 className="font-bold text-gray-600">Crear Nuevo Grupo</h3>
                    </div>
                </div>
            </div>

            {/* Create Group Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Crear Nuevo Grupo</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Grado Escolar</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={newGroupData.gradeId}
                                    onChange={(e) => setNewGroupData({ ...newGroupData, gradeId: e.target.value })}
                                    required
                                >
                                    <option value="">Selecciona un grado...</option>
                                    {levels.map(level => (
                                        <optgroup key={level.id} label={level.name}>
                                            {level.grades?.map(grade => (
                                                <option key={grade.id} value={grade.id}>{grade.name}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Grupo (Letra)</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Ej: A, B, C"
                                    value={newGroupData.name}
                                    onChange={(e) => setNewGroupData({ ...newGroupData, name: e.target.value })}
                                    required
                                    maxLength={10}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <Save size={16} />
                                    Guardar Grupo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Teacher Modal */}
            {showTeacherModal && selectedGroupForTeacher && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Asignar Maestro</h3>
                            <button onClick={() => setShowTeacherModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-1">Grupo seleccionado:</p>
                            <p className="font-bold text-gray-800">{selectedGroupForTeacher.name} - {selectedGroupForTeacher.grade?.name}</p>
                        </div>

                        <form onSubmit={handleAssignTeacher} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Maestros</label>
                                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                                    {teachers.map(teacher => (
                                        <label key={teacher.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                checked={selectedTeacherIds.includes(teacher.id.toString())}
                                                onChange={(e) => {
                                                    const idStr = teacher.id.toString();
                                                    if (e.target.checked) {
                                                        setSelectedTeacherIds(prev => [...prev, idStr]);
                                                    } else {
                                                        setSelectedTeacherIds(prev => prev.filter(id => id !== idStr));
                                                    }
                                                }}
                                            />
                                            <div className="flex-1 flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">{teacher.fullName}</span>
                                                {selectedTeacherIds.indexOf(teacher.id.toString()) === 0 && (
                                                    <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Titular</span>
                                                )}
                                                {selectedTeacherIds.indexOf(teacher.id.toString()) > 0 && (
                                                    <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">Auxiliar</span>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                    {teachers.length === 0 && (
                                        <p className="text-center text-sm text-gray-400 py-4">No hay maestros disponibles</p>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    * El primer maestro seleccionado será el Titular.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowTeacherModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <Save size={16} />
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List Students Modal */}
            {showListModal && selectedGroupForList && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Alumnos en Grupo {selectedGroupForList.name}</h3>
                                <p className="text-sm text-gray-500">Total: {selectedGroupForList.students?.length || 0} alumnos</p>
                            </div>
                            <button onClick={() => setShowListModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {selectedGroupForList.students && selectedGroupForList.students.length > 0 ? (
                                selectedGroupForList.students.map((student, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                {student.firstName?.[0]}{student.paternalSurname?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800 text-sm">{student.firstName} {student.paternalSurname} {student.maternalSurname}</p>
                                                <p className="text-xs text-gray-500">{student.matricula || 'Sin matrícula'}</p>
                                                <p className="text-[10px] text-gray-400">
                                                    {student.educationLevel} - {student.currentGrade}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    No hay alumnos en este grupo.
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowListModal(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassGrouping;
