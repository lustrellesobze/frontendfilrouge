import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Notifications() {
    const { user } = useSelector((state) => state.auth);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications');
            setNotifications(response.data.data || response.data || []);
        } catch (error) {
            console.error('Error loading notifications:', error);
            // Ne pas afficher d'erreur si c'est juste que l'endpoint n'existe pas encore
            if (error.response?.status !== 404) {
                toast.error('Erreur lors du chargement des notifications');
            } else {
                // Si l'endpoint n'existe pas, initialiser avec un tableau vide
                setNotifications([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            setNotifications(notifications.map(n => 
                n.id === notificationId ? { ...n, is_read: true } : n
            ));
            // Actualiser le compteur de notifications non lues dans le layout
            window.dispatchEvent(new CustomEvent('notificationRead'));
        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Mettre à jour quand même localement en cas d'erreur
            setNotifications(notifications.map(n => 
                n.id === notificationId ? { ...n, is_read: true } : n
            ));
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'enrollment_validated':
                return '✅';
            case 'enrollment_rejected':
                return '❌';
            case 'document_verified':
                return '📄';
            case 'payment_confirmed':
                return '💰';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type, isRead) => {
        if (isRead) {
            return 'bg-gray-50 border-gray-200';
        }
        switch (type) {
            case 'enrollment_validated':
                return 'bg-green-100 border-green-400';
            case 'enrollment_rejected':
                return 'bg-red-100 border-red-400';
            case 'document_verified':
                return 'bg-blue-100 border-blue-400';
            case 'payment_confirmed':
                return 'bg-yellow-100 border-yellow-400';
            case 'enrollment_submitted':
                return 'bg-purple-100 border-purple-400';
            default:
                return 'bg-indigo-100 border-indigo-400';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Mes Notifications
                </h1>
                <p className="text-gray-600">
                    {unreadCount > 0 
                        ? `Vous avez ${unreadCount} notification(s) non lue(s)`
                        : 'Aucune nouvelle notification'}
                </p>
            </div>

            {/* Liste des notifications */}
            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="text-6xl mb-4">🔔</div>
                        <p className="text-gray-600">Aucune notification pour le moment</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`rounded-lg shadow-md p-6 border-l-4 transition-all hover:shadow-lg ${
                                getNotificationColor(notification.type, notification.is_read)
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="text-3xl flex-shrink-0">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className={`font-semibold mb-1 ${
                                                !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                                            }`}>
                                                {notification.title || 'Notification'}
                                            </h3>
                                            <p className={`text-sm ${
                                                !notification.is_read ? 'text-gray-700' : 'text-gray-600'
                                            }`}>
                                                {notification.message || notification.content}
                                            </p>
                                            {notification.metadata && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    {JSON.stringify(notification.metadata)}
                                                </div>
                                            )}
                                        </div>
                                        {!notification.is_read && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="ml-4 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                            >
                                                Marquer comme lu
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-3 text-xs text-gray-500">
                                        {new Date(notification.created_at || notification.createdAt).toLocaleString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
