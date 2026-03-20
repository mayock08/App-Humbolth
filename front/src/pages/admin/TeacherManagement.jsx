import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    Key,
    Shield,
    X,
    Save,
    CheckCircle,
    AlertCircle,
    UserX,
    UserCheck,
    Mail,
    ToggleLeft,
    Phone,
    CreditCard,
    BookOpen,
    Camera
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import PhotoUploadModal from '../../components/PhotoUploadModal';
import SecureImage from '../../components/SecureImage';

const TeacherManagement = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
    const [currentTeacher, setCurrentTeacher] = useState(null);

    // Photo Modal state
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [selectedPhotoTeacher, setSelectedPhotoTeacher] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        fullName: '',
        matricula: '',
        email: '',
        phone: ''
    });

    // Access data
    const [accessData, setAccessData] = useState({
        password: '',
        confirmPassword: '',
        isActive: true
    });

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/Teachers`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setTeachers(data);
            } else {
                setError('Error al cargar profesores');
            }
        } catch (err) {
            setError('Error de conexión');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Search Filter ---
    const filteredTeachers = teachers.filter(t =>
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.matricula && t.matricula.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // --- Create / Edit Handlers ---
    const handleOpenForm = (teacher = null) => {
        if (teacher) {
            setCurrentTeacher(teacher);
            setFormData({
                fullName: teacher.fullName,
                matricula: teacher.matricula || '',
                email: teacher.email || '',
                phone: teacher.phone || ''
            });
        } else {
            setCurrentTeacher(null);
            setFormData({
                fullName: '',
                matricula: '',
                email: '',
                phone: ''
            });
        }
        setIsFormModalOpen(true);
        setError('');
    };

    const handleSaveTeacher = async (e) => {
        e.preventDefault();
        try {
            const url = currentTeacher
                ? `${API_BASE_URL}/Teachers/${currentTeacher.id}`
                : `${API_BASE_URL}/Teachers`;

            const method = currentTeacher ? 'PUT' : 'POST';

            const payload = { ...formData };
            if (currentTeacher) payload.id = currentTeacher.id;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                await fetchTeachers();
                setIsFormModalOpen(false);
            } else {
                setError('Error al guardar profesor');
            }
        } catch (err) {
            setError('Error al guardar: ' + err.message);
        }
    };

    // --- Access Management Handlers ---
    const handleOpenAccess = (teacher) => {
        setCurrentTeacher(teacher);
        setAccessData({
            password: '',
            confirmPassword: '',
            isActive: teacher.isActive !== undefined ? teacher.isActive : true
        });
        setIsAccessModalOpen(true);
        setError('');
    };

    const handleSaveAccess = async (e) => {
        e.preventDefault();
        if (accessData.password && accessData.password !== accessData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            // Update Status
            const statusResponse = await fetch(`${API_BASE_URL}/Teachers/${currentTeacher.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ isActive: accessData.isActive })
            });

            if (!statusResponse.ok) throw new Error('Error actualizando estado');

            // Update Password if provided
            if (accessData.password) {
                const credsResponse = await fetch(`${API_BASE_URL}/Teachers/${currentTeacher.id}/credentials`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ password: accessData.password })
                });

                if (!credsResponse.ok) throw new Error('Error actualizando contraseña');
            }

            await fetchTeachers();
            setIsAccessModalOpen(false);
        } catch (err) {
            setError(err.message);
        }
    };

    // --- Photo Management Handlers ---
    const handleManagePhoto = (teacher) => {
        setSelectedPhotoTeacher(teacher);
        setShowPhotoModal(true);
    };

    const handlePhotoSuccess = (newUrl) => {
        setTeachers(prev => prev.map(t => t.id === selectedPhotoTeacher.id ? { ...t, photoUrl: newUrl } : t));
        setShowPhotoModal(false);
    };

    // --- Subjects View Handlers ---
    const [isSubjectsModalOpen, setIsSubjectsModalOpen] = useState(false);
    const [teacherSubjects, setTeacherSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);

    const handleOpenSubjects = async (teacher) => {
        setCurrentTeacher(teacher);
        setIsSubjectsModalOpen(true);
        fetchTeacherSubjects(teacher.id);
    };

    const fetchTeacherSubjects = async (teacherId) => {
        setTeacherSubjects([]);
        setLoadingSubjects(true);
        try {
            const response = await fetch(`${API_BASE_URL}/Courses?teacherId=${teacherId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setTeacherSubjects(data);
            } else {
                setError('Error al cargar materias del profesor');
            }
        } catch (err) {
            console.error(err);
            setError('Error de conexión al cargar materias');
        } finally {
            setLoadingSubjects(false);
        }
    };

    const handleUnassignSubject = async (subject) => {
        if (!window.confirm(`¿Estás seguro de desasignar la materia "${subject.name}" de este profesor?`)) return;

        try {
            // Fetch current subject data first to preserve other fields
            const getRes = await fetch(`${API_BASE_URL}/Courses/${subject.id}`);
            if (!getRes.ok) throw new Error('Error recuperando datos de la materia');

            const currentSubjectData = await getRes.json();

            // Prepare payload with TeacherId = null
            // We must strip navigation properties to avoid validation errors (e.g. "The course field is required" from Enrollments)
            const payload = {
                id: currentSubjectData.id,
                name: currentSubjectData.name,
                grade: currentSubjectData.grade,
                teacherId: null, // Explicitly null
                code: currentSubjectData.code,
                credits: currentSubjectData.credits,
                scheduleDays: currentSubjectData.scheduleDays,
                startTime: currentSubjectData.startTime,
                endTime: currentSubjectData.endTime,
                periodId: currentSubjectData.periodId
            };

            const response = await fetch(`${API_BASE_URL}/Courses/${subject.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Refresh list
                fetchTeacherSubjects(currentTeacher.id);
            } else {
                const errText = await response.text();
                console.error("Unassign error response:", errText);
                alert('Error al desasignar materia' + errText);
            }
        } catch (err) {
            console.error(err);
            alert('Error de conexión al desasignar');
        }
    };

    const StatusBadge = ({ isActive }) => {
        // Handle explicit true/false or missing (default true)
        const active = isActive !== false;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                {active ? <CheckCircle size={10} /> : <UserX size={10} />}
                {active ? 'Activo' : 'Inactivo'}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="text-blue-600" />
                        Gestión de Profesores
                    </h1>
                    <p className="text-sm text-gray-500">Administra docentes, credenciales y acceso al sistema</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar profesor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => handleOpenForm()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                    >
                        <Plus size={20} />
                        Nuevo Profesor
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profesor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matrícula</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTeachers.map((teacher) => (
                                <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0 overflow-hidden border border-blue-200">
                                                {teacher.photoUrl ? (
                                                    <SecureImage src={teacher.photoUrl} alt="Profesor" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{teacher.fullName.substring(0, 2).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{teacher.fullName}</div>
                                                <div className="text-xs text-gray-400">ID: {teacher.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                                <Mail size={12} /> {teacher.email || 'Sin email'}
                                            </div>
                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                                <Phone size={12} /> {teacher.phone || 'Sin teléfono'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 flex items-center gap-1">
                                            <CreditCard size={14} className="text-gray-400" />
                                            {teacher.matricula || <span className="text-gray-400 italic">No asignada</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge isActive={teacher.isActive} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleManagePhoto(teacher)}
                                            className="text-gray-600 hover:text-blue-900 bg-gray-50 hover:bg-gray-200 p-2 rounded-lg mx-1 transition-colors"
                                            title="Gestionar Fotografía"
                                        >
                                            <Camera size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenAccess(teacher)}
                                            className="text-amber-600 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 p-2 rounded-lg mx-1 transition-colors"
                                            title="Gestionar Acceso"
                                        >
                                            <Key size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenForm(teacher)}
                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg mx-1 transition-colors"
                                            title="Editar Información"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenSubjects(teacher)}
                                            className="text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 p-2 rounded-lg mx-1 transition-colors"
                                            title="Ver Materias"
                                        >
                                            <BookOpen size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredTeachers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                        <p>No se encontraron profesores</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create / Edit Modal */}
            {isFormModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">
                                {currentTeacher ? 'Editar Profesor' : 'Nuevo Profesor'}
                            </h3>
                            <button onClick={() => setIsFormModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveTeacher} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={formData.matricula}
                                        onChange={e => setFormData({ ...formData, matricula: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Access Management Modal */}
            {isAccessModalOpen && currentTeacher && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Shield size={18} className="text-amber-600" />
                                Gestión de Acceso
                            </h3>
                            <button onClick={() => setIsAccessModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveAccess} className="p-6 space-y-6">
                            <div className="bg-amber-50 p-3 rounded-lg flex items-start gap-3">
                                <div className="p-2 bg-amber-100 rounded-full text-amber-600 shrink-0">
                                    <UserCheck size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{currentTeacher.fullName}</p>
                                    <p className="text-xs text-gray-500">Usuario: {currentTeacher.email || currentTeacher.matricula || 'Sin Identificador (Agrega Email/Matrícula)'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${accessData.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="text-sm font-medium text-gray-700">Estado de Cuenta</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setAccessData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${accessData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${accessData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                        <Key size={14} /> Cambiar Contraseña
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <input
                                                type="password"
                                                placeholder="Nueva Contraseña"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                                value={accessData.password}
                                                onChange={e => setAccessData({ ...accessData, password: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="password"
                                                placeholder="Confirmar Contraseña"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                                value={accessData.confirmPassword}
                                                onChange={e => setAccessData({ ...accessData, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">Dejar en blanco para mantener la contraseña actual.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsAccessModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium">Actualizar Acceso</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Subjects Modal */}
            {isSubjectsModalOpen && currentTeacher && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen size={18} className="text-purple-600" />
                                Materias Asignadas: {currentTeacher.fullName}
                            </h3>
                            <button onClick={() => setIsSubjectsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-0 overflow-auto flex-1">
                            {loadingSubjects ? (
                                <div className="p-8 text-center text-gray-500">
                                    Cargando materias...
                                </div>
                            ) : teacherSubjects.length === 0 ? (
                                <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                                    <BookOpen size={48} className="text-gray-200 mb-4" />
                                    <p className="font-medium text-gray-600">No tiene materias asignadas</p>
                                    <p className="text-sm mt-1">Asigna materias desde la sección de Gestión de Materias.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-3">Materia</th>
                                            <th className="px-6 py-3">Grado</th>
                                            <th className="px-6 py-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {teacherSubjects.map((subject) => (
                                            <tr key={subject.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-3 font-medium text-gray-900">{subject.name}</td>
                                                <td className="px-6 py-3">
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                                                        {subject.grade || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <button
                                                        onClick={() => handleUnassignSubject(subject)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                                        title="Desasignar Materia"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setIsSubjectsModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Modal */}
            {showPhotoModal && selectedPhotoTeacher && (
                <PhotoUploadModal
                    entityId={selectedPhotoTeacher.id}
                    entityType="teacher"
                    currentPhotoUrl={selectedPhotoTeacher.photoUrl}
                    onClose={() => setShowPhotoModal(false)}
                    onSuccess={handlePhotoSuccess}
                />
            )}
        </div>
    );
};

export default TeacherManagement;
