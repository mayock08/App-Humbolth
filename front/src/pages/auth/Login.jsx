import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Mail } from 'lucide-react';
import Logo from '../../assets/Logo.png';

const Login = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [email, setEmail] = React.useState('admin@edu.com');
    const [password, setPassword] = React.useState('password');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="flex flex-col items-center mb-8">
                    <img src={Logo} alt="Logo" className="w-20 h-20 object-contain mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">{t('welcome')}</h2>
                    <p className="text-gray-500 text-sm mt-2">Ingresa a tu cuenta para continuar</p>
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg w-full text-center border border-red-100">
                            {error}
                        </div>
                    )}
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="admin@edu.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center text-gray-500 cursor-pointer hover:text-gray-700">
                            <input type="checkbox" className="mr-2 rounded text-primary focus:ring-primary" />
                            Recordarme
                        </label>
                        <a href="#" className="text-primary font-medium hover:underline">¿Olvidaste tu contraseña?</a>
                    </div>

                    <button type="submit" className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-0.5">
                        {t('login')}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-400">
                    © 2025 EDU School System
                </div>
            </div>
        </div>
    );
};

export default Login;
