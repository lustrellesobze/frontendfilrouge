import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import SiteMap from '../../Components/SiteMap';

export default function SitesIndex() {
    const [centers, setCenters] = useState([]);
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' ou 'map'
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [showMapModal, setShowMapModal] = useState(false);
    
    // Filtres
    const [filters, setFilters] = useState({
        type: '', // 'examen', 'depot', ou '' pour tous
        region_id: '',
        search: '',
    });

    // Statistiques
    const [stats, setStats] = useState({
        total: 0,
        total_capacity: 0,
        cities_covered: 0,
    });

    const loadRegions = async () => {
        try {
            const response = await api.get('/sites/regions/list');
            setRegions(response.data.data || response.data || []);
        } catch (error) {
            console.error('Erreur lors du chargement des régions:', error);
            // Fallback: essayer l'ancienne route
            try {
                const fallbackResponse = await api.get('/regions?status=active');
                setRegions(fallbackResponse.data.data || fallbackResponse.data || []);
            } catch (fallbackError) {
                console.error('Erreur lors du chargement des régions (fallback):', fallbackError);
            }
        }
    };

    const loadCenters = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            if (filters.type) params.append('type', filters.type);
            if (filters.region_id) params.append('region_id', filters.region_id);
            if (filters.search) params.append('search', filters.search);

            const response = await api.get(`/sites?${params.toString()}`);
            const centersData = response.data?.data || [];
            setCenters(centersData);
            
            // Mettre à jour les statistiques
            if (response.data?.meta) {
                setStats({
                    total: response.data.meta.total || 0,
                    total_capacity: response.data.meta.total_capacity || 0,
                    cities_covered: response.data.meta.cities_covered || 0,
                });
            }
        } catch (error) {
            console.error('Erreur lors du chargement des centres:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement des centres';
            toast.error(`Erreur: ${errorMessage}`);
            setCenters([]);
        } finally {
            setLoading(false);
        }
    };

    // Charger les régions une seule fois au montage
    useEffect(() => {
        loadRegions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Charger les centres quand les filtres changent
    useEffect(() => {
        loadCenters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleShowMap = (center) => {
        setSelectedCenter(center);
        setShowMapModal(true);
    };

    const handleReserve = (center) => {
        toast.info('Fonctionnalité de réservation à venir');
    };

    // Filtrer les centres par type pour les compteurs
    const examCenters = centers.filter(c => c.type === 'examen');
    const depotCenters = centers.filter(c => c.type === 'depot');

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Titre principal */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Choisissez votre centre d'enrôlement
                    </h1>
                    <p className="text-gray-600">
                        Trouvez votre centre le plus proche
                    </p>
                </div>

                {/* Barre de recherche et bouton carte */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Rechercher par ville, nom ou adresse"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        <button
                            onClick={() => setViewMode('map')}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Vue carte interactive
                        </button>
                    </div>
                </div>

                {/* Statistiques et filtres */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                        {/* Statistiques */}
                        <div className="grid grid-cols-3 gap-4 flex-1">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">{stats.total}</div>
                                <div className="text-sm text-gray-600 mt-1">Centres Disponible</div>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">{stats.total_capacity}</div>
                                <div className="text-sm text-gray-600 mt-1">Capacité Totale</div>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">{stats.cities_covered}</div>
                                <div className="text-sm text-gray-600 mt-1">Villes Couvertes</div>
                            </div>
                        </div>

                        {/* Filtres */}
                        <div className="flex gap-4 items-center">
                            <div className="relative">
                                <select
                                    value={filters.region_id}
                                    onChange={(e) => handleFilterChange('region_id', e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white pr-10"
                                >
                                    <option value="">Toutes les régions</option>
                                    {regions.map(region => (
                                        <option key={region.id} value={region.id}>{region.name}</option>
                                    ))}
                                </select>
                                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filtres
                            </button>
                        </div>
                    </div>
                </div>

                {/* Onglets de type de centre */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex gap-4 border-b border-gray-200">
                        <button
                            onClick={() => handleFilterChange('type', 'examen')}
                            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                                filters.type === 'examen'
                                    ? 'border-green-600 text-green-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Centre d'examen ({examCenters.length})
                        </button>
                        <button
                            onClick={() => handleFilterChange('type', 'depot')}
                            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                                filters.type === 'depot'
                                    ? 'border-green-600 text-green-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Centre de dépôt ({depotCenters.length})
                        </button>
                        <button
                            onClick={() => handleFilterChange('type', '')}
                            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                                filters.type === ''
                                    ? 'border-green-600 text-green-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Tous les centres ({centers.length})
                        </button>
                    </div>
                </div>

                {/* Vue Carte */}
                {viewMode === 'map' && (
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Carte interactive - Recherche par région, ville ou centre
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setFilters({ type: '', region_id: '', search: '' });
                                        setViewMode('list');
                                    }}
                                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Retour à la liste
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        {/* Barre de recherche pour la carte */}
                        <div className="mb-4">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    placeholder="Rechercher une région (ex: Littoral), une ville (ex: Douala) ou un centre..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                💡 Tapez le nom d'une région, d'une ville ou d'un centre pour le localiser sur la carte
                            </p>
                        </div>

                        {centers.length > 0 ? (
                            <SiteMap 
                                sites={centers.map(c => ({
                                    ...c,
                                    latitude: c.latitude,
                                    longitude: c.longitude,
                                }))} 
                                showAllSites={true} 
                                height="600px"
                                searchQuery={filters.search}
                            />
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-12 text-center">
                                <p className="text-gray-600">Aucun centre à afficher sur la carte</p>
                                <p className="text-sm text-gray-500 mt-2">Essayez de modifier vos filtres de recherche</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Liste des centres */}
                {viewMode === 'list' && (
                    <>
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                <p className="mt-4 text-gray-600">Chargement des centres...</p>
                            </div>
                        ) : centers.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                <div className="text-6xl mb-4">📍</div>
                                <p className="text-gray-600 text-lg">
                                    Aucun centre trouvé avec les critères sélectionnés.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {centers.map((center) => (
                                    <div
                                        key={center.id}
                                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                    >
                                        {/* En-tête vert */}
                                        <div className="bg-green-600 text-white p-4">
                                            <h3 className="text-lg font-bold">{center.name}</h3>
                                            <p className="text-sm text-green-100">{center.city}</p>
                                        </div>

                                        {/* Contenu */}
                                        <div className="p-4 space-y-3">
                                            {/* Adresse */}
                                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>{center.address || `${center.city}`}</span>
                                            </div>

                                            {/* Téléphone */}
                                            {center.contact_phone && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    <span>{center.contact_phone}</span>
                                                </div>
                                            )}

                                            {/* Horaires */}
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>Lun - Ven : 8h - 16h</span>
                                            </div>

                                            {/* Capacité et Attente */}
                                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                                                <div className="bg-gray-50 rounded p-3 text-center">
                                                    <div className="flex items-center justify-center gap-1 mb-1">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        <span className="text-xs text-gray-600">Capacité</span>
                                                    </div>
                                                    <div className="text-lg font-bold text-gray-900">{center.capacity || 'N/A'}</div>
                                                </div>
                                                <div className="bg-gray-50 rounded p-3 text-center">
                                                    <div className="flex items-center justify-center gap-1 mb-1">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-xs text-gray-600">Attente</span>
                                                    </div>
                                                    <div className="text-lg font-bold text-gray-900">30 min</div>
                                                </div>
                                            </div>

                                            {/* Boutons d'action */}
                                            <div className="flex gap-3 pt-3 border-t border-gray-200">
                                                <button
                                                    onClick={() => handleShowMap(center)}
                                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                                >
                                                    Itinéraire
                                                </button>
                                                <button
                                                    onClick={() => handleReserve(center)}
                                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    Réserver
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Modal Carte pour Itinéraire */}
                {showMapModal && selectedCenter && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                            <div className="flex justify-between items-center p-4 border-b">
                                <h3 className="text-lg font-semibold">Itinéraire vers {selectedCenter.name}</h3>
                                <button
                                    onClick={() => {
                                        setShowMapModal(false);
                                        setSelectedCenter(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-4">
                                {selectedCenter.latitude && selectedCenter.longitude ? (
                                    <SiteMap 
                                        site={selectedCenter}
                                        sites={[]} 
                                        showAllSites={false} 
                                        height="500px"
                                        center={[parseFloat(selectedCenter.latitude), parseFloat(selectedCenter.longitude)]}
                                        zoom={15}
                                    />
                                ) : (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-yellow-800">
                                            Les coordonnées GPS de ce centre ne sont pas disponibles. 
                                            Veuillez contacter le centre directement pour obtenir l'itinéraire.
                                        </p>
                                        {selectedCenter.contact_phone && (
                                            <p className="mt-2 text-sm">
                                                Téléphone: <a href={`tel:${selectedCenter.contact_phone}`} className="text-green-600 hover:underline">{selectedCenter.contact_phone}</a>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
