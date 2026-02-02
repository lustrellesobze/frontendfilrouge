import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PERIODS = [
  { value: '7days', label: '7 derniers jours' },
  { value: 'last_month', label: 'Mois dernier' },
  { value: 'month', label: 'Mois (choisir)' },
  { value: 'year', label: 'Année (choisir)' },
];

const MONTHS = [
  { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' }, { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' }, { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' }, { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);

const STATUS_LABELS = {
  draft: 'Brouillon',
  pending: 'En attente',
  submitted: 'Soumis',
  validated: 'Validé',
  rejected: 'Rejeté',
};

export default function AdminReports() {
  const [period, setPeriod] = useState('7days');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ period });
      if (period === 'month' || period === 'year') params.set('year', year);
      if (period === 'month') params.set('month', month);
      const res = await api.get(`/admin/reports?${params.toString()}`);
      setData(res.data);
    } catch (e) {
      toast.error('Erreur lors du chargement des rapports');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [period, month, year]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadReports();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Rapports</h1>
        <p className="text-gray-600 mb-6">
          Consultez vos rapports sur les candidatures et les paiements par période.
        </p>

        {/* Filtres / Recherche */}
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Période</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full min-w-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            {period === 'month' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full min-w-[140px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full min-w-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {period === 'year' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full min-w-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
            >
              Rechercher
            </button>
          </div>
        </form>

        {/* Résultats */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : data ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Rapport : {data.period?.label}</h2>
                {data.period?.start && data.period?.end && (
                  <span className="text-sm text-gray-500">
                    du {new Date(data.period.start).toLocaleDateString('fr-FR')} au {new Date(data.period.end).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="text-2xl font-bold text-blue-700">{data.enrollments?.total ?? 0}</div>
                  <div className="text-sm text-gray-600">Candidatures sur la période</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="text-2xl font-bold text-green-700">
                    {((data.payments?.total_revenue ?? 0) / 1000).toFixed(0)} K FCFA
                  </div>
                  <div className="text-sm text-gray-600">Revenus (paiements complétés)</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-gray-700">{data.payments?.total_count ?? 0}</div>
                  <div className="text-sm text-gray-600">Paiements (tous statuts)</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Candidatures par statut</h3>
                <ul className="space-y-2">
                  {data.enrollments?.by_status && Object.entries(data.enrollments.by_status).length > 0 ? (
                    Object.entries(data.enrollments.by_status).map(([status, count]) => (
                      <li key={status} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-gray-700">{STATUS_LABELS[status] ?? status}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 py-2">Aucune candidature sur cette période.</li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              Aucune donnée disponible pour cette période.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
