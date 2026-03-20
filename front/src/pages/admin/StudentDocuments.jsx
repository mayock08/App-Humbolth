import React, { useState, useEffect } from 'react';
import { Upload, FileText, Check, X, AlertCircle, Eye, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const StudentDocuments = ({ studentId, onFinish, isAdmin = false }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Document types configuration
    const docTypes = [
        { key: 'ACTA_NACIMIENTO', label: 'Acta de Nacimiento', required: true },
        { key: 'CURP', label: 'CURP', required: true },
        { key: 'COMPROBANTE_DOMICILIO', label: 'Comprobante de Domicilio', required: true },
        { key: 'BOLETA_ANTERIOR', label: 'Boleta de Grado Anterior', required: false },
        { key: 'CARTA_BUENA_CONDUCTA', label: 'Carta de Buena Conducta', required: false },
        { key: 'CERTIFICADO_MEDICO', label: 'Certificado Médico', required: false }
    ];

    useEffect(() => {
        if (studentId) {
            fetchDocuments();
        }
    }, [studentId]);

    const fetchDocuments = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/StudentDocuments/student/${studentId}`);
            if (res.ok) {
                const data = await res.json();
                setDocuments(data);
            }
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (event, docType) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', docType);
        formData.append('studentId', studentId.toString());

        try {
            const res = await fetch(`${API_BASE_URL}/StudentDocuments/student/${studentId}`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                await fetchDocuments();
            } else {
                alert("Error al subir el documento");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error de conexión al subir");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (docId) => {
        if (!window.confirm("¿Eliminar este documento?")) return;

        try {
            const res = await fetch(`${API_BASE_URL}/StudentDocuments/${docId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setDocuments(prev => prev.filter(d => d.id !== docId));
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const handleStatusUpdate = async (docId, newStatus) => {
        try {
            const res = await fetch(`${API_BASE_URL}/StudentDocuments/${docId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setDocuments(prev => prev.map(d =>
                    d.id === docId ? { ...d, status: newStatus } : d
                ));
            }
        } catch (error) {
            console.error("Status update error:", error);
        }
    };

    const getDocStatus = (typeKey) => {
        const doc = documents.find(d => d.documentType === typeKey);
        if (!doc) return { status: 'PENDING', label: 'Pendiente', color: 'text-gray-400', bg: 'bg-gray-50' };

        // Status configuration
        const statusConfig = {
            'Pending': { label: 'En Revisión', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            'Approved': { label: 'Aprobado', color: 'text-green-600', bg: 'bg-green-50' },
            'Rejected': { label: 'Rechazado', color: 'text-red-600', bg: 'bg-red-50' }
        };

        // Fallback to Pending config if status is unknown, or use the actual status from DB
        const config = statusConfig[doc.status] || statusConfig['Pending'];

        return {
            status: 'UPLOADED',
            ...config,
            doc // Return actual doc object
        };
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando documentos...</div>;

    return (
        <div className="space-y-6">
            {!isAdmin && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="font-semibold text-blue-900">Documentación Requerida</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            Por favor suba los documentos digitalizados en formato PDF o imagen (JPG, PNG).
                            Tamaño máximo por archivo: 5MB.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {docTypes.map((type) => {
                    const { status, label, color, bg, doc } = getDocStatus(type.key);

                    return (
                        <div key={type.key} className={`border rounded-lg p-4 transition-all ${bg} ${doc?.status === 'Approved' ? 'border-green-200' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <FileText size={18} className={status === 'UPLOADED' ? color : 'text-gray-400'} />
                                    <div>
                                        <h4 className="font-medium text-gray-900">{type.label}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold ${color}`}>
                                                {type.required && status === 'PENDING' ? '* Requerido' : label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {status === 'UPLOADED' && (
                                    <div className="flex gap-1">
                                        <a
                                            href={`${API_BASE_URL.replace('/api', '')}${doc.filePath}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 hover:bg-white rounded-full text-gray-600 transition-colors shadow-sm border border-gray-200"
                                            title="Ver documento"
                                        >
                                            <Eye size={16} />
                                        </a>
                                        {isAdmin ? (
                                            <>
                                                {doc.status !== 'Approved' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(doc.id, 'Approved')}
                                                        className="p-1.5 hover:bg-green-100 rounded-full text-green-600 transition-colors"
                                                        title="Aprobar"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                )}
                                                {doc.status !== 'Rejected' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(doc.id, 'Rejected')}
                                                        className="p-1.5 hover:bg-red-100 rounded-full text-red-600 transition-colors"
                                                        title="Rechazar"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(doc.id)}
                                                    className="p-1.5 hover:bg-red-50 rounded-full text-red-400 transition-colors"
                                                    title="Eliminar (Admin)"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                className="p-1.5 hover:bg-red-100 rounded-full text-red-600 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {status === 'PENDING' ? (
                                <div className="mt-2">
                                    <input
                                        type="file"
                                        id={`upload-${type.key}`}
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => handleUpload(e, type.key)}
                                        disabled={uploading}
                                    />
                                    <label
                                        htmlFor={`upload-${type.key}`}
                                        className={`flex items-center justify-center gap-2 w-full py-2 border border-dashed rounded-lg cursor-pointer transition-colors text-sm font-medium
                                            ${uploading
                                                ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                                : 'border-blue-300 text-blue-600 hover:bg-white hover:border-blue-400 shadow-sm'
                                            }`}
                                    >
                                        <Upload size={16} />
                                        {uploading ? 'Subiendo...' : 'Subir Archivo'}
                                    </label>
                                </div>
                            ) : (
                                <div className="mt-2 text-xs text-gray-500">
                                    Subido el {new Date(doc.uploadedAt).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100">
                <button
                    onClick={onFinish}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                    {isAdmin ? 'Cerrar' : 'Finalizar Inscripción'}
                </button>
            </div>
        </div>
    );
};

export default StudentDocuments;
