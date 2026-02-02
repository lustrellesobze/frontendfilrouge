import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';

const COLORS_SEXE = ['#4f46e5', '#ec4899', '#94a3b8'];
const COLORS_REGION = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0ea5e9', '#84cc16', '#f43f5e'];

export default function ProgramManagerDashboard() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/program-manager/statistics');
            setStats(response.data);
        } catch (error) {
            console.error('Erreur chargement statistiques:', error);
            toast.error('Erreur lors du chargement des statistiques');
            setStats({
                total: 0,
                by_status: {},
                by_gender: { male: 0, female: 0, other: 0 },
                by_region: [],
                by_series: [],
                by_mention: [],
                programs: [],
                average_age: null,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExportCsv = async () => {
        try {
            const response = await api.get('/program-manager/enrollments/export/csv', {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `candidats-${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Export CSV téléchargé');
        } catch (error) {
            console.error('Erreur export CSV:', error);
            toast.error('Erreur lors de l’export CSV');
        }
    };

    const handleExportPdf = async () => {
        try {
            const response = await api.get('/program-manager/enrollments/export/pdf', {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `liste-candidats-${new Date().toISOString().slice(0, 10)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Export PDF téléchargé');
        } catch (error) {
            console.error('Erreur export PDF:', error);
            toast.error('Erreur lors de l’export PDF');
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
                    <p className="text-gray-600 mt-1">Bienvenue, {user?.name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div
                        onClick={() => navigate('/program-manager/enrollments')}
                        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition cursor-pointer"
                    >
                        <p className="text-sm font-medium text-gray-600">Total candidatures</p>
                        <p className="text-3xl font-bold text-indigo-600 mt-2">{stats?.total ?? 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <p className="text-sm font-medium text-gray-600">En attente</p>
                        <p className="text-3xl font-bold text-amber-600 mt-2">
                            {stats?.by_status?.pending ?? 0}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <p className="text-sm font-medium text-gray-600">Validées</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                            {stats?.by_status?.validated ?? 0}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <p className="text-sm font-medium text-gray-600">Rejetées</p>
                        <p className="text-3xl font-bold text-red-600 mt-2">
                            {stats?.by_status?.rejected ?? 0}
                        </p>
                    </div>
                </div>

                {/* Progression des Validations */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Progression des Validations</h2>
                    {(() => {
                        const total = (stats?.total ?? 0) || 1;
                        const validated = stats?.by_status?.validated ?? 0;
                        const rejected = stats?.by_status?.rejected ?? 0;
                        const pending = stats?.by_status?.pending ?? 0;
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
                                        <span className="text-sm font-medium text-gray-700 w-10 text-right">Validés</span>
                                        <span className="text-sm font-semibold text-gray-900 w-12">{pctValid}%</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${pctRej}%` }} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 w-10 text-right">Rejetés</span>
                                        <span className="text-sm font-semibold text-gray-900 w-12">{pctRej}%</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gray-400 rounded-full" style={{ width: `${pctPending}%` }} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 w-10 text-right">En attente</span>
                                        <span className="text-sm font-semibold text-gray-900 w-12">{pctPending}%</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/program-manager/enrollments')}
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

                {/* Moyenne d'âge des candidats de la filière */}
                {stats?.average_age != null && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Moyenne d&apos;âge des candidats (ma filière)</h2>
                        <p className="text-3xl font-bold text-indigo-600">{stats.average_age} ans</p>
                        <p className="text-sm text-gray-500 mt-1">Âge moyen des étudiants inscrits dans vos filières</p>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Par filière</h2>
                    {stats?.programs?.length > 0 ? (
                        <ul className="space-y-2">
                            {stats.programs.map((p) => (
                                <li
                                    key={p.program_id}
                                    className="flex justify-between py-2 border-b border-gray-100 last:border-0"
                                >
                                    <span>{p.program_name}</span>
                                    <span className="font-semibold text-indigo-600">{p.count}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">Aucune filière assignée ou aucune candidature.</p>
                    )}
                </div>

                {/* Répartition par sexe – graphique circulaire */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition par sexe</h2>
                    {(() => {
                        const dataSexe = [
                            { name: 'Masculin', value: stats?.by_gender?.male ?? 0 },
                            { name: 'Féminin', value: stats?.by_gender?.female ?? 0 },
                            { name: 'Autre', value: stats?.by_gender?.other ?? 0 },
                        ].filter((d) => d.value > 0);
                        if (dataSexe.length === 0) {
                            return <p className="text-gray-500 py-8 text-center">Aucune donnée.</p>;
                        }
                        return (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={dataSexe}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                            nameKey="name"
                                            label={({ name, value }) => `${name}: ${value}`}
                                        >
                                            {dataSexe.map((_, index) => (
                                                <Cell key={index} fill={COLORS_SEXE[index % COLORS_SEXE.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [value, 'Candidats']} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        );
                    })()}
                </div>

                {/* Répartition par région – graphique en barres */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition par région</h2>
                    {stats?.by_region?.length > 0 ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={stats.by_region}
                                    margin={{ top: 10, right: 20, left: 10, bottom: 60 }}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis
                                        type="category"
                                        dataKey="region"
                                        width={120}
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(v) => (v && v.length > 18 ? v.slice(0, 17) + '…' : v)}
                                    />
                                    <Tooltip formatter={(value) => [value, 'Candidats']} />
                                    <Bar dataKey="count" name="Candidats" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-gray-500 py-8 text-center">Aucune donnée.</p>
                    )}
                </div>

                {/* Statistiques : série et mention (listes compactes) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition par série</h2>
                        {stats?.by_series?.length > 0 ? (
                            <ul className="space-y-2">
                                {stats.by_series.map((s) => (
                                    <li key={s.serie} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                        <span className="text-sm text-gray-700">{s.serie}</span>
                                        <span className="font-semibold text-indigo-600">{s.count}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">Aucune donnée.</p>
                        )}
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition par mention</h2>
                        {stats?.by_mention?.length > 0 ? (
                            <ul className="space-y-2">
                                {stats.by_mention.map((m) => (
                                    <li key={m.mention} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                        <span className="text-sm text-gray-700">{m.mention}</span>
                                        <span className="font-semibold text-indigo-600">{m.count}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">Aucune donnée.</p>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/program-manager/enrollments')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium"
                    >
                        Voir les candidatures
                    </button>
                    <button
                        onClick={handleExportCsv}
                        className="px-4 py-2 bg-white border border-indigo-600 text-indigo-700 rounded-md hover:bg-indigo-50 transition font-medium"
                    >
                        Exporter CSV
                    </button>
                    <button
                        onClick={handleExportPdf}
                        className="px-4 py-2 bg-white border border-indigo-600 text-indigo-700 rounded-md hover:bg-indigo-50 transition font-medium"
                    >
                        Exporter PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
