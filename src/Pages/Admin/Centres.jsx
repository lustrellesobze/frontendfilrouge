import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCentres() {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'exam' | 'depot'
    const [examCenters, setExamCenters] = useState([]);
    const [depotCenters, setDepotCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModal, setEditModal] = useState(null); // { type: 'exam'|'depot', item: {...} }

    useEffect(() => {
        loadCenters();
    }, []);

    // Extraire la liste depuis différentes formes de réponse API
    const extractList = (res) => {
        if (!res?.data) return [];
        const d = res.data;
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d?.items)) return d.items;
        return [];
    };

    const loadCenters = async () => {
        setLoading(true);
        try {
            const [examRes, depotRes] = await Promise.allSettled([
                api.get('/admin/exam-centers'),
                api.get('/admin/centre-depots'),
            ]);
            setExamCenters(examRes.status === 'fulfilled' ? extractList(examRes.value) : []);
            setDepotCenters(depotRes.status === 'fulfilled' ? extractList(depotRes.value) : []);
            if (examRes.status === 'rejected') {
                console.error('Erreur centres d\'examen:', examRes.reason?.response?.status, examRes.reason?.message);
                toast.error(examRes.reason?.response?.data?.message || 'Erreur chargement des centres d\'examen');
            }
            if (depotRes.status === 'rejected') {
                console.error('Erreur centres de dépôt:', depotRes.reason?.response?.status, depotRes.reason?.message);
                toast.error(depotRes.reason?.response?.data?.message || 'Erreur chargement des centres de dépôt');
            }
        } catch (e) {
            toast.error('Erreur chargement des centres');
            console.error(e?.response?.data || e);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExam = async (id, name) => {
        if (!window.confirm(`Supprimer le centre d'examen « ${name} » ?`)) return;
        try {
            await api.delete(`/exam-centers/${id}`);
            toast.success('Centre d\'examen supprimé');
            loadCenters();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const handleDeleteDepot = async (id, name) => {
        if (!window.confirm(`Supprimer le centre de dépôt « ${name} » ?`)) return;
        try {
            await api.delete(`/centre-depots/${id}`);
            toast.success('Centre de dépôt supprimé');
            loadCenters();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const handleUpdateExam = async (e) => {
        e.preventDefault();
        const form = e.target;
        const id = editModal?.item?.id;
        if (!id) return;
        try {
            await api.put(`/exam-centers/${id}`, {
                name: form.name.value.trim(),
                city: form.city?.value?.trim() || null,
                address: form.address?.value?.trim() || null,
                capacity: form.capacity?.value ? parseInt(form.capacity.value, 10) : null,
                status: form.status?.value || 'active',
            });
            toast.success('Centre d\'examen mis à jour');
            setEditModal(null);
            loadCenters();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de la modification');
        }
    };

    const handleUpdateDepot = async (e) => {
        e.preventDefault();
        const form = e.target;
        const id = editModal?.item?.id;
        if (!id) return;
        try {
            await api.put(`/centre-depots/${id}`, {
                nom: form.nom.value.trim(),
                ville: form.ville?.value?.trim() || null,
                region: form.region?.value?.trim() || null,
                adresse: form.adresse?.value?.trim() || null,
                telephone: form.telephone?.value?.trim() || null,
            });
            toast.success('Centre de dépôt mis à jour');
            setEditModal(null);
            loadCenters();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de la modification');
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Centres et écoles</h1>
            <p className="text-gray-600 mb-6">
                Les centres d&apos;examen et centres de dépôt sont gérés ici.
            </p>

            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Vue d&apos;ensemble
                </button>
                <button
                    onClick={() => setActiveTab('exam')}
                    className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'exam' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Centres d&apos;examen ({examCenters.length})
                </button>
                <button
                    onClick={() => setActiveTab('depot')}
                    className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'depot' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Centres de dépôt ({depotCenters.length})
                </button>
            </div>

            {/* Vue d'ensemble : les deux listes avec Modifier / Supprimer */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <h2 className="px-6 py-4 bg-gray-50 font-semibold text-gray-900">Centres d&apos;examen</h2>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adresse</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacité</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {examCenters.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Aucun centre d&apos;examen</td></tr>
                                ) : (
                                    examCenters.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{c.city ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{c.address ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{c.capacity ?? '—'}</td>
                                            <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>{c.status ?? '—'}</span></td>
                                            <td className="px-4 py-3 text-right">
                                                <button type="button" onClick={() => setEditModal({ type: 'exam', item: c })} className="mr-2 text-blue-600 hover:text-blue-800 text-sm font-medium">Modifier</button>
                                                <button type="button" onClick={() => handleDeleteExam(c.id, c.name)} className="text-red-600 hover:text-red-800 text-sm font-medium">Supprimer</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <h2 className="px-6 py-4 bg-gray-50 font-semibold text-gray-900">Centres de dépôt</h2>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Région</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {depotCenters.length === 0 ? (
                                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Aucun centre de dépôt</td></tr>
                                ) : (
                                    depotCenters.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.nom}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{c.ville ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{c.region ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{c.telephone ?? '—'}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button type="button" onClick={() => setEditModal({ type: 'depot', item: c })} className="mr-2 text-blue-600 hover:text-blue-800 text-sm font-medium">Modifier</button>
                                                <button type="button" onClick={() => handleDeleteDepot(c.id, c.nom)} className="text-red-600 hover:text-red-800 text-sm font-medium">Supprimer</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'exam' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <h2 className="px-6 py-4 bg-gray-50 font-semibold text-gray-900">Centres d'examen</h2>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adresse</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacité</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {examCenters.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Aucun centre d&apos;examen</td></tr>
                            ) : (
                                examCenters.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{c.city ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{c.address ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{c.capacity ?? '—'}</td>
                                        <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>{c.status ?? '—'}</span></td>
                                        <td className="px-4 py-3 text-right">
                                            <button type="button" onClick={() => setEditModal({ type: 'exam', item: c })} className="mr-2 text-blue-600 hover:text-blue-800 text-sm font-medium">Modifier</button>
                                            <button type="button" onClick={() => handleDeleteExam(c.id, c.name)} className="text-red-600 hover:text-red-800 text-sm font-medium">Supprimer</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'depot' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <h2 className="px-6 py-4 bg-gray-50 font-semibold text-gray-900">Centres de dépôt</h2>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Région</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {depotCenters.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Aucun centre de dépôt</td></tr>
                            ) : (
                                depotCenters.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.nom}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{c.ville ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{c.region ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{c.telephone ?? '—'}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button type="button" onClick={() => setEditModal({ type: 'depot', item: c })} className="mr-2 text-blue-600 hover:text-blue-800 text-sm font-medium">Modifier</button>
                                            <button type="button" onClick={() => handleDeleteDepot(c.id, c.nom)} className="text-red-600 hover:text-red-800 text-sm font-medium">Supprimer</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Modifier - Centre d'examen */}
            {editModal?.type === 'exam' && editModal?.item && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditModal(null)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Modifier le centre d&apos;examen</h3>
                        <form onSubmit={handleUpdateExam} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                <input name="name" defaultValue={editModal.item.name} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                                <input name="city" defaultValue={editModal.item.city ?? ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                <input name="address" defaultValue={editModal.item.address ?? ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Capacité</label>
                                <input name="capacity" type="number" defaultValue={editModal.item.capacity ?? ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                                <select name="status" defaultValue={editModal.item.status ?? 'active'} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                    <option value="active">Actif</option>
                                    <option value="inactive">Inactif</option>
                                </select>
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setEditModal(null)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annuler</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Modifier - Centre de dépôt */}
            {editModal?.type === 'depot' && editModal?.item && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditModal(null)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Modifier le centre de dépôt</h3>
                        <form onSubmit={handleUpdateDepot} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                <input name="nom" defaultValue={editModal.item.nom} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                                <input name="ville" defaultValue={editModal.item.ville ?? ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                                <input name="region" defaultValue={editModal.item.region ?? ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                <input name="adresse" defaultValue={editModal.item.adresse ?? ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                <input name="telephone" defaultValue={editModal.item.telephone ?? ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setEditModal(null)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annuler</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
