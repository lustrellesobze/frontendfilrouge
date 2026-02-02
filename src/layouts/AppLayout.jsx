import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { logout } from '../store/slices/authSlice';
import LanguageSelector from '../Components/LanguageSelector';

export default function AppLayout({ children }) {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/auth/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation - Bande verte */}
            <nav className="bg-green-600 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-8">
                            {/* Logo S SGEE avec carré violet */}
                            <Link to="/" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">S</span>
                                </div>
                                <span className="text-xl font-bold text-white">SGEE</span>
                            </Link>
                            <div className="hidden md:flex space-x-6">
                                <Link to="/" className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium transition-colors">
                                    {t('common.home')}
                                </Link>
                                <Link to="/sites" className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium transition-colors">
                                    {t('common.sites')}
                                </Link>
                                <Link to="/exams" className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium transition-colors">
                                    {t('common.exams')}
                                </Link>
                                <Link to="/faq" className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium transition-colors">
                                    {t('common.faq')}
                                </Link>
                                <Link to="/contact" className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium transition-colors">
                                    {t('common.contact')}
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {/* Sélecteur de langue */}
                            <LanguageSelector />
                            
                            {isAuthenticated ? (
                                <>
                                    <span className="text-sm text-white font-medium hidden sm:inline">👤 {user?.name}</span>
                                    {user?.roles?.some(role => role.slug === 'admin' || role === 'admin') && (
                                        <Link
                                            to="/admin/dashboard"
                                            className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium transition-colors"
                                        >
                                            {t('common.admin')}
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm text-white hover:text-gray-200 px-2 sm:px-0 transition-colors"
                                    >
                                        {t('common.logout')}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/auth/login"
                                        className="px-3 sm:px-4 py-2 bg-white text-green-600 border border-green-600 rounded-md text-sm font-medium hover:bg-green-50 transition-colors whitespace-nowrap"
                                    >
                                        {t('common.login')}
                                    </Link>
                                    <Link
                                        to="/auth/register"
                                        className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
                                    >
                                        {t('common.register')}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Content */}
            <main>
                {children || <Outlet />}
            </main>
        </div>
    );
}

