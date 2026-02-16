import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, Loader } from 'lucide-react';

const AIPanel = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '¡Hola! Soy tu asistente de IA para gestión escolar. Puedo ayudarte con información sobre estudiantes, calificaciones, asistencias y más. ¿En qué puedo ayudarte?'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('http://institutohumboldt.mx:8080/api/AI/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: input })
            });

            if (response.ok) {
                const data = await response.json();
                const assistantMessage = {
                    role: 'assistant',
                    content: data.response || 'Lo siento, no pude procesar tu solicitud.'
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                throw new Error('Error en la respuesta');
            }
        } catch (err) {
            console.error('Error:', err);
            const errorMessage = {
                role: 'assistant',
                content: 'Lo siento, hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const suggestedQuestions = [
        '¿Cuántos estudiantes hay en 1°B?',
        '¿Cuál es el promedio general del grupo?',
        'Muéstrame los estudiantes con bajo rendimiento',
        '¿Qué materias tienen más faltas?'
    ];

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/settings')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="text-purple-500" size={24} />
                            <h2 className="text-2xl font-bold text-gray-800">Asistente IA</h2>
                        </div>
                        <p className="text-gray-500 text-sm">Consulta inteligente sobre gestión escolar</p>
                    </div>
                </div>
            </div>

            {/* Chat Container */}
            <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles size={16} className="text-purple-500" />
                                        <span className="text-xs font-semibold text-purple-600">Asistente IA</span>
                                    </div>
                                )}
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                                <Loader size={16} className="animate-spin text-purple-500" />
                                <span className="text-sm text-gray-600">Pensando...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions */}
                {messages.length === 1 && (
                    <div className="px-6 pb-4">
                        <p className="text-xs text-gray-500 mb-2">Preguntas sugeridas:</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestedQuestions.map((q, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setInput(q)}
                                    className="px-3 py-1.5 text-xs bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe tu pregunta..."
                            disabled={loading}
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:bg-gray-50"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AIPanel;
