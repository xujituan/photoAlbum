import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMemoryStore } from '@/store/useMemoryStore';
import { MOODS, MOOD_LIST, type Memory } from '@/utils/moods';
import { photoUrl } from '@/utils/api';
import { EmptyState } from '@/components/EmptyState';
import { TimelineSkeleton } from '@/components/Skeleton';
import { Clock, X, ArrowUpRight, MapPin, Hash } from 'lucide-react';

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function Timeline() {
  const { memories, loading, fetchAll, filterMood, setFilterMood } = useMemoryStore();
  const [activeYear, setActiveYear] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll, filterMood]);

  // 按 年 → 月 分组
  const grouped = useMemo(() => {
    const yearMap = new Map<string, Map<string, typeof memories>>();
    memories.forEach((m) => {
      const d = new Date(m.taken_at);
      const y = String(d.getFullYear());
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      if (!yearMap.has(y)) yearMap.set(y, new Map());
      const yMap = yearMap.get(y)!;
      if (!yMap.has(mo)) yMap.set(mo, [] as any);
      yMap.get(mo)!.push(m);
    });
    return Array.from(yearMap.entries())
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, months]) => ({
        year,
        months: Array.from(months.entries())
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([m, items]) => ({ month: m, items })),
        total: Array.from(months.values()).reduce((s, arr) => s + arr.length, 0),
      }));
  }, [memories]);

  const activeFilter = filterMood
    ? MOOD_LIST.find((x) => x.key === filterMood)
    : null;
  const totalCount = memories.length;
  const yearRange =
    grouped.length > 0
      ? grouped.length === 1
        ? grouped[0].year
        : `${grouped[grouped.length - 1].year} — ${grouped[0].year}`
      : '—';

  // scroll spy: 监听当前可见的年份
  useEffect(() => {
    if (grouped.length === 0) return;
    const sections = grouped
      .map((g) => document.getElementById(`year-${g.year}`))
      .filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = visible[0].target.id.replace('year-', '');
          setActiveYear(id);
        }
      },
      { rootMargin: '-30% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [grouped]);

  const jumpToYear = (year: string) => {
    const el = document.getElementById(`year-${year}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveYear(year);
    }
  };

  return (
    <div className="relative z-10 min-h-screen px-6 md:px-12 py-24 max-w-6xl mx-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="mb-20"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-12 bg-gold" />
          <span className="font-mono text-xs text-gold uppercase tracking-[0.4em]">
            Chronicle
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="font-display text-6xl md:text-8xl font-bold text-cream leading-[0.9] tracking-tight mb-3">
              时间线
            </h1>
            <p className="font-display italic text-xl md:text-2xl text-cream/55 max-w-2xl leading-relaxed">
              沿着时间行走，与记忆重逢
            </p>
          </div>

          {/* 元信息 */}
          <div className="flex items-center gap-8 font-mono text-[10px] uppercase tracking-[0.3em] text-cream/40">
            <div className="flex flex-col gap-1">
              <span className="text-cream/30">memories</span>
              <span className="text-2xl text-cream font-display normal-case tracking-normal">
                {String(totalCount).padStart(3, '0')}
              </span>
            </div>
            <div className="h-8 w-px bg-cream/15" />
            <div className="flex flex-col gap-1">
              <span className="text-cream/30">years</span>
              <span className="text-2xl text-cream font-display normal-case tracking-normal">
                {grouped.length}
              </span>
            </div>
            <div className="h-8 w-px bg-cream/15" />
            <div className="flex flex-col gap-1">
              <span className="text-cream/30">span</span>
              <span className="text-sm text-gold normal-case tracking-wider">
                {yearRange}
              </span>
            </div>
          </div>
        </div>

        {/* 当前心情筛选 */}
        {activeFilter && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 inline-flex items-center gap-3"
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest"
              style={{
                background: `radial-gradient(circle, ${activeFilter.color}25 0%, ${activeFilter.color}08 100%)`,
                color: activeFilter.color,
                boxShadow: `inset 0 0 0 1px ${activeFilter.color}40, 0 0 16px ${activeFilter.glow}`,
              }}
            >
              <span className="text-base leading-none">{activeFilter.emoji}</span>
              filtering · {activeFilter.label}
            </span>
            <button
              onClick={() => setFilterMood(null)}
              className="text-cream/40 hover:text-cream transition-colors"
              title="清除筛选"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </motion.header>

      {/* 主体 */}
      {loading && memories.length === 0 ? (
        <TimelineSkeleton count={5} />
      ) : memories.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="时光还没开始书写"
          hint="去记录第一段回忆，让时间线开始流动。"
          cta={{ to: '/add', label: '✦ 开始记录' }}
        />
      ) : (
        <div className="relative">
          {/* 悬浮年份导航 - 右侧 */}
          {grouped.length > 1 && (
            <nav className="hidden lg:block fixed top-1/2 right-6 -translate-y-1/2 z-30">
              <div className="glass rounded-full py-3 px-1.5 flex flex-col items-center gap-1">
                <div className="font-mono text-[8px] text-gold/60 uppercase tracking-widest mb-1 [writing-mode:vertical-rl] rotate-180">
                  Years
                </div>
                {grouped.map((g) => {
                  const active = activeYear === g.year;
                  return (
                    <button
                      key={g.year}
                      onClick={() => jumpToYear(g.year)}
                      className={`group relative flex items-center gap-2 px-1.5 py-1 transition-all ${
                        active ? 'text-gold' : 'text-cream/40 hover:text-cream'
                      }`}
                      title={`${g.year} · ${g.total} 段`}
                    >
                      <div
                        className={`rounded-full transition-all ${
                          active
                            ? 'w-2.5 h-2.5 bg-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]'
                            : 'w-1.5 h-1.5 bg-cream/30 group-hover:bg-cream/60'
                        }`}
                      />
                      <span
                        className={`font-mono text-[10px] transition-opacity ${
                          active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {g.year}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>
          )}

          {/* 中央轴 */}
          <div className="pointer-events-none absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px timeline-line" />

          {grouped.map((yearGroup, yi) => (
            <section key={yearGroup.year} id={`year-${yearGroup.year}`} className="mb-28 last:mb-0 scroll-mt-32">
              {/* 年份大标 — 章节式 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8 }}
                className="relative flex flex-col items-center text-center mb-16 pl-14 md:pl-0"
              >
                {/* 节点 */}
                <div className="relative flex items-center justify-center mb-4">
                  <div
                    className="w-3 h-3 rounded-full bg-gold"
                    style={{ boxShadow: '0 0 16px rgba(212, 175, 55, 0.7)' }}
                  />
                  <div className="absolute w-8 h-8 rounded-full border border-gold/30" />
                </div>

                <div className="font-mono text-[10px] tracking-[0.5em] text-gold/60 uppercase mb-2">
                  chapter · {String(yi + 1).padStart(2, '0')}
                </div>
                <h2 className="font-display text-7xl md:text-9xl font-bold text-cream leading-none tracking-tight">
                  {yearGroup.year}
                </h2>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.4em] text-cream/40">
                  {yearGroup.total} 段记忆 · {yearGroup.months.length} 个月
                </div>
              </motion.div>

              {/* 月份 + 记忆 */}
              {yearGroup.months.map(({ month, items }) => (
                <div key={month} className="mb-20 last:mb-0">
                  {/* 月份标 */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative flex items-center mb-10 pl-14 md:pl-0 md:justify-center"
                  >
                    <div className="md:absolute md:left-1/2 md:-translate-x-1/2 z-10 glass-strong px-5 py-1.5 rounded-full flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-gold"
                        style={{ boxShadow: '0 0 6px rgba(212,175,55,0.7)' }}
                      />
                      <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
                        {Number(month)}月
                      </span>
                    </div>
                  </motion.div>

                  <div className="space-y-12">
                    {items.map((m, i) => (
                      <MemoryNode
                        key={m.id}
                        memory={m}
                        side={i % 2 === 0 ? 'left' : 'right'}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))}

          {/* 结尾装饰 */}
          <div className="relative flex flex-col items-center mt-12 pl-14 md:pl-0">
            <div className="md:absolute md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full border border-gold/40" />
            <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.4em] text-cream/30">
              ✦ the chronicle continues ✦
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------- 记忆节点 ------- */

function MemoryNode({
  memory: m,
  side,
}: {
  memory: Memory;
  side: 'left' | 'right';
}) {
  const mood = MOODS[m.mood];
  const d = new Date(m.taken_at);
  const day = d.getDate();
  const weekday = WEEKDAYS[d.getDay()];
  const time = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.article
      initial={{ opacity: 0, x: side === 'left' ? -50 : 50, y: 20 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      className={`relative flex items-stretch gap-6 pl-14 md:pl-0 ${
        side === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
    >
      {/* 节点圆点 */}
      <div className="absolute left-4 md:left-1/2 top-8 -translate-x-1/2 z-10">
        <div
          className="w-4 h-4 rounded-full"
          style={{
            background: mood.color,
            boxShadow: `0 0 0 4px var(--void), 0 0 14px ${mood.glow}`,
          }}
        />
      </div>

      {/* 卡片 */}
      <div
        className={`md:w-[calc(50%-3.5rem)] ${
          side === 'left' ? 'md:pr-4' : 'md:pl-4'
        }`}
      >
        <Link
          to={`/memory/${m.id}`}
          className="group block relative glass rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1"
          style={{
            boxShadow: `0 0 0 1px ${mood.color}25, 0 12px 32px rgba(0,0,0,0.45)`,
          }}
        >
          {/* hover 光带 */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${mood.color}20 0%, transparent 60%)`,
            }}
          />

          <div className="relative grid grid-cols-1 sm:grid-cols-12">
            {/* 日期列 */}
            <div
              className="sm:col-span-3 px-5 py-6 flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-2 border-b sm:border-b-0 sm:border-r"
              style={{ borderColor: `${mood.color}25` }}
            >
              <div className="font-display text-5xl sm:text-6xl font-bold text-cream leading-none">
                {String(day).padStart(2, '0')}
              </div>
              <div className="flex sm:flex-col gap-2 sm:gap-0.5 font-mono text-[10px] uppercase tracking-[0.3em] text-cream/40">
                <span>{weekday}</span>
                <span className="text-cream/25 hidden sm:inline">·</span>
                <span>{time}</span>
              </div>
            </div>

            {/* 内容列 */}
            <div className="sm:col-span-9 p-5 sm:p-6">
              {/* 顶部：心情 + 日期 */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xl leading-none"
                    style={{ filter: `drop-shadow(0 0 6px ${mood.glow})` }}
                  >
                    {mood.emoji}
                  </span>
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.3em]"
                    style={{ color: mood.color }}
                  >
                    {mood.label}
                  </span>
                </div>
                <ArrowUpRight
                  size={14}
                  className="text-cream/30 group-hover:text-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                />
              </div>

              {/* 照片 */}
              <div
                className="aspect-[16/10] rounded-lg overflow-hidden mb-4 relative"
                style={{ boxShadow: `inset 0 0 0 1px ${mood.color}20` }}
              >
                <img
                  src={photoUrl(m.photo_url)}
                  alt={m.title}
                  className="w-full h-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.18] group-hover:saturate-[1.15]"
                  style={{ transformOrigin: 'center center' }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(180deg, transparent 60%, ${mood.color}15 100%)`,
                  }}
                />
              </div>

              {/* 标题 + 故事 */}
              <h3 className="font-display text-2xl text-cream font-semibold leading-tight mb-2">
                {m.title}
              </h3>
              {m.story && (
                <p className="text-cream/55 text-sm leading-relaxed line-clamp-2 mb-3">
                  {m.story}
                </p>
              )}

              {/* 地点 */}
              {m.location_name && (
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-cream/40">
                  <MapPin size={10} />
                  {m.location_name}
                </div>
              )}
            </div>
          </div>
        </Link>
      </div>
    </motion.article>
  );
}
