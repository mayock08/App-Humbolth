import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';

const StudentIqTest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [test, setTest] = useState(null);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Mock data fetch - Replace with actual API call
    useEffect(() => {
        // Simulate API delay
        setTimeout(() => {
            const mockTest = {
                id: id,
                name: "IQ General Adultos",
                description: "Prueba de habilidades cognitivas generales. Evalúa razonamiento lógico, verbal y matemático.",
                totalTimeMinutes: 45,
                sections: [
                    {
                        id: 1,
                        name: "Razonamiento Lógico",
                        description: "Identifica patrones y secuencias.",
                        questions: [
                            {
                                id: 101,
                                text: "¿Cuál número sigue en la serie? 2, 4, 8, 16, ?",
                                options: [
                                    { id: 1, text: "24" },
                                    { id: 2, text: "30" },
                                    { id: 3, text: "32" },
                                    { id: 4, text: "34" }
                                ]
                            },
                            {
                                id: 102,
                                text: "Si todos los Bloops son Razzies y todos los Razzies son Lazzies, ¿son todos los Bloops Lazzies?",
                                options: [
                                    { id: 5, text: "Sí" },
                                    { id: 6, text: "No" },
                                    { id: 7, text: "No se puede determinar" }
                                ]
                            }
                        ]
                    },
                    {
                        id: 2,
                        name: "Habilidad Verbal",
                        description: "Selecciona la palabra que mejor completa la oración.",
                        questions: [
                            {
                                id: 201,
                                text: "Agua es a Tubería como Electricidad es a...",
                                options: [
                                    { id: 8, text: "Cable" },
                                    { id: 9, text: "Luz" },
                                    { id: 10, text: "Interruptor" }
                                ]
                            }
                        ]
                    }
                ]
            };
            setTest(mockTest);
            setTimeLeft(mockTest.totalTimeMinutes * 60);
            setLoading(false);
        }, 1000);
    }, [id]);

    // Timer logic
    useEffect(() => {
        if (timeLeft > 0 && !isSubmitted) {
            const timerId = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timerId);
        } else if (timeLeft === 0 && !loading && !isSubmitted) {
            handleSubmit();
        }
    }, [timeLeft, isSubmitted, loading]);

    const handleOptionSelect = (questionId, optionId) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }));
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        console.log("Submitting answers:", answers);
        // TODO: Send to API
        // await api.post(`/api/iq-tests/${id}/submit`, { answers });
        alert("Examen enviado correctamente. ¡Gracias!");
        navigate('/student-dashboard');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const currentSection = test.sections[currentSectionIndex];
    const isLastSection = currentSectionIndex === test.sections.length - 1;
    const progress = (Object.keys(answers).length / test.sections.reduce((acc, s) => acc + s.questions.length, 0)) * 100;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex justify-between items-center sticky top-4 z-10 border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{test.name}</h1>
                        <p className="text-gray-500 text-sm">{currentSection.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold ${timeLeft < 300 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                            <Clock size={20} />
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </header>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                    <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>

                {/* Questions */}
                <div className="space-y-6 mb-8">
                    {currentSection.questions.map((q, idx) => (
                        <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">
                                <span className="text-gray-400 mr-2">{idx + 1}.</span>
                                {q.text}
                            </h3>
                            <div className="space-y-3">
                                {q.options.map(opt => (
                                    <label
                                        key={opt.id}
                                        className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${answers[q.id] === opt.id
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                            : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${q.id}`}
                                            value={opt.id}
                                            checked={answers[q.id] === opt.id}
                                            onChange={() => handleOptionSelect(q.id, opt.id)}
                                            className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                        />
                                        <span className="ml-3 text-gray-700">{opt.text}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => setCurrentSectionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentSectionIndex === 0}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${currentSectionIndex === 0
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                            }`}
                    >
                        <ChevronLeft size={20} />
                        Anterior
                    </button>

                    {isLastSection ? (
                        <button
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 transform hover:-translate-y-0.5"
                        >
                            Finalizar Examen
                            <CheckCircle size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentSectionIndex(prev => Math.min(test.sections.length - 1, prev + 1))}
                            className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-blue-200 transform hover:-translate-y-0.5"
                        >
                            Siguiente Sección
                            <ChevronRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentIqTest;
