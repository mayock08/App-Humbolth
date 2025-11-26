import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, BookOpen, UserCog, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import i18n from '../i18n';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
    <Link to={to} className={`flex flex-col items-center justify-center py-4 w-full hover:bg-blue-50 transition-colors ${active ? 'text-primary' : 'text-gray-500'}`}>
        <Icon size={24} className="mb-1" />
        <span className="text-xs font-medium">{label}</span>
    </Link>
);

const DashboardLayout = ({ children }) => {
    const { t } = useTranslation();
    const location = useLocation();

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-24 bg-white shadow-md flex flex-col items-center py-6 z-10">
                <div className="mb-8">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
                        EDU
                    </div>
                </div>

                <nav className="flex-1 w-full flex flex-col gap-2">
                    <SidebarItem icon={LayoutDashboard} label={t('dashboard')} to="/dashboard" active={location.pathname === '/dashboard'} />
                    <SidebarItem icon={Users} label={t('attendance')} to="/attendance" />
                    <SidebarItem icon={BookOpen} label={t('subjects')} to="/subjects" />
                    <SidebarItem icon={UserCog} label="Supervisor" to="/supervisor" />
                    <SidebarItem icon={Settings} label={t('settings')} to="/settings" />
                </nav>

                <div className="mt-auto mb-6 flex flex-col gap-2">
                    <div className="flex gap-1 justify-center">
                        <button onClick={() => i18n.changeLanguage('es')} className={`text-xs font-bold px-2 py-1 rounded ${i18n.language === 'es' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-100'}`}>ES</button>
                        <button onClick={() => i18n.changeLanguage('en')} className={`text-xs font-bold px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-100'}`}>EN</button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white h-16 flex items-center justify-between px-8 shadow-sm z-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-800">{t('teacher_panel')}</h1>
                        <span className="bg-blue-100 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                            {t('attendance')}
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="text-gray-500 text-sm">24 de noviembre de 2025</span>
                        <div className="flex items-center gap-3">
                            <img
                                src="https://i.pravatar.cc/150?img=11"
                                alt="User"
                                className="w-10 h-10 rounded-full border-2 border-gray-100"
                            />
                            <div className="flex flex-col text-right">
                                <span className="text-sm font-bold text-gray-800">Mtra. Daniela López</span>
                                <span className="text-xs text-gray-500">Docente - Matemáticas 1°B</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
