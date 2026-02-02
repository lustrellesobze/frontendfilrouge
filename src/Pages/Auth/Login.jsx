import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { login } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function Login() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        quitus_number: '',
        remember: false,
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { loading, error } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.quitus_number && formData.quitus_number.trim() !== '') {
            const quitusPattern = /^Q\d{5}$/;
            if (!quitusPattern.test(formData.quitus_number)) {
                toast.error(t('auth.quitus_invalid'));
                return;
            }
        }
        
        try {
            const result = await dispatch(login({
                email: formData.email,
                password: formData.password,
                quitus_number: formData.quitus_number || null,
            })).unwrap();

            toast.success(t('auth.login_success'));
            
            const user = result.user;
            const isAdmin = user?.roles?.some(role => 
                (typeof role === 'object' && role.slug === 'admin') || 
                (typeof role === 'string' && role === 'admin')
            );
            const isResponsableFiliere = user?.roles?.some(role => 
                (typeof role === 'object' && role.slug === 'responsable_filiere') || 
                (typeof role === 'string' && role === 'responsable_filiere')
            );
            
            // Rediriger selon le rôle
            if (isAdmin) {
                navigate('/admin/dashboard', { replace: true });
            } else if (isResponsableFiliere) {
                // Rediriger le responsable de filière directement vers son dashboard (pas la page d'accueil)
                navigate('/program-manager/dashboard', { replace: true });
            } else {
                const from = location.state?.from?.pathname || '/';
                navigate(from, { replace: true });
            }
        } catch (err) {
            toast.error(err || t('auth.login_error'));
        }
    };

    return (
        <div className="bg-white py-8 px-6 shadow rounded-lg">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
                {t('auth.login_title')}
            </h2>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700 text-center mb-3">
                    {t('auth.no_account')}
                </p>
                <Link 
                    to="/auth/register" 
                    className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
                >
                    {t('auth.sign_up_btn')}
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('auth.email')}
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder={t('auth.email_placeholder')}
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('auth.password')}
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder={t('auth.password_placeholder')}
                    />
                </div>

                <div>
                    <label htmlFor="quitus_number" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('auth.quitus_number')} <span className="text-gray-500">{t('auth.quitus_optional')}</span>
                    </label>
                    <input
                        id="quitus_number"
                        type="text"
                        value={formData.quitus_number}
                        onChange={(e) => {
                            let value = e.target.value.toUpperCase();
                            if (value.length > 6) value = value.substring(0, 6);
                            if (value.length > 0 && value[0] !== 'Q') {
                                value = 'Q' + value.replace(/[^0-9]/g, '');
                            }
                            if (value.length > 1) {
                                value = 'Q' + value.substring(1).replace(/[^0-9]/g, '');
                            }
                            setFormData({ ...formData, quitus_number: value });
                        }}
                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm uppercase"
                        placeholder={t('auth.quitus_placeholder')}
                        maxLength={6}
                        pattern="Q\d{5}"
                    />
                    <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                        <p className="text-xs text-blue-800">
                            <strong>ℹ️</strong> {t('auth.quitus_info')}
                        </p>
                        <p className="text-xs text-blue-800 mt-1">
                            {t('auth.quitus_format')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center">
                    <input
                        id="remember"
                        type="checkbox"
                        checked={formData.remember}
                        onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                        {t('auth.remember')}
                    </label>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? t('auth.logging_in') : t('auth.login_btn')}
                    </button>
                </div>
            </form>

            <div className="mt-6 text-center border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-600">
                    {t('auth.no_account_bottom')}{' '}
                    <Link to="/auth/register" className="font-medium text-green-600 hover:text-green-500 underline">
                        {t('auth.create_account')}
                    </Link>
                </p>
            </div>
        </div>
    );
}

