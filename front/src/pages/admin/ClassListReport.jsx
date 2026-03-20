import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import { Filter, Printer, FileText, ChevronLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { API_BASE_URL } from '../../config';

const ClassListReport = () => {
    const { t } = useTranslation();
    const [levels, setLevels] = useState([]);
    const [grades, setGrades] = useState([]);
    const [groups, setGroups] = useState([]);
    const [schoolPeriods, setSchoolPeriods] = useState([]);

    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');

    const [students, setStudents] = useState([]);
    const [groupInfo, setGroupInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Listado_Grupo_${groupInfo?.name || 'Vacio'}`
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [levelsRes, periodsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/SchoolLevels`),
                fetch(`${API_BASE_URL}/SchoolPeriods`)
            ]);

            if (levelsRes.ok) setLevels(await levelsRes.json());
            if (periodsRes.ok) {
                const periods = await periodsRes.json();
                setSchoolPeriods(periods);
                const activePeriod = periods.find(p => p.isActive);
                if (activePeriod) setSelectedPeriod(activePeriod.id.toString());
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
            toast.error('Error al cargar datos iniciales');
        }
    };

    const fetchGrades = async (levelId) => {
        if (!levelId) {
            setGrades([]);
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/SchoolGrades?levelId=${levelId}`);
            if (res.ok) setGrades(await res.json());
        } catch (error) {
            console.error('Error fetching grades:', error);
        }
    };

    const fetchGroups = async (gradeId) => {
        if (!gradeId) {
            setGroups([]);
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/SchoolGroups`);
            if (res.ok) {
                const allGroups = await res.json();
                setGroups(allGroups.filter(g => g.gradeId === parseInt(gradeId)));
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const handleLevelChange = (e) => {
        const val = e.target.value;
        setSelectedLevel(val);
        setSelectedGrade('');
        setSelectedGroup('');
        setGroups([]);
        fetchGrades(val);
    };

    const handleGradeChange = (e) => {
        const val = e.target.value;
        setSelectedGrade(val);
        setSelectedGroup('');
        fetchGroups(val);
    };

    const handleSearch = async () => {
        if (!selectedGroup) {
            toast.warning('Por favor seleccione un grupo.');
            return;
        }

        setLoading(true);
        try {
            const groupRes = await fetch(`${API_BASE_URL}/SchoolGroups/${selectedGroup}`);
            if (!groupRes.ok) throw new Error('Failed to fetch group');
            const groupData = await groupRes.json();
            setGroupInfo(groupData);

            // Fetch students for this group
            const studentsRes = await fetch(`${API_BASE_URL}/Students?groupId=${selectedGroup}&pageSize=100`);
            if (studentsRes.ok) {
                const studentsData = await studentsRes.json();
                setStudents(studentsData);
            } else {
                toast.error('Error al cargar alumnos');
            }
        } catch (error) {
            console.error('Error searching:', error);
            toast.error('Error al realizar la búsqueda');
        } finally {
            setLoading(false);
        }
    };

    const selectedPeriodObj = schoolPeriods.find(p => p.id.toString() === selectedPeriod);
    const periodName = selectedPeriodObj ? selectedPeriodObj.name : '';

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link to="/reports" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2 transition-colors">
                        <ChevronLeft size={16} /> Volver a Reportes
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        Listado de Alumnos por Grupo
                    </h1>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    Filtros de Búsqueda
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ciclo Escolar</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                        >
                            <option value="">Seleccionar ciclo...</option>
                            {schoolPeriods.filter(p => p.parentPeriodId == null).map(period => (
                                <option key={period.id} value={period.id}>{period.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Escolar</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedLevel}
                            onChange={handleLevelChange}
                        >
                            <option value="">Selecciones nivel...</option>
                            {levels.map(level => (
                                <option key={level.id} value={level.id}>{level.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedGrade}
                            onChange={handleGradeChange}
                            disabled={!selectedLevel}
                        >
                            <option value="">Seleccione grado...</option>
                            {grades.map(grade => (
                                <option key={grade.id} value={grade.id}>{grade.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            disabled={!selectedGrade}
                        >
                            <option value="">Seleccione grupo...</option>
                            {groups.map(group => (
                                <option key={group.id} value={group.id}>{group.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                    <button
                        onClick={handleSearch}
                        disabled={loading || !selectedGroup}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-blue-300 shadow-sm font-medium"
                    >
                        <Search size={18} />
                        Generar Reporte
                    </button>
                    {students.length > 0 && (
                        <button
                            onClick={handlePrint}
                            className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2 shadow-sm font-medium"
                        >
                            <Printer size={18} />
                            Imprimir Listado
                        </button>
                    )}
                </div>
            </div>

            {/* Print Area Container */}
            <div className={`bg-white shadow-xl min-h-[500px] border border-gray-200 overflow-x-auto ${students.length === 0 && !loading ? 'hidden' : ''}`}>
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                        Cargando reporte...
                    </div>
                ) : (
                    <div ref={componentRef} className="p-8 pb-16 bg-white min-w-[800px] printable-area" style={{ fontFamily: 'Arial, sans-serif' }}>

                        <style type="text/css" media="print">
                            {`
                                @page { size: portrait; margin: 15mm; }
                                body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                            `}
                        </style>

                        {/* Header Image Equivalent */}
                        <div className="flex items-center justify-center mb-6 border-b-2 border-transparent pb-4 relative">
                            {/* Dummy Logo for layout purposes, user can replace with actual Logo reference if desired, or we can use the imported Logo */}
                            <div className="absolute left-0 top-0">
                                <img src="/src/assets/Logo.png" alt="Logo" className="w-20" onError={(e) => e.target.style.display = 'none'} />
                            </div>

                            <div className="text-center w-full">
                                <h2 className="text-[17px] font-bold text-[#000080] m-0" style={{ color: '#000080' }}>INSTITUTO HUMBOLDT DE SAN LUIS, A.C.</h2>
                                <h3 className="text-[15px] font-normal text-[#000080] m-1" style={{ color: '#000080' }}>Listado de Alumnos por Grupo</h3>
                                <p className="text-[13px] text-[#000080]" style={{ color: '#000080' }}>
                                    Grupo "{groupInfo?.name || ''}" {selectedGrade ? grades.find(g => g.id.toString() === selectedGrade)?.name : ''} de {selectedLevel ? levels.find(l => l.id.toString() === selectedLevel)?.name : ''} Ciclo Escolar {periodName}
                                </p>
                            </div>
                        </div>

                        {/* Data Table */}
                        <table className="w-full text-sm border-collapse" style={{ border: '1px solid black' }}>
                            <thead>
                                <tr>
                                    <th className="border border-black p-1 text-center font-bold text-xs" style={{ width: '4%' }}>No.</th>
                                    <th className="border border-black p-1 text-left font-bold text-xs px-2" style={{ width: '30%' }}>Nombre del Alumno (a)</th>
                                    {/* Empty columns for marking (14 thin, 1 slightly wider at end) */}
                                    {Array.from({ length: 14 }).map((_, i) => (
                                        <th key={i} className="border border-black p-1" style={{ width: '4%' }}></th>
                                    ))}
                                    <th className="border border-black p-1" style={{ width: '6%' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => {
                                    const fullName = `${student.paternalSurname} ${student.maternalSurname || ''} ${student.firstName}`.toUpperCase();
                                    return (
                                        <tr key={student.id}>
                                            <td className="border border-black p-1 text-center text-xs font-bold">{index + 1}</td>
                                            <td className="border border-black p-1 px-2 text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis">{fullName}</td>
                                            {Array.from({ length: 14 }).map((_, i) => (
                                                <td key={`cell-${student.id}-${i}`} className="border border-black p-1 h-6"></td>
                                            ))}
                                            <td className="border border-black p-1 h-6"></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
};

export default ClassListReport;
