import React, { useState } from 'react';
import {
    Users,
    MoreHorizontal,
    Plus,
    FileText,
    AlertCircle
} from 'lucide-react';

const ClassGrouping = () => {
    const [classes, setClasses] = useState([
        {
            id: 1,
            name: '1st Grade - Class A',
            room: 'ROOM 101',
            teacher: 'Mr. Anderson',
            teacherImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            current: 22,
            capacity: 25,
            boys: 12,
            girls: 10
        },
        {
            id: 2,
            name: '1st Grade - Class B',
            room: 'ROOM 102',
            teacher: 'Mrs. Davis',
            teacherImg: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            current: 18,
            capacity: 25,
            boys: 10,
            girls: 8
        },
        {
            id: 3,
            name: '1st Grade - Class C',
            room: 'ROOM 103',
            teacher: 'Ms. Lee',
            teacherImg: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            current: 25,
            capacity: 25,
            boys: 15,
            girls: 10,
            isFull: true
        }
    ]);

    const unassignedStudents = [
        { id: '88293', name: 'Liam Johnson', gender: 'Boy', grade: 'Grade 1' },
        { id: '88294', name: 'Emma Wilson', gender: 'Girl', grade: 'Grade 1' },
        { id: '88295', name: 'Noah Brown', gender: 'Boy', grade: 'Grade 1' },
        { id: '88296', name: 'Olivia Anderson', gender: 'Girl', grade: 'Grade 1' },
    ];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-6">
            {/* Left Panel: Unassigned Students */}
            <div className="w-full md:w-80 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-gray-800">Unassigned (45)</h2>
                    <button className="text-sm text-blue-600 font-medium hover:underline">Select All</button>
                </div>

                {/* Search */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search student name..."
                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-50 rounded-xl px-4 py-2 text-sm transition-all"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium whitespace-nowrap hover:bg-gray-200">Grade: All</button>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium whitespace-nowrap hover:bg-gray-200">Gender</button>
                </div>

                {/* Student List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {unassignedStudents.map((student) => (
                        <div key={student.id} className="p-3 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm cursor-move bg-white group transition-all">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${student.gender === 'Boy' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                                        {student.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800">{student.name}</h4>
                                        <p className="text-xs text-gray-400">ID: {student.id} • {student.grade}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${student.gender === 'Boy' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                    {student.gender}
                                </span>
                            </div>
                        </div>
                    ))}
                    <button className="w-full text-center text-xs text-gray-400 py-2 hover:text-gray-600">
                        Load more students
                    </button>
                </div>
            </div>

            {/* Right Panel: Class Groups */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Class Placement & Grouping</h1>
                        <p className="text-gray-500 text-sm">Fall 2024 Semester • Drag students to assign</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 bg-white transition-colors">
                            Auto-Assign
                        </button>
                        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-md shadow-blue-200 transition-colors">
                            <Plus size={16} className="mr-2" /> Create New Group
                        </button>
                    </div>
                </div>

                {/* Grid of Classes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-8">
                    {classes.map((cls) => (
                        <div key={cls.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative group hover:shadow-md transition-all">
                            {cls.isFull && (
                                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                                    <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg border border-orange-200">FULL</span>
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{cls.name}</h3>
                                    <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">{cls.room}</p>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            {/* Teacher */}
                            <div className="flex items-center mb-6 bg-gray-50 p-3 rounded-xl">
                                <img src={cls.teacherImg} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt={cls.teacher} />
                                <div className="ml-3 flex-1">
                                    <h4 className="text-sm font-bold text-gray-900">{cls.teacher}</h4>
                                    <p className="text-xs text-gray-500">Lead Teacher</p>
                                </div>
                                <button className="text-xs text-blue-600 font-medium hover:underline">Change</button>
                            </div>

                            {/* Capacity Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-gray-500">Capacity</span>
                                    <span className={`font-bold ${cls.current >= cls.capacity ? 'text-orange-600' : 'text-gray-900'}`}>{cls.current}/{cls.capacity}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${cls.current >= cls.capacity ? 'bg-orange-500' : 'bg-blue-500'}`}
                                        style={{ width: `${(cls.current / cls.capacity) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Gender Split */}
                            <div className="mb-6">
                                <div className="flex justify-between text-[10px] mb-1.5 font-medium">
                                    <span className="text-blue-600">Boys ({cls.boys})</span>
                                    <span className="text-pink-600">Girls ({cls.girls})</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 flex overflow-hidden">
                                    <div className="bg-blue-400 h-full" style={{ width: `${(cls.boys / cls.current) * 100}%` }}></div>
                                    <div className="bg-pink-400 h-full" style={{ width: `${(cls.girls / cls.current) * 100}%` }}></div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                <div className="text-xs text-gray-400 flex items-center">
                                    {cls.isFull ? (
                                        <><AlertCircle size={14} className="mr-1 text-orange-500" /> Class full</>
                                    ) : (
                                        "Drop students here"
                                    )}
                                </div>
                                <button className="flex items-center text-xs font-bold text-blue-600 hover:text-blue-800">
                                    <FileText size={14} className="mr-1" /> Class List
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Create New Group Card */}
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all h-[320px]">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                            <Plus size={24} />
                        </div>
                        <h3 className="font-bold text-gray-600">Create New Group</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassGrouping;
