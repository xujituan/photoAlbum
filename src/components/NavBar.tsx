import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, X } from 'lucide-react';
import { useMemoryStore } from '@/store/useMemoryStore';
import { MOOD_LIST } from '@/utils/moods';

const NAV_ITEMS = [
  { to: '/timeline', label: '时间线' },
  { to: '/gallery', label: '拍立得墙' },
  { to: '/map', label: '地图' },
];

export function NavBar() {
  const navigate = useNavigate();
  const { filterMood, setFilterMood } = useMemoryStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);

  const active = filterMood
    ? MOOD_LIST.find((m) => m.key === filterMood)
    : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5">
      <div className="max-w-7xl mx-auto glass-strong rounded-full pl-3 pr-3 py-2 flex items-center gap-2">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 pl-3 pr-4 group"
        >
          <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-void text-xs font-bold">
            ✦
          </div>
          <span className="hidden sm:inline font-display text-base text-cream group-hover:text-gold transition-colors">
            Memory Atlas
          </span>
        </button>

        {/* 分隔线 */}
        <div className="hidden md:block h-5 w-px bg-gold/20 mx-2" />

        {/* 主导航 */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-full text-sm transition-colors ${
                  isActive
                    ? 'bg-gold/15 text-gold'
                    : 'text-cream/70 hover:text-cream'
                }`
              }
            >
              {it.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        {/* 心情筛选下拉 */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((o) => !o)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
              active
                ? 'text-cream'
                : 'text-cream/70 hover:text-cream'
            }`}
            style={
              active
                ? {
                    background: `radial-gradient(circle, ${active.color}30 0%, ${active.color}08 100%)`,
                    boxShadow: `inset 0 0 0 1px ${active.color}50`,
                  }
                : { background: 'rgba(255,255,255,0.03)' }
            }
          >
            {active ? (
              <>
                <span className="text-base">{active.emoji}</span>
                <span className="font-mono text-xs uppercase tracking-wider">
                  {active.label}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilterMood(null);
                  }}
                  className="ml-1 text-cream/50 hover:text-cream"
                  title="清除"
                >
                  <X size={11} />
                </button>
              </>
            ) : (
              <>
                <span className="text-base">🎭</span>
                <span className="font-mono text-xs uppercase tracking-wider">
                  心情
                </span>
                <ChevronDown
                  size={12}
                  className={`transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </>
            )}
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 glass-strong rounded-2xl p-3 min-w-[280px]"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cream/40 mb-3 px-2">
                  ✦ 按心情筛选
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => {
                      setFilterMood(null);
                      setOpen(false);
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                      !filterMood
                        ? 'bg-gold/20 text-gold'
                        : 'text-cream/60 hover:bg-cream/5'
                    }`}
                  >
                    <span className="text-lg">◉</span>
                    <span className="text-[10px] font-mono uppercase">全部</span>
                  </button>
                  {MOOD_LIST.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => {
                        setFilterMood(filterMood === m.key ? null : m.key);
                        setOpen(false);
                      }}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                        filterMood === m.key
                          ? 'scale-105'
                          : 'text-cream/60 hover:bg-cream/5'
                      }`}
                      style={
                        filterMood === m.key
                          ? {
                              background: `radial-gradient(circle, ${m.color}30 0%, ${m.color}08 100%)`,
                              boxShadow: `inset 0 0 0 1px ${m.color}50`,
                            }
                          : undefined
                      }
                    >
                      <span className="text-lg" style={{ filter: filterMood === m.key ? `drop-shadow(0 0 6px ${m.glow})` : '' }}>
                        {m.emoji}
                      </span>
                      <span
                        className="text-[10px] font-mono uppercase"
                        style={{ color: filterMood === m.key ? m.color : undefined }}
                      >
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* New Memory 按钮 */}
        <button
          onClick={() => navigate('/add')}
          className="ml-2 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm btn-gold"
        >
          <Plus size={14} />
          <span className="font-mono text-xs uppercase tracking-widest">New</span>
        </button>
      </div>
    </header>
  );
}
