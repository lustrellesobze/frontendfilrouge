import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminProgramManagers() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProgramManagers();
    }, []);

    const loadProgramManagers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/program-managers');
            setList(res.data?.data || res.data || []);
        } catch (e) {
            toast.error('Erreur lors du chargement des responsables de filière');
            setList([]);
        } finally {
            setLoading(false);
        }
    };

    // Grouper par user (un même user peut gérer plusieurs filières)
    const byUser = list.reduce((acc, pm) => {
        const uid = pm.user_id;
        if (!acc[uid]) {
            acc[uid] = {
                user: pm.user,
                programs: [],
                status: pm.status,
                assigned_at: pm.assigned_at,
                numero_responsable: pm.numero_responsable,
            };
        }
        if (pm.program && !acc[uid].programs.some((p) => p?.id === pm.program?.id)) {
            acc[uid].programs.push(pm.program);
        }
        return acc;
    }, {});
    const rows = Object.values(byUser);

    if (loading) {
        return (
            <div className="p-6 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Responsables de filière</h1>
                <p className="text-gray-600 mb-6">
                    Liste de tous les responsables de filière créés. Chaque responsable peut gérer une ou plusieurs filières (programmes).
                </p>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {rows.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <p>Aucun responsable de filière pour le moment.</p>
                            <p className="text-sm mt-2">Les responsables de filière peuvent être créés via les paramètres ou l&apos;assignation des programmes.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">N°</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro (RF-xxx)</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filière(s) / Programme(s)</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date d&apos;assignation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {rows.map((row, index) => (
                                        <tr key={row.user?.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-600 w-12">{index + 1}</td>
                                            <td className="px-4 py-3 text-sm font-mono font-medium text-blue-700">{row.numero_responsable || '—'}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.user?.name || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{row.user?.email || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{row.user?.phone || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {row.programs?.length
                                                    ? row.programs.map((p) => p?.name).filter(Boolean).join(', ')
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs rounded ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {row.status === 'active' ? 'Actif' : row.status || '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {row.assigned_at
                                                    ? new Date(row.assigned_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
