import React, { useState, useEffect } from 'react';
import { Download, LayoutGrid, List, MapPin, User, Code, Globe, BookOpen, Scale, Laptop, Beaker, MapPin as MapPinIcon, BookDashed, Fingerprint, Award } from 'lucide-react';
import { API_BASE_URL } from '../../config';

// Predefined colors for courses
const COURSE_COLORS = ['blue', 'green', 'purple', 'orange', 'indigo', 'slate'];
const COURSE_ICONS = [Globe, BookOpen, Code, Laptop, Scale, Beaker];

const StudentSchedule = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchStudentCourses();
    }, []);

    const fetchStudentCourses = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/StudentProfile/${userId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCourses(data.courses || []);
            }
        } catch (err) {
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    };

    // Process real schedule data
    const scheduleDays = [
        { label: 'MONDAY', date: '16' },
        { label: 'TUESDAY', date: '17', isToday: true },
        { label: 'WEDNESDAY', date: '18' },
        { label: 'THURSDAY', date: '19' },
        { label: 'FRIDAY', date: '20' },
        { label: 'SATURDAY', date: '21' }
    ];

    const generateTimeSlots = () => {
        if (!courses || courses.length === 0) {
            return [
                { id: '08:00', label: '08:00 AM', subLabel: '09:40 AM' },
                { id: '10:00', label: '10:00 AM', subLabel: '11:40 AM' },
                { id: '12:00', label: '12:00 PM', subLabel: '01:40 PM' }
            ];
        }

        const uniqueTimes = new Set();
        const timeMap = {};

        courses.forEach(c => {
            if (c.startTime) {
                const startId = c.startTime.substring(0, 5); // "08:00"
                uniqueTimes.add(startId);

                const parseTime = (timeStr) => {
                    if (!timeStr) return '';
                    let [hours, mins] = timeStr.split(':');
                    let h = parseInt(hours, 10);
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    h = h % 12 || 12;
                    return `${h.toString().padStart(2, '0')}:${mins} ${ampm}`;
                };

                if (!timeMap[startId]) {
                    timeMap[startId] = {
                        id: startId,
                        label: parseTime(startId),
                        subLabel: parseTime(c.endTime ? c.endTime.substring(0, 5) : ''),
                        raw: startId
                    };
                }
            }
        });

        const sortedTimes = Array.from(uniqueTimes).sort();
        if (sortedTimes.length === 0) {
            return [
                { id: '08:00', label: '08:00 AM', subLabel: '09:40 AM' }
            ];
        }

        return sortedTimes.map(t => timeMap[t]);
    };

    const timeSlots = generateTimeSlots();

    // Map DB courses to the grid
    const classes = {};
    timeSlots.forEach(slot => {
        classes[slot.id] = {};
    });

    // Populate classes
    courses.forEach((course, index) => {
        const days = course.scheduleDays ? course.scheduleDays.toUpperCase().split(',') : [];
        const startTimeStr = course.startTime ? course.startTime.substring(0, 5) : null;

        let targetSlotId = startTimeStr;

        days.forEach(dayStr => {
            const cleanDay = dayStr.trim();
            let dayKey = cleanDay;
            if (cleanDay === 'LUNES') dayKey = 'MONDAY';
            if (cleanDay === 'MARTES') dayKey = 'TUESDAY';
            if (cleanDay === 'MIERCOLES' || cleanDay === 'MIÉRCOLES') dayKey = 'WEDNESDAY';
            if (cleanDay === 'JUEVES') dayKey = 'THURSDAY';
            if (cleanDay === 'VIERNES') dayKey = 'FRIDAY';
            if (cleanDay === 'SABADO' || cleanDay === 'SÁBADO') dayKey = 'SATURDAY';

            if (classes[targetSlotId] && scheduleDays.find(d => d.label === dayKey)) {
                classes[targetSlotId][dayKey] = {
                    id: course.id,
                    title: course.name,
                    prof: course.teacher ? `Prof. ${course.teacher}` : 'Docente Asignado',
                    room: course.room || `Aula ${index + 1}0${index % 5}`,
                    color: COURSE_COLORS[index % COURSE_COLORS.length],
                    icon: COURSE_ICONS[index % COURSE_ICONS.length],
                    isCurrent: dayKey === 'TUESDAY' && targetSlotId === '08:00'
                };
            }
        });
    });

    const getColorClasses = (colorName) => {
        switch (colorName) {
            case 'solid-blue':
                return 'bg-blue-600 text-white border-blue-600 shadow-md transform -translate-y-1';
            case 'blue':
                return 'bg-blue-50/50 border-blue-200 text-blue-700 hover:bg-blue-50';
            case 'green':
                return 'bg-green-50/50 border-green-200 text-green-700 hover:bg-green-50';
            case 'purple':
                return 'bg-purple-50/50 border-purple-200 text-purple-700 hover:bg-purple-50';
            case 'orange':
                return 'bg-orange-50/50 border-orange-200 text-orange-700 hover:bg-orange-50';
            case 'indigo':
                return 'bg-indigo-50/50 border-indigo-200 text-indigo-700 hover:bg-indigo-50';
            case 'slate':
            default:
                return 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
        }
    };

    const getIconColorClasses = (colorName) => {
        switch (colorName) {
            case 'solid-blue': return 'text-white opacity-80';
            case 'blue': return 'text-blue-500';
            case 'green': return 'text-green-500';
            case 'purple': return 'text-purple-500';
            case 'orange': return 'text-orange-500';
            case 'indigo': return 'text-indigo-500';
            case 'slate': default: return 'text-slate-500';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Cargando horario...</div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto flex flex-col h-full bg-[#f8fafc] font-sans">
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">My School Schedule</h1>
                    <span className="px-3 py-1 bg-gray-200/70 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">
                        SEMESTER 2 - 2023
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                        <button className="flex items-center gap-2 px-4 py-1.5 bg-white text-blue-600 rounded-md shadow-sm text-sm font-bold">
                            <LayoutGrid size={16} /> Grid
                        </button>
                        <button className="flex items-center gap-2 px-4 py-1.5 text-gray-500 hover:text-gray-700 rounded-md text-sm font-semibold transition-colors">
                            <List size={16} /> List
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors">
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>

            {/* Virtual Class Banner Removed as requested */}

            {/* Timetable Grid */}
            <div className="flex-1 overflow-auto bg-white rounded-2xl border border-gray-200 shadow-sm relative z-0">
                <div className="min-w-[1100px] grid" style={{ gridTemplateColumns: '120px repeat(6, 1fr)' }}>
                    {/* Header Row */}
                    <div className="sticky top-0 z-20 p-4 flex items-center justify-center border-b border-r border-gray-100 bg-gray-50 rounded-tl-2xl">
                        {/* Empty top-left cell */}
                    </div>
                    {scheduleDays.map((day, i) => (
                        <div key={day.label} className={`sticky top-0 z-20 p-4 flex flex-col items-center justify-center border-b border-gray-100 ${day.isToday ? 'bg-blue-50' : 'bg-gray-50'} ${i < 5 ? 'border-r' : 'rounded-tr-2xl'}`}>
                            <h3 className={`text-xs font-black tracking-widest ${day.isToday ? 'text-blue-600' : 'text-gray-500'}`}>{day.label}</h3>
                            <div className={`text-xl font-bold mt-1 ${day.isToday ? 'text-blue-700' : 'text-gray-900'}`}>
                                {day.date}
                            </div>
                            {day.isToday && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1"></div>}
                        </div>
                    ))}

                    {/* Time Slots and Classes */}
                    {timeSlots.map((slot, rowIndex) => {
                        const isLastRow = rowIndex === timeSlots.length - 1;
                        return (
                            <React.Fragment key={slot.id}>
                                {/* Time Cell */}
                                <div className={`p-4 flex flex-col items-center justify-center border-r border-gray-100 min-h-[140px] ${!isLastRow ? 'border-b' : ''} ${rowIndex === timeSlots.length - 1 ? 'rounded-bl-2xl' : ''}`}>
                                    {slot.isBreak ? (
                                        <span className="text-xs font-black tracking-widest text-orange-600 px-3 py-1 bg-orange-50 rounded-full border border-orange-100">RECESS</span>
                                    ) : (
                                        <>
                                            <span className="font-bold text-gray-900 text-sm whitespace-nowrap">{slot.label}</span>
                                            <span className="text-[11px] font-semibold text-gray-400 mt-1 whitespace-nowrap">{slot.subLabel}</span>
                                        </>
                                    )}
                                </div>

                                {/* Class Cells */}
                                {scheduleDays.map((day, colIndex) => {
                                    const isLastCol = colIndex === 5;
                                    const borderB = !isLastRow ? 'border-b border-gray-100' : '';
                                    const borderR = !isLastCol ? 'border-r border-gray-100' : '';

                                    if (slot.isBreak) {
                                        return <div key={`${slot.id}-${day.label}`} className={`bg-gray-50/50 flex items-center justify-center ${borderB} ${borderR} ${isLastRow && isLastCol ? 'rounded-br-2xl' : ''}`}></div>;
                                    }

                                    const classInfo = classes[slot.id]?.[day.label];
                                    const bgClass = day.isToday && !classInfo?.isCurrent ? 'bg-blue-50/10' : '';

                                    return (
                                        <div key={`${slot.id}-${day.label}`} className={`p-2.5 relative ${borderB} ${borderR} ${bgClass} ${isLastRow && isLastCol ? 'rounded-br-2xl' : ''}`}>
                                            {classInfo && (
                                                <div className={`h-full border rounded-xl p-3 flex flex-col cursor-pointer transition-transform hover:-translate-y-1 duration-200 ${getColorClasses(classInfo.color)}`}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`text-[10px] font-black tracking-widest uppercase opacity-70 ${classInfo.isCurrent ? 'text-blue-200' : 'text-current'}`}>{day.label}</span>
                                                        {classInfo.isCurrent && <div className="w-2 h-2 rounded-full bg-blue-100 animate-pulse flex-shrink-0" />}
                                                    </div>
                                                    <h4 className="font-bold text-sm leading-tight pr-2 mb-2">{classInfo.title}</h4>

                                                    <p className={`text-[11px] font-medium leading-tight opacity-80 ${classInfo.isCurrent ? 'text-blue-100' : 'text-gray-500'}`}>
                                                        {classInfo.prof}
                                                    </p>

                                                    <div className="mt-auto pt-3 flex items-center gap-1.5 text-xs font-bold">
                                                        {React.createElement(classInfo.icon || MapPinIcon, {
                                                            size: 14,
                                                            className: getIconColorClasses(classInfo.color)
                                                        })}
                                                        <span className={classInfo.isCurrent ? "text-blue-100 opacity-90" : "text-gray-600 opacity-90"}>{classInfo.room}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Footer Activity Panel Replacement */}
            <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <BookDashed size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Materias Inscritas</p>
                        <h3 className="text-2xl font-black text-gray-900 leading-none">{courses.length}</h3>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Fingerprint size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">Total Faltas</p>
                        <h3 className="text-2xl font-black text-gray-900 leading-none">0</h3>
                        <p className="text-[10px] text-gray-500 mt-1">Acumuladas en el periodo</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-green-50/50 p-4 rounded-xl border border-green-100">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <Award size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Promedio General</p>
                        <h3 className="text-2xl font-black text-gray-900 leading-none">9.0</h3>
                        <p className="text-[10px] text-gray-500 mt-1">Promedio estimado</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentSchedule;
