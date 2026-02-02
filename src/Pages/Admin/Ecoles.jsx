import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminEcoles() {
    const [ecoles, setEcoles] = useState([]);
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', code: '', type: 'universite', region_id: '', address: '', city: '', phone: '', email: '', bp: '', site_web: '', status: 'active' });

    useEffect(() => {
        loadEcoles();
        api.get('/regions').then(r => setRegions(r.data?.data || r.data || [])).catch(() => {});
    }, []);

    const loadEcoles = async () => {
        try {
            const res = await api.get('/admin/ecoles');
            setEcoles(res.data?.data || res.data || []);
        } catch (e) {
            toast.error('Erreur chargement des écoles');
            setEcoles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, region_id: form.region_id || undefined };
            if (editing) {
                await api.put(`/admin/ecoles/${editing.id}`, payload);
                toast.success('École mise à jour');
            } else {
                await api.post('/admin/ecoles', payload);
                toast.success('École créée');
            }
            setModalOpen(false);
            setEditing(null);
            setForm({ name: '', code: '', type: 'universite', region_id: '', address: '', city: '', phone: '', email: '', bp: '', site_web: '', status: 'active' });
            loadEcoles();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        }
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', code: '', type: 'universite', region_id: '', address: '', city: '', phone: '', email: '', bp: '', site_web: '', status: 'active' });
        setModalOpen(true);
    };

    const openEdit = (e) => {
        setEditing(e);
        setForm({
            name: e.name,
            code: e.code || '',
            type: e.type || 'universite',
            region_id: e.region_id || '',
            address: e.address || '',
            city: e.city || '',
            phone: e.phone || '',
            email: e.email || '',
            bp: e.bp || '',
            site_web: e.site_web || '',
            status: e.status || 'active',
        });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette école ?')) return;
        try {
            await api.delete(`/admin/ecoles/${id}`);
            toast.success('École supprimée');
            loadEcoles();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Erreur');
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    const universitesCount = ecoles.filter((e) => e.type === 'universite').length;
    const grandesEcolesCount = ecoles.filter((e) => e.type === 'grande_ecole').length;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Écoles</h1>
                <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Créer une école
                </button>
            </div>
            <p className="text-gray-600 mb-6">
                Gérez les établissements (universités et grandes écoles) qui organisent les concours. La liste affiche toutes les écoles existantes. Vous pouvez en créer, modifier ou supprimer. Chaque école peut avoir un code, une région, des coordonnées et un site web.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-600">
                    <p className="text-sm font-medium text-gray-500">Total écoles</p>
                    <p className="text-2xl font-bold text-gray-900">{ecoles.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
                    <p className="text-sm font-medium text-gray-500">Universités</p>
                    <p className="text-2xl font-bold text-indigo-700">{universitesCount}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                    <p className="text-sm font-medium text-gray-500">Grandes écoles</p>
                    <p className="text-2xl font-bold text-purple-700">{grandesEcolesCount}</p>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concours</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {ecoles.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Aucune école</td></tr>
                        ) : (
                            ecoles.map((e) => (
                                <tr key={e.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{e.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{e.code || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{e.type === 'grande_ecole' ? 'Grande école' : 'Université'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{e._count?.concours ?? 0}</td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button onClick={() => openEdit(e)} className="text-blue-600 hover:underline text-sm">Modifier</button>
                                        <button onClick={() => handleDelete(e.id)} className="text-red-600 hover:underline text-sm">Supprimer</button>
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
                        <h2 className="text-lg font-semibold mb-4">{editing ? 'Modifier l\'école' : 'Nouvelle école'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                        <option value="universite">Université</option>
                                        <option value="grande_ecole">Grande école</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Région</label>
                                <select value={form.region_id} onChange={(e) => setForm({ ...form, region_id: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2">
                                    <option value="">—</option>
                                    {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ville</label>
                                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Adresse</label>
                                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                                    <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">BP</label>
                                    <input type="text" value={form.bp} onChange={(e) => setForm({ ...form, bp: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Site web</label>
                                    <input type="url" value={form.site_web} onChange={(e) => setForm({ ...form, site_web: e.target.value })} className="mt-1 block w-full rounded border border-gray-300 px-3 py-2" />
                                </div>
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
