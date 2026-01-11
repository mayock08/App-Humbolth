import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, MapPin, GraduationCap, Users } from 'lucide-react';

const AddStudent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        paternalSurname: '',
        maternalSurname: '',
        gender: '',
        birthDate: '',
        curp: '',
        photoUrl: '',
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
        email: '',
        phone: '',
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
            const response = await fetch('http://localhost:5246/api/SchoolLevels');
            if (response.ok) {
                const data = await response.json();
                setLevels(data);
            }
        } catch (err) {
            console.error('Error fetching levels:', err);
        }
    };

    const fetchFamilies = async () => {
        try {
            const response = await fetch('http://localhost:5246/api/Families');
            if (response.ok) {
                const data = await response.json();
                setFamilies(data);
            }
        } catch (err) {
            console.error('Error fetching families:', err);
        }
    };

    useEffect(() => {
        if (formData.levelId) {
            const selectedLevel = levels.find(l => l.id === parseInt(formData.levelId));
            if (selectedLevel && selectedLevel.grades) {
                setGrades(selectedLevel.grades);
                setGroups([]);
                setFormData(prev => ({ ...prev, gradeId: '', groupId: '' }));
            }
        }
    }, [formData.levelId, levels]);

    useEffect(() => {
        if (formData.gradeId) {
            const selectedGrade = grades.find(g => g.id === parseInt(formData.gradeId));
            if (selectedGrade && selectedGrade.groups) {
                setGroups(selectedGrade.groups);
                setFormData(prev => ({ ...prev, groupId: '' }));
            }
        }
    }, [formData.gradeId, grades]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let familyId = formData.familyId;

            if (formData.familyOption === 'new') {
                const familyResponse = await fetch('http://localhost:5246/api/Families', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        familyName: formData.newFamilyName,
                        familyNumber: formData.newFamilyNumber || `FAM-${Date.now()}`
                    })
                });

                if (!familyResponse.ok) throw new Error('Error al crear la familia');
                const familyData = await familyResponse.json();
                familyId = familyData.id;
            }

            const studentPayload = {
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

            const studentResponse = await fetch('http://localhost:5246/api/Students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentPayload)
            });

            if (!studentResponse.ok) throw new Error('Error al crear el alumno');

            setSuccess(true);
            setTimeout(() => navigate('/settings'), 2000);
        } catch (err) {
            setError(err.message || 'Error al guardar el alumno');
        } finally {
            setLoading(false);
        }
    };

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
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
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
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
                <option value="">Seleccionar...</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-4 flex items-center gap-3">
                <button
                    onClick={() => navigate('/settings')}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Registro de Alumno</h1>
                    <p className="text-xs text-gray-500">Complete la información del estudiante</p>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-600">
                    Alumno creado exitosamente. Redirigiendo...
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Datos Básicos */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                        <User size={16} className="text-gray-600" />
                        <h2 className="text-sm font-semibold text-gray-900">Datos Básicos</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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

                {/* Domicilio */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                        <MapPin size={16} className="text-gray-600" />
                        <h2 className="text-sm font-semibold text-gray-900">Domicilio y Contacto</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                            <InputField label="Calle y Número" name="streetAddress" />
                        </div>
                        <InputField label="Ciudad" name="city" />
                        <InputField label="Estado" name="state" />
                        <InputField label="Código Postal" name="zipCode" />
                        <InputField label="Email" name="email" type="email" />
                        <InputField label="Teléfono" name="phone" type="tel" />
                    </div>
                </div>

                {/* Escolaridad */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                        <GraduationCap size={16} className="text-gray-600" />
                        <h2 className="text-sm font-semibold text-gray-900">Escolaridad</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                            <label className="block text-xs font-medium text-gray-700 mb-1">Grupo</label>
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
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">Seleccionar...</option>
                                {groups.map(group => (
                                    <option key={group.id} value={group.id}>{group.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Familia */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                        <Users size={16} className="text-gray-600" />
                        <h2 className="text-sm font-semibold text-gray-900">Familia</h2>
                    </div>

                    <div className="mb-3 flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="familyOption"
                                value="new"
                                checked={formData.familyOption === 'new'}
                                onChange={handleChange}
                                className="text-primary"
                            />
                            <span className="text-xs font-medium text-gray-700">Crear Nueva Familia</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="familyOption"
                                value="existing"
                                checked={formData.familyOption === 'existing'}
                                onChange={handleChange}
                                className="text-primary"
                            />
                            <span className="text-xs font-medium text-gray-700">Familia Existente</span>
                        </label>
                    </div>

                    {formData.familyOption === 'new' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <InputField label="Nombre de Familia" name="newFamilyName" placeholder="Ej: Familia Pérez" />
                            <InputField label="Número de Familia" name="newFamilyNumber" placeholder="Ej: FAM-001" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <SelectField
                                label="Seleccionar Familia"
                                name="familyId"
                                options={families.map(f => ({
                                    value: f.id,
                                    label: `${f.familyName} (${f.familyNumber})`
                                }))}
                            />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate('/settings')}
                        className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm bg-primary text-white rounded font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save size={16} />
                        {loading ? 'Guardando...' : 'Guardar Alumno'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddStudent;
