import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <AlertTriangle size={48} />
                    </div>
                </div>
                <div>
                    <h2 className="mt-6 text-center text-5xl font-extrabold text-gray-900">404</h2>
                    <p className="mt-2 text-center text-xl text-gray-600 flex flex-col items-center justify-center">
                        <span className="font-semibold text-gray-800 block mb-2">Página no encontrada</span>
                        Lo sentimos, la página que buscas no existe o ha sido movida.
                    </p>
                </div>
                <div className="mt-8">
                    <Link
                        to="/"
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                        <Home className="mr-2" size={20} />
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
