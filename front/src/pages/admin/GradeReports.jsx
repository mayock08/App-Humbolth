import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, CheckCircle, XCircle, Download, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5246';

export default function GradeReports() {
    const { t } = useTranslation();
    const [groups, setGroups] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sendingEmails, setSendingEmails] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const fetchInitialData = async () => {
        try {
            const [gRes, pRes] = await Promise.all([
                fetch(`${API_URL}/api/SchoolGroups`, { headers: getAuthHeaders() }),
                fetch(`${API_URL}/api/SchoolPeriods`, { headers: getAuthHeaders() })
            ]);
            if (gRes.ok) setGroups(await gRes.json());
            if (pRes.ok) setPeriods(await pRes.json());
        } catch (error) {
            console.error('Error fetching initial data:', error);
            toast.error('Error al cargar filtros.');
        }
    };

    const handleSearch = async () => {
        if (!selectedGroup) return toast.warning('Seleccione un grupo primero.');
        setLoading(true);
        try {
            let url = `${API_URL}/api/StudentReports/group/${selectedGroup}`;
            if (selectedPeriod) url += `?periodId=${selectedPeriod}`;
            const res = await fetch(url, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            } else {
                toast.error('Error obteniendo listado.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de conexión.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadIndividual = async (studentId, matricula) => {
        try {
            let url = `${API_URL}/api/StudentReports/pdf/${studentId}`;
            if (selectedPeriod) url += `?periodId=${selectedPeriod}`;
            
            const res = await fetch(url, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error('Falló descarga');
            
            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `Ficha_${matricula}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            toast.error('Error descargando PDF.');
        }
    };

    const handleSendBulkEmails = async () => {
        if (students.length === 0) return toast.warning('No hay alumnos para enviar la ficha.');
        const ids = students.map(s => s.studentId);
        
        if (!window.confirm(`¿Enviar correos a ${ids.length} padres?`)) return;

        setSendingEmails(true);
        const toastId = toast.loading('Enviando correos...');
        try {
            const res = await fetch(`${API_URL}/api/StudentReports/send-email`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ 
                    periodId: selectedPeriod ? parseInt(selectedPeriod) : 0, 
                    studentIds: ids 
                })
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`Completado. Enviados: ${data.sentCount}. Errores: ${data.errorCount}`, { id: toastId });
            } else {
                const errText = await res.text();
                toast.error(`Error: ${errText}`, { id: toastId });
            }
        } catch (error) {
            toast.error('Error en servicio de correo.', { id: toastId });
        } finally {
            setSendingEmails(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Fichas de Promedio</h2>
                    <p className="text-gray-500 mt-1">Generación de reportes de calificaciones y envío a padres.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grupo Escolar</label>
                    <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <select 
                            value={selectedGroup} 
                            onChange={e => setSelectedGroup(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        >
                            <option value="">Selecciona un grupo</option>
                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Periodo Escolar (Opcional)</label>
                    <div className="relative">
                        <select 
                            value={selectedPeriod} 
                            onChange={e => setSelectedPeriod(e.target.value)}
                            className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        >
                            <option value="">Todos los periodos</option>
                            {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <button 
                        onClick={handleSearch}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium shadow-sm transition-colors"
                    >
                        Buscar Alumnos
                    </button>
                </div>
            </div>

            {/* Actions Bar */}
            {students.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
                    <div className="flex items-center text-sm text-slate-600">
                        <Users size={16} className="mr-2" />
                        <span>Encontrados <strong>{students.length}</strong> alumnos.</span>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            disabled={sendingEmails}
                            onClick={handleSendBulkEmails}
                            className={`flex items-center px-4 py-2 rounded-lg font-medium shadow-sm transition-colors ${
                                sendingEmails ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                            } text-white`}
                        >
                            <Mail size={18} className="mr-2" />
                            {sendingEmails ? 'Enviando...' : 'Notificar a Todo el Grupo'}
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="p-12 text-center text-gray-500">Cargando datos del grupo...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Alumno</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Promedio Acum.</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Correo Config.</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        Selecciona un grupo para visualizar alumnos.
                                    </td>
                                </tr>
                            ) : students.map((std) => (
                                <tr key={std.studentId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{std.studentName}</div>
                                        <div className="text-xs text-gray-500">Matrícula: {std.matricula}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {std.generalAverage.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {std.hasParentEmail ? (
                                            <span className="inline-flex items-center text-green-600 text-xs gap-1 justify-center w-full" title={std.parentEmail}>
                                                <CheckCircle size={16} /> Configurado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center text-red-500 text-xs gap-1 justify-center w-full">
                                                <AlertCircle size={16} /> Falta
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                        <button 
                                            onClick={() => handleDownloadIndividual(std.studentId, std.matricula)}
                                            className="text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2"
                                        >
                                            <Download size={16} /> PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
