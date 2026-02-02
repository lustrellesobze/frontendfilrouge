import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ProgramManagerEnrollments() {
    const [searchParams] = useSearchParams();
    const statusFromUrl = searchParams.get('status');
    const statusFilter = (statusFromUrl === null || statusFromUrl === '') ? 'pending' : statusFromUrl;
    const genderFilter = searchParams.get('gender') || '';
    const regionIdFilter = searchParams.get('region_id') || '';
    const bacSerieIdFilter = searchParams.get('bac_serie_id') || '';
    const mentionIdFilter = searchParams.get('mention_id') || '';
    const searchFilter = searchParams.get('search') || '';
    const [data, setData] = useState({ data: [], total: 0, current_page: 1, last_page: 1 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const [regions, setRegions] = useState([]);
    const [bacSeries, setBacSeries] = useState([]);
    const [mentions, setMentions] = useState([]);

    const [detailEnrollmentId, setDetailEnrollmentId] = useState(null);
    const [detailEnrollment, setDetailEnrollment] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadEnrollments();
    }, [page, statusFilter, genderFilter, regionIdFilter, bacSerieIdFilter, mentionIdFilter, searchFilter]);

    useEffect(() => {
        if (detailEnrollmentId) {
            (async () => {
                setDetailLoading(true);
                try {
                    const res = await api.get(`/program-manager/enrollments/${detailEnrollmentId}`);
                    setDetailEnrollment(res.data);
                } catch (e) {
                    toast.error('Impossible de charger le détail de la candidature');
                    setDetailEnrollmentId(null);
                } finally {
                    setDetailLoading(false);
                }
            })();
        } else {
            setDetailEnrollment(null);
            setShowRejectModal(false);
            setRejectReason('');
        }
    }, [detailEnrollmentId]);

    useEffect(() => {
        // Charger les listes pour filtres
        (async () => {
            try {
                const [r, b, m] = await Promise.all([
                    api.get('/regions'),
                    api.get('/bac-series'),
                    api.get('/mentions'),
                ]);
                setRegions(r.data?.data || r.data || []);
                setBacSeries(b.data?.data || b.data || []);
                setMentions(m.data?.data || m.data || []);
            } catch (e) {
                // Ne pas bloquer l'UI si ces ressources ne se chargent pas
                console.warn('⚠️ Impossible de charger certaines ressources (regions/bac-series/mentions)');
            }
        })();
    }, []);

    const exportParams = useMemo(() => {
        const params = new URLSearchParams();
        if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
        if (genderFilter) params.set('gender', genderFilter);
        if (regionIdFilter) params.set('region_id', regionIdFilter);
        if (bacSerieIdFilter) params.set('bac_serie_id', bacSerieIdFilter);
        if (mentionIdFilter) params.set('mention_id', mentionIdFilter);
        if (searchFilter) params.set('search', searchFilter);
        return params;
    }, [statusFilter, genderFilter, regionIdFilter, bacSerieIdFilter, mentionIdFilter, searchFilter]);

    const loadEnrollments = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page, per_page: 15 });
            if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
            if (genderFilter) params.set('gender', genderFilter);
            if (regionIdFilter) params.set('region_id', regionIdFilter);
            if (bacSerieIdFilter) params.set('bac_serie_id', bacSerieIdFilter);
            if (mentionIdFilter) params.set('mention_id', mentionIdFilter);
            if (searchFilter) params.set('search', searchFilter);
            const response = await api.get(`/program-manager/enrollments?${params}`);
            setData(response.data);
        } catch (error) {
            console.error('Erreur chargement candidatures:', error);
            toast.error('Erreur lors du chargement des candidatures');
            setData({ data: [], total: 0, current_page: 1, last_page: 1 });
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async () => {
        if (!detailEnrollmentId) return;
        setActionLoading(true);
        try {
            await api.post(`/program-manager/enrollments/${detailEnrollmentId}/validate`);
            toast.success('Candidature validée. Un email a été envoyé au candidat.');
            setDetailEnrollmentId(null);
            loadEnrollments();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Erreur lors de la validation');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectSubmit = async () => {
        const reason = rejectReason.trim();
        if (!reason) {
            toast.error('Veuillez indiquer le motif de rejet.');
            return;
        }
        if (!detailEnrollmentId) return;
        setActionLoading(true);
        try {
            await api.post(`/program-manager/enrollments/${detailEnrollmentId}/reject`, { reason });
            toast.success('Candidature rejetée.');
            setShowRejectModal(false);
            setRejectReason('');
            setDetailEnrollmentId(null);
            loadEnrollments();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Erreur lors du rejet');
        } finally {
            setActionLoading(false);
        }
    };

    const downloadDocument = async (docId) => {
        try {
            const res = await api.get(`/enrollment-documents/${docId}/download`, { responseType: 'blob' });
            const blob = new Blob([res.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `document-${docId}`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Téléchargement lancé');
        } catch (e) {
            toast.error('Impossible de télécharger le document');
        }
    };

    const downloadExport = async (format) => {
        try {
            const url = format === 'csv'
                ? `/program-manager/enrollments/export/csv?${exportParams}`
                : `/program-manager/enrollments/export/pdf?${exportParams}`;

            const response = await api.get(url, { responseType: 'blob' });
            const type = format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/pdf';
            const blob = new Blob([response.data], { type });
            const objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.setAttribute('download', `${format === 'csv' ? 'candidats' : 'liste-candidats'}-${new Date().toISOString().slice(0, 10)}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(objectUrl);
            toast.success(`Export ${format.toUpperCase()} téléchargé`);
        } catch (e) {
            console.error('Erreur export:', e);
            toast.error('Erreur lors de l’export');
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Candidatures de ma filière</h1>

                <div className="mb-4 flex gap-2">
                    {['all', 'pending', 'submitted', 'validated', 'rejected'].map((s) => (
                        <a
                            key={s}
                            href={`/program-manager/enrollments${s !== 'all' ? `?status=${s}` : '?status=all'}`}
                            className={`px-3 py-1.5 rounded text-sm ${
                                statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {s === 'all' ? 'Tous' : s === 'pending' ? 'En attente' : s === 'submitted' ? 'Soumis' : s === 'validated' ? 'Validés' : 'Rejetés'}
                        </a>
                    ))}
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                        <input
                            defaultValue={searchFilter}
                            placeholder="Recherche (nom, email, code...)"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const url = new URL(window.location.href);
                                    if (e.target.value) url.searchParams.set('search', e.target.value);
                                    else url.searchParams.delete('search');
                                    window.location.href = url.pathname + '?' + url.searchParams.toString();
                                }
                            }}
                            className="border rounded px-3 py-2 text-sm"
                        />

                        <select
                            value={genderFilter}
                            onChange={(e) => {
                                const url = new URL(window.location.href);
                                if (e.target.value) url.searchParams.set('gender', e.target.value);
                                else url.searchParams.delete('gender');
                                window.location.href = url.pathname + '?' + url.searchParams.toString();
                            }}
                            className="border rounded px-3 py-2 text-sm"
                        >
                            <option value="">Sexe (tous)</option>
                            <option value="M">Masculin</option>
                            <option value="F">Féminin</option>
                        </select>

                        <select
                            value={regionIdFilter}
                            onChange={(e) => {
                                const url = new URL(window.location.href);
                                if (e.target.value) url.searchParams.set('region_id', e.target.value);
                                else url.searchParams.delete('region_id');
                                window.location.href = url.pathname + '?' + url.searchParams.toString();
                            }}
                            className="border rounded px-3 py-2 text-sm"
                        >
                            <option value="">Région (toutes)</option>
                            {regions.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>

                        <select
                            value={bacSerieIdFilter}
                            onChange={(e) => {
                                const url = new URL(window.location.href);
                                if (e.target.value) url.searchParams.set('bac_serie_id', e.target.value);
                                else url.searchParams.delete('bac_serie_id');
                                window.location.href = url.pathname + '?' + url.searchParams.toString();
                            }}
                            className="border rounded px-3 py-2 text-sm"
                        >
                            <option value="">Série (toutes)</option>
                            {bacSeries.map((s) => (
                                <option key={s.id} value={s.id}>{s.libelle}</option>
                            ))}
                        </select>

                        <select
                            value={mentionIdFilter}
                            onChange={(e) => {
                                const url = new URL(window.location.href);
                                if (e.target.value) url.searchParams.set('mention_id', e.target.value);
                                else url.searchParams.delete('mention_id');
                                window.location.href = url.pathname + '?' + url.searchParams.toString();
                            }}
                            className="border rounded px-3 py-2 text-sm"
                        >
                            <option value="">Mention (toutes)</option>
                            {mentions.map((m) => (
                                <option key={m.id} value={m.id}>{m.libelle}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => downloadExport('csv')}
                            className="px-3 py-2 bg-white border border-indigo-600 text-indigo-700 rounded-md hover:bg-indigo-50 text-sm font-medium"
                        >
                            Exporter CSV (avec filtres)
                        </button>
                        <button
                            onClick={() => downloadExport('pdf')}
                            className="px-3 py-2 bg-white border border-indigo-600 text-indigo-700 rounded-md hover:bg-indigo-50 text-sm font-medium"
                        >
                            Exporter PDF (avec filtres)
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Candidat</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Filière</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Série</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mention</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Région</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sexe</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                            Aucune candidature.
                                        </td>
                                    </tr>
                                ) : (
                                    data.data?.map((e) => (
                                        <tr key={e.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm">{e.enrollment_code || '-'}</td>
                                            <td className="px-4 py-2 text-sm">{e.student?.user?.name ?? '-'}</td>
                                            <td className="px-4 py-2 text-sm">{e.program?.name ?? '-'}</td>
                                            <td className="px-4 py-2 text-sm">{e.bacSerie?.libelle ?? '-'}</td>
                                            <td className="px-4 py-2 text-sm">{e.mention?.libelle ?? '-'}</td>
                                            <td className="px-4 py-2 text-sm">{e.preferredRegion?.name ?? '-'}</td>
                                            <td className="px-4 py-2 text-sm">{e.student?.gender ?? '-'}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    e.status === 'validated' ? 'bg-green-100 text-green-800' :
                                                    e.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    e.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {e.status === 'pending' ? 'En attente' : e.status === 'submitted' ? 'Soumis' : e.status === 'validated' ? 'Validé' : e.status === 'rejected' ? 'Rejeté' : e.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setDetailEnrollmentId(e.id)}
                                                    className="px-2 py-1 text-sm text-indigo-600 hover:underline"
                                                >
                                                    Consulter
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {data.last_page > 1 && (
                            <div className="px-4 py-2 flex justify-between items-center border-t">
                                <span className="text-sm text-gray-600">
                                    Page {data.current_page} / {data.last_page} ({data.total} au total)
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        disabled={data.current_page <= 1}
                                        onClick={() => setPage((p) => p - 1)}
                                        className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                                    >
                                        Précédent
                                    </button>
                                    <button
                                        disabled={data.current_page >= data.last_page}
                                        onClick={() => setPage((p) => p + 1)}
                                        className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                                    >
                                        Suivant
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal détail candidature */}
                {detailEnrollmentId != null && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <div className="fixed inset-0 bg-black/50" onClick={() => setDetailEnrollmentId(null)} />
                            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Détail de la candidature</h2>
                                    {detailLoading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                                        </div>
                                    ) : detailEnrollment ? (
                                        <>
                                            <div className="space-y-3 mb-6">
                                                <p><span className="font-medium text-gray-600">Code :</span> {detailEnrollment.enrollment_code || '-'}</p>
                                                <p><span className="font-medium text-gray-600">Candidat :</span> {detailEnrollment.student?.user?.name ?? '-'}</p>
                                                <p><span className="font-medium text-gray-600">Email :</span> {detailEnrollment.student?.user?.email ?? '-'}</p>
                                                <p><span className="font-medium text-gray-600">Filière :</span> {detailEnrollment.program?.name ?? '-'}</p>
                                                <p><span className="font-medium text-gray-600">Série / Mention :</span> {detailEnrollment.bacSerie?.libelle ?? '-'} / {detailEnrollment.mention?.libelle ?? '-'}</p>
                                                <p><span className="font-medium text-gray-600">Région :</span> {detailEnrollment.preferredRegion?.name ?? '-'}</p>
                                                <p><span className="font-medium text-gray-600">Statut :</span>
                                                    <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                                        detailEnrollment.status === 'validated' ? 'bg-green-100 text-green-800' :
                                                        detailEnrollment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        detailEnrollment.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {detailEnrollment.status === 'pending' ? 'En attente' : detailEnrollment.status === 'submitted' ? 'Soumis' : detailEnrollment.status === 'validated' ? 'Validé' : detailEnrollment.status === 'rejected' ? 'Rejeté' : detailEnrollment.status}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="mb-6">
                                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Documents</h3>
                                                {detailEnrollment.documents?.length > 0 ? (
                                                    <ul className="space-y-2">
                                                        {detailEnrollment.documents.map((doc) => (
                                                            <li key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                                <span className="text-sm">{doc.title || doc.type}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => downloadDocument(doc.id)}
                                                                    className="text-sm text-indigo-600 hover:underline"
                                                                >
                                                                    Télécharger
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-sm text-gray-500">Aucun document</p>
                                                )}
                                            </div>
                                            {(detailEnrollment.status === 'pending' || detailEnrollment.status === 'submitted') && !showRejectModal && (
                                                <div className="flex gap-3 justify-end pt-4 border-t">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDetailEnrollmentId(null)}
                                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                    >
                                                        Fermer
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleValidate}
                                                        disabled={actionLoading}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        {actionLoading ? 'En cours...' : 'Valider'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowRejectModal(true)}
                                                        disabled={actionLoading}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                                                    >
                                                        Rejeter
                                                    </button>
                                                </div>
                                            )}
                                            {(detailEnrollment.status !== 'pending' && detailEnrollment.status !== 'submitted') && !showRejectModal && (
                                                <div className="flex justify-end pt-4 border-t">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDetailEnrollmentId(null)}
                                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                    >
                                                        Fermer
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal motif de rejet */}
                {showRejectModal && detailEnrollment && (
                    <div className="fixed inset-0 z-[60] overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <div className="fixed inset-0 bg-black/50" onClick={() => setShowRejectModal(false)} />
                            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Motif de rejet</h3>
                                <p className="text-sm text-gray-600 mb-4">Indiquez obligatoirement le motif du rejet de cette candidature.</p>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Exemple : Dossier incomplet, document CNI illisible..."
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                />
                                <div className="flex gap-2 justify-end mt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleRejectSubmit}
                                        disabled={actionLoading || !rejectReason.trim()}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {actionLoading ? 'En cours...' : 'Confirmer le rejet'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
