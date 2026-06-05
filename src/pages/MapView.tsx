import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Compass, Maximize2 } from 'lucide-react';
import { useMemoryStore } from '@/store/useMemoryStore';
import { MemoryMap } from '@/components/MemoryMap';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';

export function MapView() {
  const { memories, fetchAll } = useMemoryStore();
  const navigate = useNavigate();
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const withLocation = memories.filter((m) => m.lat != null && m.lng != null);

  // 较准确的国家/区域估算：按 30°lat × 30°lng 网格
  const regions = new Set(
    withLocation.map(
      (m) =>
        `${Math.floor((m.lat! + 90) / 30)}-${Math.floor((m.lng! + 180) / 30)}`
    )
  ).size;

  const northernmost = withLocation.reduce<typeof withLocation[number] | null>(
    (max, m) => (max === null || m.lat! > max.lat! ? m : max),
    null
  );
  const southernmost = withLocation.reduce<typeof withLocation[number] | null>(
    (min, m) => (min === null || m.lat! < min.lat! ? m : min),
    null
  );

  return (
    <div className="relative z-10 min-h-screen px-6 md:px-12 py-24 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-12 bg-gold" />
          <span className="font-mono text-xs text-gold uppercase tracking-[0.4em]">
            Memory Map
          </span>
        </div>
        <h1 className="font-display text-6xl md:text-8xl font-bold text-cream leading-[0.9] tracking-tight mb-3">
          世界记忆地图
        </h1>
        <p className="font-display italic text-xl md:text-2xl text-cream/55 max-w-2xl">
          把足迹收藏在星空地图上，每一次远行都留下金光
        </p>
      </motion.div>

      {withLocation.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="地图上还没有足迹"
          hint="在添加记忆时点击地图选点，让回忆与地理位置相连。"
          cta={{ to: '/add', label: '✦ 添加第一段定位记忆' }}
        />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <MapStat
              label="足迹"
              value={withLocation.length}
              accent="#d4af37"
              icon={<Compass size={14} />}
            />
            <MapStat
              label="区域"
              value={regions}
              accent="#00d4ff"
              icon={<Maximize2 size={14} />}
            />
            <MapStat
              label="最北"
              value={northernmost?.location_name || '—'}
              accent="#00ffa3"
              clickable={!!northernmost}
              onClick={
                northernmost
                  ? () => setFlyTo({ lat: northernmost.lat!, lng: northernmost.lng!, zoom: 5 })
                  : undefined
              }
            />
            <MapStat
              label="最南"
              value={southernmost?.location_name || '—'}
              accent="#ff006e"
              clickable={!!southernmost}
              onClick={
                southernmost
                  ? () => setFlyTo({ lat: southernmost.lat!, lng: southernmost.lng!, zoom: 5 })
                  : undefined
              }
            />
          </div>
          <MemoryMap
            memories={withLocation}
            height="70vh"
            onMarkerClick={(m) => navigate(`/memory/${m.id}`)}
            flyTo={flyTo}
          />
        </>
      )}
    </div>
  );
}

function MapStat({
  label,
  value,
  accent,
  icon,
  clickable,
  onClick,
}: {
  label: string;
  value: string | number;
  accent: string;
  icon?: React.ReactNode;
  clickable?: boolean;
  onClick?: () => void;
}) {
  const Wrapper: any = clickable ? motion.button : motion.div;
  return (
    <Wrapper
      onClick={onClick}
      whileHover={clickable ? { y: -2 } : undefined}
      className={`glass rounded-2xl p-4 relative overflow-hidden text-left w-full ${
        clickable ? 'cursor-pointer hover:border-gold/40 transition-colors' : ''
      }`}
    >
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-30 blur-2xl"
        style={{ background: accent }}
      />
      <div className="relative">
        <div
          className="font-mono text-[10px] uppercase tracking-[0.3em] mb-2 flex items-center gap-1.5"
          style={{ color: accent }}
        >
          {icon}
          {label}
          {clickable && (
            <span className="ml-auto text-cream/30 font-mono text-[9px]">
              fly →
            </span>
          )}
        </div>
        <div className="font-display text-2xl md:text-3xl text-cream font-bold leading-none truncate">
          {value}
        </div>
      </div>
    </Wrapper>
  );
}
