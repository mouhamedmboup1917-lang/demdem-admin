'use client';
/**
 * LiveMap.jsx — Composant Leaflet pour le tracking temps réel DemDem Admin
 * Chargé dynamiquement (no SSR) depuis trajets-actifs/page.js
 */
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix l'icône par défaut cassée dans Leaflet + webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const STATUS_COLORS = { active: '#16a34a', idle: '#d97706', offline: '#94a3b8' };
const STATUS_LABELS = { active: 'En course', idle: 'Disponible', offline: 'Hors ligne' };

/** Crée une icône SVG personnalisée selon le statut */
function createDriverIcon(driver) {
  const color  = STATUS_COLORS[driver.status];
  const pulse  = driver.status === 'active';
  const initials = driver.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="54" viewBox="0 0 44 54">
      ${pulse ? `<circle cx="22" cy="22" r="20" fill="${color}" opacity="0.15">
        <animate attributeName="r" values="16;22;16" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
      </circle>` : ''}
      <circle cx="22" cy="22" r="18" fill="${color}" stroke="white" stroke-width="3"/>
      <text x="22" y="27" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="white">${initials}</text>
      <!-- Flèche vers le bas -->
      <polygon points="16,38 28,38 22,50" fill="${color}"/>
    </svg>
  `;

  return L.divIcon({
    html:      svg,
    iconSize:  [44, 54],
    iconAnchor:[22, 50],
    className: '',
  });
}

export default function LiveMap({ drivers, selected, onSelectDriver }) {
  const mapRef       = useRef(null);
  const leafletRef   = useRef(null);
  const markersRef   = useRef({});

  // Initialisation de la carte
  useEffect(() => {
    if (leafletRef.current) return; // déjà initialisée

    const map = L.map(mapRef.current, {
      center:           [14.4974, -14.4524], // Centre Sénégal
      zoom:             7,
      zoomControl:      true,
      attributionControl: true,
    });

    // Tuiles OpenStreetMap (Open Source, pas de clé API)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom:     19,
    }).addTo(map);

    // Couche satellite optionnelle en overlay
    // L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(map);

    leafletRef.current = map;

    return () => {
      map.remove();
      leafletRef.current = null;
    };
  }, []);

  // Mise à jour des marqueurs quand les drivers changent
  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;

    // Met à jour ou crée chaque marqueur
    drivers.forEach(driver => {
      const latlng = [driver.lat, driver.lng];

      if (markersRef.current[driver.id]) {
        // Mise à jour position fluide
        markersRef.current[driver.id].setLatLng(latlng);
        markersRef.current[driver.id].setIcon(createDriverIcon(driver));
      } else {
        // Création initiale
        const marker = L.marker(latlng, {
          icon: createDriverIcon(driver),
          title: driver.name,
        }).addTo(map);

        marker.bindPopup(buildPopup(driver), { maxWidth: 280, closeButton: false });
        marker.on('click', () => onSelectDriver(driver));
        markersRef.current[driver.id] = marker;
      }

      // Mise à jour du popup
      markersRef.current[driver.id].setPopupContent(buildPopup(driver));
    });

    // Supprime les marqueurs de drivers retirés de la liste
    const currentIds = new Set(drivers.map(d => d.id));
    Object.keys(markersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  }, [drivers, onSelectDriver]);

  // Recentre sur le conducteur sélectionné
  useEffect(() => {
    const map = leafletRef.current;
    if (!map || !selected) return;
    map.flyTo([selected.lat, selected.lng], 13, { animate: true, duration: 1.2 });
    markersRef.current[selected.id]?.openPopup();
  }, [selected]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%' }}
      className="z-0"
    />
  );
}

function buildPopup(driver) {
  const color = STATUS_COLORS[driver.status];
  const label = STATUS_LABELS[driver.status];
  return `
    <div style="font-family:system-ui,sans-serif;min-width:200px;padding:4px 0">
      <div style="font-weight:800;font-size:15px;color:#1a1917;margin-bottom:4px">${driver.name}</div>
      <div style="font-size:12px;color:#64748b;margin-bottom:8px">${driver.phone}</div>
      <div style="font-size:13px;font-weight:600;color:#44403c;margin-bottom:6px">🛣️ ${driver.route || 'Aucun trajet'}</div>
      <div style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:${color};background:${color}18;border:1px solid ${color}40;padding:4px 10px;border-radius:9999px;width:fit-content">
        <span style="width:7px;height:7px;border-radius:50%;background:${color};display:inline-block"></span>
        ${label}
      </div>
      ${driver.status === 'active' ? `
        <div style="margin-top:8px;font-size:12px;color:#94a3b8">
          👥 ${driver.pxCount}/${driver.maxPx} passagers · ⏱ ${driver.since} · 🚗 ${Math.round(driver.speed)} km/h
        </div>
        <div style="margin-top:6px;height:4px;background:#e7e5e0;border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${Math.round(driver.progress)}%;background:linear-gradient(to right,#d97706,#b48c40);border-radius:4px"></div>
        </div>
        <div style="font-size:10px;text-align:right;color:#d97706;font-weight:700;margin-top:2px">${Math.round(driver.progress)}%</div>
      ` : ''}
    </div>
  `;
}
