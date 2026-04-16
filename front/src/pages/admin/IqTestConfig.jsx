import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, ToggleLeft, ToggleRight, Calendar, Plus, X, Sparkles, Loader, CheckCircle, Eye, Edit } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const IqTestConfig = () => {
    const [tests, setTests] = useState([]);
    const [schoolGroups, setSchoolGroups] = useState([]);
    const [selectedTestId, setSelectedTestId] = useState(null);
    const [assignments, setAssignments] = useState([]); // Array of { groupId, isActive, startDate, endDate }
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Modal state for Creating Test
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTest, setNewTest] = useState({
        name: '',
        description: '',
        totalTimeMinutes: 45,
        targetSkill: 'General IQ'
    });

    // Modal state for AI Generator
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [generatingAi, setGeneratingAi] = useState(false);
    const [importingAi, setImportingAi] = useState(false);
    const [generatedPreview, setGeneratedPreview] = useState(null); // Will hold the parsed JSON
    const [aiParams, setAiParams] = useState({
        difficulty: 'Media',
        count: 5,
        educationalLevel: 'Primaria',
        customPrompt: ''
    });

    // View Questions State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [testDetails, setTestDetails] = useState(null);

    // Manual Question State
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [manualQuestion, setManualQuestion] = useState({
        sectionName: 'Sección Principal',
        text: '',
        difficulty: 1,
        abilityDomain: 'General',
        options: [
            { optionKey: 'A', text: '', isCorrect: true },
            { optionKey: 'B', text: '', isCorrect: false },
            { optionKey: 'C', text: '', isCorrect: false },
            { optionKey: 'D', text: '', isCorrect: false }
        ]
    });
    const [savingManual, setSavingManual] = useState(false);

    const targetSkillsList = [
        'General IQ', 'Lógica', 'Matemáticas', 'Verbal', 'Memoria', 'Visual', 'Velocidad'
    ];

    useEffect(() => {
        fetchTestsAndGroups();
    }, []);

    useEffect(() => {
        if (selectedTestId) {
            fetchAssignmentsForTest(selectedTestId);
        } else {
            setAssignments([]);
        }
    }, [selectedTestId]);

    const fetchTestsAndGroups = async () => {
        setLoading(true);
        try {
            const [testsRes, groupsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/IqTests`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
                fetch(`${API_BASE_URL}/SchoolGroups`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
            ]);

            if (testsRes.ok) setTests(await testsRes.json());
            if (groupsRes.ok) {
                const groupsData = await groupsRes.json();
                setSchoolGroups(groupsData.map(g => ({
                    id: g.id,
                    name: `${g.grade?.level?.name || ''} ${g.grade?.name || ''}${g.name}`,
                    level: g.grade?.level?.name || 'Desconocido'
                })));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignmentsForTest = async (testId) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/IqTests/${testId}/assignments`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                const mappedVars = data.map(d => ({
                    groupId: d.groupId,
                    isActive: d.isActive,
                    startDate: d.startDate ? d.startDate.split('T')[0] : '',
                    endDate: d.endDate ? d.endDate.split('T')[0] : ''
                }));
                const fullState = schoolGroups.map(g => {
                    const existing = mappedVars.find(m => m.groupId === g.id);
                    return existing ? existing : { groupId: g.id, isActive: false, startDate: '', endDate: '' };
                });
                setAssignments(fullState);
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = (groupId) => {
        setAssignments(prev => prev.map(a => 
            a.groupId === groupId ? { ...a, isActive: !a.isActive } : a
        ));
    };

    const handleDateChange = (groupId, field, value) => {
        setAssignments(prev => prev.map(a => 
            a.groupId === groupId ? { ...a, [field]: value } : a
        ));
    };

    const saveAssignment = async (assignmentObj) => {
        setSaving(true);
        try {
            const payload = {
                testId: selectedTestId,
                groupId: assignmentObj.groupId,
                isActive: assignmentObj.isActive,
                startDate: assignmentObj.startDate ? new Date(assignmentObj.startDate).toISOString() : null,
                endDate: assignmentObj.endDate ? new Date(assignmentObj.endDate).toISOString() : null
            };

            const response = await fetch(`${API_BASE_URL}/IqTests/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error('Save error', response);
            }
        } catch (error) {
            console.error('Save error', error);
        } finally {
            setSaving(false);
        }
    };

    const saveAllAssignments = async () => {
        setSaving(true);
        try {
            await Promise.all(assignments.map(a => saveAssignment(a)));
            alert('¡Todas las configuraciones se guardaron con éxito!');
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleCreateTest = async () => {
        if (!newTest.name || !newTest.targetSkill) {
            alert('Por favor complete el nombre y el rubro del examen.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/IqTests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: newTest.name,
                    description: newTest.description,
                    totalTimeMinutes: parseInt(newTest.totalTimeMinutes),
                    targetSkill: newTest.targetSkill,
                    isActive: true
                })
            });

            if (response.ok) {
                const created = await response.json();
                setTests([...tests, created]);
                setSelectedTestId(created.id);
                setIsModalOpen(false);
                setNewTest({ name: '', description: '', totalTimeMinutes: 45, targetSkill: 'General IQ' });
            } else {
                alert('No se pudo crear la evaluación.');
            }
        } catch (error) {
            console.error('Error creating test:', error);
            alert('Error de red al intentar crear.');
        }
    };

    const handleGenerateAiQuestions = async () => {
        const selectedTest = tests.find(t => t.id === selectedTestId);
        if (!selectedTest) return;

        setGeneratingAi(true);
        setGeneratedPreview(null);
        try {
            const response = await fetch(`${API_BASE_URL}/AI/generate-iq-questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    targetSkill: selectedTest.targetSkill || 'General IQ',
                    difficulty: aiParams.difficulty,
                    count: parseInt(aiParams.count),
                    educationalLevel: aiParams.educationalLevel,
                    customPrompt: aiParams.customPrompt
                })
            });

            if (response.ok) {
                const data = await response.json();
                setGeneratedPreview(data);
            } else {
                alert('Hubo un problema generando las preguntas. Asegúrate de tener IA configurada.');
            }
        } catch (error) {
            console.error('Error auto-generating:', error);
        } finally {
            setGeneratingAi(false);
        }
    };

    const handleImportAiQuestions = async () => {
        if (!generatedPreview) return;
        setImportingAi(true);
        try {
            const response = await fetch(`${API_BASE_URL}/IqTests/${selectedTestId}/import-questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(generatedPreview)
            });

            if (response.ok) {
                alert('¡Preguntas importadas exitosamente a la evaluación!');
                setIsAiModalOpen(false);
                setGeneratedPreview(null);
            } else {
                alert('No se pudieron importar las preguntas. Verifica la conexión.');
            }
        } catch (error) {
            console.error('Error importing:', error);
        } finally {
            setImportingAi(false);
        }
    };

    const handleViewQuestions = async () => {
        if (!selectedTestId) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/IqTests/${selectedTestId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setTestDetails(data);
                setIsViewModalOpen(true);
            }
        } catch (error) {
            console.error('Error fetching test details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenManualQuestion = () => {
        const selectedTest = tests.find(t => t.id === selectedTestId);
        setManualQuestion({
            sectionName: 'Sección Principal',
            text: '',
            difficulty: 1,
            abilityDomain: selectedTest?.targetSkill || 'General',
            options: [
                { optionKey: 'A', text: '', isCorrect: true },
                { optionKey: 'B', text: '', isCorrect: false },
                { optionKey: 'C', text: '', isCorrect: false },
                { optionKey: 'D', text: '', isCorrect: false }
            ]
        });
        setIsManualModalOpen(true);
    };

    const handleSaveManualQuestion = async () => {
        if (!manualQuestion.text || manualQuestion.options.some(o => !o.text)) {
            alert("Por favor completa el texto de la pregunta y todas las opciones.");
            return;
        }
        if (!manualQuestion.options.some(o => o.isCorrect)) {
            alert("Debe haber al menos una opción correcta.");
            return;
        }

        setSavingManual(true);
        const payload = {
            sections: [
                {
                    name: manualQuestion.sectionName,
                    questions: [
                        {
                            text: manualQuestion.text,
                            difficulty: parseInt(manualQuestion.difficulty),
                            abilityDomain: manualQuestion.abilityDomain,
                            options: manualQuestion.options
                        }
                    ]
                }
            ]
        };

        try {
            const response = await fetch(`${API_BASE_URL}/IqTests/${selectedTestId}/import-questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('¡Pregunta añadida correctamente!');
                setIsManualModalOpen(false);
                if (isViewModalOpen) {
                    handleViewQuestions(); // Refresh list if open
                }
            } else {
                alert('Error al añadir la pregunta.');
            }
        } catch (error) {
            console.error('Error adding manual question:', error);
            alert('Error de red al crear pregunta manual.');
        } finally {
            setSavingManual(false);
        }
    };

    const handleManualOptionToggleCorrect = (index) => {
        const newOptions = manualQuestion.options.map((o, i) => ({
            ...o,
            isCorrect: i === index
        }));
        setManualQuestion({ ...manualQuestion, options: newOptions });
    };

    const handleManualOptionTextChange = (index, text) => {
        const newOptions = [...manualQuestion.options];
        newOptions[index].text = text;
        setManualQuestion({ ...manualQuestion, options: newOptions });
    };

    const groupsByLevel = schoolGroups.reduce((acc, group) => {
        if (!acc[group.level]) acc[group.level] = [];
        acc[group.level].push(group);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-3xl p-8 text-white shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                        <Settings size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Configuración de Evaluaciones</h1>
                        <p className="text-blue-100 mt-1">Activa o desactiva exámenes psicométricos y de razonamiento por grupo</p>
                    </div>
                </div>
            </div>

            {loading && !selectedTestId && tests.length === 0 ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="mb-8 flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-1/2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Seleccione una Evaluación</label>
                            <select
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-shadow"
                                value={selectedTestId || ''}
                                onChange={(e) => setSelectedTestId(Number(e.target.value))}
                            >
                                <option value="">-- Elija un Examen --</option>
                                {tests.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} {t.targetSkill ? `[${t.targetSkill}]` : ''} ({t.totalTimeMinutes} min)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-medium transition-colors border border-indigo-200"
                            >
                                <Plus size={18} />
                                Nueva Evaluación
                            </button>
                            {selectedTestId && (
                                <>
                                    <button
                                        onClick={() => setIsAiModalOpen(true)}
                                        className="flex items-center gap-2 px-6 py-3 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl font-medium transition-colors border border-purple-200 shadow-sm"
                                    >
                                        <Sparkles size={18} />
                                        Generador IA
                                    </button>
                                    <button
                                        onClick={handleViewQuestions}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-medium transition-colors border border-blue-200 shadow-sm"
                                    >
                                        <Eye size={18} />
                                        Ver Preguntas
                                    </button>
                                    <button
                                        onClick={handleOpenManualQuestion}
                                        className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl font-medium transition-colors border border-green-200 shadow-sm"
                                    >
                                        <Edit size={18} />
                                        Añadir Manual
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {selectedTestId && assignments.length > 0 && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="text-blue-600" size={20} />
                                    <p className="text-sm text-blue-800">
                                        Activa o desactiva la prueba seleccionada masivamente para cada grupo.
                                    </p>
                                </div>
                                <button
                                    onClick={saveAllAssignments}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {saving ? 'Guardando...' : 'Guardar Todo'}
                                </button>
                            </div>

                            {Object.entries(groupsByLevel).map(([level, groups]) => (
                                <div key={level} className="border border-gray-100 rounded-2xl overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                        <h3 className="font-semibold text-gray-800">{level}</h3>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {groups.map(group => {
                                            const assignRecord = assignments.find(a => a.groupId === group.id);
                                            if (!assignRecord) return null;

                                            return (
                                                <div key={group.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                                                    <div className="flex items-center gap-4 min-w-[200px]">
                                                        <button 
                                                            onClick={() => handleToggleActive(group.id)}
                                                            className={`transition-colors ${assignRecord.isActive ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}
                                                        >
                                                            {assignRecord.isActive ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                                                        </button>
                                                        <div>
                                                            <p className="font-semibold text-gray-800">{group.name}</p>
                                                            <p className="text-xs text-gray-500">{assignRecord.isActive ? 'Activado' : 'Inactivo'}</p>
                                                        </div>
                                                    </div>

                                                    <div className={`flex flex-wrap gap-4 transition-opacity duration-300 ${assignRecord.isActive ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-medium text-gray-500 flex items-center gap-1"><Calendar size={12}/> Válido Desde</label>
                                                            <input 
                                                                type="date" 
                                                                value={assignRecord.startDate}
                                                                onChange={(e) => handleDateChange(group.id, 'startDate', e.target.value)}
                                                                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-medium text-gray-500 flex items-center gap-1"><Calendar size={12}/> Válido Hasta</label>
                                                            <input 
                                                                type="date" 
                                                                value={assignRecord.endDate}
                                                                onChange={(e) => handleDateChange(group.id, 'endDate', e.target.value)}
                                                                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Create Test Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-semibold text-gray-800 text-lg">Nueva Evaluación Psicométrica</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Examen</label>
                                <input
                                    type="text"
                                    value={newTest.name}
                                    placeholder="Ej. Examen de Razonamiento"
                                    onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                                <textarea
                                    value={newTest.description}
                                    placeholder="Detalles sobre el enfoque de esta prueba"
                                    onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 h-24 resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tiempo (Minutos)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newTest.totalTimeMinutes}
                                        onChange={(e) => setNewTest({ ...newTest, totalTimeMinutes: e.target.value })}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Habilidad a Evaluar</label>
                                    <select
                                        value={newTest.targetSkill}
                                        onChange={(e) => setNewTest({ ...newTest, targetSkill: e.target.value })}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    >
                                        {targetSkillsList.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 rounded-b-3xl">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2 font-medium text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateTest}
                                className="px-6 py-2 font-medium bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 hover:shadow transition-all"
                            >
                                Crear Examen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Generator Modal */}
            {isAiModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-purple-100 bg-purple-50/50">
                            <div className="flex items-center gap-3">
                                <Sparkles className="text-purple-600" />
                                <div>
                                    <h3 className="font-bold text-purple-900 text-lg">Asistente de Inteligencia Artificial</h3>
                                    <p className="text-xs text-purple-600">Autogeneración de reactivos estructurados</p>
                                </div>
                            </div>
                            <button onClick={() => { setIsAiModalOpen(false); setGeneratedPreview(null); }} className="text-purple-400 hover:text-purple-700 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            {!generatedPreview ? (
                                <div className="space-y-6">
                                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                        <h4 className="font-semibold text-gray-800 mb-2">Parámetros de Generación</h4>
                                        <p className="text-sm text-gray-500 mb-6">El modelo construirá preguntas originales respetando la habilidad matriz de esta prueba.</p>
                                        
                                        <div className="flex flex-col gap-4">
                                            <div className="flex justify-center gap-4">
                                                <div className="flex-1 text-left space-y-1">
                                                    <label className="text-sm font-semibold text-gray-700">Nivel Educativo</label>
                                                    <select 
                                                        className="w-full border-gray-300 rounded-xl px-4 py-2 bg-white border outline-none focus:ring-2 focus:ring-purple-500/20"
                                                        value={aiParams.educationalLevel}
                                                        onChange={(e) => setAiParams({...aiParams, educationalLevel: e.target.value})}
                                                    >
                                                        <option value="Kinder">Kinder</option>
                                                        <option value="Primaria">Primaria</option>
                                                        <option value="Secundaria">Secundaria</option>
                                                        <option value="Preparatoria">Preparatoria</option>
                                                    </select>
                                                </div>
                                                <div className="flex-1 text-left space-y-1">
                                                    <label className="text-sm font-semibold text-gray-700">Dificultad Base</label>
                                                    <select 
                                                        className="w-full border-gray-300 rounded-xl px-4 py-2 bg-white border outline-none focus:ring-2 focus:ring-purple-500/20"
                                                        value={aiParams.difficulty}
                                                        onChange={(e) => setAiParams({...aiParams, difficulty: e.target.value})}
                                                    >
                                                        <option value="Básica">Básica</option>
                                                        <option value="Media">Media</option>
                                                        <option value="Avanzada">Avanzada</option>
                                                    </select>
                                                </div>
                                                <div className="flex-1 text-left space-y-1">
                                                    <label className="text-sm font-semibold text-gray-700">Cantidad Reactivos</label>
                                                    <input 
                                                        type="number" min="1" max="25"
                                                        className="w-full border-gray-300 rounded-xl px-4 py-2 border outline-none focus:ring-2 focus:ring-purple-500/20"
                                                        value={aiParams.count}
                                                        onChange={(e) => setAiParams({...aiParams, count: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-left space-y-1">
                                                <label className="text-sm font-semibold text-gray-700">Contexto o Prompt Específico (Opcional)</label>
                                                <textarea
                                                    className="w-full border-gray-300 rounded-xl px-4 py-2 border outline-none focus:ring-2 focus:ring-purple-500/20 min-h-[80px]"
                                                    placeholder="Ej. Haz que todas las preguntas sean sobre dinosaurios y ciencia..."
                                                    value={aiParams.customPrompt}
                                                    onChange={(e) => setAiParams({...aiParams, customPrompt: e.target.value})}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-center pt-4">
                                        <button 
                                            onClick={handleGenerateAiQuestions} 
                                            disabled={generatingAi}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-2xl px-12 py-4 shadow-lg shadow-purple-500/30 flex items-center gap-3 transition-all disabled:opacity-50"
                                        >
                                            {generatingAi ? <Loader className="animate-spin" /> : <Sparkles />}
                                            {generatingAi ? 'Analizando contexto...' : 'Crear Preguntas Mágicamente'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-green-50 p-4 rounded-xl flex items-start gap-3 border border-green-100">
                                        <CheckCircle className="text-green-600 shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-green-900">¡Borrador Generado con Éxito!</h4>
                                            <p className="text-sm text-green-700">Revisa la estructura propuesta abajo. Si estás de acuerdo, procede a importarla al Test.</p>
                                        </div>
                                    </div>

                                    {/* Preview Renderer */}
                                    <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
                                        {generatedPreview.sections?.map((sec, i) => (
                                            <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                                <div className="bg-gray-100 px-5 py-3 border-b border-gray-200">
                                                    <h3 className="font-bold text-gray-800">{sec.name} <span className="text-sm font-normal text-gray-500 ml-2">({sec.questions?.length || 0} Preguntas)</span></h3>
                                                </div>
                                                <div className="divide-y divide-gray-100">
                                                    {sec.questions?.map((q, j) => (
                                                        <div key={j} className="p-5">
                                                            <p className="font-medium text-gray-900 mb-4"><span className="text-blue-600 mr-2">{j+1}.</span>{q.text}</p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                                                                {q.options?.map((opt, k) => (
                                                                    <div key={k} className={`p-3 rounded-lg border ${opt.isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                                                        <span className="font-bold mr-2">{opt.optionKey}.</span>{opt.text}
                                                                        {opt.isCorrect && <span className="float-right bg-green-200 text-green-900 text-xs px-2 py-0.5 rounded-full font-bold">✔</span>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {generatedPreview && (
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex justify-between items-center rounded-b-3xl">
                                <button
                                    onClick={() => setGeneratedPreview(null)}
                                    className="px-5 py-2 font-medium text-gray-500 hover:text-gray-800 transition-colors"
                                >
                                    Descartar Borrador
                                </button>
                                <button
                                    onClick={handleImportAiQuestions}
                                    disabled={importingAi}
                                    className="px-8 py-3 font-semibold bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition-all flex items-center gap-2 group disabled:opacity-50"
                                >
                                    {importingAi ? <Loader className="animate-spin" size={20} /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                                    Confirmar e Importar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* View Questions Modal */}
            {isViewModalOpen && testDetails && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-blue-100 bg-blue-50/50">
                            <div className="flex items-center gap-3">
                                <Eye className="text-blue-600" />
                                <div>
                                    <h3 className="font-bold text-blue-900 text-lg">Preguntas de la Evaluación</h3>
                                    <p className="text-xs text-blue-600">{testDetails.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsViewModalOpen(false)} className="text-blue-400 hover:text-blue-700 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto">
                            {testDetails.sections && testDetails.sections.length > 0 ? (
                                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                                    {testDetails.sections.map((sec, i) => (
                                        <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                            <div className="bg-gray-100 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                                                <h3 className="font-bold text-gray-800">{sec.name} <span className="text-sm font-normal text-gray-500 ml-2">({sec.questions?.length || 0} Preguntas)</span></h3>
                                            </div>
                                            <div className="divide-y divide-gray-100">
                                                {sec.questions?.map((q, j) => (
                                                    <div key={j} className="p-5">
                                                        <p className="font-medium text-gray-900 mb-4"><span className="text-blue-600 mr-2">{j+1}.</span>{q.text}</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                                                            {q.options?.map((opt, k) => (
                                                                <div key={k} className={`p-3 rounded-lg border ${opt.isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                                                    <span className="font-bold mr-2">{opt.optionKey}.</span>{opt.text}
                                                                    {opt.isCorrect && <span className="float-right bg-green-200 text-green-900 text-xs px-2 py-0.5 rounded-full font-bold">✔</span>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <p>No hay preguntas generadas para este examen aún.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Question Modal */}
            {isManualModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-green-100 bg-green-50/50">
                            <div className="flex items-center gap-3">
                                <Edit className="text-green-600" />
                                <div>
                                    <h3 className="font-bold text-green-900 text-lg">Añadir Pregunta Manual</h3>
                                </div>
                            </div>
                            <button onClick={() => setIsManualModalOpen(false)} className="text-green-400 hover:text-green-700 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto space-y-5">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Sección</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                                        value={manualQuestion.sectionName}
                                        onChange={(e) => setManualQuestion({...manualQuestion, sectionName: e.target.value})}
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Dificultad (1-10)</label>
                                    <input 
                                        type="number" min="1" max="10"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                                        value={manualQuestion.difficulty}
                                        onChange={(e) => setManualQuestion({...manualQuestion, difficulty: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Texto de la Pregunta</label>
                                <textarea 
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none min-h-[80px]"
                                    value={manualQuestion.text}
                                    placeholder="Escribe la pregunta aquí..."
                                    onChange={(e) => setManualQuestion({...manualQuestion, text: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Opciones de Respuesta (Marca la correcta)</label>
                                <div className="space-y-3">
                                    {manualQuestion.options.map((opt, i) => (
                                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${opt.isCorrect ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                            <button 
                                                onClick={() => handleManualOptionToggleCorrect(i)}
                                                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${opt.isCorrect ? 'bg-green-500 border-green-500 text-white shadow-sm' : 'bg-white border-gray-300'}`}
                                            >
                                                {opt.isCorrect && <CheckCircle size={14} />}
                                            </button>
                                            <span className="font-bold text-gray-600">{opt.optionKey}.</span>
                                            <input 
                                                type="text" 
                                                className="w-full bg-transparent border-none outline-none focus:ring-0 text-gray-800"
                                                placeholder={`Texto de la opción ${opt.optionKey}`}
                                                value={opt.text}
                                                onChange={(e) => handleManualOptionTextChange(i, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex justify-end gap-3 rounded-b-3xl">
                            <button
                                onClick={() => setIsManualModalOpen(false)}
                                className="px-5 py-2 font-medium text-gray-500 hover:text-gray-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveManualQuestion}
                                disabled={savingManual}
                                className="px-8 py-2.5 font-semibold bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {savingManual ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                Guardar Pregunta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IqTestConfig;
