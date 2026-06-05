import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Maximize2 } from 'lucide-react';
import type { Memory } from '@/utils/moods';
import { MOODS } from '@/utils/moods';
import { photoUrl } from '@/utils/api';

interface PolaroidCardProps {
  memory: Memory;
  rotation?: number;
  index?: number;
  onImageClick?: (memory: Memory) => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function PolaroidCard({ memory, rotation, index = 0, onImageClick }: PolaroidCardProps) {
  const mood = MOODS[memory.mood];
  const rot = rotation ?? ((((memory.id.charCodeAt(0) ?? 0) % 16) - 8));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: rot }}
      animate={{ opacity: 1, y: 0, rotate: rot }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ y: -8 }}
    >
      <Link to={`/memory/${memory.id}`} className="block polaroid group" style={{ transform: `rotate(${rot}deg)` }}>
        {/* 照片 */}
        <div
          className="relative aspect-square overflow-hidden rounded-sm bg-ink"
          style={{
            boxShadow: `inset 0 0 0 2px ${mood.color}30`,
          }}
        >
          <img
            src={photoUrl(memory.photo_url)}
            alt={memory.title}
            className="w-full h-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.18] group-hover:saturate-[1.15]"
            style={{ transformOrigin: 'center center' }}
            loading="lazy"
          />
          {/* 心情色角标 */}
          <div
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm backdrop-blur-md"
            style={{
              background: `radial-gradient(circle, ${mood.color}80, ${mood.color}30)`,
              boxShadow: `0 0 12px ${mood.glow}`,
            }}
          >
            {mood.emoji}
          </div>

          {/* 悬浮放大按钮（仅当 onImageClick 传入时显示） */}
          {onImageClick && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onImageClick(memory);
              }}
              className="absolute bottom-2 right-2 w-8 h-8 rounded-full glass-strong flex items-center justify-center text-cream hover:text-gold transition-colors opacity-0 group-hover:opacity-100"
              title="放大查看"
            >
              <Maximize2 size={13} />
            </button>
          )}
        </div>

        {/* 拍立得底部信息 */}
        <div className="pt-3 px-1">
          <div className="font-display text-ink text-lg font-semibold leading-tight line-clamp-1">
            {memory.title}
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-ink/60">
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {formatDate(memory.taken_at)}
            </span>
            {memory.location_name && (
              <span className="flex items-center gap-1 max-w-[60%] truncate">
                <MapPin size={10} />
                {memory.location_name}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
