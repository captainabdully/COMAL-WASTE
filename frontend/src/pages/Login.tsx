import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { showError, showSuccess } from '../lib/alerts';
import { LanguageToggle } from '../components/LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/login', {
                email,
                password,
            });

            if (res.data.token) {
                // Check for admin or manager role
                const userRoles = res.data.user.roles || [];
                if (!userRoles.includes('admin') && !userRoles.includes('manager')) {
                    const message = "Access denied: This portal is for Admins and Managers only.";
                    setError(message);
                    await showError('Access denied', new Error(message));
                    return;
                }

                login(res.data.token, res.data.user);
                await showSuccess('Signed in successfully');
                navigate('/');
            } else {
                const message = 'The server did not return a valid session.';
                setError(message);
                await showError('Sign in failed', new Error(message));
            }
        } catch (err) {
            console.error("Login error:", err);
            const message = err instanceof Error ? err.message : 'Failed to login';
            setError(message);
            await showError('Sign in failed', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-100 flex items-center justify-center p-4 bg-[url('/src/assets/comal.png')] bg-cover bg-center">
            <div className="absolute right-4 top-4"><LanguageToggle /></div>
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{t('welcomeBack')}</h1>
                    <p className="text-gray-500 mt-2">{t('signInPrompt')}</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('emailAddress')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                            placeholder="admin@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('password')}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? t('signingIn') : t('signIn')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
