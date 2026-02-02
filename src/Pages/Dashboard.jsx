import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const { t, i18n } = useTranslation();
    const { user } = useSelector((state) => state.auth);
    const [activeEnrollment, setActiveEnrollment] = useState(null);
    const [examDate, setExamDate] = useState(null);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, [user]);

    useEffect(() => {
        if (examDate) {
            const interval = setInterval(() => {
                updateCountdown();
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [examDate]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Charger le dossier actif (enrôlement soumis ou validé)
            const enrollmentsResponse = await api.get('/enrollments');
            const enrollments = enrollmentsResponse.data.data || enrollmentsResponse.data || [];
            
            // Trouver le dossier actif : soumis/validé > en attente (pending) > brouillon
            const active = enrollments.find(
                (e) => e.status === 'submitted' || e.status === 'validated'
            ) || enrollments.find((e) => e.status === 'pending')
            || enrollments.find((e) => e.status === 'draft');
            
            if (active) {
                setActiveEnrollment(active);
                
                // Date d'examen : concours > session (end_on) > métadonnées > défaut
                let dateExam = null;
                if (active.concours?.date_examen) {
                    dateExam = new Date(active.concours.date_examen);
                } else if (active.academicSession?.end_on) {
                    dateExam = new Date(active.academicSession.end_on);
                } else if (active.metadata?.exam_date) {
                    dateExam = new Date(active.metadata.exam_date);
                }
                if (dateExam && !isNaN(dateExam.getTime())) {
                    setExamDate(dateExam);
                } else {
                    setExamDate(new Date('2026-06-15T08:00:00'));
                }
            } else {
                setExamDate(new Date('2026-06-15T08:00:00'));
            }
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
            toast.error(t('dashboard.load_error'));
        } finally {
            setLoading(false);
        }
    };

    const updateCountdown = () => {
        if (!examDate) return;
        
        const now = new Date().getTime();
        const exam = new Date(examDate).getTime();
        const distance = exam - now;

        if (distance < 0) {
            setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
    };

    const formatDate = (date) => {
        if (!date) return '';
        const locale = i18n.language === 'en' ? 'en-GB' : 'fr-FR';
        return new Date(date).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatusMessage = (status) => t(`dashboard.status_${status}`, t('dashboard.status_unknown'));

    const getStatusColor = (status) => {
        const colors = {
            draft: 'bg-yellow-600',
            pending: 'bg-amber-600',
            submitted: 'bg-red-600',
            validated: 'bg-green-600',
            rejected: 'bg-red-800',
        };
        return colors[status] || 'bg-gray-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    // Extraire le prénom (dernier mot du nom complet, ou premier si un seul mot)
    const getFirstName = () => {
        if (!user?.name) return 'Candidat';
        const nameParts = user.name.trim().split(/\s+/);
        // Si un seul mot, c'est le prénom, sinon prendre le dernier mot (prénom généralement en dernier au Cameroun)
        return nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
    };
    
    const firstName = getFirstName();
    
    const competitionName = activeEnrollment?.program?.name || 
                           activeEnrollment?.program?.department?.name || 
                           t('dashboard.competition_default');

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('dashboard.hello')}, {firstName} !
                </h1>
                <p className="text-gray-600">
                    {t('dashboard.welcome_space')}{' '}
                    <span className="font-bold">{competitionName}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        {t('dashboard.countdown_title')}
                    </h2>
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="bg-blue-600 text-white rounded-lg p-4 text-center shadow-md">
                            <div className="text-2xl font-bold">{String(countdown.days).padStart(2, '0')}</div>
                            <div className="text-xs mt-1 uppercase font-semibold">{t('dashboard.days')}</div>
                        </div>
                        <div className="bg-green-600 text-white rounded-lg p-4 text-center shadow-md">
                            <div className="text-2xl font-bold">{String(countdown.hours).padStart(2, '0')}</div>
                            <div className="text-xs mt-1 uppercase font-semibold">{t('dashboard.hours')}</div>
                        </div>
                        <div className="bg-blue-800 text-white rounded-lg p-4 text-center shadow-md">
                            <div className="text-2xl font-bold">{String(countdown.minutes).padStart(2, '0')}</div>
                            <div className="text-xs mt-1 uppercase font-semibold">{t('dashboard.minutes')}</div>
                        </div>
                        <div className="bg-orange-500 text-white rounded-lg p-4 text-center shadow-md">
                            <div className="text-2xl font-bold">{String(countdown.seconds).padStart(2, '0')}</div>
                            <div className="text-xs mt-1 uppercase font-semibold">{t('dashboard.seconds')}</div>
                        </div>
                    </div>
                    {examDate && (
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                            <div className="w-1 h-8 bg-blue-600"></div>
                            <p className="text-sm text-gray-600">
                                {t('dashboard.official_date')}{' '}
                                <span className="font-semibold">{formatDate(examDate)}</span>
                            </p>
                        </div>
                    )}
                </div>

                <div className="bg-green-600 rounded-lg shadow-sm p-6 text-white">
                    <h2 className="text-lg font-bold mb-4">{t('dashboard.active_file')}</h2>
                    {activeEnrollment ? (
                        <>
                            <p className="text-sm mb-4 opacity-90">
                                {getStatusMessage(activeEnrollment.status)}
                            </p>
                            <div className="border-t border-white/30 pt-4 mt-4">
                                <Link
                                    to="/enrollments/dossier"
                                    className="block w-full bg-white/20 hover:bg-white/30 text-white rounded-lg px-4 py-2 text-center transition-colors font-medium"
                                >
                                    {t('dashboard.see_my_documents')}
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-sm mb-4 opacity-90">
                                {t('dashboard.no_active_file')}
                            </p>
                            <div className="border-t border-white/30 pt-4 mt-4">
                                <Link
                                    to="/enrollments/create"
                                    className="block w-full bg-white/20 hover:bg-white/30 text-white rounded-lg px-4 py-2 text-center transition-colors font-medium"
                                >
                                    {t('dashboard.create_my_file')}
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                    {t('dashboard.tips_title')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{t('dashboard.tips_organization')}</h3>
                        <p className="text-sm text-gray-600">{t('dashboard.tips_organization_text')}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{t('dashboard.tips_documents')}</h3>
                        <p className="text-sm text-gray-600">{t('dashboard.tips_documents_text')}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{t('dashboard.tips_rest')}</h3>
                        <p className="text-sm text-gray-600">{t('dashboard.tips_rest_text')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
