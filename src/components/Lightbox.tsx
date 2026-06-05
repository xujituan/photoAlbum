import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, ZoomIn, ZoomOut } from 'lucide-react';
import { photoUrl } from '@/utils/api';
import { MOODS } from '@/utils/moods';
import type { Memory } from '@/utils/moods';

interface LightboxProps {
  open: boolean;
  memory: Memory | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function Lightbox({ open, memory, onClose, onPrev, onNext }: LightboxProps) {
  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  // Esc 关闭 + 方向键切换 + 缩放快捷键
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && onPrev) onPrev();
      else if (e.key === 'ArrowRight' && onNext) onNext();
      else if (e.key === '+' || e.key === '=') setZoomed(true);
      else if (e.key === '-' || e.key === '_') setZoomed(false);
      else if (e.key === '0') {
        setZoomed(false);
        setPan({ x: 0, y: 0 });
      }
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, onPrev, onNext]);

  // 切换 memory 时重置
  useEffect(() => {
    setZoomed(false);
    setPan({ x: 0, y: 0 });
  }, [memory?.id]);

  if (!memory) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key={memory.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] flex items-center justify-center"
          onClick={onClose}
        >
          {/* 背景 */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(10,6,18,0.92) 0%, rgba(0,0,0,0.97) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          />

          {/* 关闭 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-6 right-6 z-10 w-11 h-11 rounded-full glass-strong flex items-center justify-center text-cream hover:text-gold transition-colors"
            title="关闭 (Esc)"
          >
            <X size={18} />
          </button>

          {/* 缩放控制 */}
          <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoomed((z) => !z);
                if (zoomed) setPan({ x: 0, y: 0 });
              }}
              className="w-11 h-11 rounded-full glass-strong flex items-center justify-center text-cream hover:text-gold transition-colors"
              title={zoomed ? '缩小 (0)' : '放大 (双击图片)'}
            >
              {zoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
            </button>
          </div>

          {/* 上一段 */}
          {onPrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full glass-strong flex items-center justify-center text-cream hover:text-gold transition-colors"
              title="上一段 (←)"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          {/* 下一段 */}
          {onNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full glass-strong flex items-center justify-center text-cream hover:text-gold transition-colors"
              title="下一段 (→)"
            >
              <ArrowRight size={18} />
            </button>
          )}

          {/* 大图 */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative z-[1] max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative overflow-hidden rounded-lg select-none"
              style={{
                cursor: zoomed ? (pan.x !== 0 || pan.y !== 0 ? 'grabbing' : 'grab') : 'zoom-in',
                maxWidth: '90vw',
                maxHeight: '75vh',
              }}
              onClick={() => {
                if (!zoomed) setZoomed(true);
                else setPan({ x: 0, y: 0 });
              }}
              onDoubleClick={() => {
                setZoomed((z) => !z);
                if (zoomed) setPan({ x: 0, y: 0 });
              }}
              onMouseDown={(e) => {
                if (!zoomed) return;
                dragRef.current = {
                  startX: e.clientX,
                  startY: e.clientY,
                  origX: pan.x,
                  origY: pan.y,
                };
              }}
              onMouseMove={(e) => {
                if (!dragRef.current || !zoomed) return;
                setPan({
                  x: dragRef.current.origX + (e.clientX - dragRef.current.startX),
                  y: dragRef.current.origY + (e.clientY - dragRef.current.startY),
                });
              }}
              onMouseUp={() => (dragRef.current = null)}
              onMouseLeave={() => (dragRef.current = null)}
              onWheel={(e) => {
                if (e.deltaY < 0) setZoomed(true);
                else if (e.deltaY > 0) {
                  setZoomed(false);
                  setPan({ x: 0, y: 0 });
                }
              }}
            >
              <img
                src={photoUrl(memory.photo_url)}
                alt={memory.title}
                draggable={false}
                className="max-w-full max-h-[75vh] object-contain rounded-lg transition-transform duration-300"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomed ? 2 : 1})`,
                  boxShadow: `0 0 0 1px ${MOODS[memory.mood].color}40, 0 30px 80px rgba(0,0,0,0.6), 0 0 60px ${MOODS[memory.mood].glow}`,
                }}
              />
              {zoomed && (
                <div className="absolute bottom-2 right-2 glass-strong rounded-full px-2 py-1 font-mono text-[9px] text-gold uppercase tracking-widest pointer-events-none">
                  2× · 拖动平移
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <div
                className="font-mono text-[10px] uppercase tracking-[0.3em] mb-1"
                style={{ color: MOODS[memory.mood].color }}
              >
                {MOODS[memory.mood].emoji} {MOODS[memory.mood].label}
              </div>
              <div className="font-display text-2xl text-cream font-semibold">
                {memory.title}
              </div>
              {memory.location_name && (
                <div className="mt-1 font-mono text-xs text-cream/40">
                  ✦ {memory.location_name} · {new Date(memory.taken_at).toLocaleDateString('zh-CN')}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
