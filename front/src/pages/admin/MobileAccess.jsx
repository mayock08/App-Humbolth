import React, { useState } from 'react';
import {
    Smartphone,
    Shield,
    Search,
    UserX,
    UserCheck,
    CheckCircle,
    XCircle,
    Battery
} from 'lucide-react';

const MobileAccess = () => {
    // Mock user data
    const [users, setUsers] = useState([
        { id: 1, name: 'Liam Johnson', role: 'Student', grade: '3rd Grade', device: 'iPhone 13', lastLogin: '2 mins ago', access: true, battery: 85 },
        { id: 2, name: 'Sarah Wilson', role: 'Parent', child: 'Emma Wilson', device: 'Samsung S22', lastLogin: '1 hour ago', access: true, battery: 42 },
        { id: 3, name: 'Michael Brown', role: 'Student', grade: '5th Grade', device: 'iPad Air', lastLogin: 'Yesterday', access: false, battery: -1 },
        { id: 4, name: 'Jessica Davis', role: 'Teacher', grade: 'Staff', device: 'iPhone 14 Pro', lastLogin: 'Just now', access: true, battery: 92 },
    ]);

    const toggleAccess = (id) => {
        setUsers(users.map(user =>
            user.id === id ? { ...user, access: !user.access } : user
        ));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mobile App Access Control</h1>
                    <p className="text-gray-500 text-sm">Manage who can log into the mobile application (Students & Parents).</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium flex items-center">
                    <Shield size={16} className="mr-2" />
                    Secure Gateway Active
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Search Bar */}
                <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex gap-4">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search user by name, ID or role..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 text-left">User</th>
                                <th className="px-6 py-4 text-left">Role</th>
                                <th className="px-6 py-4 text-left">Device Info</th>
                                <th className="px-6 py-4 text-left">Last Login</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((user) => (
                                <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${!user.access ? 'bg-red-50/30' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${!user.access ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">{user.name}</h4>
                                                <p className="text-xs text-gray-500">{user.child ? `Parent of ${user.child}` : user.grade}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-2 py-1 rounded-md font-medium border ${user.role === 'Student' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                                                user.role === 'Parent' ? 'bg-purple-50 border-purple-100 text-purple-700' :
                                                    'bg-gray-100 border-gray-200 text-gray-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Smartphone size={16} className="mr-2 text-gray-400" />
                                            {user.device}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {user.lastLogin}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {user.access ? (
                                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                <CheckCircle size={12} className="mr-1" /> Active
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                                <XCircle size={12} className="mr-1" /> Blocked
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => toggleAccess(user.id)}
                                            className={`p-2 rounded-lg transition-colors ${user.access
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                }`}
                                            title={user.access ? "Block Access" : "Grant Access"}
                                        >
                                            {user.access ? <UserX size={20} /> : <UserCheck size={20} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MobileAccess;
