import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronLeft, MoreHorizontal, ChevronRight, Eye, UserPlus, FileText, X, Camera } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { Link } from 'react-router-dom';
import StudentDocuments from './StudentDocuments';
import PhotoUploadModal from '../../components/PhotoUploadModal';
import SecureImage from '../../components/SecureImage';

const StudentsList = () => {
    const { t } = useTranslation();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Document Review State
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showDocsModal, setShowDocsModal] = useState(false);

    // Photo Modal State
    const [selectedPhotoStudent, setSelectedPhotoStudent] = useState(null);
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchStudents();
    }, [page, debouncedSearch]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `${API_BASE_URL}/Students?page=${page}&pageSize=10`;
            if (debouncedSearch) {
                url += `&search=${encodeURIComponent(debouncedSearch)}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStudents(data);
                const totalPagesHeader = response.headers.get('X-Total-Pages');
                if (totalPagesHeader) {
                    setTotalPages(parseInt(totalPagesHeader));
                }
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDocs = (student) => {
        setSelectedStudent(student);
        setShowDocsModal(true);
    };

    const handleManagePhoto = (student) => {
        setSelectedPhotoStudent(student);
        setShowPhotoModal(true);
    };

    const handlePhotoSuccess = (newUrl) => {
        setStudents(prev => prev.map(s => s.id === selectedPhotoStudent.id ? { ...s, photoUrl: newUrl } : s));
        setShowPhotoModal(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Directorio de Alumnos</h2>
                <Link to="/admin/students/add" className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
                    <UserPlus size={20} />
                    <span>Nuevo Alumno</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o matrícula..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matrícula</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Cargando estudiantes...
                                    </td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron estudiantes
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-primary font-bold overflow-hidden border border-blue-200">
                                                    {student.photoUrl ? (
                                                        <SecureImage src={student.photoUrl} alt="Estudiante" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{student.firstName[0]}{student.paternalSurname[0]}</span>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {student.firstName} {student.paternalSurname} {student.maternalSurname}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.matricula || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.group ? `${student.group.grade?.name} ${student.group.name}` : 'Sin Grupo'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                            <button
                                                onClick={() => handleManagePhoto(student)}
                                                className="text-gray-600 hover:text-blue-700 bg-gray-50 hover:bg-blue-50 p-2 rounded-lg inline-flex items-center gap-1 transition-colors"
                                                title="Fotografía"
                                            >
                                                <Camera size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleViewDocs(student)}
                                                className="text-gray-600 hover:text-blue-700 bg-gray-50 hover:bg-blue-50 p-2 rounded-lg inline-flex items-center gap-1 transition-colors"
                                                title="Documentación"
                                            >
                                                <FileText size={16} />
                                            </button>
                                            <Link
                                                to={`/student/profile/${student.id}`}
                                                className="text-primary hover:text-blue-700 bg-blue-50 p-2 rounded-lg inline-flex items-center gap-1 transition-colors"
                                                title="Ver Perfil"
                                            >
                                                <Eye size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        Página {page} de {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Documents Modal */}
            {showDocsModal && selectedStudent && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Documentación del Estudiante</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedStudent.firstName} {selectedStudent.paternalSurname} - {selectedStudent.matricula || 'Sin Matrícula'}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDocsModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <StudentDocuments
                                studentId={selectedStudent.id}
                                onFinish={() => setShowDocsModal(false)}
                                isAdmin={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Modal */}
            {showPhotoModal && selectedPhotoStudent && (
                <PhotoUploadModal
                    entityId={selectedPhotoStudent.id}
                    entityType="student"
                    currentPhotoUrl={selectedPhotoStudent.photoUrl}
                    onClose={() => setShowPhotoModal(false)}
                    onSuccess={handlePhotoSuccess}
                />
            )}
        </div>
    );
};

export default StudentsList;
