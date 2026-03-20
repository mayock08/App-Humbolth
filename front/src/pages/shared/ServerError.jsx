import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

const ServerError = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        <AlertOctagon size={48} />
                    </div>
                </div>
                <div>
                    <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">Algo salió mal</h2>
                    <p className="mt-2 text-center text-lg text-gray-600">
                        Ha ocurrido un error inesperado al cargar la página o al procesar la información.
                    </p>
                </div>
                <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                    >
                        <RotateCcw className="mr-2" size={20} />
                        Intentar de nuevo
                    </button>
                    <Link
                        to="/"
                        className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                        <Home className="mr-2" size={20} />
                        Ir al Inicio
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ServerError;
