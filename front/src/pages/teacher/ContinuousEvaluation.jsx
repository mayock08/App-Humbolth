import React, { useState, useEffect } from 'react';
import {
    Save, Download, Filter, Search, MoreHorizontal,
    AlertTriangle, CheckCircle, XCircle, Users
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const ContinuousEvaluation = () => {
    // State for filters
    const [activePeriod, setActivePeriod] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');

    // State for data
    const [allCourses, setAllCourses] = useState([]); // All courses for the teacher in active period
    const [availableGroups, setAvailableGroups] = useState([]); // Unique groups derived from courses
    const [filteredCourses, setFilteredCourses] = useState([]); // Courses for selected group

    const [students, setStudents] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [criteria, setCriteria] = useState([]);
    const [grades, setGrades] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const teacherId = localStorage.getItem('userId');

    // 1. Initial Fetch (Period & Courses)
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            // Fetch Active Period
            const periodRes = await fetch(`${API_BASE_URL}/SchoolPeriods/active`);
            let currentPeriod = null;
            if (periodRes.ok) {
                currentPeriod = await periodRes.json();
                setActivePeriod(currentPeriod);
            }

            // Fetch Teacher Courses
            if (teacherId) {
                const response = await fetch(`${API_BASE_URL}/Teachers/${teacherId}`);
                if (response.ok) {
                    const data = await response.json();
                    let coursesList = data.courses || [];

                    // Filter by Active Period (or duplicate logic from TeacherGrades)
                    if (currentPeriod && currentPeriod.id) {
                        const periodCourses = coursesList.filter(c => c.periodId === currentPeriod.id || c.periodId === null);
                        if (periodCourses.length > 0) coursesList = periodCourses;
                    }

                    setAllCourses(coursesList);

                    // Derive Unique Groups
                    // Group format in Course: grade (string "1"), group (string "A")
                    // We want "1 - A"
                    const groupsMap = new Map();
                    coursesList.forEach(c => {
                        const groupKey = `${c.grade} - ${c.group}`;
                        if (!groupsMap.has(groupKey)) {
                            groupsMap.set(groupKey, {
                                label: groupKey,
                                grade: c.grade,
                                group: c.group
                            });
                        }
                    });
                    const uniqueGroups = Array.from(groupsMap.values()).sort((a, b) => a.label.localeCompare(b.label));
                    setAvailableGroups(uniqueGroups);

                    // Auto-select first group if available
                    if (uniqueGroups.length > 0) {
                        setSelectedGroup(uniqueGroups[0].label);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching initial data:', err);
        } finally {
            setLoading(false);
        }
    };

    // 2. Filter Courses when Group Changes
    useEffect(() => {
        if (selectedGroup && allCourses.length > 0) {
            // "1 - A" -> grade "1", group "A"
            // Simple string matching might be safer if we constructed the key carefully
            const filtered = allCourses.filter(c => `${c.grade} - ${c.group}` === selectedGroup);
            setFilteredCourses(filtered);

            // Auto-select first course in group
            if (filtered.length > 0) {
                setSelectedCourseId(filtered[0].id);
            } else {
                setSelectedCourseId('');
            }
        } else {
            setFilteredCourses([]);
            setSelectedCourseId('');
        }
    }, [selectedGroup, allCourses]);

    // 3. Fetch Course Data (Students, Evals, Grades) when Course Changes
    useEffect(() => {
        if (selectedCourseId) {
            fetchCourseData(selectedCourseId);
        } else {
            setStudents([]);
            setEvaluations([]);
            setCriteria([]);
            setGrades({});
        }
    }, [selectedCourseId]);

    const fetchCourseData = async (courseId) => {
        setLoading(true);
        try {
            // A. Fetch Students
            const studentsRes = await fetch(`${API_BASE_URL}/StudentProfile/List?courseId=${courseId}`);
            let studentsData = [];
            if (studentsRes.ok) {
                studentsData = await studentsRes.json();
                setStudents(studentsData);
            }

            // B. Fetch Criteria & Evaluations
            const criteriaRes = await fetch(`${API_BASE_URL}/CourseGrading/criteria/course/${courseId}`);
            let courseEvaluations = [];
            if (criteriaRes.ok) {
                const criteriaData = await criteriaRes.json();
                setCriteria(criteriaData);
                const evalsPromises = criteriaData.map(async c => {
                    const response = await fetch(`${API_BASE_URL}/CourseGrading/evaluations/criteria/${c.id}`);
                    const evals = await response.json();
                    return evals.map(e => ({
                        ...e,
                        criteriaId: c.id,
                        criteriaWeight: c.weightPercentage,
                        criteriaName: c.componentType
                    }));
                });
                const evalsResults = await Promise.all(evalsPromises);
                courseEvaluations = evalsResults.flat();
                // Sort by date
                courseEvaluations.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
                setEvaluations(courseEvaluations);
            }

            // C. Fetch Existing Grades
            // Initialize default structure
            const currentGrades = {};
            studentsData.forEach(s => {
                currentGrades[s.id] = {};
                courseEvaluations.forEach(e => {
                    currentGrades[s.id][e.id] = 0;
                });
            });

            const gradePromises = courseEvaluations.map(e =>
                fetch(`${API_BASE_URL}/StudentGrades/evaluation/${e.id}`).then(r => r.json())
            );
            const gradesResults = await Promise.all(gradePromises);

            gradesResults.flat().forEach(grade => {
                if (currentGrades[grade.studentId]) {
                    currentGrades[grade.studentId][grade.evaluationId] = grade.score;
                }
            });
            setGrades(currentGrades);

        } catch (err) {
            console.error('Error fetching course data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGradeChange = (studentId, evaluationId, value) => {
        const numValue = parseFloat(value);
        setGrades(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [evaluationId]: isNaN(numValue) ? value : numValue
            }
        }));
    };

    const handleSaveGrades = async () => {
        setSaving(true);
        try {
            const bulkPayload = [];
            Object.keys(grades).forEach(studentId => {
                const studentGrades = grades[studentId];
                Object.keys(studentGrades).forEach(evalId => {
                    bulkPayload.push({
                        studentId: parseInt(studentId),
                        evaluationId: parseInt(evalId),
                        score: parseFloat(studentGrades[evalId]) || 0,
                        feedback: ""
                    });
                });
            });

            const response = await fetch(`${API_BASE_URL}/StudentGrades/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bulkPayload)
            });

            if (response.ok) {
                alert('Cambios guardados exitosamente');
            } else {
                alert('Error al guardar cambios');
            }
        } catch (err) {
            console.error('Error saving grades:', err);
            alert('Error al guardar cambios');
        } finally {
            setSaving(false);
        }
    };

    // Helper Functions
    const calculateAverage = (studentId) => {
        const studentGrades = grades[studentId];
        if (!studentGrades || evaluations.length === 0) return 0;

        const criteriaScores = {};

        evaluations.forEach(ev => {
            const score = parseFloat(studentGrades[ev.id]) || 0;
            const maxScore = ev.maxScore || 10;
            const cid = ev.criteriaId;

            if (!criteriaScores[cid]) {
                criteriaScores[cid] = { totalScore: 0, totalMax: 0, weight: ev.criteriaWeight || 0 };
            }

            criteriaScores[cid].totalScore += score;
            criteriaScores[cid].totalMax += maxScore;
        });

        let finalGrade = 0;
        Object.values(criteriaScores).forEach(crit => {
            if (crit.totalMax > 0) {
                const criteriaGrade = (crit.totalScore / crit.totalMax) * 10;
                finalGrade += criteriaGrade * (crit.weight / 100);
            }
        });

        return finalGrade.toFixed(1);
    };

    const getGradeColor = (grade) => {
        if (grade >= 7) return 'text-green-600 bg-green-50 border-green-200';
        if (grade >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    // Derived Stats
    const stats = {
        total: students.length,
        approved: students.filter(s => calculateAverage(s.id) >= 7).length,
        risk: students.filter(s => calculateAverage(s.id) >= 6 && calculateAverage(s.id) < 7).length,
        failed: students.filter(s => calculateAverage(s.id) < 6).length,
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Evaluación Continua</h1>
                    <p className="text-gray-500">Gestiona y califica el desempeño académico en tiempo real.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                        <Download size={18} />
                        Exportar Excel
                    </button>
                    <button
                        onClick={handleSaveGrades}
                        disabled={saving || loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-6 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto items-center">
                    <div className="flex items-center gap-2 text-gray-500 font-medium mr-2">
                        <Filter size={20} />
                        <span className="text-sm tracking-wide uppercase">Filtros</span>
                    </div>

                    {/* Period Selector */}
                    <div className="w-full md:w-56">
                        <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Periodo</label>
                        <div className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg p-2.5 font-medium flex items-center justify-between">
                            <span>{activePeriod ? activePeriod.name : 'Cargando...'}</span>
                        </div>
                    </div>

                    {/* Group Selector */}
                    <div className="w-full md:w-48">
                        <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Grupo</label>
                        <select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-medium"
                        >
                            {availableGroups.length === 0 && <option value="">Sin grupos</option>}
                            {availableGroups.map(g => (
                                <option key={g.label} value={g.label}>{g.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Subject Selector */}
                    <div className="w-full md:w-64">
                        <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Materia</label>
                        <select
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-medium"
                        >
                            {filteredCourses.length === 0 && <option value="">Sin materias</option>}
                            {filteredCourses.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 pl-0 lg:pl-6 w-full lg:w-auto justify-between lg:justify-end">
                    <div className="text-right">
                        <p className="text-xs text-gray-400 font-semibold uppercase">Promedio Grupal</p>
                        {/* Calculate group average */}
                        <p className="text-2xl font-bold text-blue-600">
                            {students.length > 0
                                ? (students.reduce((acc, s) => acc + parseFloat(calculateAverage(s.id)), 0) / students.length).toFixed(1)
                                : '0.0'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Criteria Progress Bar */}
            {criteria.length > 0 && selectedCourseId && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Criterios de Evaluación</h3>

                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                            {criteria.map((crit, idx) => (
                                <div
                                    key={crit.id}
                                    className={`h-full ${['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'][idx % 4]}`}
                                    style={{ width: `${crit.weightPercentage}%` }}
                                    title={`${crit.componentType}: ${crit.weightPercentage}%`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>Total asignado: {criteria.reduce((acc, curr) => acc + curr.weightPercentage, 0)}%</span>
                            <span>Meta: 100%</span>
                        </div>
                    </div>

                    {/* Criteria Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {criteria.map((crit, idx) => (
                            <div key={crit.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                                <h4 className="font-bold text-gray-800">{crit.componentType}</h4>
                                <div className="text-3xl font-black text-blue-600 my-2">{crit.weightPercentage}%</div>
                                <p className="text-xs text-gray-500 truncate">{crit.description || 'Sin descripción'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                    <div className="relative w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2"
                            placeholder="Buscar alumno..."
                        />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            <span>Aprobado ({'>'}7.0)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                            <span>Riesgo (6.0 - 6.9)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span>Reprobado ({'<'}6.0)</span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[300px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-full py-20 text-gray-400">
                            Cargando datos...
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold w-64 min-w-[250px] sticky left-0 bg-gray-50 z-20">Nombre del Estudiante</th>
                                    {evaluations.map(ev => (
                                        <th key={ev.id} className="px-4 py-3 text-center min-w-[120px]">
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-gray-700">{ev.title}</span>
                                                <span className="text-[10px] text-gray-400 mt-0.5 italic whitespace-nowrap">
                                                    {ev.criteriaName} ({ev.criteriaWeight}%)
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-center min-w-[100px] bg-blue-50/30">
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-blue-700">Promedio</span>
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-center w-20">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {students.length === 0 && (
                                    <tr><td colSpan="100%" className="text-center py-10 text-gray-500">No hay estudiantes</td></tr>
                                )}
                                {students.map((student) => {
                                    const avg = calculateAverage(student.id);
                                    return (
                                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-gray-900 bg-white group-hover:bg-gray-50/50 sticky left-0 z-10 border-r border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                                                        {student.fullName.charAt(0)}
                                                    </div>
                                                    <span>{student.fullName}</span>
                                                </div>
                                            </td>
                                            {evaluations.map(ev => (
                                                <td key={ev.id} className="px-4 py-3 text-center">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={ev.maxScore}
                                                        value={grades[student.id]?.[ev.id] ?? ''}
                                                        onChange={(e) => handleGradeChange(student.id, ev.id, e.target.value)}
                                                        className={`w-16 text-center font-bold py-1.5 rounded-md border text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${grades[student.id]?.[ev.id] ? getGradeColor(grades[student.id][ev.id]) : 'border-gray-300'
                                                            }`}
                                                    />
                                                </td>
                                            ))}
                                            <td className="px-4 py-3 text-center bg-blue-50/30 font-bold text-blue-700 text-lg">
                                                {avg}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Mostrando {students.length} estudiantes</span>
                </div>
            </div>

            {/* Stats Cards (Bottom) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Alumnos Inscritos</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Aprobados</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.risk}</p>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">En Riesgo</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <XCircle size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Reprobados</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContinuousEvaluation;
