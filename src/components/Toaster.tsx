import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore, type Toast } from '@/store/useToastStore';

const ICON: Record<Toast['kind'], React.ComponentType<any>> = {
  success: Check,
  error: AlertCircle,
  info: Info,
};

const COLOR: Record<Toast['kind'], string> = {
  success: '#00ffa3',
  error: '#ff006e',
  info: '#00d4ff',
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="fixed top-20 right-6 z-[60] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICON[t.kind];
          const c = COLOR[t.kind];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className="pointer-events-auto glass-strong rounded-2xl pl-4 pr-3 py-3 flex items-center gap-3 min-w-[280px] max-w-md"
              style={{
                boxShadow: `0 0 0 1px ${c}40, 0 12px 32px rgba(0,0,0,0.5), 0 0 20px ${c}20`,
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `radial-gradient(circle, ${c}40 0%, ${c}10 100%)`,
                  color: c,
                }}
              >
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                {t.title && (
                  <div
                    className="font-mono text-[10px] uppercase tracking-widest mb-0.5"
                    style={{ color: c }}
                  >
                    {t.title}
                  </div>
                )}
                <div className="text-cream/90 text-sm leading-snug">
                  {t.message}
                </div>
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-cream/40 hover:text-cream p-1"
                title="关闭"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
