import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Save, User, MapPin, GraduationCap, Users,
    Check, ChevronRight, ChevronLeft, FileText, CheckCircle
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import StudentDocuments from './StudentDocuments';

const AddStudent = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [createdStudentId, setCreatedStudentId] = useState(null);

    // Form state - All in one object for simplicity, though split across steps
    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        matricula: '',
        firstName: '',
        paternalSurname: '',
        maternalSurname: '',
        gender: '',
        birthDate: '',
        curp: '',
        photoUrl: '',
        // Step 2: Address
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
        email: '',
        phone: '',
        // Step 3: School & Family
        levelId: '',
        gradeId: '',
        groupId: '',
        currentGrade: '',
        currentGroup: '',
        familyOption: 'new',
        familyId: '',
        newFamilyName: '',
        newFamilyNumber: '',
        status: 'Activo'
    });

    // Catalogs
    const [levels, setLevels] = useState([]);
    const [grades, setGrades] = useState([]);
    const [groups, setGroups] = useState([]);
    const [families, setFamilies] = useState([]);

    useEffect(() => {
        fetchLevels();
        fetchFamilies();
    }, []);

    const fetchLevels = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/SchoolLevels`);
            if (response.ok) setLevels(await response.json());
        } catch (err) { console.error('Error fetching levels:', err); }
    };

    const fetchFamilies = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/Families`);
            if (response.ok) setFamilies(await response.json());
        } catch (err) { console.error('Error fetching families:', err); }
    };

    // Dependent Dropdowns Logic
    useEffect(() => {
        if (formData.levelId) {
            const selectedLevel = levels.find(l => l.id === parseInt(formData.levelId));
            if (selectedLevel?.grades) {
                setGrades(selectedLevel.grades);
                setGroups([]);
                setFormData(prev => ({ ...prev, gradeId: '', groupId: '' }));
            }
        }
    }, [formData.levelId, levels]);

    useEffect(() => {
        if (formData.gradeId) {
            const selectedGrade = grades.find(g => g.id === parseInt(formData.gradeId));
            if (selectedGrade?.groups) {
                setGroups(selectedGrade.groups);
                setFormData(prev => ({ ...prev, groupId: '' }));
            }
        }
    }, [formData.gradeId, grades]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep = (step) => {
        switch (step) {
            case 1: // Basic Info
                if (!formData.firstName || !formData.paternalSurname) {
                    setError('Nombre y Apellido Paterno son obligatorios.');
                    return false;
                }
                return true;
            case 2: // Address
                // Email optional but recommended validation if present
                return true;
            case 3: // School Family
                if (!formData.levelId || !formData.gradeId) {
                    setError('Debe seleccionar Nivel y Grado.');
                    return false;
                }
                if (formData.familyOption === 'new' && !formData.newFamilyName) {
                    setError('Nombre de familia es obligatorio para nueva familia.');
                    return false;
                }
                if (formData.familyOption === 'existing' && !formData.familyId) {
                    setError('Seleccione una familia existente.');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setError('');
            if (currentStep === 3) {
                // Determine if we submit here
                handleSubmit();
            } else {
                setCurrentStep(prev => prev + 1);
            }
        }
    };

    const prevStep = () => {
        setError('');
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            let familyId = formData.familyId;

            if (formData.familyOption === 'new') {
                const familyResponse = await fetch(`${API_BASE_URL}/Families`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        familyName: formData.newFamilyName,
                        familyNumber: formData.newFamilyNumber || `FAM - ${Date.now()} `
                    })
                });
                if (!familyResponse.ok) throw new Error('Error al crear la familia');
                const familyData = await familyResponse.json();
                familyId = familyData.id;
            }

            const studentPayload = {
                matricula: formData.matricula,
                firstName: formData.firstName,
                paternalSurname: formData.paternalSurname,
                maternalSurname: formData.maternalSurname,
                gender: formData.gender,
                birthDate: formData.birthDate || null,
                curp: formData.curp,
                photoUrl: formData.photoUrl,
                streetAddress: formData.streetAddress,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                email: formData.email,
                phone: formData.phone,
                currentGrade: formData.currentGrade,
                currentGroup: formData.currentGroup,
                groupId: parseInt(formData.groupId) || null,
                familyId: familyId ? parseInt(familyId) : null,
                status: formData.status
            };

            const studentResponse = await fetch(`${API_BASE_URL}/Students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentPayload)
            });

            if (!studentResponse.ok) throw new Error('Error al crear el alumno');
            const newStudent = await studentResponse.json();

            setCreatedStudentId(newStudent.id);
            setSuccess(true);
            setCurrentStep(4); // Move to Documents step

        } catch (err) {
            setError(err.message || 'Error al guardar el alumno');
        } finally {
            setLoading(false);
        }
    };

    // Components
    const InputField = ({ label, name, type = "text", required = false, ...props }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required={required}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                {...props}
            />
        </div>
    );

    const SelectField = ({ label, name, options, required = false, disabled = false }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required={required}
                disabled={disabled}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
            >
                <option value="">Seleccionar...</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );

    // Stepper
    const steps = [
        { id: 1, label: 'Datos Básicos', icon: User },
        { id: 2, label: 'Domicilio', icon: MapPin },
        { id: 3, label: 'Escolaridad', icon: GraduationCap },
        { id: 4, label: 'Documentos', icon: FileText }
    ];

    return (
        <div className="max-w-5xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/settings')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Inscripción de Alumno</h1>
                        <p className="text-sm text-gray-500">Complete los pasos para registrar al estudiante</p>
                    </div>
                </div>
            </div>

            {/* Stepper */}
            <div className="mb-8">
                <div className="flex justify-between items-center relative">
                    <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -z-10" />
                    {steps.map((step) => {
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;
                        return (
                            <div key={step.id} className="flex flex-col items-center bg-white px-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 
                                    ${isActive ? 'border-blue-600 bg-blue-600 text-white shadow-lg scale-110' :
                                        isCompleted ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 bg-white text-gray-400'}`}>
                                    {isCompleted ? <Check size={20} /> : <step.icon size={20} />}
                                </div>
                                <span className={`text-xs font-semibold mt-2 ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r text-red-700 text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}

            {/* Content Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 min-h-[400px]">

                {currentStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b">Información Personal</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <InputField label="Matrícula" name="matricula" placeholder="Generada automáticamente si se omite" />
                            <InputField label="Nombre(s)" name="firstName" required />
                            <InputField label="Apellido Paterno" name="paternalSurname" required />
                            <InputField label="Apellido Materno" name="maternalSurname" />
                            <SelectField
                                label="Género"
                                name="gender"
                                options={[
                                    { value: 'Masculino', label: 'Masculino' },
                                    { value: 'Femenino', label: 'Femenino' }
                                ]}
                            />
                            <InputField label="Fecha de Nacimiento" name="birthDate" type="date" />
                            <InputField label="CURP" name="curp" maxLength={18} />
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b">Domicilio y Contacto</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <InputField label="Calle y Número Exterior/Interior" name="streetAddress" placeholder="Ej: Av. Reforma 123, Depto 4" />
                            </div>
                            <InputField label="Ciudad / Municipio" name="city" />
                            <InputField label="Estado" name="state" />
                            <InputField label="Código Postal" name="zipCode" />
                            <InputField label="Correo Electrónico de Contacto" name="email" type="email" />
                            <InputField label="Teléfono (Móvil o Casa)" name="phone" type="tel" />
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b">Datos Académicos y Familiares</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <SelectField
                                label="Nivel Educativo"
                                name="levelId"
                                options={levels.map(l => ({ value: l.id, label: l.name }))}
                            />
                            <SelectField
                                label="Grado"
                                name="gradeId"
                                options={grades.map(g => ({ value: g.id, label: g.name }))}
                                disabled={!formData.levelId}
                            />
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Grupo Asignado</label>
                                <select
                                    name="groupId"
                                    value={formData.groupId}
                                    onChange={(e) => {
                                        const groupId = e.target.value;
                                        const selectedGroup = groups.find(g => g.id === parseInt(groupId));
                                        const selectedGrade = grades.find(g => g.id === parseInt(formData.gradeId));
                                        setFormData(prev => ({
                                            ...prev,
                                            groupId,
                                            currentGrade: selectedGrade?.name || '',
                                            currentGroup: selectedGroup?.name || ''
                                        }));
                                    }}
                                    disabled={!formData.gradeId}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 bg-white"
                                >
                                    <option value="">Seleccionar...</option>
                                    {groups.map(group => (
                                        <option key={group.id} value={group.id}>{group.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Users size={16} />
                                Información Familiar
                            </h3>

                            <div className="flex gap-6 mb-4">
                                <label className="flex items-center gap-2 cursor-pointer p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 transition-colors w-full">
                                    <input
                                        type="radio"
                                        name="familyOption"
                                        value="new"
                                        checked={formData.familyOption === 'new'}
                                        onChange={handleChange}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Registrar Nueva Familia</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 transition-colors w-full">
                                    <input
                                        type="radio"
                                        name="familyOption"
                                        value="existing"
                                        checked={formData.familyOption === 'existing'}
                                        onChange={handleChange}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Vincular Familia Existente</span>
                                </label>
                            </div>

                            {formData.familyOption === 'new' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                                    <InputField label="Nombre de Familia (Apellidos)" name="newFamilyName" placeholder="Ej: Familia Pérez López" />
                                    <InputField label="Número Identificador (Opcional)" name="newFamilyNumber" placeholder="Ej: FAM-2024-001" />
                                </div>
                            ) : (
                                <div className="animate-in fade-in">
                                    <SelectField
                                        label="Buscar Familia"
                                        name="familyId"
                                        options={families.map(f => ({
                                            value: f.id,
                                            label: `${f.familyName} (${f.familyNumber})`
                                        }))}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {currentStep === 4 && createdStudentId && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-3 mb-6 p-4 bg-green-50 text-green-800 rounded-xl border border-green-200">
                            <CheckCircle size={24} />
                            <div>
                                <h3 className="font-bold">¡Alumno Registrado Exitosamente!</h3>
                                <p className="text-sm">Ahora puede cargar la documentación digitalizada.</p>
                            </div>
                        </div>

                        <StudentDocuments
                            studentId={createdStudentId}
                            onFinish={() => navigate('/settings')}
                        />
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            {currentStep < 4 && (
                <div className="mt-8 flex justify-between">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors 
                            ${currentStep === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <ChevronLeft size={20} />
                        Anterior
                    </button>

                    <button
                        onClick={nextStep}
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-70"
                    >
                        {loading ? (
                            <span>Procesando...</span>
                        ) : (
                            <>
                                {currentStep === 3 ? 'Registrar y Continuar' : 'Siguiente'}
                                <ChevronRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default AddStudent;
