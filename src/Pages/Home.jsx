import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Home() {
    const { t } = useTranslation();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [hasEnrollment, setHasEnrollment] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated && user) {
            console.log('🔍 Vérification de l\'enrôlement pour l\'utilisateur:', user.id);
            checkEnrollment();
        } else {
            // Si non connecté, pas d'enrôlement et ne pas afficher le chargement
            setHasEnrollment(false);
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    // Recharger les données quand l'utilisateur revient sur la page (après soumission d'enrollment)
    useEffect(() => {
        const handleFocus = () => {
            if (isAuthenticated && user) {
                checkEnrollment();
            }
        };
        
        // Recharger aussi quand la page devient visible (retour depuis une autre page)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isAuthenticated && user) {
                checkEnrollment();
            }
        };
        
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isAuthenticated, user]);

    const checkEnrollment = async () => {
        try {
            setLoading(true);
            const response = await api.get('/enrollments');
            const enrollments = response.data.data || response.data || [];
            // Un candidat peut postuler à plusieurs concours : on affiche "Mon tableau de bord" s'il a au moins une candidature
            const hasAnyEnrollment = enrollments && enrollments.length > 0;
            setHasEnrollment(hasAnyEnrollment);
        } catch (error) {
            console.error('❌ Erreur vérification enrôlement:', error);
            setHasEnrollment(false);
        } finally {
            setLoading(false);
        }
    };

    const handleStartClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isAuthenticated) {
            toast.error(t('home.please_login'), { duration: 3000 });
            // Rediriger vers login avec l'état de redirection
            navigate('/auth/login', { 
                state: { from: { pathname: '/enrollments/create' } },
                replace: false
            });
        } else {
            // Si connecté, accéder directement au formulaire d'enrollment
            navigate('/enrollments/create', { replace: false });
        }
    };

    const handleDownloadArrete = async (level) => {
        const filename = level === 'first-year' 
            ? 'arrete-premiere-annee.pdf' 
            : 'arrete-troisieme-annee.pdf';
        
        try {
            // Méthode 1: Essayer via l'API des arrêtés (méthode recommandée)
            try {
                console.log('📥 Tentative de téléchargement via API des arrêtés...');
                
                // Récupérer la liste des arrêtés
                const arretesResponse = await api.get('/arretes');
                const arretes = arretesResponse.data?.data || arretesResponse.data || [];
                
                // Trouver l'arrêté correspondant au niveau
                const type = level === 'first-year' ? 'premiere_annee' : 'troisieme_annee';
                const arrete = arretes.find(a => 
                    a.type === type || 
                    a.type === level ||
                    (level === 'first-year' && (a.title?.toLowerCase().includes('première') || a.title?.toLowerCase().includes('premiere'))) ||
                    (level === 'third-year' && (a.title?.toLowerCase().includes('troisième') || a.title?.toLowerCase().includes('troisieme')))
                );
                
                if (arrete && arrete.id) {
                    console.log('✅ Arrêté trouvé:', arrete.id, arrete.title);
                    
                    // Télécharger via l'API
                    const downloadResponse = await api.get(`/arretes/${arrete.id}/download`, {
                        responseType: 'blob',
                    });
                    
                    const blob = new Blob([downloadResponse.data], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    
                    setTimeout(() => {
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                    }, 100);
                    
                    toast.success('Téléchargement de l\'arrêté réussi !');
                    return;
                } else {
                    console.warn('⚠️ Aucun arrêté trouvé pour le niveau:', level);
                }
            } catch (apiError) {
                console.warn('⚠️ Erreur lors du téléchargement via API:', apiError);
            }
            
            // Méthode 2: Essayer via l'endpoint statique /documents
            try {
                console.log('📥 Tentative de téléchargement depuis /documents...');
                
                // Utiliser une URL relative pour éviter les problèmes de CORS
                const baseUrl = window.location.origin;
                const downloadUrl = `${baseUrl}/documents/${filename}`;
                
                console.log('🔗 URL de téléchargement:', downloadUrl);
                
                // Télécharger via fetch
                const response = await fetch(downloadUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/pdf',
                    },
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const blob = await response.blob();
                
                // Vérifier que c'est bien un PDF
                if (blob.size === 0) {
                    throw new Error('Le fichier téléchargé est vide');
                }
                
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                
                setTimeout(() => {
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                }, 100);
                
                toast.success('Téléchargement de l\'arrêté réussi !');
                return;
            } catch (staticError) {
                console.warn('⚠️ Erreur lors du téléchargement depuis /documents:', staticError);
            }
            
            // Si toutes les méthodes échouent, rediriger vers la page des arrêtés sans message d'erreur
            // (c'est normal si le fichier n'est pas trouvé, on redirige vers la liste)
            navigate(`/arretes?level=${level}`);
            
        } catch (error) {
            console.error('❌ Erreur générale lors du téléchargement:', error);
            toast.error('Erreur lors du téléchargement. Redirection vers la page des arrêtés...');
            navigate(`/arretes?level=${level}`);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section with Split Layout */}
            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
                {/* Left Side - Content */}
                <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12 xl:px-16 py-12 lg:py-16">
                    <div className="max-w-2xl">
                        {/* Titre principal avec SGEE en rouge */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            {t('home.title')}{' '}
                            <span className="text-red-600">{t('home.title_sgee')}</span>
                            {t('home.title_end')}
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-700 mb-6 leading-relaxed">
                            {t('home.subtitle')}
                        </p>

                        <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                            {t('home.arrete_advice')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <button
                                onClick={() => handleDownloadArrete('first-year')}
                                className="flex-1 px-6 py-4 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transform hover:scale-105 transition-all duration-200 text-center flex items-center justify-center gap-2"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-lg font-semibold">{t('home.first_year')}</span>
                            </button>

                            <button
                                onClick={() => handleDownloadArrete('third-year')}
                                className="flex-1 px-6 py-4 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transform hover:scale-105 transition-all duration-200 text-center flex items-center justify-center gap-2"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-lg font-semibold">{t('home.third_year')}</span>
                            </button>
                        </div>

                        <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
                            {t('home.fill_advice')}{' '}
                            <Link to="/contact" className="text-green-600 hover:text-green-700 underline font-medium">
                                {t('home.here')}
                            </Link>
                            {' '}{t('home.here_end')}
                        </p>

                        <div className="flex justify-start flex-wrap gap-4">
                            {loading ? (
                                <div className="px-8 py-4 bg-gray-300 text-gray-600 rounded-lg text-lg font-medium flex items-center gap-2">
                                    {t('common.loading')}
                                </div>
                            ) : (
                                <>
                                    {isAuthenticated && hasEnrollment && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
                                            className="px-8 py-4 bg-green-600 text-white rounded-lg text-lg font-medium hover:bg-green-700 transition shadow-md flex items-center gap-2"
                                        >
                                            {t('home.my_dashboard')}
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleStartClick}
                                        className="px-8 py-4 bg-green-600 text-white rounded-lg text-lg font-medium hover:bg-green-700 transition shadow-md flex items-center gap-2"
                                    >
                                        {isAuthenticated ? t('home.start') : t('home.sign_up')}
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side - Image : étudiants africains en graduation (Oscar Omondi, Nairobi) */}
                <div className="flex-1 relative min-h-[400px] lg:min-h-[600px] xl:min-h-[700px] overflow-hidden bg-slate-100">
                    <img
                        src="https://images.unsplash.com/photo-1645262803541-7b5bf0bee72c?w=1200&q=90&auto=format&fit=crop"
                        alt="Étudiants africains en tenue de graduation"
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        style={{ filter: 'brightness(1.06) contrast(1.05) saturate(1.08)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/25 via-white/15 to-white/35" aria-hidden="true" />
                    
                    {/* Overlay avec gradient vert très léger */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-transparent to-transparent z-10"></div>
                    
                    {/* Badge "Excellence Académique" avec style professionnel */}
                    <div className="absolute bottom-8 right-8 bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-2xl text-center max-w-[220px] z-20 border border-green-100">
                        <div className="flex items-center justify-center mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.206 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.794 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.794 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.206 18 16.5 18s-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">{t('home.excellence')}</h3>
                        <p className="text-sm text-gray-600 leading-tight">{t('home.excellence_sub')}</p>
                    </div>
                    
                    <div className="absolute top-8 left-8 z-20">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-green-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{t('home.certified_platform')}</p>
                                    <p className="text-xs text-gray-600">{t('home.secure_registration')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Overlay avec gradient pour transition douce vers le contenu */}
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/30 pointer-events-none z-10"></div>
                </div>
            </div>

            {/* Section Pourquoi choisir SGEE ? — visible en scrollant */}
            <section className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
                        {t('home.why_choose')}
                    </h2>
                    <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                        {t('home.why_choose_sub')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        <div className="bg-sky-50 rounded-xl p-6 lg:p-8 shadow-sm border border-sky-100">
                            <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('home.quick_registration')}</h3>
                            <p className="text-gray-600">{t('home.quick_registration_text')}</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-6 lg:p-8 shadow-sm border border-amber-100">
                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('home.realtime_tracking')}</h3>
                            <p className="text-gray-600">{t('home.realtime_tracking_text')}</p>
                        </div>
                        <div className="bg-sky-50 rounded-xl p-6 lg:p-8 shadow-sm border border-sky-100">
                            <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('home.dedicated_support')}</h3>
                            <p className="text-gray-600">{t('home.dedicated_support_text')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-green-600 text-white py-6 px-4 text-center">
                <p className="text-sm sm:text-base">
                    {t('footer.copyright')}
                </p>
            </footer>
        </div>
    );
}
