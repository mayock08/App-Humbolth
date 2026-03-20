import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, X, Filter } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const Admissions = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        newStudentsCount: 0,
        reEnrolledCount: 0,
        newStudents: [],
        reEnrolled: []
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('new'); // 'new' or 're-enrolled'
    const [currentCycle] = useState('2025-2026'); // This could be dynamic or fetched from settings

    useEffect(() => {
        fetchStats();
    }, [currentCycle]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/Students/admissions/stats?currentCycle=${currentCycle}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching admission stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const displayedStudents = activeTab === 'new' ? stats.newStudents : stats.reEnrolled;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Admisiones {currentCycle}</h2>
                    <p className="text-gray-500">Gestión de ingresos y reinscripciones</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                    onClick={() => setActiveTab('new')}
                    className={`bg-white p-6 rounded-xl shadow-sm border transition-all cursor-pointer ${activeTab === 'new' ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100 hover:border-primary/50'}`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                            <UserPlus size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase text-gray-400">Ciclo {currentCycle}</span>
                    </div>
                    <div>
                        <span className="block text-4xl font-bold text-gray-900">{stats.newStudentsCount}</span>
                        <span className="text-sm text-gray-500">Alumnos de Nuevo Ingreso</span>
                    </div>
                </div>

                <div
                    onClick={() => setActiveTab('re-enrolled')}
                    className={`bg-white p-6 rounded-xl shadow-sm border transition-all cursor-pointer ${activeTab === 're-enrolled' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-gray-100 hover:border-purple-500/50'}`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                            <RotateCw size={24} />
                        </div>
                        <span className="text-xs font-semibold uppercase text-gray-400">Ciclo {currentCycle}</span>
                    </div>
                    <div>
                        <span className="block text-4xl font-bold text-gray-900">{stats.reEnrolledCount}</span>
                        <span className="text-sm text-gray-500">Alumnos Reinscritos</span>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-800">
                        {activeTab === 'new' ? 'Listado de Nuevo Ingreso' : 'Listado de Reinscritos'}
                    </h3>
                    <span className="text-sm text-gray-500">
                        {displayedStudents.length} estudiantes
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matrícula</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo Asignado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ciclo de Ingreso</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Cargando datos de admisión...
                                    </td>
                                </tr>
                            ) : displayedStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No hay estudiantes en esta categoría
                                    </td>
                                </tr>
                            ) : (
                                displayedStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold ${activeTab === 'new' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                                    {student.firstName[0]}{student.paternalSurname[0]}
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.admissionCycle}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {student.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Admissions;
