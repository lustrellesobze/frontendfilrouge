import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes par défaut de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Composant pour centrer la carte sur un point
function MapCenter({ center, zoom, searchQuery, sites }) {
    const map = useMap();
    
    useEffect(() => {
        if (center) {
            map.setView(center, zoom || 13);
        }
    }, [center, zoom, map]);
    
    // Centrer sur le résultat de recherche si un seul résultat
    useEffect(() => {
        if (searchQuery && searchQuery.trim() && sites) {
            const query = searchQuery.toLowerCase().trim();
            const filtered = sites.filter(s => {
                const name = (s.name || '').toLowerCase();
                const city = (s.city || '').toLowerCase();
                const address = (s.address || '').toLowerCase();
                const region = (s.region || '').toLowerCase();
                return name.includes(query) || city.includes(query) || address.includes(query) || region.includes(query);
            });
            
            if (filtered.length === 1 && filtered[0].latitude && filtered[0].longitude) {
                map.setView(
                    [parseFloat(filtered[0].latitude), parseFloat(filtered[0].longitude)],
                    13
                );
            }
        }
    }, [searchQuery, sites, map]);
    
    return null;
}

// Icône personnalisée pour les centres de dépôt
const depotIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Icône personnalisée pour les centres d'examen
const examenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function SiteMap({ site, sites = [], height = '400px', showAllSites = false, center: propCenter = null, zoom: propZoom = null, searchQuery = '' }) {
    const mapRef = useRef(null);
    const [highlightedSites, setHighlightedSites] = useState([]);

    // Centre du Cameroun par défaut
    const cameroonCenter = [7.3697, 12.3547];
    
    // Si un centre est fourni en prop, l'utiliser
    let center = null;
    if (propCenter) {
        center = Array.isArray(propCenter) ? propCenter : [propCenter[0], propCenter[1]];
    }
    
    // Sinon, calculer le centre
    if (!center) {
        center = site && site.latitude && site.longitude
            ? [parseFloat(site.latitude), parseFloat(site.longitude)]
            : showAllSites && sites.length > 0 && sites.some(s => s.latitude && s.longitude)
                ? (() => {
                    // Calculer le centre moyen de tous les sites avec coordonnées
                    const sitesWithCoords = sites.filter(s => s.latitude && s.longitude);
                    if (sitesWithCoords.length === 0) return cameroonCenter;
                    const avgLat = sitesWithCoords.reduce((sum, s) => sum + parseFloat(s.latitude), 0) / sitesWithCoords.length;
                    const avgLng = sitesWithCoords.reduce((sum, s) => sum + parseFloat(s.longitude), 0) / sitesWithCoords.length;
                    return [avgLat, avgLng];
                })()
                : cameroonCenter;
    }

    const zoom = propZoom !== null ? propZoom : (site ? 15 : (showAllSites && sites.length > 0 ? 8 : 6));

    // Filtrer les sites selon la recherche
    useEffect(() => {
        if (searchQuery && searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            const filtered = sites.filter(s => {
                const name = (s.name || '').toLowerCase();
                const city = (s.city || '').toLowerCase();
                const address = (s.address || '').toLowerCase();
                const region = (s.region || '').toLowerCase();
                return name.includes(query) || city.includes(query) || address.includes(query) || region.includes(query);
            });
            setHighlightedSites(filtered);
        } else {
            setHighlightedSites([]);
        }
    }, [searchQuery, sites]);

    return (
        <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden">
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Centrer la carte */}
                <MapCenter center={center} zoom={zoom} searchQuery={searchQuery} sites={sites} />

                {/* Afficher un site spécifique */}
                {site && site.latitude && site.longitude && (
                    <Marker
                        position={[parseFloat(site.latitude), parseFloat(site.longitude)]}
                        icon={site.type === 'depot' ? depotIcon : examenIcon}
                    >
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-semibold text-sm mb-1">{site.name}</h3>
                                <p className="text-xs text-gray-600 mb-1">
                                    {site.type === 'depot' ? '📍 Centre de Dépôt' : '🎓 Centre d\'Examen'}
                                </p>
                                <p className="text-xs text-gray-600">{site.address}</p>
                                {site.city && (
                                    <p className="text-xs text-gray-500 mt-1">{site.city}</p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Afficher tous les sites si demandé */}
                {showAllSites && sites
                    .filter(s => s.latitude && s.longitude)
                    .map((s) => {
                        const isHighlighted = highlightedSites.some(hs => hs.id === s.id);
                        const isMatched = !searchQuery || isHighlighted;
                        
                        return (
                            <Marker
                                key={s.id}
                                position={[parseFloat(s.latitude), parseFloat(s.longitude)]}
                                icon={s.type === 'depot' ? depotIcon : examenIcon}
                                opacity={isMatched ? 1 : 0.3}
                            >
                                <Popup>
                                    <div className="p-2">
                                        <h3 className={`font-semibold text-sm mb-1 ${isHighlighted ? 'text-green-600' : ''}`}>
                                            {s.name}
                                            {isHighlighted && ' ✓'}
                                        </h3>
                                        <p className="text-xs text-gray-600 mb-1">
                                            {s.type === 'depot' ? '📍 Centre de Dépôt' : '🎓 Centre d\'Examen'}
                                        </p>
                                        <p className="text-xs text-gray-600">{s.address || 'Adresse non disponible'}</p>
                                        {s.city && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {s.city}
                                                {s.region && `, ${s.region}`}
                                            </p>
                                        )}
                                        {s.contact_phone && (
                                            <p className="text-xs text-indigo-600 mt-1">📞 {s.contact_phone}</p>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
            </MapContainer>
        </div>
    );
}

