import React, { useState } from 'react';
import { X, Upload, Camera } from 'lucide-react';
import SecureImage from './SecureImage';
import { API_BASE_URL } from '../config';

const PhotoUploadModal = ({ entityId, entityType, currentPhotoUrl, onClose, onSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Seleccione una imagen primero.');
            return;
        }

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const endpointType = entityType === 'student' ? 'Students' : 'Teachers';
            const res = await fetch(`${API_BASE_URL}/${endpointType}/${entityId}/photo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                onSuccess(data.url);
            } else {
                setError('Error al subir la fotografía.');
            }
        } catch (err) {
            console.error(err);
            setError('Error de conexión.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <Camera size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Administrar Fotografía</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Current or Preview Image */}
                    <div className="flex justify-center mb-6">
                        <div className="relative w-40 h-40 rounded-full border-4 border-gray-100 overflow-hidden shadow-inner bg-gray-50 flex items-center justify-center">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : currentPhotoUrl ? (
                                <SecureImage src={currentPhotoUrl} alt="Current Photo" className="w-full h-full object-cover" />
                            ) : (
                                <UserPlaceholder />
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                            {error}
                        </div>
                    )}

                    {/* Upload Controls */}
                    <div className="space-y-4">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="photo-upload"
                            disabled={uploading}
                        />
                        <label
                            htmlFor="photo-upload"
                            className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-600 font-medium"
                        >
                            <Upload size={20} />
                            Seleccionar Nueva Foto
                        </label>

                        {file && (
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {uploading ? 'Subiendo...' : 'Guardar Fotografía'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const UserPlaceholder = () => (
    <svg className="w-20 h-20 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

export default PhotoUploadModal;
