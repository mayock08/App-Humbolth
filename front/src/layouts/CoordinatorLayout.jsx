import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    LogOut,
    Menu,
    X,
    Search,
    Bell,
    ChevronDown,
    User,
    Users,
    FileText
} from 'lucide-react';
import Logo from '../assets/Logo.png';

const CoordinatorLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    // Mock User - in real app get from AuthContext
    const user = { name: 'Coordinador', role: 'Académico' };

    const menuItems = [
        { path: '/coordinator/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        // Future links:
        // { path: '/coordinator/groups', icon: Users, label: 'Mis Grupos' },
        // { path: '/coordinator/reports', icon: FileText, label: 'Reportes' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100 shadow-sm transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-center border-b border-gray-50 px-4">
                    <img src={Logo} alt="Logo" className="w-8 h-8 object-contain" />
                    {sidebarOpen && (
                        <span className="ml-3 font-bold text-lg text-gray-800 tracking-tight">
                            School<span className="text-emerald-600">Coord</span>
                        </span>
                    )}
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    <div className={`mb-4 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider ${!sidebarOpen && 'hidden'}`}>
                        Menu
                    </div>

                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-emerald-50 text-emerald-600 shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon
                                    size={20}
                                    className={`${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'} transition-colors`}
                                />
                                {sidebarOpen && (
                                    <span className="ml-3 font-medium text-sm">{item.label}</span>
                                )}
                            </Link>
                        );
                    })}

                    <div className="pt-4 mt-4 border-t border-gray-50">
                        <button className="w-full flex items-center px-3 py-2.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200">
                            <LogOut size={20} />
                            {sidebarOpen && <span className="ml-3 font-medium text-sm">Logout</span>}
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main
                className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'
                    }`}
            >
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors mr-4"
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="flex items-center cursor-pointer pl-6 border-l border-gray-100">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                                <User size={20} />
                            </div>
                            <div className="ml-3 hidden md:block">
                                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.role}</p>
                            </div>
                            <ChevronDown size={14} className="ml-2 text-gray-400" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default CoordinatorLayout;
