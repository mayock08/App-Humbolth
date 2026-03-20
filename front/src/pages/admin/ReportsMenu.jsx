import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Printer, TrendingUp, Calendar, BookOpen } from 'lucide-react';

const ReportsMenu = () => {
    const reportCards = [
        {
            title: 'Listas Escolares',
            description: 'Genera e imprime el listado de alumnos por grupo con casillas para asistencia o calificaciones.',
            icon: Users,
            path: '/reports/class-lists',
            color: 'bg-blue-500'
        },
        {
            title: 'Calificaciones Generales',
            description: 'Próximamente. Reportes de calificaciones por grupo y periodo.',
            icon: TrendingUp,
            path: '/reports',
            color: 'bg-emerald-500',
            disabled: true
        },
        {
            title: 'Reporte de Asistencias',
            description: 'Próximamente. Concentrado de inasistencias por periodo.',
            icon: Calendar,
            path: '/reports',
            color: 'bg-orange-500',
            disabled: true
        },
        {
            title: 'Kárdex del Alumno',
            description: 'Próximamente. Historial académico detallado por estudiante.',
            icon: BookOpen,
            path: '/reports',
            color: 'bg-purple-500',
            disabled: true
        }
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    Reportes y Documentos
                </h1>
                <p className="text-gray-500 mt-2">
                    Selecciona el tipo de reporte que deseas generar o imprimir.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportCards.map((report, index) => {
                    const Icon = report.icon;
                    return (
                        <Link
                            key={index}
                            to={report.disabled ? '#' : report.path}
                            className={`block relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md ${report.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-1 hover:border-blue-100'}`}
                        >
                            <div className={`inline-flex rounded-xl p-3 text-white ${report.color} mb-4 shadow-sm`}>
                                <Icon size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{report.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {report.description}
                            </p>

                            {report.disabled && (
                                <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                                    En desarrollo
                                </div>
                            )}
                            {!report.disabled && (
                                <div className="mt-4 flex items-center text-sm font-medium text-blue-600 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Printer size={16} /> Generar <span className="ml-1">&rarr;</span>
                                </div>
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    );
};

export default ReportsMenu;
