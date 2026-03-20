import React, { useState, useEffect, useRef } from 'react';
import {
    Plus, Search, Edit2, Trash2, Library, BookOpen,
    Save, X, Image as ImageIcon, CheckCircle, Circle
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const QuestionPools = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [pools, setPools] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pool Modal
    const [showPoolModal, setShowPoolModal] = useState(false);
    const [poolForm, setPoolForm] = useState({ name: '', description: '' });

    // Questions View
    const [selectedPool, setSelectedPool] = useState(null);
    const [showQuestionModal, setShowQuestionModal] = useState(false);

    // Question Form
    const [qForm, setQForm] = useState({
        questionText: '',
        questionType: 'multiple_choice',
        points: 1,
        imageUrl: '',
        // For Multiple Choice / Open
        options: [{ id: 1, text: '', isCorrect: true }],
        // For True/False
        tfCorrect: 'true'
    });

    const fileInputRef = useRef(null);

    const TEACHER_ID = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')) : 0;

    useEffect(() => {
        if (TEACHER_ID) {
            fetchCourses();
        }
    }, [TEACHER_ID]);

    useEffect(() => {
        if (selectedCourseId) {
            fetchPools();
            setSelectedPool(null);
        } else {
            setPools([]);
        }
    }, [selectedCourseId]);

    const fetchCourses = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/Teachers/${TEACHER_ID}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCourses(data.courses || []);
                if (data.courses && data.courses.length > 0) {
                    setSelectedCourseId(data.courses[0].id.toString());
                }
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchPools = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/QuestionPools/course/${selectedCourseId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPools(data);
            }
        } catch (error) {
            console.error('Error fetching pools:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePool = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: poolForm.name,
                description: poolForm.description,
                teacherId: TEACHER_ID,
                courseId: parseInt(selectedCourseId)
            };
            const response = await fetch(`${API_BASE_URL}/QuestionPools`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setShowPoolModal(false);
                setPoolForm({ name: '', description: '' });
                fetchPools(); // Refresh list
            } else {
                alert('Error al crear banco');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setQForm(prev => ({ ...prev, imageUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const addOption = () => {
        const newId = qForm.options.length > 0 ? Math.max(...qForm.options.map(o => o.id)) + 1 : 1;
        setQForm(prev => ({
            ...prev,
            options: [...prev.options, { id: newId, text: '', isCorrect: false }]
        }));
    };

    const removeOption = (id) => {
        setQForm(prev => ({
            ...prev,
            options: prev.options.filter(o => o.id !== id)
        }));
    };

    const updateOption = (id, field, value) => {
        setQForm(prev => ({
            ...prev,
            options: prev.options.map(o => {
                if (o.id === id) {
                    return { ...o, [field]: value };
                }
                // If setting this to correct, un-correct others (single correct answer logic for simple multiple choice)
                if (field === 'isCorrect' && value === true) {
                    return { ...o, isCorrect: false };
                }
                return o;
            })
        }));
    };

    const handleSaveQuestion = async (e) => {
        e.preventDefault();
        if (!selectedPool) return;

        let optionsJson = null;
        let correctAnswerJson = null;

        if (qForm.questionType === 'multiple_choice') {
            optionsJson = JSON.stringify(qForm.options);
            const correctOpts = qForm.options.filter(o => o.isCorrect).map(o => o.id);
            correctAnswerJson = JSON.stringify(correctOpts.length ? correctOpts : [qForm.options[0].id]);
        } else if (qForm.questionType === 'true_false') {
            optionsJson = JSON.stringify([
                { id: 1, text: 'Verdadero', isCorrect: qForm.tfCorrect === 'true' },
                { id: 2, text: 'Falso', isCorrect: qForm.tfCorrect === 'false' }
            ]);
            correctAnswerJson = JSON.stringify([qForm.tfCorrect === 'true' ? 1 : 2]);
        } else {
            // OPEN question
            optionsJson = JSON.stringify([]);
            correctAnswerJson = JSON.stringify([]);
        }

        const payload = {
            poolId: selectedPool.id,
            questionText: qForm.questionText,
            questionType: qForm.questionType,
            points: qForm.points,
            imageUrl: qForm.imageUrl || null,
            optionsJson: optionsJson,
            correctAnswerJson: correctAnswerJson
        };

        try {
            const response = await fetch(`${API_BASE_URL}/QuestionPools/${selectedPool.id}/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Refresh pool details
                const updatedPoolResp = await fetch(`${API_BASE_URL}/QuestionPools/${selectedPool.id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (updatedPoolResp.ok) {
                    setSelectedPool(await updatedPoolResp.json());
                }

                setShowQuestionModal(false);
                setQForm({
                    questionText: '', questionType: 'multiple_choice', points: 1, imageUrl: '',
                    options: [{ id: 1, text: '', isCorrect: true }], tfCorrect: 'true'
                });
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                alert('Error al guardar pregunta');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Library className="text-blue-600" /> Bancos de Preguntas
                    </h1>
                    <p className="text-gray-500 mt-1">Crea y administra repositorios de preguntas para tus exámenes</p>
                </div>
                {courses.length > 0 && (
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-600">Materia:</label>
                        <select
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                        >
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {selectedCourseId ? (
                <div className="flex gap-6">
                    {/* Pools List */}
                    <div className="w-1/3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold text-gray-800">Tus Bancos</h2>
                            <button
                                onClick={() => setShowPoolModal(true)}
                                className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {loading ? (
                            <p className="text-sm text-gray-500">Cargando...</p>
                        ) : pools.length > 0 ? (
                            <div className="space-y-3">
                                {pools.map(pool => (
                                    <div
                                        key={pool.id}
                                        onClick={() => setSelectedPool(pool)}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedPool?.id === pool.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        <h3 className="font-semibold text-gray-800">{pool.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1 truncate">{pool.description}</p>
                                        <div className="text-xs text-blue-600 mt-2 font-medium">
                                            {pool.questions?.length || 0} preguntas
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-4">No hay bancos creados para esta materia.</p>
                        )}
                    </div>

                    {/* Selected Pool Details */}
                    <div className="w-2/3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        {selectedPool ? (
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">{selectedPool.name}</h2>
                                        <p className="text-sm text-gray-500 mt-1">{selectedPool.description}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowQuestionModal(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <Plus size={16} /> Nueva Pregunta
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {selectedPool.questions && selectedPool.questions.length > 0 ? (
                                        selectedPool.questions.map((q, idx) => (
                                            <div key={q.id} className="p-4 border border-gray-100 bg-gray-50 rounded-xl">
                                                <div className="flex justify-between">
                                                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{q.questionType.replace('_', ' ')} • {q.points} PTS</span>
                                                    <span className="text-xs text-gray-400">#{idx + 1}</span>
                                                </div>
                                                <p className="font-medium text-gray-800 mt-2">{q.questionText}</p>

                                                {q.imageUrl && (
                                                    <img src={q.imageUrl} alt="Ref" className="mt-3 max-h-32 rounded-lg border border-gray-200 object-contain" />
                                                )}

                                                {q.questionType === 'multiple_choice' && q.optionsJson && (
                                                    <div className="mt-3 space-y-1">
                                                        {JSON.parse(q.optionsJson).map((opt, i) => (
                                                            <div key={i} className={`text-sm px-3 py-1.5 rounded-lg border ${opt.isCorrect ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600'}`}>
                                                                {opt.isCorrect && <CheckCircle size={14} className="inline mr-2" />}
                                                                {!opt.isCorrect && <Circle size={14} className="inline mr-2 text-gray-300" />}
                                                                {opt.text}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {q.questionType === 'true_false' && q.optionsJson && (
                                                    <div className="mt-3 flex gap-4">
                                                        {JSON.parse(q.optionsJson).map((opt, i) => (
                                                            <div key={i} className={`text-sm px-4 py-1.5 rounded-lg border font-medium ${opt.isCorrect ? 'border-green-400 bg-green-50 text-green-700 font-bold' : 'border-gray-200 bg-white text-gray-500'}`}>
                                                                {opt.text} {opt.isCorrect && '(Correcta)'}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl">
                                            Aún no hay preguntas. Haz clic en "Nueva Pregunta" para comenzar.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 flex-col gap-3">
                                <BookOpen size={48} className="opacity-20" />
                                <p>Selecciona un banco para ver sus preguntas</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 text-gray-500">
                    No tienes materias asignadas o seleccionadas.
                </div>
            )}

            {/* Create Pool Modal */}
            {showPoolModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Nuevo Banco de Preguntas</h3>
                            <button onClick={() => setShowPoolModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreatePool} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    required
                                    className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={poolForm.name}
                                    onChange={e => setPoolForm({ ...poolForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <textarea
                                    className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none h-20"
                                    value={poolForm.description}
                                    onChange={e => setPoolForm({ ...poolForm, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowPoolModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Crear Banco</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Question Modal */}
            {showQuestionModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Agregar Pregunta</h3>
                            <button onClick={() => setShowQuestionModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSaveQuestion} className="space-y-5">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pregunta</label>
                                    <select
                                        className="w-full border p-2.5 rounded-lg"
                                        value={qForm.questionType}
                                        onChange={e => setQForm({ ...qForm, questionType: e.target.value })}
                                    >
                                        <option value="multiple_choice">Opción Múltiple</option>
                                        <option value="true_false">Verdadero / Falso</option>
                                        <option value="open">Abierta</option>
                                    </select>
                                </div>
                                <div className="w-24">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Puntos</label>
                                    <input
                                        type="number" min="0.5" step="0.5" required
                                        className="w-full border p-2.5 rounded-lg"
                                        value={qForm.points}
                                        onChange={e => setQForm({ ...qForm, points: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Texto de la Pregunta</label>
                                <textarea
                                    required
                                    className="w-full border p-2.5 rounded-lg resize-none h-24"
                                    placeholder="Escribe la pregunta aquí..."
                                    value={qForm.questionText}
                                    onChange={e => setQForm({ ...qForm, questionText: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Imagen de Apoyo (Opcional)</label>
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition">
                                        <ImageIcon size={18} /> Seleccionar Imagen
                                        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                    {qForm.imageUrl && (
                                        <div className="relative">
                                            <img src={qForm.imageUrl} alt="Preview" className="h-16 w-16 object-cover rounded-lg border" />
                                            <button
                                                type="button"
                                                onClick={() => setQForm({ ...qForm, imageUrl: '' })}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dynamic Options Area */}
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-6">
                                {qForm.questionType === 'multiple_choice' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="text-sm font-medium text-gray-700">Opciones de Respuesta</label>
                                            <button
                                                type="button" onClick={addOption}
                                                className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
                                            >
                                                <Plus size={16} /> Añadir Opción
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {qForm.options.map((opt, idx) => (
                                                <div key={opt.id} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200">
                                                    <input
                                                        type="radio"
                                                        name="correctOption"
                                                        checked={opt.isCorrect}
                                                        onChange={() => updateOption(opt.id, 'isCorrect', true)}
                                                        className="w-4 h-4 text-blue-600 cursor-pointer"
                                                        title="Marcar como correcta"
                                                    />
                                                    <input
                                                        required
                                                        placeholder={`Opción ${idx + 1}...`}
                                                        className="flex-1 text-sm border-none focus:ring-0 p-1"
                                                        value={opt.text}
                                                        onChange={e => updateOption(opt.id, 'text', e.target.value)}
                                                    />
                                                    {qForm.options.length > 1 && (
                                                        <button
                                                            type="button" onClick={() => removeOption(opt.id)}
                                                            className="text-red-400 hover:text-red-600 p-1"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {qForm.questionType === 'true_false' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Respuesta Correcta</label>
                                        <div className="flex gap-4">
                                            <label className={`flex-1 cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 transition ${qForm.tfCorrect === 'true' ? 'border-green-500 bg-green-50 text-green-700 font-medium' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                                <input type="radio" name="tf" value="true" checked={qForm.tfCorrect === 'true'} onChange={e => setQForm({ ...qForm, tfCorrect: e.target.value })} className="hidden" />
                                                Verdadero
                                            </label>
                                            <label className={`flex-1 cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 transition ${qForm.tfCorrect === 'false' ? 'border-red-500 bg-red-50 text-red-700 font-medium' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                                <input type="radio" name="tf" value="false" checked={qForm.tfCorrect === 'false'} onChange={e => setQForm({ ...qForm, tfCorrect: e.target.value })} className="hidden" />
                                                Falso
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {qForm.questionType === 'open' && (
                                    <div className="text-sm text-gray-500 text-center py-4 italic">
                                        Las preguntas abiertas requieren calificación manual del docente y no tienen una "respuesta pre-programada".
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setShowQuestionModal(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition">Cancelar</button>
                                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition flex items-center gap-2">
                                    <Save size={18} /> Guardar Pregunta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionPools;
