import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import GenderChart from '../../components/Charts/GenderChart';
import TrendsChart from '../../components/Charts/TrendsChart';
import ProgramsChart from '../../components/Charts/ProgramsChart';
import RegionsChart from '../../components/Charts/RegionsChart';
import StatusChart from '../../Components/Charts/StatusChart';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsError, setStatsError] = useState(null);
    const [pendingValidations, setPendingValidations] = useState(0);

    useEffect(() => {
        loadStats();
        loadPendingValidations();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            setStatsError(null);
            const response = await api.get('/dashboard/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
            setStats(null);
            const status = error.response?.status;
            const message = error.response?.data?.message;
            setStatsError({ status, message });
            if (status === 403) {
                toast.error('Accès refusé. Vérifiez que votre compte a le rôle administrateur (ex: exécuter seed-admin.js).');
            } else if (status === 401) {
                toast.error('Session expirée. Veuillez vous reconnecter.');
            } else if (status >= 500 || !error.response) {
                toast.error('Impossible de charger les statistiques. Vérifiez que le backend est démarré et la base de données accessible.');
            } else {
                toast.error('Erreur lors du chargement des statistiques');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadPendingValidations = async () => {
        try {
            // Compter les dossiers en attente de validation finale
            const response = await api.get('/admin/enrollments?status=reviewed_by_manager&per_page=1');
            setPendingValidations(response.data.total || 0);
        } catch (error) {
            console.error('Erreur lors du chargement des validations en attente:', error);
        }
    };

    if (loading) {
        return (
            <div className="py-8 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-xl">
                    <p className="text-red-800 font-medium">Impossible de charger les statistiques</p>
                    {statsError?.status === 403 && (
                        <p className="text-red-700 text-sm mt-2">
                            Votre compte n&apos;a pas les droits administrateur. Assurez-vous d&apos;avoir exécuté le seed admin (dans backend : <code className="bg-red-100 px-1 rounded">npm run seed:admin</code>) et de vous connecter avec le compte admin.
                        </p>
                    )}
                    {statsError?.status === 401 && (
                        <p className="text-red-700 text-sm mt-2">Session expirée ou non authentifié. Reconnectez-vous.</p>
                    )}
                    {(!statsError?.status || statsError?.status >= 500 || !statsError?.status) && statsError && (
                        <p className="text-red-700 text-sm mt-2">
                            {statsError.message || 'Vérifiez que le backend (port 8000) et la base de données sont démarrés.'}
                        </p>
                    )}
                    <button
                        type="button"
                        onClick={() => loadStats()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    const StatCard = ({ title, value, icon, color = 'indigo', onClick }) => (
        <div 
            className={`bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                </div>
                <div className={`bg-${color}-100 rounded-full p-3 flex-shrink-0 ml-4`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Administration</h1>
                        <p className="text-gray-600 mt-2">Bienvenue, {user?.name}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/admin/enrollments')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
                        >
                            Gérer les enrôlements
                        </button>
                    </div>
                </div>

                {/* Alerte pour dossiers en attente de validation */}
                {pendingValidations > 0 && (
                    <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-yellow-800 font-semibold">
                                        {pendingValidations} dossier{pendingValidations > 1 ? 's' : ''} en attente de validation finale
                                    </p>
                                    <p className="text-yellow-700 text-sm">Des responsables de filières ont recommandé des dossiers pour validation</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/admin/enrollments?status=reviewed_by_manager')}
                                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition text-sm font-medium"
                            >
                                Voir maintenant
                            </button>
                        </div>
                    </div>
                )}

                {/* Statistiques principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Candidats Inscrits"
                        value={stats.totals?.students || 0}
                        color="blue"
                        icon={
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        }
                        onClick={() => navigate('/admin/enrollments')}
                    />
                    <StatCard
                        title="Candidats Enrôlés"
                        value={stats.totals?.enrolled || 0}
                        color="green"
                        icon={
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title="Centres d'Examen"
                        value={stats.totals?.exam_centers || 0}
                        color="yellow"
                        icon={
                            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                        onClick={() => navigate('/admin/centres')}
                    />
                    <StatCard
                        title="Revenus Totaux"
                        value={`${((stats.payments?.total_revenue || 0) / 1000).toFixed(0)}K FCFA`}
                        color="teal"
                        icon={
                            <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                </div>

                {/* Gestion des concours : Sessions, Écoles, Concours */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Sessions des concours"
                        value={stats.totals?.sessions ?? 0}
                        color="indigo"
                        icon={
                            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        }
                        onClick={() => navigate('/admin/sessions')}
                    />
                    <StatCard
                        title="Écoles"
                        value={stats.totals?.ecoles ?? 0}
                        color="purple"
                        icon={
                            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        }
                        onClick={() => navigate('/admin/ecoles')}
                    />
                    <StatCard
                        title="Concours"
                        value={stats.totals?.concours ?? 0}
                        color="orange"
                        icon={
                            <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        }
                        onClick={() => navigate('/admin/competitions')}
                    />
                </div>

                {/* Progression des Validations */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Progression des Validations</h2>
                    {(() => {
                        const validated = stats.enrollments?.by_status?.validated ?? 0;
                        const rejected = stats.enrollments?.by_status?.rejected ?? 0;
                        const pending = stats.enrollments?.by_status?.pending ?? 0;
                        const total = validated + rejected + pending || 1;
                        const pctValid = Math.round((validated / total) * 100);
                        const pctRej = Math.round((rejected / total) * 100);
                        const pctPending = Math.round((pending / total) * 100);
                        return (
                            <>
                                <div className="space-y-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${pctValid}%` }} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 w-16 text-right">Validés</span>
                                        <span className="text-sm font-semibold text-gray-900 w-12">{pctValid}%</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${pctRej}%` }} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 w-16 text-right">Rejetés</span>
                                        <span className="text-sm font-semibold text-gray-900 w-12">{pctRej}%</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gray-400 rounded-full" style={{ width: `${pctPending}%` }} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 w-16 text-right">En attente</span>
                                        <span className="text-sm font-semibold text-gray-900 w-12">{pctPending}%</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/enrollments')}
                                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    Gérer les Candidats
                                </button>
                            </>
                        );
                    })()}
                </div>

                {/* Graphiques en première ligne */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Graphique circulaire - Enrôlements par statut */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Répartition des Statuts</h2>
                        <StatusChart data={stats.enrollments?.by_status || {}} />
                    </div>

                    {/* Graphique circulaire - Répartition par genre */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Répartition par Genre</h2>
                        <GenderChart data={{
                            male: stats.gender?.male || 0,
                            female: stats.gender?.female || 0,
                            other: stats.gender?.other || 0
                        }} />
                    </div>
                </div>

                {/* Graphiques en deuxième ligne - toujours affichés */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Évolution des 7 derniers jours</h2>
                        <TrendsChart data={stats.trends?.enrollments_last_7_days || []} />
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Programmes par Candidats</h2>
                        <ProgramsChart data={stats.top_programs || []} />
                    </div>
                </div>

                {/* Répartition par région - toujours affichée */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Répartition par région</h2>
                    <RegionsChart data={stats.regions?.enrollments_by_region || []} />
                </div>

                {/* Statistiques : Par filière (toutes les filières avec effectif) */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Classement par filière</h2>
                    <p className="text-sm text-gray-500 mb-4">Nombre de candidatures par programme (filière).</p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Filière</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Candidats</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(stats.by_program || []).length > 0 ? (stats.by_program || []).map((row) => (
                                    <tr key={row.program_id}>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{row.program_name || '—'}</td>
                                        <td className="px-4 py-2 text-sm text-right text-gray-600 font-semibold">{row.count}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={2} className="px-4 py-4 text-center text-gray-500">Aucune donnée</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Par mention (bac) */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Répartition par mention (bac)</h2>
                    <p className="text-sm text-gray-500 mb-4">Nombre de candidats par mention au baccalauréat.</p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mention</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Candidats</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(stats.by_mention || []).length > 0 ? (stats.by_mention || []).map((row) => (
                                    <tr key={row.mention_id}>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{row.mention_name || '—'}</td>
                                        <td className="px-4 py-2 text-sm text-right text-gray-600 font-semibold">{row.count}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={2} className="px-4 py-4 text-center text-gray-500">Aucune donnée</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Concours les plus sollicités */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Concours les plus sollicités</h2>
                    <p className="text-sm text-gray-500 mb-4">Comparaison du nombre de candidatures par concours.</p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Concours</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Candidats</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(stats.by_concours || []).length > 0 ? (stats.by_concours || []).map((row) => (
                                    <tr key={row.concours_id}>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{row.concours_name || '—'}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{row.concours_code || '—'}</td>
                                        <td className="px-4 py-2 text-sm text-right text-indigo-600 font-semibold">{row.count}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} className="px-4 py-4 text-center text-gray-500">Aucune donnée</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Moyenne d'âge des candidats par filière - toujours affichée */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Moyenne d&apos;âge des candidats par filière</h2>
                    <p className="text-sm text-gray-500 mb-4">Âge moyen des candidats inscrits aux concours, par programme.</p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Filière</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Moyenne d&apos;âge</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Candidats</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(stats.average_age_by_program || []).length > 0 ? (stats.average_age_by_program || []).map((row) => (
                                    <tr key={row.program_id}>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{row.program_name || '—'}</td>
                                        <td className="px-4 py-2 text-sm text-right text-indigo-600 font-semibold">
                                            {row.average_age != null ? `${row.average_age} ans` : '—'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-right text-gray-600">{row.count}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} className="px-4 py-4 text-center text-gray-500">Aucune donnée</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Actions rapides et informations */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Dossiers en attente de validation */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/admin/enrollments')}
                                className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-sm font-medium text-gray-900"
                            >
                                📋 Gérer les candidatures
                            </button>
                            <button
                                onClick={() => navigate('/admin/enrollments?status=reviewed_by_manager')}
                                className="w-full text-left px-4 py-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition text-sm font-medium text-gray-900"
                            >
                                ✅ Valider les dossiers recommandés ({pendingValidations})
                            </button>
                            <button
                                onClick={() => navigate('/admin/sessions')}
                                className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition text-sm font-medium text-gray-900"
                            >
                                📅 Sessions des concours
                            </button>
                            <button
                                onClick={() => navigate('/admin/ecoles')}
                                className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition text-sm font-medium text-gray-900"
                            >
                                🏫 Écoles
                            </button>
                            <button
                                onClick={() => navigate('/admin/competitions')}
                                className="w-full text-left px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition text-sm font-medium text-gray-900"
                            >
                                📑 Concours
                            </button>
                            <button
                                onClick={() => navigate('/admin/centres')}
                                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-sm font-medium text-gray-900"
                            >
                                📍 Centres (examen / dépôt)
                            </button>
                            <button
                                onClick={() => navigate('/admin/parametres')}
                                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition text-sm font-medium text-gray-900"
                            >
                                ⚙️ Paramètres de l&apos;application
                            </button>
                            <button
                                onClick={() => navigate('/admin/users')}
                                className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition text-sm font-medium text-gray-900"
                            >
                                👥 Gérer les utilisateurs
                            </button>
                        </div>
                    </div>

                    {/* Informations de session */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Actuelle</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Enrôlements:</span>
                                <span className="text-sm font-semibold text-gray-900">{stats.enrollments?.current_session || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Récents (30j):</span>
                                <span className="text-sm font-semibold text-gray-900">{stats.enrollments?.recent || 0}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                                <span className="text-sm text-gray-600">Total paiements:</span>
                                <span className="text-sm font-semibold text-gray-900">{stats.totals?.payments || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Résumé */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total enrôlements:</span>
                                <span className="text-sm font-semibold text-gray-900">{stats.totals?.enrollments || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Centres dépôt:</span>
                                <span className="text-sm font-semibold text-gray-900">{stats.totals?.depot_centers || 0}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                                <span className="text-sm text-gray-600">Régions:</span>
                                <span className="text-sm font-semibold text-gray-900">{stats.regions?.total_regions || stats.regions?.enrollments_by_region?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
