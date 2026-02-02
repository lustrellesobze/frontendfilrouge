import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchEnrollment } from '../../store/slices/enrollmentSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function EnrollmentsConfirmation() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const { currentEnrollment, loading } = useSelector((state) => state.enrollment);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (id) {
            dispatch(fetchEnrollment(id));
        }
    }, [id, dispatch]);

    useEffect(() => {
        if (!id && !loading) {
            navigate('/');
        }
    }, [id, loading, navigate]);

    const handleDownloadForm = async () => {
        try {
            const lang = i18n.language === 'en' ? 'en' : 'fr';
            const loadingToast = toast.loading(t('confirmation.generating'));
            
            const response = await api.get(`/enrollments/${id}/download-form`, {
                responseType: 'blob',
                params: { lang },
            });
            
            // Vérifier que la réponse est bien un PDF
            if (!response.data || response.data.size === 0) {
                throw new Error('Le fichier PDF est vide');
            }
            
            // Vérifier le type MIME
            const contentType = response.headers['content-type'] || response.headers['Content-Type'];
            if (contentType && !contentType.includes('application/pdf')) {
                console.warn('⚠️ Type MIME inattendu:', contentType);
            }
            
            console.log('✅ PDF reçu, taille:', response.data.size, 'bytes');
            
            // Créer un lien de téléchargement
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `fiche-inscription-${currentEnrollment?.enrollment_code || id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            // Nettoyer l'URL après un court délai
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 100);
            
            toast.dismiss(loadingToast);
            toast.success('Fiche d\'inscription téléchargée avec succès !');
        } catch (error) {
            console.error('❌ Erreur téléchargement:', error);
            console.error('Détails:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
            });
            
            let errorMessage = t('confirmation.download_error');
            if (error.response?.status === 404) errorMessage = t('confirmation.not_found_error');
            else if (error.response?.status === 500) errorMessage = error.response?.data?.message || t('confirmation.server_error');
            else if (error.message) errorMessage = error.message;
            toast.error(errorMessage, { duration: 5000 });
        }
    };

    const getStatusLabel = (status) => t(`enrollment.status.${status}`, status);

    const getStatusColor = (status) => {
        const colors = {
            'validated': 'text-green-600',
            'submitted': 'text-yellow-600',
            'draft': 'text-gray-600',
            'rejected': 'text-red-600',
        };
        return colors[status] || 'text-gray-600';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                    <p className="text-gray-600">{t('confirmation.loading')}</p>
                </div>
            </div>
        );
    }

    if (!currentEnrollment) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center py-12">
                    <p className="text-gray-600">{t('confirmation.not_found')}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        {t('confirmation.back_home_btn')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-2xl w-full">
                {/* Message de félicitations */}
                <div className="bg-white rounded-lg border border-purple-200 p-8 shadow-lg mb-6">
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {t('confirmation.congratulations')}
                        </h2>
                        <p className="text-lg text-gray-700 mb-4">
                            {t('confirmation.submitted')}
                        </p>
                        <p className="text-sm text-gray-600 mb-6">
                            {t('confirmation.wait_check')}
                        </p>
                    </div>

                    {currentEnrollment.metadata?.candidate_code && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-center">
                                <span className="font-semibold text-blue-900">{t('confirmation.candidate_code')}: </span>
                                <span className="text-xl font-bold text-blue-600">{currentEnrollment.metadata.candidate_code}</span>
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={handleDownloadForm}
                            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {t('confirmation.download_form')}
                        </button>

                        <button
                            onClick={() => navigate('/dashboard', { replace: true })}
                            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            {t('confirmation.go_dashboard')}
                        </button>

                        <button
                            onClick={() => navigate('/', { replace: true })}
                            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                        >
                            {t('confirmation.back_home')}
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                            📌 {t('confirmation.qr_note')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
