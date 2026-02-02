import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminConcours() {
    const [concours, setConcours] = useState([]);
    const [ecoles, setEcoles] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        ecole_id: '', academic_session_id: '', name: '', code: '', type: 'premiere_annee',
        date_limite_inscription: '', date_examen: '', frais_inscription: '', description: '', status: 'open',
    });

    useEffect(() => {
        loadConcours();
        api.get('/admin/ecoles').then(r => setEcoles(r.data?.data || r.data || [])).catch(() => {});
        api.get('/admin/sessions').then(r => setSessions(r.data?.data || r.data || [])).catch(() => {});
    }, []);

    const loadConcours = async () => {
        try {
            const res = await api.get('/admin/concours');
            setConcours(res.data?.data || res.data || []);
        } catch (e) {
            toast.error('Erreur chargement des concours');
            setConcours([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                ecole_id: parseInt(form.ecole_id),
                academic_session_id: form.academic_session_id ? parseInt(form.academic_session_id) : undefined,
                frais_inscription: form.frais_inscription ? parseFloat(form.frais_inscription) : undefined,
            };
            if (editing) {
                await api.put(`/admin/concours/${editing.id}`, payload);
                toast.success('Concours mis à jour');
            } else {
                await api.post('/admin/concours', payload);
                toast.success('Concours créé');
            }
            setModalOpen(false);
            setEditing(null);
            resetForm();
            loadConcours();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        }
    };

    const resetForm = () => setForm({
        ecole_id: '', academic_session_id: '', name: '', code: '', type: 'premiere_annee',
        date_limite_inscription: '', date_examen: '', frais_inscription: '', description: '', status: 'open',
    });

    const handleClose = async (id) => {
        try {
            await api.post(`/admin/concours/${id}/close`);
            toast.success('Concours fermé');
            loadConcours();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Erreur');
        }
    };

    const openCreate = () => {
        setEditing(null);
        resetForm();
        setModalOpen(true);
    };

    const openEdit = (c) => {
        setEditing(c);
        setForm({
            ecole_id: c.ecole_id,
            academic_session_id: c.academic_session_id || '',
            name: c.name,
            code: c.code || '',
            type: c.type || 'premiere_annee',
            date_limite_inscription: c.date_limite_inscription ? c.date_limite_inscription.slice(0, 10) : '',
            date_examen: c.date_examen ? c.date_examen.slice(0, 10) : '',
            frais_inscription: c.frais_inscription ?? '',
            description: c.description || '',
            status: c.status || 'open',
        });
        setModalOpen(true);
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
    const typeLabel = (t) => t === 'troisieme_annee' ? 'Troisième Année' : t === 'both' ? 'Les deux' : 'Première Année';

    if (loading) {
        return (
            <div className="p-6 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    const openCount = concours.filter((c) => c.status === 'open').length;
    const closedCount = concours.filter((c) => c.status === 'closed').length;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Concours</h1>
                <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Créer un concours
                </button>
            </div>
            <p className="text-gray-600 mb-6">
                Gérez les concours d'entrée par école et par session. La liste affiche tous les concours existants. Vous pouvez en créer, modifier ou fermer un concours lorsque la date est dépassée. Chaque concours est rattaché à une école et peut être associé à une session.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-600">
                    <p className="text-sm font-medium text-gray-500">Total concours</p>
                    <p className="text-2xl font-bold text-gray-900">{concours.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                    <p className="text-sm font-medium text-gray-500">Ouverts</p>
                    <p className="text-2xl font-bold text-green-700">{openCount}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
                    <p className="text-sm font-medium text-gray-500">Fermés</p>
                    <p className="text-2xl font-bold text-gray-700">{closedCount}</p>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">École</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date limite</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {concours.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Aucun concours</td></tr>
                        ) : (
                            concours.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{c.ecole?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{typeLabel(c.type)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(c.date_limite_inscription)}</td>
                                    <td>
                                        <span className={`px-2 py-1 text-xs rounded ${c.status === 'closed' ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'}`}>
                                            {c.status === 'closed' ? 'Fermé' : 'Ouvert'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button onClick={() => openEdit(c)} className="text-blue-600 hover:underline text-sm">Modifier</button>
                                        {c.status !== 'closed' && (
                                            <button onClick={() => handleClose(c.id)} className="text-orange-600 hover:underline text-sm">Fermer</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 my-8">
                        <h2 className="text-lg font-semibold mb-4">{editing ? 'Modifier le concours' : 'Nouveau concours'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">École *</label>
                                <select value={form.ecole_id} onChange={(e) => setForm({ ...form, ecole_id: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" required>
                                    <option value="">— Choisir —</option>
                                    {ecoles.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Session (optionnel)</label>
                                <select value={form.academic_session_id} onChange={(e) => setForm({ ...form, academic_session_id: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2">
                                    <option value="">—</option>
                                    {sessions.map((s) => <option key={s.id} value={s.id}>{s.label} ({s.code})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nom *</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Code</label>
                                    <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2">
                                        <option value="premiere_annee">Première Année</option>
                                        <option value="troisieme_annee">Troisième Année</option>
                                        <option value="both">Les deux</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date limite inscription</label>
                                    <input type="date" value={form.date_limite_inscription} onChange={(e) => setForm({ ...form, date_limite_inscription: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date examen</label>
                                    <input type="date" value={form.date_examen} onChange={(e) => setForm({ ...form, date_examen: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Frais inscription (FCFA)</label>
                                <input type="number" value={form.frais_inscription} onChange={(e) => setForm({ ...form, frais_inscription: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" min="0" step="100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" rows={2} />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => { setModalOpen(false); setEditing(null); }} className="px-4 py-2 border border-gray-300 rounded-lg">Annuler</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
