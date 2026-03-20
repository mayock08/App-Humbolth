import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Calendar, CheckCircle, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

import { API_BASE_URL } from '../../config';

const SchoolPeriods = () => {
    const { t } = useTranslation();
    const [periods, setPeriods] = useState([]);
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPeriod, setCurrentPeriod] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        isActive: false,
        levelId: '',
        parentPeriodId: '',
        periodType: 'Year',
        weight: 1
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [periodsRes, levelsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/SchoolPeriods`),
                fetch(`${API_BASE_URL}/SchoolLevels`)
            ]);

            if (periodsRes.ok && levelsRes.ok) {
                const periodsData = await periodsRes.json();
                const levelsData = await levelsRes.json();
                setPeriods(periodsData);
                setLevels(levelsData);
            } else {
                toast.error('Error al cargar datos');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const fetchPeriods = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/SchoolPeriods`);
            if (response.ok) {
                const data = await response.json();
                setPeriods(data);
            } else {
                toast.error('Error al cargar los ciclos escolares');
            }
        } catch (error) {
            console.error('Error fetching periods:', error);
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (period = null) => {
        if (period) {
            setCurrentPeriod(period);
            setFormData({
                name: period.name,
                startDate: period.startDate.split('T')[0],
                endDate: period.endDate.split('T')[0],
                isActive: period.isActive,
                levelId: period.levelId || '',
                parentPeriodId: period.parentPeriodId || '',
                periodType: period.periodType || 'Year',
                weight: period.weight || 1
            });
        } else {
            setCurrentPeriod(null);
            setFormData({
                name: '',
                startDate: '',
                endDate: '',
                isActive: false,
                levelId: '',
                parentPeriodId: '',
                periodType: 'Year',
                weight: 1
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentPeriod(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const method = currentPeriod ? 'PUT' : 'POST';
        const url = currentPeriod
            ? `${API_BASE_URL}/SchoolPeriods/${currentPeriod.id}`
            : `${API_BASE_URL}/SchoolPeriods`;

        const payload = {
            ...formData,
            id: currentPeriod ? currentPeriod.id : 0,
            levelId: formData.levelId ? parseInt(formData.levelId) : null,
            parentPeriodId: formData.parentPeriodId ? parseInt(formData.parentPeriodId) : null,
            weight: parseFloat(formData.weight) || 1
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success(currentPeriod ? 'Ciclo actualizado correctamente' : 'Ciclo creado correctamente');
                handleCloseModal();
                fetchPeriods();
            } else {
                toast.error('Error al guardar el ciclo escolar');
            }
        } catch (error) {
            console.error('Error saving period:', error);
            toast.error('Error de conexión');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este ciclo escolar?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/SchoolPeriods/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Ciclo eliminado correctamente');
                fetchPeriods();
            } else {
                toast.error('Error al eliminar el ciclo');
            }
        } catch (error) {
            console.error('Error deleting period:', error);
            toast.error('Error de conexión');
        }
    };

    const filteredPeriods = periods.filter(period =>
        period.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-blue-600" />
                        Ciclos Escolares
                    </h1>
                    <p className="text-gray-500 mt-1">Administra los periodos académicos de la institución.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Nuevo Ciclo
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar ciclo..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-600 text-sm font-medium">
                                <th className="p-4 border-b border-gray-200 w-1/4">Nombre y Tipo</th>
                                <th className="p-4 border-b border-gray-200">Nivel</th>
                                <th className="p-4 border-b border-gray-200">Fecha Inicio</th>
                                <th className="p-4 border-b border-gray-200">Fecha Fin</th>
                                <th className="p-4 border-b border-gray-200 text-center">Estado</th>
                                <th className="p-4 border-b border-gray-200 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">Cargando...</td>
                                </tr>
                            ) : filteredPeriods.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">No se encontraron ciclos escolares</td>
                                </tr>
                            ) : (
                                filteredPeriods.map((period) => (
                                    <React.Fragment key={period.id}>
                                        <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 font-semibold group bg-gray-50/50">
                                            <td className="p-4 text-gray-900 flex flex-col">
                                                <span>{period.name}</span>
                                                <span className="text-xs text-gray-500 font-normal">{period.periodType}</span>
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {period.level ? period.level.name : <span className="text-gray-400 italic font-normal">No asignado</span>}
                                            </td>
                                            <td className="p-4 text-gray-600 font-normal">
                                                {new Date(period.startDate).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-gray-600 font-normal">
                                                {new Date(period.endDate).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-center">
                                                {period.isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                                        <CheckCircle size={12} />
                                                        Activo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                        <XCircle size={12} />
                                                        Inactivo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleOpenModal(period)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(period.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Child periods */}
                                        {period.subPeriods && period.subPeriods.map(child => (
                                            <tr key={`child-${child.id}`} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 group bg-white">
                                                <td className="p-4 pl-10 text-gray-800 flex flex-col">
                                                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> {child.name}</span>
                                                    <span className="text-xs text-gray-400 ml-3.5">{child.periodType} • Peso: {child.weight}</span>
                                                </td>
                                                <td className="p-4 text-gray-600 text-sm">
                                                    {period.level ? period.level.name : ''}
                                                </td>
                                                <td className="p-4 text-gray-500 text-sm">
                                                    {new Date(child.startDate).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-gray-500 text-sm">
                                                    {new Date(child.endDate).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {child.isActive ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                            Activo
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-500 border border-gray-100">
                                                            Inactivo
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleOpenModal(child)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            title="Editar Sub-periodo"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(child.id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Eliminar Sub-periodo"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">
                                {currentPeriod ? 'Editar Ciclo Escolar' : 'Nuevo Ciclo Escolar'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Ciclo</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Ej. 2024-2025 o Trimestre 1"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Periodo</label>
                                    <select
                                        name="periodType"
                                        value={formData.periodType}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                    >
                                        <option value="Year">Año Escolar (Global)</option>
                                        <option value="Semester">Semestre</option>
                                        <option value="Trimester">Trimestre</option>
                                        <option value="Quarter">Cuatrimestre</option>
                                        <option value="Partial">Parcial / Bloque</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Periodo Padre (Opcional)</label>
                                    <select
                                        name="parentPeriodId"
                                        value={formData.parentPeriodId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                    >
                                        <option value="">Ninguno (Es un periodo raíz)</option>
                                        {periods.map(p => (
                                            /* Prevent assigning itself as parent */
                                            (!currentPeriod || currentPeriod.id !== p.id) &&
                                            <option key={p.id} value={p.id}>{p.name} ({p.periodType})</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-400 mt-1">Si es un trimestre, selecciona el Año al que pertenece.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Escolar</label>
                                    <select
                                        name="levelId"
                                        value={formData.levelId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                        required
                                    >
                                        <option value="">Seleccione un nivel...</option>
                                        {levels.map(level => (
                                            <option key={level.id} value={level.id}>{level.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-900 rounded-lg border border-blue-100">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                                    Establecer como ciclo activo actual
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchoolPeriods;
