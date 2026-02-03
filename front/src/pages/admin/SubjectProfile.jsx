import React, { useState } from 'react';
import {
    ArrowLeft,
    Save,
    Layout,
    FlaskConical,
    Palette,
    Calculator,
    Info,
    CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubjectProfile = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(1);

    // Form state
    const [formData, setFormData] = useState({
        name: 'Advanced Mathematics II',
        code: 'MAT-201',
        level: 'High School (Prepa)',
        credits: 4,
        minGrade: 70,
        periodType: 'Bimonthly',
        template: 'Standard Math'
    });

    const templates = [
        { id: 'math', name: 'Standard Math', credits: '4 Credits', type: 'Quarterly', icon: Calculator, color: 'bg-orange-100 text-orange-600' },
        { id: 'science', name: 'Science Lab', credits: '6 Credits', type: 'Semester', icon: FlaskConical, color: 'bg-purple-100 text-purple-600' },
        { id: 'art', name: 'Art Workshop', credits: '2 Credits', type: 'Bimonthly', icon: Palette, color: 'bg-green-100 text-green-600' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <nav className="flex items-center text-sm text-gray-500 mb-4">
                    <span onClick={() => navigate('/dashboard')} className="cursor-pointer hover:text-blue-600">Dashboard</span>
                    <span className="mx-2">/</span>
                    <span onClick={() => navigate('/subjects')} className="cursor-pointer hover:text-blue-600">Curriculum</span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">New Subject</span>
                </nav>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create New Subject Profile</h1>
                        <p className="text-gray-500 mt-1">Define the parameters for a new academic course.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 bg-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-colors">
                            <Save size={18} className="mr-2" /> Save Subject
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form Area */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Section 1: Basic Info */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <div className="flex items-center mb-6">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">1</div>
                            <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                                    placeholder="e.g. Advanced Mathematics II"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Code</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm text-gray-500 font-mono"
                                        placeholder="E.G. MAT-201"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Educational Level</label>
                                    <select
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                                    >
                                        <option>High School (Prepa)</option>
                                        <option>Middle School (Secundaria)</option>
                                        <option>Primary (Primaria)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Academic Configuration */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <div className="flex items-center mb-6">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center font-bold mr-3">2</div>
                            <h2 className="text-lg font-bold text-gray-900">Academic Configuration</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Credits</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.credits}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">pts</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1.5">Academic value for GPA calculation.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Min. Passing Grade</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.minGrade}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/ 100</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Grading Period Type</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { id: 'Bimonthly', label: 'Bimonthly', sub: '6 periods per year', icon: Layout },
                                    { id: 'Quarterly', label: 'Quarterly', sub: '4 periods per year', icon: Layout },
                                    { id: 'Semester', label: 'Semester', sub: '2 periods per year', icon: Calendar },
                                ].map((type) => {
                                    const active = formData.periodType === type.id;
                                    const Icon = type.icon;
                                    return (
                                        <div
                                            key={type.id}
                                            onClick={() => setFormData({ ...formData, periodType: type.id })}
                                            className={`cursor-pointer rounded-xl border p-4 transition-all ${active ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-200'}`}
                                        >
                                            <div className="flex items-center mb-2">
                                                <Icon size={18} className={active ? 'text-blue-600' : 'text-gray-400'} />
                                                <span className={`ml-2 text-sm font-bold ${active ? 'text-blue-900' : 'text-gray-700'}`}>{type.label}</span>
                                            </div>
                                            <p className={`text-xs ${active ? 'text-blue-600' : 'text-gray-500'}`}>{type.sub}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Eval (Collapsed Visual) */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center opacity-50">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold mr-3">3</div>
                        <h2 className="text-lg font-bold text-gray-900 flex-1">Competencies & Evaluation</h2>
                        <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500">Total Weight: 100%</div>
                    </div>
                </div>

                {/* Right Sidebar - Templates & Tips */}
                <div className="space-y-6">
                    {/* Quick Templates */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center mb-4 text-gray-800">
                            <Wand2 size={18} className="mr-2 text-blue-500" />
                            <h3 className="font-bold text-sm">Quick Templates</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Need a head start? Use a preset to fill standard details.</p>

                        <div className="space-y-3">
                            {templates.map((t) => {
                                const Icon = t.icon;
                                return (
                                    <div key={t.id} className="flex items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${t.color}`}>
                                            <Icon size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{t.name}</h4>
                                            <p className="text-[10px] text-gray-500">{t.credits} • {t.type}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Did you know? */}
                    <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
                        <div className="flex items-start">
                            <div className="mt-1 mr-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <Info size={14} />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-blue-900 mb-1">Did you know?</h4>
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    Setting the <strong>minimum passing grade</strong> automatically updates the report card logic for all enrolled students.
                                    <a href="#" className="underline ml-1 hover:text-blue-900">Learn more about grading policies.</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple Icon component for the wand since it wasn't imported above in one go to keep code clean
const Wand2 = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M15 4V2" />
        <path d="M15 16v-2" />
        <path d="M8 9h2" />
        <path d="M20 9h2" />
        <path d="M17.8 11.8 19 13" />
        <path d="M15 9h0" />
        <path d="M17.8 6.2 19 5" />
        <path d="m3 21 9-9" />
        <path d="M12.2 6.2 11 5" />
    </svg>
);

export default SubjectProfile;
