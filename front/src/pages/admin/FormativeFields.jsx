import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Library, CheckCircle, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

import { API_BASE_URL } from '../../config';

const FormativeFields = () => {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentField, setCurrentField] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isOfficial: true
    });

    useEffect(() => {
        fetchFields();
    }, []);

    const fetchFields = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/FormativeFields`);
            if (response.ok) {
                const data = await response.json();
                setFields(data);
            } else {
                toast.error('Error al cargar los campos formativos');
            }
        } catch (error) {
            console.error('Error fetching formative fields:', error);
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (field = null) => {
        if (field) {
            setCurrentField(field);
            setFormData({
                name: field.name,
                description: field.description || '',
                isOfficial: field.isOfficial
            });
        } else {
            setCurrentField(null);
            setFormData({
                name: '',
                description: '',
                isOfficial: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentField(null);
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

        const method = currentField ? 'PUT' : 'POST';
        const url = currentField
            ? `${API_BASE_URL}/FormativeFields/${currentField.id}`
            : `${API_BASE_URL}/FormativeFields`;

        const payload = {
            ...formData,
            id: currentField ? currentField.id : 0
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
                toast.success(currentField ? 'Campo formativo actualizado' : 'Campo formativo creado');
                handleCloseModal();
                fetchFields();
            } else {
                toast.error('Error al guardar el campo formativo');
            }
        } catch (error) {
            console.error('Error saving field:', error);
            toast.error('Error de conexión');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este campo formativo?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/FormativeFields/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Campo formativo eliminado');
                fetchFields();
            } else {
                toast.error('Error al eliminar');
            }
        } catch (error) {
            console.error('Error deleting field:', error);
            toast.error('Error de conexión');
        }
    };

    const filteredFields = fields.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Library className="w-8 h-8 text-indigo-600" />
                        Campos Formativos
                    </h1>
                    <p className="text-gray-500 mt-1">Configura la organización curricular según la NEM (SEP).</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Nuevo Campo
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar campo..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-600 text-sm font-medium">
                                <th className="p-4 border-b border-gray-200 w-1/3">Nombre</th>
                                <th className="p-4 border-b border-gray-200 w-1/3">Descripción</th>
                                <th className="p-4 border-b border-gray-200 text-center">Tipo (SEP)</th>
                                <th className="p-4 border-b border-gray-200 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500">Cargando...</td>
                                </tr>
                            ) : filteredFields.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500">No se encontraron registros</td>
                                </tr>
                            ) : (
                                filteredFields.map((field) => (
                                    <tr key={field.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 font-semibold group bg-white">
                                        <td className="p-4 text-gray-900">
                                            {field.name}
                                        </td>
                                        <td className="p-4 text-gray-600 font-normal truncate max-w-xs">
                                            {field.description || <span className="italic text-gray-400">Sin descripción</span>}
                                        </td>
                                        <td className="p-4 text-center">
                                            {field.isOfficial ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                                    <CheckCircle size={12} />
                                                    Oficial
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                    Interno
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(field)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(field.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">
                                {currentField ? 'Editar Campo Formativo' : 'Nuevo Campo Formativo'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Campo</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ej. Lenguajes"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Breve descripción de los alcances formativos"
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-indigo-50 text-indigo-900 rounded-lg border border-indigo-100">
                                <input
                                    type="checkbox"
                                    name="isOfficial"
                                    id="isOfficial"
                                    checked={formData.isOfficial}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                <label htmlFor="isOfficial" className="text-sm font-medium cursor-pointer flex-1">
                                    Es un campo oficial dictaminado por la SEP (Nueva Escuela Mexicana)
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
                                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm"
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

export default FormativeFields;
