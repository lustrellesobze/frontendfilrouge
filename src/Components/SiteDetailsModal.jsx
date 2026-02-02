import React from 'react';
import SiteMap from './SiteMap';

export default function SiteDetailsModal({ site, isOpen, onClose }) {
    if (!isOpen || !site) return null;

    const getTypeLabel = (type) => {
        return type === 'depot' ? 'Centre de Dépôt' : 'Centre d\'Examen';
    };

    const getTypeColor = (type) => {
        return type === 'depot' 
            ? 'bg-blue-100 text-blue-800 border-blue-200' 
            : 'bg-green-100 text-green-800 border-green-200';
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

                {/* Modal */}
                <div
                    className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-white px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(site.type)}`}>
                                    {getTypeLabel(site.type)}
                                </span>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {site.name}
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <span className="sr-only">Fermer</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white px-6 py-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Informations */}
                            <div className="space-y-4">
                                {/* Localisation */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">📍 Localisation</h4>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p><strong>Ville:</strong> {site.city}</p>
                                        {site.neighborhood && (
                                            <p><strong>Quartier:</strong> {site.neighborhood}</p>
                                        )}
                                        {site.region_name && (
                                            <p><strong>Région:</strong> {site.region_name}</p>
                                        )}
                                        <p><strong>Adresse:</strong> {site.address}</p>
                                    </div>
                                </div>

                                {/* Contact */}
                                {(site.contact_phone || site.contact_email) && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">📞 Contact</h4>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            {site.contact_phone && (
                                                <p>
                                                    <strong>Téléphone:</strong>{' '}
                                                    <a
                                                        href={`tel:${site.contact_phone}`}
                                                        className="text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        {site.contact_phone}
                                                    </a>
                                                </p>
                                            )}
                                            {site.contact_email && (
                                                <p>
                                                    <strong>Email:</strong>{' '}
                                                    <a
                                                        href={`mailto:${site.contact_email}`}
                                                        className="text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        {site.contact_email}
                                                    </a>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Capacité (pour les centres d'examen) */}
                                {site.type === 'examen' && site.capacity && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">🎓 Informations</h4>
                                        <p className="text-sm text-gray-600">
                                            <strong>Capacité:</strong> {site.capacity} places
                                        </p>
                                    </div>
                                )}

                                {/* Horaires (pour les centres de dépôt) */}
                                {site.type === 'depot' && site.opening_hours && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">🕐 Horaires d'ouverture</h4>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            {Object.entries(site.opening_hours).map(([day, hours]) => (
                                                <div key={day} className="flex justify-between">
                                                    <span className="capitalize">{day}:</span>
                                                    <span className="font-medium">{hours}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                {site.description && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">📝 Description</h4>
                                        <p className="text-sm text-gray-600">{site.description}</p>
                                    </div>
                                )}

                                {/* Coordonnées GPS */}
                                {site.latitude && site.longitude && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">🗺️ Coordonnées GPS</h4>
                                        <p className="text-sm text-gray-600 font-mono">
                                            {parseFloat(site.latitude).toFixed(6)}, {parseFloat(site.longitude).toFixed(6)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Carte */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">🗺️ Localisation sur la carte</h4>
                                <SiteMap site={site} height="400px" />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

