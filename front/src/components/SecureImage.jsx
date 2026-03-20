import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const SecureImage = ({ src, alt, className, fallback = '/default-avatar.png' }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        // If there's no src, or it's just the filename instead of a URL path, we need to handle it.
        // The API returns endpoint paths like '/api/Students/1/photo'.
        if (!src) {
            setLoading(false);
            setError(true);
            return;
        }

        const fetchImage = async () => {
            setLoading(true);
            setError(false);
            try {
                // Determine if src is a full URL or relative path
                const fetchUrl = src.startsWith('http') ? src : `${API_BASE_URL.replace('/api', '')}${src}`;

                const token = localStorage.getItem('token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                const response = await fetch(fetchUrl, {
                    headers: headers
                });

                if (!response.ok) {
                    throw new Error('Image not found or unauthorized');
                }

                const blob = await response.blob();

                // Create object URL
                const objectUrl = URL.createObjectURL(blob);

                if (isMounted) {
                    setImageSrc(objectUrl);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error loading secure image:", err);
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        fetchImage();

        return () => {
            isMounted = false;
            // Cleanup object URL to prevent memory leaks
            if (imageSrc) {
                URL.revokeObjectURL(imageSrc);
            }
        };
    }, [src]);

    if (loading) {
        return <div className={`animate-pulse bg-gray-200 flex items-center justify-center text-gray-400 text-xs ${className}`}>Cargando...</div>;
    }

    if (error || !imageSrc) {
        return <img src={fallback} alt={alt || 'Fallback'} className={className} />;
    }

    return (
        <img
            src={imageSrc}
            alt={alt || "Image"}
            className={className}
        />
    );
};

export default SecureImage;
