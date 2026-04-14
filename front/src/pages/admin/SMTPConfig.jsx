import React, { useState, useEffect } from 'react';
import { Mail, Save } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5246';

export default function SMTPConfig() {
    const [config, setConfig] = useState({
        SMTP_HOST: '',
        SMTP_PORT: '587',
        SMTP_USER: '',
        SMTP_PASSWORD: ''
    });
    const [loading, setLoading] = useState(true);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_URL}/api/SystemSettings`, { headers: getAuthHeaders() });
                if (res.ok) {
                    const data = await res.json();
                    let newConfig = { ...config };
                    data.forEach(item => {
                        if (newConfig[item.settingKey] !== undefined) {
                            newConfig[item.settingKey] = item.settingValue;
                        }
                    });
                    setConfig(newConfig);
                }
            } catch (error) {
                toast.error('Error al obtener configuraciones');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Guardando configuración...');
        try {
            const keys = Object.keys(config);
            for (const key of keys) {
                await fetch(`${API_URL}/api/SystemSettings`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        settingKey: key,
                        settingValue: config[key],
                        description: `Configuración de SMTP: ${key}`
                    })
                });
            }
            toast.success('Configuración SMTP guardada correctamente.', { id: toastId });
        } catch (error) {
            toast.error('Error al guardar.', { id: toastId });
        }
    };

    if (loading) return <div className="p-8">Cargando...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Configuración SMTP</h2>
                <p className="text-gray-500">Parámetros para el envío de correos masivos (Ej. Fichas de Promedios).</p>
            </div>

            <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-6 flex items-center justify-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                    <Mail size={48} className="text-slate-400" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Servidor SMTP (Host)</label>
                        <input 
                            required
                            type="text" 
                            placeholder="smtp.gmail.com"
                            value={config.SMTP_HOST}
                            onChange={(e) => setConfig({...config, SMTP_HOST: e.target.value})}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Puerto</label>
                        <input 
                            required
                            type="number" 
                            placeholder="587"
                            value={config.SMTP_PORT}
                            onChange={(e) => setConfig({...config, SMTP_PORT: e.target.value})}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Usuario (Correo Emisor)</label>
                        <input 
                            required
                            type="email" 
                            placeholder="admin@colegio.edu"
                            value={config.SMTP_USER}
                            onChange={(e) => setConfig({...config, SMTP_USER: e.target.value})}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña (o App Password)</label>
                        <input 
                            required
                            type="password" 
                            placeholder="********"
                            value={config.SMTP_PASSWORD}
                            onChange={(e) => setConfig({...config, SMTP_PASSWORD: e.target.value})}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Nota: Si usa Gmail o cuentas con 2FA, utilice una "Contraseña de aplicación" generada desde su cuenta en lugar de la contraseña habitual.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button 
                        type="submit"
                        className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                    >
                        <Save size={18} className="mr-2" />
                        Guardar Configuración
                    </button>
                </div>
            </form>
        </div>
    );
}
