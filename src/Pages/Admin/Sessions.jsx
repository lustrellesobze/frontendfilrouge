import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminSessions() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ code: '', label: '', start_on: '', end_on: '', is_current: false });

    useEffect(() => { loadSessions(); }, []);

    const loadSessions = async () => {
        try {
            const res = await api.get('/admin/sessions');
            setSessions(res.data?.data || res.data || []);
        } catch (e) {
            toast.error('Erreur chargement des sessions');
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = async (id) => {
        try {
            await api.post(`/admin/sessions/${id}/close`);
            toast.success('Session fermée');
            loadSessions();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Erreur');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/admin/sessions/${editing.id}`, form);
                toast.success('Session mise à jour');
            } else {
                await api.post('/admin/sessions', form);
                toast.success('Session créée');
            }
            setModalOpen(false);
            setEditing(null);
            setForm({ code: '', label: '', start_on: '', end_on: '', is_current: false });
            loadSessions();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        }
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ code: '', label: '', start_on: '', end_on: '', is_current: false });
        setModalOpen(true);
    };

    const openEdit = (s) => {
        setEditing(s);
        setForm({
            code: s.code,
            label: s.label,
            start_on: s.start_on ? s.start_on.slice(0, 10) : '',
            end_on: s.end_on ? s.end_on.slice(0, 10) : '',
            is_current: s.is_current,
        });
        setModalOpen(true);
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
    const isPast = (d) => d && new Date(d) < new Date();

    const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'current' | 'closed'
    const currentCount = sessions.filter((s) => s.is_current).length;
    const closedCount = sessions.filter((s) => s.status === 'closed').length;
    const plannedCount = sessions.length - closedCount - currentCount;

    const filteredSessions = filterStatus === 'closed'
        ? sessions.filter((s) => s.status === 'closed')
        : filterStatus === 'current'
            ? sessions.filter((s) => s.status !== 'closed')
            : sessions;

    if (loading) {
        return (
            <div className="p-6 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Sessions des concours</h1>
                <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Créer une session
                </button>
            </div>
            <p className="text-gray-600 mb-6">
                Gérez les sessions académiques (ex. 2024-2025). La liste affiche toutes les sessions existantes. Vous pouvez en créer, modifier ou fermer une lorsque la date est dépassée.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-600">
                    <p className="text-sm font-medium text-gray-500">Total sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                    <p className="text-sm font-medium text-gray-500">En cours</p>
                    <p className="text-2xl font-bold text-green-700">{currentCount}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
                    <p className="text-sm font-medium text-gray-500">Sessions fermées</p>
                    <p className="text-2xl font-bold text-gray-700">{closedCount}</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-sm font-medium text-gray-700">Afficher :</span>
                <button
                    type="button"
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Toutes ({sessions.length})
                </button>
                <button
                    type="button"
                    onClick={() => setFilterStatus('current')}
                    className={`px-3 py-1.5 rounded-lg text-sm ${filterStatus === 'current' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    En cours / Planifiées ({sessions.length - closedCount})
                </button>
                <button
                    type="button"
                    onClick={() => setFilterStatus('closed')}
                    className={`px-3 py-1.5 rounded-lg text-sm ${filterStatus === 'closed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Fermées ({closedCount})
                </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Début</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fin</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredSessions.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">{filterStatus === 'closed' ? 'Aucune session fermée' : filterStatus === 'current' ? 'Aucune session en cours ou planifiée' : 'Aucune session'}</td></tr>
                        ) : (
                            filteredSessions.map((s) => (
                                <tr key={s.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">{s.code}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{s.label}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(s.start_on)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(s.end_on)}</td>
                                    <td>
                                        <span className={`px-2 py-1 text-xs rounded ${s.status === 'closed' ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'}`}>
                                            {s.status === 'closed' ? 'Fermée' : s.is_current ? 'En cours' : 'Planifiée'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button onClick={() => openEdit(s)} className="text-blue-600 hover:underline text-sm">Modifier</button>
                                        {s.status !== 'closed' && isPast(s.end_on) && (
                                            <button onClick={() => handleClose(s.id)} className="text-orange-600 hover:underline text-sm">Fermer</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-lg font-semibold mb-4">{editing ? 'Modifier la session' : 'Nouvelle session'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Code</label>
                                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Libellé</label>
                                <input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date début</label>
                                <input type="date" value={form.start_on} onChange={(e) => setForm({ ...form, start_on: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date fin</label>
                                <input type="date" value={form.end_on} onChange={(e) => setForm({ ...form, end_on: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" checked={form.is_current} onChange={(e) => setForm({ ...form, is_current: e.target.checked })} className="rounded" />
                                <label className="ml-2 text-sm text-gray-700">Session courante</label>
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
