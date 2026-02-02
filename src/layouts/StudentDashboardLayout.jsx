import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { logout } from '../store/slices/authSlice';
import api from '../services/api';

export default function StudentDashboardLayout() {
    const { t } = useTranslation();
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [competitionName, setCompetitionName] = useState('Concours');
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

    useEffect(() => {
        loadCompetitionName();
        loadUnreadNotificationsCount();
        
        // Actualiser le nombre de notifications toutes les 30 secondes
        const interval = setInterval(loadUnreadNotificationsCount, 30000);
        
        // Écouter les événements de notification lue
        const handleNotificationRead = () => {
            loadUnreadNotificationsCount();
        };
        window.addEventListener('notificationRead', handleNotificationRead);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('notificationRead', handleNotificationRead);
        };
    }, [user]);

    const loadUnreadNotificationsCount = async () => {
        try {
            const response = await api.get('/notifications/unread-count');
            setUnreadNotificationsCount(response.data.count || 0);
        } catch (error) {
            console.error('Error loading unread notifications count:', error);
            // En cas d'erreur, ne pas bloquer l'interface
        }
    };

    const loadCompetitionName = async () => {
        try {
            // Charger l'enrôlement actif pour obtenir le programme/concours
            const enrollmentsResponse = await api.get('/enrollments');
            const enrollments = enrollmentsResponse.data.data || enrollmentsResponse.data || [];
            
            // Trouver le dossier actif (soumis ou validé)
            const active = enrollments.find(
                (e) => e.status === 'submitted' || e.status === 'validated'
            ) || enrollments.find((e) => e.status === 'draft');
            
            if (active?.program?.name) {
                // Utiliser le nom du programme comme nom du concours
                setCompetitionName(active.program.name);
            } else if (active?.program?.department?.name) {
                // Sinon utiliser le département
                setCompetitionName(active.program.department.name);
            } else {
                setCompetitionName(t('dashboard.competition_default'));
            }
        } catch (error) {
            console.error('Error loading competition name:', error);
            setCompetitionName(t('dashboard.competition_default'));
        }
    };

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/auth/login');
    };

    // Obtenir l'initiale du nom
    const getInitial = () => {
        if (user?.name) {
            return user.name.charAt(0).toUpperCase();
        }
        return 'U';
    };

    const menuItems = [
        { path: '/dashboard', label: t('sidebar.dashboard'), icon: '📊' },
        { path: '/enrollments', label: t('sidebar.my_candidatures'), icon: '📋' },
        { path: '/archives', label: t('sidebar.archives'), icon: '📦' },
        { path: '/feedback', label: t('sidebar.feedback'), icon: '❤️' },
        { path: '/notifications', label: t('sidebar.notifications'), icon: '🔔' },
        { path: '/profile', label: t('sidebar.profile'), icon: '👤' },
        { path: '/chatbox', label: t('sidebar.chatbox'), icon: '💬' },
        { path: '/enrollments/dossier', label: t('sidebar.dossier'), icon: '📁' },
    ];

    const isActive = (path) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        if (path === '/enrollments') return location.pathname === '/enrollments';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-blue-900 text-white transition-all duration-300 flex flex-col fixed h-screen`}>
                {/* Header Sidebar */}
                <div className="p-4 border-b border-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-900 font-bold text-xl">{getInitial()}</span>
                        </div>
                        {sidebarOpen && (
                            <div>
                                <p className="text-sm text-white font-bold truncate" title={competitionName}>
                                    {competitionName}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const active = isActive(item.path);
                        const isNotifications = item.path === '/notifications';
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                                    active
                                        ? 'bg-blue-600 text-white'
                                        : 'text-white/80 hover:bg-blue-800 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{item.icon}</span>
                                    {sidebarOpen && (
                                        <span className="font-medium">{item.label}</span>
                                    )}
                                </div>
                                {isNotifications && unreadNotificationsCount > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
                                        {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-blue-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-blue-800 hover:text-white transition-colors"
                    >
                        <span className="text-xl">🚪</span>
                        {sidebarOpen && <span className="font-medium">{t('sidebar.logout')}</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                {/* Header avec cloche de notifications */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-end">
                    <Link
                        to="/notifications"
                        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title={t('sidebar.notifications')}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {unreadNotificationsCount > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                            </span>
                        )}
                    </Link>
                </header>
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
