import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    Calendar,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Search,
    Bell,
    ChevronDown,
    CreditCard,
    Smartphone as SmartphoneIcon
} from 'lucide-react';
import Logo from '../assets/NewLogo.png';

const AdministratorLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admissions', icon: Users, label: 'Admissions' },
        { path: '/students', icon: GraduationCap, label: 'Students' },
        { path: '/mobile-access', icon: SmartphoneIcon, label: 'Mobile Access' },
        { path: '/class-grouping', icon: Users, label: 'Class Grouping' }, // New from image
        { path: '/schedule', icon: Calendar, label: 'Schedule' }, // New from image
        { path: '/subjects', icon: FileText, label: 'Subjects' },
        { path: '/finance', icon: CreditCard, label: 'Finance' },
        { path: '/reports', icon: FileText, label: 'Reports' },
        { path: '/settings', icon: Settings, label: 'Settings' },
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
                            School<span className="text-blue-600">Control</span>
                        </span>
                    )}
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    <div className={`mb-4 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider ${!sidebarOpen && 'hidden'}`}>
                        Main Menu
                    </div>

                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon
                                    size={20}
                                    className={`${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} transition-colors`}
                                />
                                {sidebarOpen && (
                                    <span className="ml-3 font-medium text-sm">{item.label}</span>
                                )}
                                {!sidebarOpen && (
                                    <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-gray-900 text-white text-xs invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 w-max z-50">
                                        {item.label}
                                    </div>
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

                        {/* Search */}
                        <div className="relative hidden md:block w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search student by name or ID..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-blue-100 focus:ring-2 focus:ring-blue-50 rounded-lg text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="flex items-center cursor-pointer pl-6 border-l border-gray-100">
                            <img
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                alt="Admin Profile"
                                className="w-9 h-9 rounded-full ring-2 ring-gray-50"
                            />
                            <div className="ml-3 hidden md:block">
                                <p className="text-sm font-semibold text-gray-800">Admin User</p>
                                <p className="text-xs text-gray-500">Head Registrar</p>
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

export default AdministratorLayout;
