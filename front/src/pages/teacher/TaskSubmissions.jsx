import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, FileText, ExternalLink, MessageSquare, CheckSquare, Save, X } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const TaskSubmissions = () => {
    const { courseId, taskId } = useParams();
    const navigate = useNavigate();

    const [task, setTask] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Grading Modal State
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [gradeForm, setGradeForm] = useState({ grade: '', teacherFeedback: '' });

    useEffect(() => {
        fetchData();
    }, [taskId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [taskRes, subRes] = await Promise.all([
                fetch(`${API_BASE_URL}/CourseTasks/${taskId}`),
                fetch(`${API_BASE_URL}/TaskSubmissions/task/${taskId}`)
            ]);

            if (taskRes.ok) {
                setTask(await taskRes.json());
            }
            if (subRes.ok) {
                setSubmissions(await subRes.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenGradeModal = (submission) => {
        setSelectedSubmission(submission);
        setGradeForm({
            grade: submission.grade || '',
            teacherFeedback: submission.teacherFeedback || ''
        });
    };

    const handleSaveGrade = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                grade: parseFloat(gradeForm.grade),
                teacherFeedback: gradeForm.teacherFeedback
            };

            const res = await fetch(`${API_BASE_URL}/TaskSubmissions/${selectedSubmission.id}/grade`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSelectedSubmission(null);
                fetchData(); // Refresh list to get updated grades
            } else {
                alert("Error al guardar la calificación");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const renderSubmissionContent = (submission) => {
        if (!task) return null;

        if (submission.status === 'ASSIGNED') {
            return <div className="text-gray-400 italic">El estudiante aún no ha enviado la tarea.</div>;
        }

        switch (task.submissionType) {
            case 'FileUpload':
            case 'Multimedia':
                return (
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Archivo Adjunto:</p>
                        {submission.fileUrl ? (
                            <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline bg-blue-50 p-3 rounded-xl w-max">
                                <FileText size={18} /> Ver / Descargar Archivo
                            </a>
                        ) : (
                            <span className="text-red-500 text-sm">No se adjuntó archivo.</span>
                        )}
                    </div>
                );
            case 'OnlineText':
            case 'Discussion':
                return (
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Respuesta en Texto:</p>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 whitespace-pre-wrap text-sm min-h-[100px]">
                            {submission.textResponse || 'Sin respuesta.'}
                        </div>
                    </div>
                );
            case 'ExternalLink':
                return (
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Enlace Externo:</p>
                        {submission.textResponse ? (
                            <a href={submission.textResponse} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline bg-blue-50 p-3 rounded-xl w-max break-all">
                                <ExternalLink size={18} /> {submission.textResponse}
                            </a>
                        ) : (
                            <span className="text-red-500 text-sm">No se proporcionó enlace.</span>
                        )}
                    </div>
                );
            case 'Checklist':
                let items = [];
                try {
                    items = JSON.parse(submission.checklistResponsesJson || '[]');
                } catch { }

                return (
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Lista de Verificación (% Completado):</p>
                        <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            {items.length > 0 ? items.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <CheckSquare size={18} className={item.checked ? "text-green-500" : "text-gray-300"} />
                                    <span className={item.checked ? "text-gray-800" : "text-gray-400 line-through"}>{item.label}</span>
                                </div>
                            )) : (
                                <span className="text-gray-400 italic">No hay datos de lista de verificación.</span>
                            )}
                        </div>
                    </div>
                );
            default:
                return <div>Tipo de entrega no soportado.</div>;
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando entregas...</div>;
    if (!task) return <div className="p-8 text-center text-red-500">No se encontró la tarea.</div>;

    return (
        <div className="flex flex-col h-full space-y-6 max-w-6xl mx-auto w-full">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(`/teacher-tasks/${courseId}`)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Entregas: {task.title}</h2>
                        <p className="text-gray-500 text-sm flex gap-3">
                            <span>Tipo: <strong>{task.submissionType}</strong></span>
                            <span>|</span>
                            <span>Puntos Máximos: <strong>{task.maxScore}</strong></span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
                                <th className="p-4">Estudiante</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4">Fecha de Entrega</th>
                                <th className="p-4 text-center">Calificación</th>
                                <th className="p-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {submissions.map(sub => (
                                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-800">{sub.studentName}</div>
                                    </td>
                                    <td className="p-4">
                                        {sub.status === 'GRADED' && <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full"><CheckCircle size={14} /> Calificado</span>}
                                        {sub.status === 'SUBMITTED' && <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full"><MessageSquare size={14} /> Entregado</span>}
                                        {sub.status === 'ASSIGNED' && <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full"><Clock size={14} /> Pendiente</span>}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {sub.submissionDate ? new Date(sub.submissionDate).toLocaleString() : '-'}
                                    </td>
                                    <td className="p-4 text-center font-bold text-gray-800">
                                        {sub.grade !== null ? `${sub.grade} / ${task.maxScore}` : '-'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleOpenGradeModal(sub)}
                                            className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                                        >
                                            {sub.status === 'GRADED' ? 'Ver / Editar' : 'Revisar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {submissions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">
                                        No hay estudiantes asignados o entregas registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Grading Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Revisando: {selectedSubmission.studentName}</h3>
                                <p className="text-sm text-gray-500 mt-1">Tarea: {task.title}</p>
                            </div>
                            <button onClick={() => setSelectedSubmission(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Student Work Section */}
                            <div className="mb-8">
                                <h4 className="font-bold border-b border-gray-200 pb-2 mb-4 text-gray-800">Trabajo del Estudiante</h4>
                                {renderSubmissionContent(selectedSubmission)}
                            </div>

                            {/* Grading Section */}
                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
                                <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                                    <CheckCircle size={18} className="text-blue-600" /> Calificación y Retroalimentación
                                </h4>
                                <form id="gradeForm" onSubmit={handleSaveGrade} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Puntuación (Max: {task.maxScore})</label>
                                        <input
                                            type="number"
                                            className="w-48 border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-lg"
                                            value={gradeForm.grade}
                                            onChange={e => setGradeForm({ ...gradeForm, grade: e.target.value })}
                                            required
                                            min="0"
                                            max={task.maxScore}
                                            step="0.1"
                                            disabled={selectedSubmission.status === 'ASSIGNED'}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Comentarios del Profesor</label>
                                        <textarea
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
                                            value={gradeForm.teacherFeedback}
                                            onChange={e => setGradeForm({ ...gradeForm, teacherFeedback: e.target.value })}
                                            placeholder="Excelente trabajo observando los detalles..."
                                            disabled={selectedSubmission.status === 'ASSIGNED'}
                                        ></textarea>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50 rounded-b-2xl">
                            <button type="button" onClick={() => setSelectedSubmission(null)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 bg-white border border-gray-200 rounded-xl font-medium transition-colors shadow-sm">Cancelar</button>
                            <button
                                type="submit"
                                form="gradeForm"
                                disabled={selectedSubmission.status === 'ASSIGNED'}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-bold shadow-md transition-colors flex items-center gap-2"
                            >
                                <Save size={18} /> Guardar Calificación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskSubmissions;
