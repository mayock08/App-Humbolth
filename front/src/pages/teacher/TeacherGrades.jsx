import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, Edit2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';

import { API_BASE_URL } from '../../config';

const TeacherGrades = () => {
    const location = useLocation();
    const [activePeriod, setActivePeriod] = useState(null);
    const [courses, setCourses] = useState([]);


    const [selectedCourse, setSelectedCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [editingCell, setEditingCell] = useState(null);
    const [grades, setGrades] = useState({});
    const [loading, setLoading] = useState(false);

    const [evaluations, setEvaluations] = useState([]);

    const teacherId = localStorage.getItem('userId');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            // 1. Fetch Active Period
            const periodRes = await fetch(`${API_BASE_URL}/SchoolPeriods/active`);
            let currentPeriod = null;

            if (periodRes.ok) {
                currentPeriod = await periodRes.json();
                setActivePeriod(currentPeriod);
            }

            // 2. Fetch Teacher Courses
            if (teacherId) {
                const response = await fetch(`${API_BASE_URL}/Teachers/${teacherId}`);
                if (response.ok) {
                    const data = await response.json();
                    const coursesList = data.courses || [];


                    // Filter by Active Period
                    let filtered = coursesList;
                    if (currentPeriod && currentPeriod.id) {
                        const periodCourses = coursesList.filter(c => c.periodId === currentPeriod.id || c.periodId === null);
                        filtered = periodCourses;
                    }
                    setCourses(filtered);

                    // Check if course was passed via routing state
                    if (filtered.length > 0) {
                        const preselectedCourseId = location.state?.courseId;
                        let initialCourse = filtered[0];
                        if (preselectedCourseId) {
                            const found = filtered.find(c => c.id === preselectedCourseId);
                            if (found) {
                                initialCourse = found;
                            }
                        }
                        setSelectedCourse(initialCourse);
                        fetchCourseData(initialCourse.id);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching initial data:', err);
        } finally {
            setLoading(false);
        }
    };





    const fetchCourseData = async (courseId) => {
        setLoading(true);
        try {
            // Determine filtering parameters from selected group
            let queryParams = `courseId=${courseId}`;

            // Group logic removed as per new requirements to match TeacherActivities
            // We now strictly use courseId.


            // 1. Fetch Students
            // Now that we select a specific course, we should fetch students for that course.
            // If the API supports filtering by courseId directly for students, we use that.
            // Assuming obscure logic about "group" is no longer the primary driver if we have a courseId.
            // However, sticking to previous behavior where we might want all students in group?
            // The prompt says "fill it according to the id of the subject".
            // So we trust courseId.

            // Construct query params
            // If we have a selected Group, we might still want to filter by it if the course is shared across groups?
            // But usually a Course entity matches a specific group/grade.
            // Let's try fetching by courseId if available.

            // If the backend endpoint /StudentProfile/List supports courseId:
            let fetchUrl = `${API_BASE_URL}/StudentProfile/List?courseId=${courseId}`;



            console.log('Fetching students with url:', fetchUrl);

            const studentsRes = await fetch(fetchUrl);
            let studentsData = [];
            if (studentsRes.ok) {
                studentsData = await studentsRes.json();
                setStudents(studentsData);
            } else {
                console.error('Error fetching students:', studentsRes.status);
            }

            // 2. Fetch Criteria & Evaluations
            const criteriaRes = await fetch(`${API_BASE_URL}/CourseGrading/criteria/course/${courseId}`);
            let courseEvaluations = [];

            if (criteriaRes.ok) {
                const criteriaData = await criteriaRes.json();

                // Fetch evaluations for each criteria
                const evalsPromises = criteriaData.map(c =>
                    fetch(`${API_BASE_URL}/CourseGrading/evaluations/criteria/${c.id}`).then(r => r.json())
                );

                const evalsResults = await Promise.all(evalsPromises);
                courseEvaluations = evalsResults.flat();

                // Sort evaluations by date or title
                courseEvaluations.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
                setEvaluations(courseEvaluations);
            }

            // 3. Fetch Existing Grades for these evaluations
            const currentGrades = {};
            // Initialize with students
            studentsData.forEach(s => {
                currentGrades[s.id] = {};
                courseEvaluations.forEach(e => {
                    currentGrades[s.id][e.id] = 0; // Default
                });
            });

            // Fetch actual grades
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

    const handleCourseSelect = (course) => {
        if (!course) {
            setSelectedCourse(null);
            setStudents([]);
            setEvaluations([]);
            return;
        }
        setSelectedCourse(course);
        fetchCourseData(course.id);
    };

    const handleGradeChange = (studentId, evaluationId, value) => {
        const numValue = parseFloat(value);
        // Allow empty string for clearing, but store 0 or value
        // If NaN (invalid input), don't update or handle gracefully

        setGrades(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [evaluationId]: isNaN(numValue) ? value : numValue
            }
        }));
    };

    const calculateAverage = (studentId) => {
        const studentGrades = grades[studentId];
        if (!studentGrades || evaluations.length === 0) return 0;

        let totalScore = 0;
        let totalMaxScore = 0;

        evaluations.forEach(ev => {
            const score = parseFloat(studentGrades[ev.id]) || 0;
            totalScore += score;
            totalMaxScore += ev.maxScore;
        });

        // Simple percentage average or weighted? 
        // For now, let's do sum of scores / sum of max scores * 10 
        // OR just sum if max score is not available (but it is).

        if (totalMaxScore === 0) return 0;
        return ((totalScore / totalMaxScore) * 10).toFixed(1);
    };

    const handleSaveGrades = async () => {
        setLoading(true);
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
                alert('Calificaciones guardadas exitosamente');
            } else {
                alert('Error al guardar calificaciones');
            }
        } catch (err) {
            console.error('Error saving grades:', err);
            alert('Error al guardar calificaciones');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Gestión de Calificaciones</h1>
                    <p className="text-xs text-gray-500">Administre las calificaciones de sus materias</p>
                </div>

                {/* Group Selector */}
                {/* Group Selector Removed - Using Active Period Filter */}
                <div className="flex items-center gap-2">
                    {activePeriod && (
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                            Ciclo: {activePeriod.name}
                        </span>
                    )}
                </div>
            </div>

            {/* Course Selector */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Seleccione una Materia</label>
                <div className="relative">
                    <select
                        value={selectedCourse ? selectedCourse.id : ''}
                        onChange={(e) => {
                            const courseId = parseInt(e.target.value);
                            const course = courses.find(c => c.id === courseId);
                            if (course) {
                                handleCourseSelect(course);
                            } else {
                                setSelectedCourse(null);
                                setStudents([]);
                                setEvaluations([]);
                            }
                        }}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm appearance-none"
                    >
                        <option value="">-- Seleccione una Materia --</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>
                                {course.name} ({course.grade} - {course.group})
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>

            {/* Grades Table (Visible if Course Selected) */}
            {selectedCourse ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{selectedCourse.name} <span className="text-gray-500 font-normal text-base ml-2">{selectedCourse.grade} {selectedCourse.group}</span></h3>
                            <p className="text-sm text-gray-500">{students.length} estudiantes inscritos</p>
                        </div>
                        <button
                            onClick={handleSaveGrades}
                            disabled={loading}
                            className="px-4 py-2 text-sm bg-primary text-white rounded font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save size={16} />
                            {loading ? 'Guardando...' : 'Guardar Calificaciones'}
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10 border-b border-gray-200">Estudiante</th>
                                    {evaluations.map(ev => (
                                        <th key={ev.id} className="px-4 py-3 text-center font-semibold text-gray-700 min-w-[120px] border-b border-gray-200">
                                            <div className="flex flex-col">
                                                <span>{ev.title}</span>
                                                <span className="text-xs font-normal text-gray-500">Max: {ev.maxScore}</span>
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 border-b border-gray-200">Promedio</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 border-b border-gray-200">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {students.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 sticky left-0 bg-white hover:bg-gray-50 z-10 border-r border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                                                    {student.fullName.charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-900">{student.fullName}</span>
                                            </div>
                                        </td>
                                        {evaluations.map(ev => (
                                            <td key={ev.id} className="px-4 py-3 text-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={ev.maxScore}
                                                    step="0.1"
                                                    value={grades[student.id]?.[ev.id] ?? ''}
                                                    onChange={(e) => handleGradeChange(student.id, ev.id, e.target.value)}
                                                    className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                                                    placeholder="-"
                                                />
                                            </td>
                                        ))}
                                        <td className="px-4 py-3 text-center font-bold text-gray-800">
                                            {calculateAverage(student.id)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${parseFloat(calculateAverage(student.id)) >= 6
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {parseFloat(calculateAverage(student.id)) >= 6 ? 'Aprobado' : 'Reprobado'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {students.length === 0 && (
                                    <tr>
                                        <td colSpan={evaluations.length + 3} className="text-center py-8 text-gray-500">
                                            <p className="mb-2">No hay estudiantes inscritos en este grupo.</p>
                                        </td>
                                    </tr>
                                )}
                                {evaluations.length === 0 && students.length > 0 && (
                                    <tr>
                                        <td colSpan="100%" className="text-center py-8 text-gray-500">
                                            <p>No hay actividades de evaluación configuradas.</p>
                                            <p className="text-xs mt-1">Vaya a "Actividades" para crear criterios de evaluación.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                    <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Seleccione una Materia</h3>
                    <p className="text-gray-500">Elija una materia del menú superior para ver y editar calificaciones.</p>
                </div>
            )}
        </div>
    );
};

export default TeacherGrades;
