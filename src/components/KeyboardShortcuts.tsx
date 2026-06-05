import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Search, Plus, Home, Clock, Images, Map as MapIcon } from 'lucide-react';

interface Shortcut {
  keys: string[];
  desc: string;
  icon?: React.ReactNode;
}

const SHORTCUTS: { group: string; items: Shortcut[] }[] = [
  {
    group: '导航',
    items: [
      { keys: ['G', 'H'], desc: '回到首页', icon: <Home size={13} /> },
      { keys: ['G', 'T'], desc: '时间线', icon: <Clock size={13} /> },
      { keys: ['G', 'G'], desc: '拍立得墙', icon: <Images size={13} /> },
      { keys: ['G', 'M'], desc: '地图', icon: <MapIcon size={13} /> },
    ],
  },
  {
    group: '操作',
    items: [
      { keys: ['N'], desc: '记录新记忆', icon: <Plus size={13} /> },
      { keys: ['/'], desc: '搜索', icon: <Search size={13} /> },
      { keys: ['?'], desc: '显示快捷键', icon: <Keyboard size={13} /> },
      { keys: ['Esc'], desc: '关闭弹窗' },
    ],
  },
  {
    group: '浏览回忆',
    items: [
      { keys: ['←'], desc: '上一段记忆' },
      { keys: ['→'], desc: '下一段记忆' },
    ],
  },
];

export function KeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [gPressed, setGPressed] = useState(false);

  useEffect(() => {
    let gTimer: number | null = null;
    let lastKey = '';

    const onKey = (e: KeyboardEvent) => {
      // 在输入框/文本域不响应
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
        return;
      }
      // Cmd/Ctrl/Alt + 任意键不响应
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const k = e.key;

      // ? 打开帮助
      if (k === '?' || (e.shiftKey && k === '/')) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (k === 'Escape') {
        setOpen(false);
        return;
      }

      // / 搜索
      if (k === '/') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[type="text"]');
        searchInput?.focus();
        return;
      }

      // N 新建
      if (k === 'n' || k === 'N') {
        e.preventDefault();
        navigate('/add');
        return;
      }

      // G + ... 导航
      if ((k === 'g' || k === 'G') && !gPressed) {
        setGPressed(true);
        if (gTimer) clearTimeout(gTimer);
        gTimer = window.setTimeout(() => setGPressed(false), 1200);
        lastKey = 'g';
        return;
      }

      if (gPressed) {
        const target = k.toLowerCase();
        const go = (path: string) => {
          navigate(path);
        };
        if (target === 'h') go('/');
        else if (target === 't') go('/timeline');
        else if (target === 'g') go('/gallery');
        else if (target === 'm') go('/map');
        setGPressed(false);
        if (gTimer) clearTimeout(gTimer);
        return;
      }

      // ArrowLeft/Right 在首页/时间线/拍立得墙无操作（仅在详情页）
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [navigate, gPressed, location.pathname]);

  return (
    <>
      {/* G 状态提示 */}
      <AnimatePresence>
        {gPressed && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[65] glass-strong rounded-full px-5 py-2.5 flex items-center gap-2"
          >
            <kbd className="font-mono text-xs px-2 py-0.5 rounded bg-gold/20 text-gold">G</kbd>
            <span className="font-mono text-[10px] uppercase tracking-widest text-cream/60">
              然后按 H / T / G / M
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 帮助弹窗 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] flex items-center justify-center px-4"
            onClick={() => setOpen(false)}
          >
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(10,6,18,0.85) 0%, rgba(0,0,0,0.96) 100%)',
                backdropFilter: 'blur(16px)',
              }}
            />
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-[1] glass-strong rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              style={{
                boxShadow:
                  '0 0 0 1px rgba(212,175,55,0.3), 0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(212,175,55,0.15)',
              }}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full glass flex items-center justify-center text-cream/60 hover:text-cream"
                title="关闭 (Esc)"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-12 bg-gold" />
                <span className="font-mono text-xs text-gold uppercase tracking-[0.4em]">
                  Keyboard
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-cream font-semibold mb-6">
                快捷键速查
              </h2>

              <div className="space-y-6">
                {SHORTCUTS.map((g) => (
                  <div key={g.group}>
                    <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cream/40 mb-3">
                      ✦ {g.group}
                    </div>
                    <div className="space-y-2">
                      {g.items.map((s, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg hover:bg-cream/5 transition-colors"
                        >
                          <div className="flex items-center gap-2 text-sm text-cream/80">
                            {s.icon}
                            <span>{s.desc}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {s.keys.map((k, j) => (
                              <span key={j} className="flex items-center gap-1">
                                <kbd className="font-mono text-[11px] px-2 py-1 rounded-md bg-ink border border-gold/30 text-gold min-w-[28px] text-center shadow-sm">
                                  {k}
                                </kbd>
                                {j < s.keys.length - 1 && (
                                  <span className="text-cream/30 text-xs">+</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gold/10 text-center">
                <span className="font-mono text-[10px] text-cream/30 uppercase tracking-widest">
                  按 ? 随时唤起 · 按 Esc 关闭
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部右下角的小提示 */}
      <div className="hidden md:block fixed bottom-12 right-3 z-30 pointer-events-none">
        <div className="glass rounded-full px-3 py-1.5 flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity pointer-events-auto">
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-ink border border-gold/20 text-gold">?</kbd>
          <span className="font-mono text-[9px] uppercase tracking-widest text-cream/60">
            shortcuts
          </span>
        </div>
      </div>
    </>
  );
}
