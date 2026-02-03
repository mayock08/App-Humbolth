import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Mail, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Logo from '../../assets/NewLogo.png'; // Updated to use the new uploaded logo

const Login = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [email, setEmail] = useState('admin@edu.com');
    const [password, setPassword] = useState('password');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5246/api/Auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: email, password }),
            });

            if (!response.ok) {
                throw new Error('Credenciales inválidas');
            }

            const data = await response.json();

            // Store authentication data
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('username', data.username);

            // Role-based redirect
            switch (data.role) {
                case 'Admin':
                    navigate('/settings');
                    break;
                case 'Teacher':
                    navigate('/teacher-panel');
                    break;
                case 'Student':
                    if (data.hasCompletedIqTest) {
                        navigate('/student-dashboard');
                    } else {
                        navigate(`/student/iq-test/${data.userId}`);
                    }
                    break;
                default:
                    navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Visual/Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 to-indigo-900 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>

                <div className="relative z-10 w-full h-full flex flex-col justify-center px-16 text-white">
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                            <span className="text-3xl">🎓</span>
                        </div>
                        <h1 className="text-5xl font-bold mb-6 leading-tight">
                            Impulsando el <br />
                            <span className="text-blue-300">Futuro Educativo</span>
                        </h1>
                        <p className="text-lg text-blue-100 max-w-md leading-relaxed">
                            Gestiona tu institución de manera eficiente, conecta con estudiantes y profesores, y lleva la educación al siguiente nivel.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 text-blue-100">
                            <CheckCircle size={20} className="text-green-400" />
                            <span>Gestión académica integral</span>
                        </div>
                        <div className="flex items-center space-x-3 text-blue-100">
                            <CheckCircle size={20} className="text-green-400" />
                            <span>Seguimiento en tiempo real</span>
                        </div>
                        <div className="flex items-center space-x-3 text-blue-100">
                            <CheckCircle size={20} className="text-green-400" />
                            <span>Plataforma intuitiva y segura</span>
                        </div>
                    </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-gray-50">
                <div className="w-full max-w-md bg-white p-8 lg:p-10 rounded-2xl shadow-xl border border-gray-100">
                    <div className="text-center mb-10">
                        <img src={Logo} alt="Logo" className="h-16 mx-auto mb-6 object-contain" />
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido de nuevo!</h2>
                        <p className="text-gray-500">Ingresa tus credenciales para acceder</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center rounded-r">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 sm:text-sm"
                                    placeholder="ejemplo@edu.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-gray-700">Contraseña</label>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 sm:text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <div
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer select-none">
                                    Recordarme
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`
                                w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white 
                                bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                                transform transition-all duration-200 hover:-translate-y-0.5
                                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
                            `}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Iniciando sesión...
                                </span>
                            ) : (
                                t('login')
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-center text-sm text-gray-500">
                            ¿Necesitas ayuda? <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Contactar soporte</a>
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-gray-400">
                    © 2025 Humbolth Education System. Todos los derechos reservados.
                </div>
            </div>
        </div>
    );
};

export default Login;
