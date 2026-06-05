import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { photoUrl } from '@/utils/api';
import { MOODS } from '@/utils/moods';
import type { Memory } from '@/utils/moods';

function moodIcon(mood: string) {
  const m = MOODS[mood as keyof typeof MOODS];
  const color = m?.color ?? '#d4af37';
  const glow = m?.glow ?? 'rgba(212,175,55,0.5)';
  return L.divIcon({
    className: 'custom-mood-pin',
    html: `<div style="
      width: 20px;
      height: 20px;
      background: radial-gradient(circle at 30% 30%, #fff 0%, ${color} 50%, #000 100%);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 0 10px ${glow}, 0 0 18px ${glow};
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -20],
  });
}

const pickedIcon = L.divIcon({
  className: 'custom-picked-pin',
  html: `<div style="
    width: 28px;
    height: 28px;
    border: 2px solid #d4af37;
    border-radius: 50%;
    background: rgba(212,175,55,0.15);
    box-shadow: 0 0 14px rgba(212,175,55,0.6);
    animation: pulse 1.6s ease-out infinite;
  "></div>
  <style>@keyframes pulse{0%{transform:scale(0.8);opacity:1}100%{transform:scale(2);opacity:0}}</style>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

interface MemoryMapProps {
  memories: Memory[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onPick?: (lat: number, lng: number) => void;
  pickMode?: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
  onMarkerClick?: (m: Memory) => void;
  flyTo?: { lat: number; lng: number; zoom?: number } | null;
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMap()?.on('click', (e) => onPick(e.latlng.lat, e.latlng.lng));
  return null;
}

function FlyTo({
  memories,
  external,
}: {
  memories: Memory[];
  external?: { lat: number; lng: number; zoom?: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (external) {
      map.flyTo([external.lat, external.lng], external.zoom ?? 6, {
        duration: 1.4,
        easeLinearity: 0.2,
      });
      return;
    }
    const valid = memories.filter((m) => m.lat != null && m.lng != null);
    if (valid.length === 0) return;
    if (valid.length === 1) {
      map.setView([valid[0].lat!, valid[0].lng!], 6, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(valid.map((m) => [m.lat!, m.lng!]));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 8 });
  }, [memories, external, map]);
  return null;
}

export function MemoryMap({
  memories,
  center = [20, 0],
  zoom = 2,
  height = '500px',
  onPick,
  pickMode = false,
  pickedLocation,
  onMarkerClick,
  flyTo,
}: MemoryMapProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden glass" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        style={{ width: '100%', height: '100%' }}
        worldCopyJump
      >
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        />
        <TileLayer
          attribution=""
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
        />

        {pickMode && onPick && <ClickHandler onPick={onPick} />}

        {memories
          .filter((m) => m.lat != null && m.lng != null)
          .map((m) => (
            <Marker
              key={m.id}
              position={[m.lat!, m.lng!]}
              icon={moodIcon(m.mood)}
              eventHandlers={{ click: () => onMarkerClick?.(m) }}
            >
              <Popup>
                <Link to={`/memory/${m.id}`} className="block w-56 group">
                  <div
                    className="relative aspect-video overflow-hidden"
                    style={{
                      borderBottom: `2px solid ${MOODS[m.mood].color}`,
                    }}
                  >
                    <img
                      src={photoUrl(m.photo_url)}
                      alt={m.title}
                      className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.18]"
                      style={{ transformOrigin: 'center center' }}
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div
                        className="text-base font-semibold truncate"
                        style={{ color: MOODS[m.mood].color }}
                      >
                        {MOODS[m.mood].emoji} {m.title}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-cream/60 tracking-wider">
                      {m.location_name || '某地'} · {new Date(m.taken_at).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </Link>
              </Popup>
            </Marker>
          ))}

        {pickedLocation && (
          <Marker position={[pickedLocation.lat, pickedLocation.lng]} icon={pickedIcon} />
        )}

        <FlyTo memories={memories} external={flyTo} />
      </MapContainer>

      {pickMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] glass-strong px-4 py-2 rounded-full">
          <span className="font-mono text-xs text-gold uppercase tracking-widest">
            ✦ 点击地图选择位置
          </span>
        </div>
      )}
    </div>
  );
}
