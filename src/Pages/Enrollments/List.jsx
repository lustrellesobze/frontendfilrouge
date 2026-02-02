import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchEnrollments } from '../../store/slices/enrollmentSlice';
import DocumentDownload from "../../Components/DocumentDownload";

export default function EnrollmentsList() {
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const { enrollments, loading } = useSelector((state) => state.enrollment);

    useEffect(() => {
        dispatch(fetchEnrollments());
    }, [dispatch]);

    const getStatusBadge = (status) => {
        const badges = {
            draft: 'bg-gray-100 text-gray-800',
            pending: 'bg-amber-100 text-amber-800',
            submitted: 'bg-yellow-100 text-yellow-800',
            validated: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status) => t(`enrollment.status.${status}`, status);

    // Session ou concours : ouvert / fermé (l'admin ouvre ou ferme la session)
    const getSessionStatusLabel = (enrollment) => {
        const session = enrollment.concours?.academicSession || enrollment.academicSession;
        const concoursStatus = enrollment.concours?.status;
        if (concoursStatus === 'closed') return t('enrollments_list.session_closed');
        if (concoursStatus === 'open') return t('enrollments_list.session_open');
        if (session?.status === 'closed') return t('enrollments_list.session_closed');
        if (session?.status === 'open' || session?.status === 'planned') return t('enrollments_list.session_open');
        return t('enrollments_list.session_open');
    };

    if (loading) {
        return <div className="text-center py-12">{t('common.loading')}</div>;
    }

    return (
        <div className="py-8">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">{t('enrollments_list.my_candidatures')}</h1>
                    <Link
                        to="/enrollments/create"
                        className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                    >
                        {t('enrollment.create')}
                    </Link>
                </div>

                {enrollments.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-500 mb-4">{t('enrollments_list.no_enrollments')}</p>
                        <Link
                            to="/enrollments/create"
                            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            {t('enrollment.create')}
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {enrollments.map((enrollment) => (
                                <li key={enrollment.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center flex-wrap gap-2">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {enrollment.concours?.name || enrollment.program?.name || t('enrollment.title')}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(enrollment.status)}`}>
                                                    {getStatusLabel(enrollment.status)}
                                                </span>
                                                <span className={`px-2 py-1 text-xs rounded-full ${(enrollment.concours?.status || enrollment.academicSession?.status) === 'closed' ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'}`}>
                                                    {getSessionStatusLabel(enrollment)}
                                                </span>
                                            </div>
                                            {enrollment.program?.name && enrollment.concours?.name && (
                                                <p className="mt-1 text-sm text-gray-600">{enrollment.program.name}</p>
                                            )}
                                            <p className="mt-1 text-sm text-gray-500">
                                                {enrollment.enrollment_code}
                                            </p>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {enrollment.concours?.academicSession?.label || enrollment.academicSession?.label || enrollment.academicSession?.code || '—'}
                                            </p>
                                            {enrollment.submitted_at && (
                                                <p className="mt-1 text-xs text-gray-400">
                                                    {new Date(enrollment.submitted_at).toLocaleDateString(i18n.language === 'en' ? 'en-GB' : 'fr-FR')}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            {['pending', 'submitted', 'validated'].includes(enrollment.status) ? (
                                                <>
                                                    <DocumentDownload 
                                                        enrollmentId={enrollment.id} 
                                                        type="enrollment" 
                                                        label={t('enrollments_list.download_pdf')}
                                                    />
                                                    <Link
                                                        to={`/enrollments/${enrollment.id}/confirmation`}
                                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                                    >
                                                        {t('enrollments_list.view_details')}
                                                    </Link>
                                                </>
                                            ) : (
                                                <Link
                                                    to={`/enrollments/create?enrollment=${enrollment.id}`}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                                >
                                                    {t('enrollments_list.continue')}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

