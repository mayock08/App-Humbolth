import React, { useState } from 'react';
import { X, Send, CheckSquare, UploadCloud, Link as LinkIcon, FileText, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const TaskSubmissionForm = ({ task, submission, onClose }) => {
    const isGraded = submission?.status === 'GRADED';
    const isSubmitted = submission?.status === 'SUBMITTED' || isGraded;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        textResponse: submission?.textResponse || '',
        fileUrl: submission?.fileUrl || ''
    });

    const initialChecklist = () => {
        if (submission?.checklistResponsesJson) {
            try { return JSON.parse(submission.checklistResponsesJson); } catch { }
        }
        if (task.checklistItemsJson) {
            try {
                const items = JSON.parse(task.checklistItemsJson);
                return items.map(label => ({ label, checked: false }));
            } catch { }
        }
        return [];
    };

    const [checklistData, setChecklistData] = useState(initialChecklist());

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalChecklistJson = null;
            if (task.submissionType === 'Checklist') {
                finalChecklistJson = JSON.stringify(checklistData);
            }

            const payload = {
                textResponse: formData.textResponse,
                fileUrl: formData.fileUrl,
                checklistResponsesJson: finalChecklistJson
            };

            const res = await fetch(`${API_BASE_URL}/TaskSubmissions/${submission.id}/submit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                onClose(true); // Close and refresh list
            } else {
                alert("Error al enviar la tarea.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleChecklist = (index) => {
        if (isSubmitted) return;
        const newData = [...checklistData];
        newData[index].checked = !newData[index].checked;
        setChecklistData(newData);
    };

    const renderInput = () => {
        switch (task.submissionType) {
            case 'FileUpload':
            case 'Multimedia':
                return (
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">Adjuntar Archivo / Enlace a Multimedia</label>
                        {!isSubmitted ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                                <UploadCloud size={32} className="mx-auto text-blue-500 mb-2" />
                                <p className="text-sm text-gray-600 mb-4">Sube un archivo a tu almacenamiento preferido (Drive, Dropbox) y pega el enlace aquí, o ingresa el URL del archivo.</p>
                                <input
                                    type="url"
                                    placeholder="https://ejemplo.com/archivo..."
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.fileUrl}
                                    onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                                    required
                                />
                            </div>
                        ) : (
                            <div className="bg-blue-50 p-4 rounded-xl">
                                <a href={formData.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-700 font-medium hover:underline break-all">
                                    <FileText size={18} /> {formData.fileUrl}
                                </a>
                            </div>
                        )}
                    </div>
                );
            case 'OnlineText':
            case 'Discussion':
                return (
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">Tu Respuesta</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[150px]"
                            placeholder="Escribe tu respuesta aquí..."
                            value={formData.textResponse}
                            onChange={e => setFormData({ ...formData, textResponse: e.target.value })}
                            required
                            disabled={isSubmitted}
                        ></textarea>
                    </div>
                );
            case 'ExternalLink':
                return (
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">Enlace Web</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-4 top-3.5 text-gray-400" size={18} />
                            <input
                                type="url"
                                className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="https://ejemplo.com/proyecto"
                                value={formData.textResponse}
                                onChange={e => setFormData({ ...formData, textResponse: e.target.value })}
                                required
                                disabled={isSubmitted}
                            />
                        </div>
                    </div>
                );
            case 'Checklist':
                return (
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <CheckSquare size={18} className="text-blue-600" /> Lista de Verificación
                        </label>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                            {checklistData.map((item, idx) => (
                                <label key={idx} className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer ${isSubmitted ? 'cursor-default' : 'hover:bg-gray-100'}`}>
                                    <input
                                        type="checkbox"
                                        className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        checked={item.checked}
                                        onChange={() => toggleChecklist(idx)}
                                        disabled={isSubmitted}
                                    />
                                    <span className={`${item.checked ? 'text-gray-900 font-medium' : 'text-gray-600 line-through opacity-70'} leading-snug`}>{item.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-100 shrink-0 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">{task.submissionType}</span>
                            {isGraded && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-md">Calificado</span>}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">{task.title}</h2>
                    </div>
                    <button onClick={() => onClose(false)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Instructions */}
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-indigo-900 mb-2">Instrucciones</h4>
                        <p className="text-indigo-800 text-sm whitespace-pre-wrap">{task.description}</p>
                    </div>

                    {/* Teacher Feedback (if any) */}
                    {isGraded && submission.teacherFeedback && (
                        <div className="bg-green-50/80 border border-green-200 rounded-xl p-4 shadow-sm">
                            <h4 className="text-sm font-bold text-green-900 mb-1 flex items-center gap-2"><AlertCircle size={16} /> Comentarios del Profesor</h4>
                            <p className="text-green-800 text-sm whitespace-pre-wrap">{submission.teacherFeedback}</p>
                        </div>
                    )}

                    {/* Input Area */}
                    <form id="submissionForm" onSubmit={handleSubmit} className="space-y-4">
                        {renderInput()}
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl shrink-0 flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-500">
                        Puntuación Máxima: <span className="text-gray-800 font-bold">{task.maxScore} pts</span>
                        {isGraded && <span className="ml-3 text-green-600 bg-green-100 px-2 py-1 rounded-md font-bold">Obtuviste: {submission.grade}</span>}
                    </div>

                    {!isSubmitted && (
                        <button
                            type="submit"
                            form="submissionForm"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-md flex items-center gap-2 disabled:bg-blue-400"
                        >
                            {loading ? 'Enviando...' : <><Send size={18} /> Enviar Tarea</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskSubmissionForm;
