import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Images as ImagesIcon, X, ArrowDownAZ, ArrowUpAZ } from 'lucide-react';
import { useMemoryStore } from '@/store/useMemoryStore';
import { MOOD_LIST, type Memory } from '@/utils/moods';
import { PolaroidCard } from '@/components/PolaroidCard';
import { EmptyState } from '@/components/EmptyState';
import { PolaroidGridSkeleton } from '@/components/Skeleton';
import { Lightbox } from '@/components/Lightbox';
import { toast } from '@/store/useToastStore';

type SortOrder = 'newest' | 'oldest' | 'title';

export function Gallery() {
  const { memories, loading, searchQ, setSearchQ, fetchAll, filterMood, setFilterMood } = useMemoryStore();
  const [sort, setSort] = useState<SortOrder>('newest');
  const [lightbox, setLightbox] = useState<Memory | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll, filterMood]);

  // 搜索 debounce
  const debounceRef = useRef<number | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      fetchAll();
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQ]);

  const currentMood = filterMood ? MOOD_LIST.find((m) => m.key === filterMood) : null;

  // 排序后的列表（不影响原始顺序）
  const sorted = useMemo(() => {
    const arr = [...memories];
    if (sort === 'newest')
      arr.sort((a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime());
    else if (sort === 'oldest')
      arr.sort((a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime());
    else if (sort === 'title')
      arr.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
    return arr;
  }, [memories, sort]);

  // lightbox 前后导航
  const lbIdx = lightbox ? sorted.findIndex((m) => m.id === lightbox.id) : -1;
  const lbPrev = lbIdx > 0 ? sorted[lbIdx - 1] : null;
  const lbNext = lbIdx >= 0 && lbIdx < sorted.length - 1 ? sorted[lbIdx + 1] : null;

  const handleImageClick = (m: Memory) => {
    setLightbox(m);
    toast.info('按 ← → 切换 · Esc 关闭', '✦ Lightbox');
  };

  return (
    <div className="relative z-10 min-h-screen px-6 md:px-12 py-24 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-12 bg-gold" />
          <span className="font-mono text-xs text-gold uppercase tracking-[0.4em]">
            Polaroid Wall
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-display text-6xl md:text-7xl font-bold text-cream mb-3">
              拍立得墙
            </h1>
            <p className="font-display italic text-xl text-cream/50">
              每一张都微微倾斜，像随手钉在墙上的样子
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* 排序 */}
            <div className="glass rounded-full p-1 flex">
              <button
                onClick={() => setSort('newest')}
                className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                  sort === 'newest' ? 'bg-gold/20 text-gold' : 'text-cream/50 hover:text-cream'
                }`}
              >
                <ArrowDownAZ size={11} /> 最新
              </button>
              <button
                onClick={() => setSort('oldest')}
                className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                  sort === 'oldest' ? 'bg-gold/20 text-gold' : 'text-cream/50 hover:text-cream'
                }`}
              >
                <ArrowUpAZ size={11} /> 最早
              </button>
            </div>
            <div className="relative md:w-72">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40"
              />
              <input
                type="text"
                placeholder="搜索标题、故事、地点…"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {loading && memories.length === 0 ? (
        <PolaroidGridSkeleton count={8} />
      ) : memories.length === 0 ? (
        <EmptyState
          icon={ImagesIcon}
          title="墙上还没有照片"
          hint="记录第一段回忆，让拍立得墙开始填满。"
          cta={{ to: '/add', label: '✦ 钉上第一张' }}
        />
      ) : (
        <>
          {/* 心情筛选条 */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterMood(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                !filterMood
                  ? 'bg-gold/20 ring-1 ring-gold text-gold'
                  : 'glass text-cream/60 hover:text-cream'
              }`}
            >
              ◉ 全部
            </button>
            {MOOD_LIST.map((m) => {
              const active = filterMood === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setFilterMood(active ? null : m.key)}
                  className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all hover:scale-105 ${
                    active ? 'ring-1 ring-cream scale-105' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    background: active
                      ? `radial-gradient(circle, ${m.color}50 0%, ${m.color}15 100%)`
                      : 'rgba(255,255,255,0.04)',
                    color: active ? m.color : undefined,
                    boxShadow: active ? `0 0 12px ${m.glow}` : 'none',
                  }}
                >
                  <span>{m.emoji}</span>
                  <span className="font-mono uppercase tracking-wider">{m.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mb-6 font-mono text-xs text-cream/50 uppercase tracking-widest flex items-center gap-3">
            <span>✦ {memories.length} 段记忆</span>
            {currentMood && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${currentMood.color}30 0%, ${currentMood.color}10 100%)`,
                  color: currentMood.color,
                }}
              >
                {currentMood.emoji} {currentMood.label}
                <button
                  onClick={() => setFilterMood(null)}
                  className="ml-1 hover:scale-125 transition-transform"
                  title="清除筛选"
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {searchQ && <span>· 关键词 "{searchQ}"</span>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            {sorted.map((m, i) => (
              <PolaroidCard
                key={m.id}
                memory={m}
                index={i}
                onImageClick={handleImageClick}
              />
            ))}
          </div>
        </>
      )}

      <Lightbox
        open={!!lightbox}
        memory={lightbox}
        onClose={() => setLightbox(null)}
        onPrev={lbPrev ? () => setLightbox(lbPrev) : undefined}
        onNext={lbNext ? () => setLightbox(lbNext) : undefined}
      />
    </div>
  );
}
