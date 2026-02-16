import React, { useState, useEffect } from 'react';
import { BookOpen, Edit2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';

const TeacherGrades = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [editingCell, setEditingCell] = useState(null);
    const [grades, setGrades] = useState({});
    const [loading, setLoading] = useState(false);
    const [expandedCourse, setExpandedCourse] = useState(null);

    const teacherId = localStorage.getItem('userId');

    useEffect(() => {
        fetchTeacherCourses();
    }, []);

    const fetchTeacherCourses = async () => {
        try {
            const response = await fetch(`http://institutohumboldt.mx:8080/api/Courses?teacherId=${teacherId}`);
            if (response.ok) {
                const data = await response.json();
                setCourses(data);
            }
        } catch (err) {
            console.error('Error fetching courses:', err);
        }
    };

    const fetchCourseStudents = async (courseId) => {
        try {
            const response = await fetch(`http://institutohumboldt.mx:8080/api/StudentProfile/List?courseId=${courseId}`);
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
                // Initialize grades object
                const initialGrades = {};
                data.forEach(student => {
                    initialGrades[student.id] = {
                        parcial1: 0,
                        parcial2: 0,
                        parcial3: 0
                    };
                });
                setGrades(initialGrades);
            }
        } catch (err) {
            console.error('Error fetching students:', err);
        }
    };

    const handleCourseSelect = (course) => {
        if (expandedCourse === course.id) {
            setExpandedCourse(null);
            setSelectedCourse(null);
            setStudents([]);
        } else {
            setExpandedCourse(course.id);
            setSelectedCourse(course);
            fetchCourseStudents(course.id);
        }
    };

    const handleGradeChange = (studentId, parcial, value) => {
        const numValue = parseFloat(value) || 0;
        if (numValue >= 0 && numValue <= 10) {
            setGrades(prev => ({
                ...prev,
                [studentId]: {
                    ...prev[studentId],
                    [parcial]: numValue
                }
            }));
        }
    };

    const calculateAverage = (studentId) => {
        const studentGrades = grades[studentId];
        if (!studentGrades) return 0;
        const avg = (studentGrades.parcial1 + studentGrades.parcial2 + studentGrades.parcial3) / 3;
        return avg.toFixed(1);
    };

    const handleSaveGrades = async () => {
        setLoading(true);
        try {
            // Aquí iría la llamada al backend para guardar las calificaciones
            // Por ahora solo simulamos el guardado
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Calificaciones guardadas exitosamente');
        } catch (err) {
            console.error('Error saving grades:', err);
            alert('Error al guardar calificaciones');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-4">
                <h1 className="text-xl font-bold text-gray-900">Gestión de Calificaciones</h1>
                <p className="text-xs text-gray-500">Administre las calificaciones de sus materias</p>
            </div>

            {/* Courses List */}
            <div className="space-y-3">
                {courses.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                        <BookOpen className="mx-auto text-gray-400 mb-2" size={32} />
                        <p className="text-sm text-gray-500">No tiene materias asignadas</p>
                    </div>
                ) : (
                    courses.map(course => (
                        <div key={course.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            {/* Course Header */}
                            <button
                                onClick={() => handleCourseSelect(course)}
                                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded">
                                        <BookOpen className="text-primary" size={18} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-sm font-semibold text-gray-900">{course.name}</h3>
                                        <p className="text-xs text-gray-500">{course.grade} - {students.length} estudiantes</p>
                                    </div>
                                </div>
                                {expandedCourse === course.id ? (
                                    <ChevronUp size={20} className="text-gray-400" />
                                ) : (
                                    <ChevronDown size={20} className="text-gray-400" />
                                )}
                            </button>

                            {/* Students Grades Table */}
                            {expandedCourse === course.id && (
                                <div className="border-t border-gray-200">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Estudiante</th>
                                                    <th className="px-3 py-2 text-center font-semibold text-gray-700">Parcial 1</th>
                                                    <th className="px-3 py-2 text-center font-semibold text-gray-700">Parcial 2</th>
                                                    <th className="px-3 py-2 text-center font-semibold text-gray-700">Parcial 3</th>
                                                    <th className="px-3 py-2 text-center font-semibold text-gray-700">Promedio</th>
                                                    <th className="px-3 py-2 text-center font-semibold text-gray-700">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {students.map(student => (
                                                    <tr key={student.id} className="hover:bg-gray-50">
                                                        <td className="px-3 py-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                                                                    {student.fullName.charAt(0)}
                                                                </div>
                                                                <span className="font-medium text-gray-900">{student.fullName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="10"
                                                                step="0.1"
                                                                value={grades[student.id]?.parcial1 || ''}
                                                                onChange={(e) => handleGradeChange(student.id, 'parcial1', e.target.value)}
                                                                className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="10"
                                                                step="0.1"
                                                                value={grades[student.id]?.parcial2 || ''}
                                                                onChange={(e) => handleGradeChange(student.id, 'parcial2', e.target.value)}
                                                                className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="10"
                                                                step="0.1"
                                                                value={grades[student.id]?.parcial3 || ''}
                                                                onChange={(e) => handleGradeChange(student.id, 'parcial3', e.target.value)}
                                                                className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            <span className="font-semibold text-primary">
                                                                {calculateAverage(student.id)}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${parseFloat(calculateAverage(student.id)) >= 6
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                                }`}>
                                                                {parseFloat(calculateAverage(student.id)) >= 6 ? 'Aprobado' : 'Reprobado'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Save Button */}
                                    <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                                        <button
                                            onClick={handleSaveGrades}
                                            disabled={loading}
                                            className="px-4 py-2 text-sm bg-primary text-white rounded font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <Save size={16} />
                                            {loading ? 'Guardando...' : 'Guardar Calificaciones'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TeacherGrades;
