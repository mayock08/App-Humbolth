import React from 'react';
import { LayoutDashboard, GraduationCap, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.png';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
    <Link to={to} className={`flex flex-col items-center justify-center py-4 w-full hover:bg-blue-50 transition-colors ${active ? 'text-primary' : 'text-gray-500'}`}>
        <Icon size={24} className="mb-1" />
        <span className="text-xs font-medium">{label}</span>
    </Link>
);

const TeacherLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-24 bg-white shadow-md flex flex-col items-center py-6 z-10">
                <div className="mb-8">
                    <img src={Logo} alt="Logo" className="w-16 h-16 object-contain" />
                </div>

                <nav className="flex-1 w-full flex flex-col gap-2">
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Panel"
                        to="/teacher-panel"
                        active={location.pathname === '/teacher-panel'}
                    />
                    <SidebarItem
                        icon={GraduationCap}
                        label="Calificaciones"
                        to="/teacher-grades"
                        active={location.pathname === '/teacher-grades'}
                    />
                </nav>

                <div className="mt-auto mb-6 flex flex-col gap-3 w-full items-center">
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center justify-center py-3 w-full hover:bg-red-50 transition-colors text-red-500 group"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium">Salir</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white h-16 flex items-center justify-between px-8 shadow-sm z-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-800">Panel del Docente</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="text-gray-500 text-sm">
                            {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                                {username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-sm font-bold text-gray-800">{username}</span>
                                <span className="text-xs text-gray-500">Docente</span>
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

export default TeacherLayout;
