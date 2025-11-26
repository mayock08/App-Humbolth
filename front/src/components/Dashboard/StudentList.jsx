import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

const studentsData = [
    { id: 1, name: 'Ana Sofía Ramírez', phone: '5218112345678', group: '1°B', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 2, name: 'Diego Hernández', phone: '5218112341111', group: '1°B', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: 3, name: 'Valeria Gómez', phone: '5218112342222', group: '1°B', avatar: 'https://i.pravatar.cc/150?img=9' },
    { id: 4, name: 'Luis Fernando Torres', phone: '5218112343333', group: '1°B', avatar: 'https://i.pravatar.cc/150?img=13' },
    { id: 5, name: 'Camila Rodríguez', phone: '5218112344444', group: '1°B', avatar: 'https://i.pravatar.cc/150?img=10' },
    { id: 6, name: 'Santiago Pérez', phone: '5218112345555', group: '1°B', avatar: 'https://i.pravatar.cc/150?img=14' },
];

const StudentRow = ({ student }) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-white border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
            {/* Student Info */}
            <div className="flex items-center gap-4 w-full md:w-1/4">
                <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                    <h3 className="text-sm font-bold text-gray-800">{student.name}</h3>
                    <span className="text-xs text-gray-400">Tel: {student.phone}</span>
                </div>
            </div>

            {/* Group */}
            <div className="w-full md:w-24 text-center md:text-left">
                <span className="text-sm text-gray-600 font-medium">{student.group}</span>
            </div>

            {/* Attendance */}
            <div className="w-full md:w-40">
                <div className="relative">
                    <select className="w-full appearance-none bg-gray-100 border-none text-gray-700 text-sm font-medium py-2 pl-4 pr-8 rounded-lg focus:ring-2 focus:ring-primary/20 cursor-pointer">
                        <option>{t('attended')}</option>
                        <option>{t('absent')}</option>
                        <option>{t('late')}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                </div>
            </div>

            {/* Observation */}
            <div className="flex-1 w-full">
                <input
                    type="text"
                    placeholder="Observación (opcional)"
                    className="w-full bg-white border border-gray-200 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-gray-300"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors">
                    {t('notify_parent')}
                </button>
                <button className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors">
                    {t('whatsapp')}
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors">
                    {t('email_supervisor')}
                </button>
            </div>
        </div>
    );
};

const StudentList = () => {
    const { t } = useTranslation();

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="hidden md:flex items-center gap-4 p-4 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="w-1/4">Alumno</div>
                <div className="w-24">Grupo</div>
                <div className="w-40">Asistencia</div>
                <div className="flex-1">Observación</div>
                <div className="w-auto">Acciones</div>
            </div>

            {/* List */}
            <div className="flex flex-col">
                {studentsData.map(student => (
                    <StudentRow key={student.id} student={student} />
                ))}
            </div>
        </div>
    );
};

export default StudentList;
