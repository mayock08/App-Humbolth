import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, Users, BookOpen, School, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const SettingsCard = ({ icon: Icon, title, description, to, color = "bg-blue-500" }) => (
    <Link to={to} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-start gap-4 group">
        <div className={`p-3 rounded-xl ${color} text-white group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    </Link>
);

const Settings = () => {
    const { t } = useTranslation();

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">{t('settings')}</h2>
                <p className="text-gray-500">Administra la configuración general y catálogos del sistema.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SettingsCard
                    icon={UserPlus}
                    title="Agregar Alumno"
                    description="Registrar un nuevo alumno, asignar grupo y familia."
                    to="/add-student"
                    color="bg-indigo-500"
                />

                {/* Placeholder cards for future features */}
                <SettingsCard
                    icon={Users}
                    title="Gestión de Usuarios"
                    description="Administrar cuentas de docentes y administrativos."
                    to="#"
                    color="bg-emerald-500"
                />
                <SettingsCard
                    icon={School}
                    title="Ciclos Escolares"
                    description="Configurar fechas y periodos académicos."
                    to="#"
                    color="bg-orange-500"
                />
                <SettingsCard
                    icon={Sparkles}
                    title="Asistente IA"
                    description="Consulta con inteligencia artificial sobre estudiantes y gestión escolar."
                    to="/ai-panel"
                    color="bg-purple-500"
                />
            </div>
        </div>
    );
};

export default Settings;
