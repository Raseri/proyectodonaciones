/**
 * MapaRastreo — Componente de mapa de geolocalización para rastreo de donaciones.
 *
 * Muestra:
 * - Marcador de ORIGEN (organización/empresa) cuando la donación está EN_TRANSITO
 * - Marcador de DESTINO (dirección de entrega) cuando la donación está ENTREGADA
 * - Línea de ruta entre ambos puntos
 * - Actualización visual según el estado de la donación
 *
 * Usa Leaflet.js con OpenStreetMap (gratuito, sin API key).
 */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Iconos personalizados SVG ─────────────────────────────
const createCustomIcon = (color, emoji, pulseColor) => {
  const svgHtml = `
    <div class="mapa-marker-container">
      <div class="mapa-marker-pulse" style="background: ${pulseColor};"></div>
      <div class="mapa-marker-pin" style="background: ${color};">
        <span class="mapa-marker-emoji">${emoji}</span>
      </div>
      <div class="mapa-marker-shadow"></div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'mapa-custom-marker',
    iconSize: [48, 60],
    iconAnchor: [24, 58],
    popupAnchor: [0, -60],
  });
};

const ICONS = {
  origin: () => createCustomIcon('#3b82f6', '🏢', 'rgba(59, 130, 246, 0.3)'),
  destination: () => createCustomIcon('#10b981', '📍', 'rgba(16, 185, 129, 0.3)'),
  truck: () => createCustomIcon('#8b5cf6', '🚚', 'rgba(139, 92, 246, 0.3)'),
};

// ── Servicio de Geocodificación (Nominatim / OpenStreetMap) ──
async function geocodeAddress(address) {
  try {
    const encoded = encodeURIComponent(address);
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`,
      { headers: { 'Accept-Language': 'es' } }
    );
    const data = await resp.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ── Componente Principal ──────────────────────────────────
export default function MapaRastreo({ donation, organization, deliveryAddress }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routeRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [originCoords, setOriginCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);

  const isPendiente = donation?.status === 'PENDIENTE';
  const isAceptada = donation?.status === 'ACEPTADA';
  const isEnTransito = donation?.status === 'EN_TRANSITO';
  const isEntregada = donation?.status === 'ENTREGADA';
  const isCancelada = donation?.status === 'CANCELADA';
  const showMap = !isCancelada;

  // ── Geocodificación de direcciones ─────────────
  useEffect(() => {
    if (!showMap) return;

    const resolveCoords = async () => {
      setLoading(true);
      setError('');

      // Coordenadas de ORIGEN: desde la organización
      let origin = null;
      if (organization?.ubicacion?.lat && organization?.ubicacion?.lng) {
        origin = { lat: organization.ubicacion.lat, lng: organization.ubicacion.lng };
      } else if (organization?.direccion) {
        origin = await geocodeAddress(organization.direccion);
      }

      // Coordenadas de DESTINO: dirección de entrega de la donación
      let dest = null;
      if (deliveryAddress) {
        if (typeof deliveryAddress === 'object' && deliveryAddress.lat) {
          dest = deliveryAddress;
        } else {
          dest = await geocodeAddress(deliveryAddress);
        }
      }

      if (!origin) {
        // Fallback a coordenadas por defecto (CDMX)
        origin = { lat: 19.4326, lng: -99.1332 };
      }

      setOriginCoords(origin);
      setDestCoords(dest);
      setLoading(false);
    };

    resolveCoords();
  }, [showMap, organization, deliveryAddress]);

  // ── Inicializar / actualizar mapa ──────────────
  useEffect(() => {
    if (!showMap || loading || !mapRef.current) return;
    if (!originCoords) return;

    // Limpiar mapa previo
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Crear mapa
    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
    });

    // Tile layer OpenStreetMap estándar (gratuito, sin API key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const markers = [];
    const bounds = [];

    // ── Marcador de ORIGEN (organización / empresa) ──
    const originMarker = L.marker([originCoords.lat, originCoords.lng], {
      icon: ICONS.origin(),
    }).addTo(map);

    const orgName = organization?.nombre || 'Punto de Origen';
    const orgDir = organization?.direccion || 'Dirección de la organización';
    originMarker.bindPopup(`
      <div class="mapa-popup">
        <div class="mapa-popup-header origin">
          <span class="mapa-popup-icon">🏢</span>
          <strong>Punto de Salida</strong>
        </div>
        <div class="mapa-popup-body">
          <p class="mapa-popup-name">${orgName}</p>
          <p class="mapa-popup-address">${orgDir}</p>
        </div>
      </div>
    `, { className: 'mapa-popup-wrapper', maxWidth: 280 });

    markers.push(originMarker);
    bounds.push([originCoords.lat, originCoords.lng]);

    // ── Marcador de DESTINO y ruta (si hay coordenadas de destino) ──
    if (destCoords && (isEnTransito || isEntregada)) {
      const destMarker = L.marker([destCoords.lat, destCoords.lng], {
        icon: isEntregada ? ICONS.destination() : ICONS.truck(),
      }).addTo(map);

      const statusLabel = isEntregada ? '✅ Entregada' : '🚚 En Tránsito';
      const destDir = typeof deliveryAddress === 'string' ? deliveryAddress : (deliveryAddress?.displayName || 'Dirección de entrega');
      destMarker.bindPopup(`
        <div class="mapa-popup">
          <div class="mapa-popup-header ${isEntregada ? 'delivered' : 'transit'}">
            <span class="mapa-popup-icon">${isEntregada ? '📍' : '🚚'}</span>
            <strong>Punto de Entrega</strong>
          </div>
          <div class="mapa-popup-body">
            <p class="mapa-popup-name">${destDir}</p>
            <p class="mapa-popup-status">${statusLabel}</p>
          </div>
        </div>
      `, { className: 'mapa-popup-wrapper', maxWidth: 280 });

      markers.push(destMarker);
      bounds.push([destCoords.lat, destCoords.lng]);

      // ── Línea de ruta animada ──
      const routeColor = isEntregada ? '#10b981' : '#8b5cf6';
      const routeLine = L.polyline(
        [[originCoords.lat, originCoords.lng], [destCoords.lat, destCoords.lng]],
        {
          color: routeColor,
          weight: 3,
          opacity: 0.8,
          dashArray: isEntregada ? null : '10, 8',
          lineCap: 'round',
          lineJoin: 'round',
        }
      ).addTo(map);
      routeRef.current = routeLine;

      // Si está en tránsito, añadir marcador de camión en punto intermedio
      if (isEnTransito) {
        const midLat = (originCoords.lat + destCoords.lat) / 2;
        const midLng = (originCoords.lng + destCoords.lng) / 2;
        const truckMarker = L.marker([midLat, midLng], {
          icon: ICONS.truck(),
        }).addTo(map);
        truckMarker.bindPopup(`
          <div class="mapa-popup">
            <div class="mapa-popup-header transit">
              <span class="mapa-popup-icon">🚚</span>
              <strong>Camión en Camino</strong>
            </div>
            <div class="mapa-popup-body">
              <p class="mapa-popup-name">${donation?.titulo || 'Donación'}</p>
              <p class="mapa-popup-status">En tránsito hacia destino</p>
            </div>
          </div>
        `, { className: 'mapa-popup-wrapper', maxWidth: 280 });
        markers.push(truckMarker);
      }
    }

    // Ajustar vista
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    } else {
      map.setView([originCoords.lat, originCoords.lng], 13);
    }

    mapInstanceRef.current = map;
    markersRef.current = markers;

    // Resize handler
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showMap, loading, originCoords, destCoords, donation?.status]);

  // ── No mostrar si el estado no es relevante ────
  if (!showMap) return null;

  // ── Status info bar ────────────────────────────
  const getStatusInfo = () => {
    if (isPendiente) {
      return {
        icon: '⏳',
        label: 'Pendiente',
        description: 'Pedido registrado. Se muestra el punto de origen de la organización.',
        color: 'var(--color-warning)',
        bgColor: 'var(--color-warning-bg)',
        borderColor: 'var(--color-warning-border)',
      };
    }
    if (isAceptada) {
      return {
        icon: '✅',
        label: 'Aceptada',
        description: 'Donación aceptada. El camión se prepara en el punto de origen.',
        color: 'var(--color-info)',
        bgColor: 'var(--color-info-bg)',
        borderColor: 'var(--color-info-border)',
      };
    }
    if (isEnTransito) {
      return {
        icon: '🚚',
        label: 'En Tránsito',
        description: 'El camión se encuentra en camino desde la organización hacia el punto de entrega.',
        color: 'var(--color-purple)',
        bgColor: 'var(--color-purple-bg)',
        borderColor: 'var(--color-purple-border)',
      };
    }
    if (isEntregada) {
      return {
        icon: '📍',
        label: 'Entregada',
        description: 'La donación ha sido entregada exitosamente en el punto de destino.',
        color: 'var(--color-success)',
        bgColor: 'var(--color-success-bg)',
        borderColor: 'var(--color-success-border)',
      };
    }
    return null;
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="mapa-rastreo-container animate-fade-in" id="mapa-rastreo">
      {/* Header del mapa */}
      <div className="mapa-header">
        <div className="mapa-header-left">
          <div className="mapa-header-icon">🗺️</div>
          <div>
            <h3 className="mapa-header-title">Rastreo de Donación</h3>
            <p className="mapa-header-subtitle">Seguimiento en tiempo real</p>
          </div>
        </div>
        {statusInfo && (
          <div
            className="mapa-status-badge"
            style={{
              background: statusInfo.bgColor,
              color: statusInfo.color,
              borderColor: statusInfo.borderColor,
            }}
          >
            <span>{statusInfo.icon}</span>
            <span>{statusInfo.label}</span>
          </div>
        )}
      </div>

      {/* Barra de información */}
      {statusInfo && (
        <div
          className="mapa-info-bar"
          style={{
            background: statusInfo.bgColor,
            borderColor: statusInfo.borderColor,
            color: statusInfo.color,
          }}
        >
          <span className="mapa-info-icon">{statusInfo.icon}</span>
          <span>{statusInfo.description}</span>
        </div>
      )}

      {/* Mapa */}
      <div className="mapa-wrapper">
        {loading ? (
          <div className="mapa-loading">
            <div className="spinner"></div>
            <p>Cargando mapa de seguimiento...</p>
          </div>
        ) : error ? (
          <div className="mapa-error">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        ) : (
          <div ref={mapRef} className="mapa-leaflet" id="mapa-leaflet-container"></div>
        )}
      </div>

      {/* Leyenda */}
      <div className="mapa-legend">
        <div className="mapa-legend-item">
          <span className="mapa-legend-dot" style={{ background: '#3b82f6' }}></span>
          <span>Punto de Salida (Organización)</span>
        </div>
        {(isEnTransito || isEntregada) && destCoords && (
          <>
            {isEnTransito && (
              <div className="mapa-legend-item">
                <span className="mapa-legend-dot" style={{ background: '#8b5cf6' }}></span>
                <span>Camión en Tránsito</span>
              </div>
            )}
            <div className="mapa-legend-item">
              <span className="mapa-legend-dot" style={{ background: '#10b981' }}></span>
              <span>Punto de Entrega</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
