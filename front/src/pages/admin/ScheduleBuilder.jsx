import React from 'react';
import {
    Calendar,
    Download,
    MoreHorizontal,
    Wand2,
    Filter,
    Plus,
    Clock,
    User,
    AlertCircle
} from 'lucide-react';

const ScheduleBuilder = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Visual Schedule Builder</h1>
                    <p className="text-gray-500 mt-1">Drag subjects into slots. Real-time conflict detection is active.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 bg-white transition-colors">
                        <Wand2 size={16} className="mr-2 text-purple-600" /> Auto-Generate
                    </button>
                    <button className="flex items-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 bg-white transition-colors">
                        <Download size={16} className="mr-2" /> Export PDF
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-md shadow-blue-200 transition-colors">
                        Publish Schedule
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
                <div className="flex items-center text-gray-500 text-sm font-medium mr-2">
                    <Filter size={16} className="mr-2" /> Active Filters:
                </div>
                <select className="bg-blue-50 text-blue-700 border-none rounded-lg text-sm font-bold px-4 py-2 cursor-pointer focus:ring-2 focus:ring-blue-100">
                    <option>Group: 3rd Grade A</option>
                </select>
                <select className="bg-gray-100 text-gray-700 border-none rounded-lg text-sm font-medium px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors">
                    <option>Room: Lab 102</option>
                </select>
                <select className="bg-gray-100 text-gray-700 border-none rounded-lg text-sm font-medium px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors">
                    <option>Term: Fall 2024</option>
                </select>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Calendar Grid */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-6 border-b border-gray-100">
                        <div className="py-4 px-2"></div>
                        {['MON', 'TUE', 'WED', 'THU', 'FRI'].map(day => (
                            <div key={day} className="py-4 px-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="divide-y divide-gray-50">
                        {[
                            { time: '07:00' },
                            { time: '08:00' },
                            { time: '09:00' },
                            { time: '10:00' },
                            { time: '11:00' }
                        ].map((slot, i) => (
                            <div key={i} className="grid grid-cols-6 min-h-[100px]">
                                <div className="p-4 text-xs font-semibold text-gray-400 border-r border-gray-50 flex justify-center pt-6">
                                    {slot.time}
                                </div>
                                {/* Cells */}
                                <div className="border-r border-gray-50 border-gray-50/50 p-2 relative group hover:bg-gray-50 transition-colors">
                                    {i === 0 && (
                                        <div className="w-full h-full bg-blue-100 rounded-lg border-l-4 border-blue-500 p-2 cursor-pointer hover:shadow-md transition-all">
                                            <p className="text-[10px] font-bold text-blue-700 uppercase mb-0.5">Mathematics</p>
                                            <p className="text-[9px] text-blue-500">Mr. Henderson</p>
                                        </div>
                                    )}
                                </div>
                                <div className="border-r border-gray-50 slot-cell p-2">
                                    {i === 1 && (
                                        <div className="w-full h-full bg-purple-100 rounded-lg border-l-4 border-purple-500 p-2 cursor-pointer hover:shadow-md transition-all">
                                            <p className="text-[10px] font-bold text-purple-700 uppercase mb-0.5">English Lit</p>
                                            <p className="text-[9px] text-purple-500">Mrs. Gable</p>
                                        </div>
                                    )}
                                </div>
                                <div className="border-r border-gray-50 slot-cell p-2">
                                    {i === 0 && (
                                        <div className="w-full h-full bg-blue-100 rounded-lg border-l-4 border-blue-500 p-2 cursor-pointer hover:shadow-md transition-all">
                                            <p className="text-[10px] font-bold text-blue-700 uppercase mb-0.5">Mathematics</p>
                                            <p className="text-[9px] text-blue-500">Mr. Henderson</p>
                                        </div>
                                    )}
                                    {i === 2 && (
                                        <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-medium">
                                            DROP HERE
                                        </div>
                                    )}
                                </div>
                                <div className="border-r border-gray-50 slot-cell p-2">
                                    {i === 1 && (
                                        <div className="w-full h-full bg-purple-100 rounded-lg border-l-4 border-purple-500 p-2 cursor-pointer hover:shadow-md transition-all">
                                            <p className="text-[10px] font-bold text-purple-700 uppercase mb-0.5">English Lit</p>
                                            <p className="text-[9px] text-purple-500">Mrs. Gable</p>
                                        </div>
                                    )}
                                </div>
                                <div className="slot-cell p-2">
                                    {i === 1 && ( // Alert example
                                        <div className="w-full h-full bg-red-50 rounded-lg border-l-4 border-red-500 p-2 cursor-pointer hover:shadow-md transition-all relative">
                                            <div className="flex items-center text-red-700">
                                                <AlertCircle size={10} className="mr-1" />
                                                <p className="text-[10px] font-bold uppercase">Conflict</p>
                                            </div>
                                            <p className="text-[9px] text-red-500 mt-0.5">Room Occupied</p>
                                        </div>
                                    )}
                                    {i === 2 && (
                                        <div className="w-full h-full bg-yellow-100 rounded-lg border-l-4 border-yellow-500 p-2 cursor-pointer hover:shadow-md transition-all">
                                            <p className="text-[10px] font-bold text-yellow-700 uppercase mb-0.5">History</p>
                                            <p className="text-[9px] text-yellow-600">Mr. Jenkins</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Lunch Break */}
                        <div className="grid grid-cols-6 min-h-[50px] bg-gray-50/50">
                            <div className="p-4 text-xs font-semibold text-gray-400 border-r border-gray-100 flex justify-center">12:00</div>
                            <div className="col-span-5 flex items-center justify-center text-xs font-bold text-gray-300 italic tracking-widest uppercase">
                                Lunch Break
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resource Library (Sidebar) */}
                <div className="w-full lg:w-80 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h3 className="font-bold text-gray-800 mb-1">Resource Library</h3>
                        <p className="text-xs text-gray-500 mb-4">Drag items to calendar</p>

                        <div className="space-y-3">
                            {['Mathematics', 'English Literature', 'World History', 'Science Lab'].map((subject, i) => (
                                <div key={i} className="p-3 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm cursor-move flex items-center bg-white group transition-all">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${i === 0 ? 'bg-blue-100 text-blue-600' :
                                            i === 1 ? 'bg-purple-100 text-purple-600' :
                                                i === 2 ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-green-100 text-green-600'
                                        }`}>
                                        <span className="text-lg">📚</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-gray-800">{subject}</h4>
                                        <p className="text-[10px] text-gray-400">90 min session</p>
                                    </div>
                                    <MoreHorizontal size={16} className="text-gray-300" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Teacher Availability */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Teachers Available</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mr-2">AH</div>
                                    <span className="text-gray-700 font-medium">A. Henderson</span>
                                </div>
                                <span className="flex items-center text-green-600 text-xs font-bold">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span> Free
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mr-2">MA</div>
                                    <span className="text-gray-700 font-medium">M. Aris</span>
                                </div>
                                <span className="flex items-center text-red-500 text-xs font-bold">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></span> Busy
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Conflict Log */}
                    <div className="bg-red-50 rounded-2xl border border-red-100 p-5">
                        <div className="flex items-center text-red-800 font-bold text-sm mb-3">
                            <AlertCircle size={16} className="mr-2" />
                            Conflict Log (1)
                        </div>
                        <div className="bg-white/60 rounded-lg p-3 text-xs text-red-700 leading-relaxed border border-red-100">
                            <strong>8:00 AM Monday:</strong> Teacher M. Aris is double booked.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleBuilder;
