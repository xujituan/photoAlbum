import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BookCover } from '@/components/BookCover';
import { useMemoryStore } from '@/store/useMemoryStore';
import { MOODS, MOOD_LIST, type Memory } from '@/utils/moods';
import { photoUrl } from '@/utils/api';
import { Sparkles, Calendar, Image as ImageIcon, Heart, ChevronDown, Shuffle, MapPin, ArrowUpRight } from 'lucide-react';
import { PolaroidCard } from '@/components/PolaroidCard';
import { EmptyState } from '@/components/EmptyState';
import { TextReveal } from '@/components/TextReveal';
import { CountUp } from '@/components/CountUp';

export function Home() {
  const navigate = useNavigate();
  const { memories, stats, fetchAll, fetchStats } = useMemoryStore();
  const [showCover, setShowCover] = useState(() => {
    return !sessionStorage.getItem('cover-opened');
  });
  const [shuffleKey, setShuffleKey] = useState(0);

  useEffect(() => {
    fetchAll();
    fetchStats();
  }, [fetchAll, fetchStats]);

  const handleOpen = () => {
    sessionStorage.setItem('cover-opened', '1');
    setShowCover(false);
  };

  const recent = memories.slice(0, 6);

  // 随机亮点记忆
  const featured = useMemo(() => {
    if (memories.length === 0) return null;
    const idx = Math.floor((Date.now() / 1000 + shuffleKey * 13) % memories.length);
    return memories[idx];
  }, [memories, shuffleKey]);

  const topMood = stats
    ? Object.entries(stats.moodCount).sort((a, b) => (b[1] as number) - (a[1] as number))[0]
    : null;
  const topMoodMeta = topMood ? MOODS[topMood[0] as keyof typeof MOODS] : null;

  return (
    <>
      <AnimatePresence>
        {showCover && <BookCover key="cover" onOpen={handleOpen} />}
      </AnimatePresence>

      <div className="relative z-10 min-h-screen px-6 md:px-12 py-24 max-w-7xl mx-auto">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: showCover ? 0 : 1, y: showCover ? 30 : 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="relative mb-28"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-12 bg-gold" />
            <span className="font-mono text-xs text-gold uppercase tracking-[0.4em]">
              A Celestial Archive
            </span>
          </div>

          <h1 className="font-display text-7xl md:text-9xl font-bold text-cream leading-[0.9] mb-10 tracking-tight">
            {showCover ? (
              <span className="opacity-0">Memory Atlas</span>
            ) : (
              <>
                <div className="block">
                  <TextReveal text="Memory" delay={0.1} />
                </div>
                <div className="block italic font-light text-gold-shine">
                  <TextReveal text="Atlas" delay={0.55} />
                </div>
              </>
            )}
          </h1>

          <p className="font-display italic text-2xl md:text-3xl text-cream/55 max-w-2xl mb-12 leading-relaxed">
            {!showCover && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 1.2 }}
              >
                把每一个值得铭记的瞬间，
                <br />
                收藏进会发光的星图里。
              </motion.span>
            )}
          </p>

          {!showCover && (
            <motion.button
              onClick={() =>
                window.scrollTo({ top: window.innerHeight * 0.7, behavior: 'smooth' })
              }
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.4em] text-cream/40 hover:text-gold transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 1 }}
            >
              <ChevronDown size={14} className="animate-bounce" />
              scroll · enter the archive
            </motion.button>
          )}
        </motion.section>

        {/* 今日亮点记忆 (随机) */}
        {featured && !showCover && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 1.9 }}
            className="mb-28"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-gold" />
              <span className="font-mono text-xs text-gold uppercase tracking-[0.4em]">
                ✦ Star of the Moment
              </span>
              <div className="flex-1 h-px bg-gold/10" />
              <button
                onClick={() => setShuffleKey((k) => k + 1)}
                className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-cream/40 hover:text-gold transition-colors"
                title="换一颗星"
              >
                <Shuffle size={11} />
                shuffle
              </button>
            </div>
            <FeaturedStar
              key={featured.id}
              memory={featured}
              onClick={() => navigate(`/memory/${featured.id}`)}
            />
          </motion.section>
        )}

        {/* 统计仪表板 */}
        {stats && stats.total > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: showCover ? 0 : 1, y: showCover ? 30 : 0 }}
            transition={{ duration: 1.0, delay: 1.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-28"
          >
            <StatCard
              icon={<ImageIcon size={18} />}
              value={<CountUp to={stats.total} delay={1.6} />}
              label="段记忆"
              accent="var(--aurora-1)"
            />
            <StatCard
              icon={<Calendar size={18} />}
              value={<CountUp to={stats.years.length} delay={1.75} />}
              label="个年份"
              accent="var(--aurora-3)"
            />
            <StatCard
              icon={<Heart size={18} />}
              value={topMoodMeta ? topMoodMeta.label : '—'}
              label="最常心情"
              accent={topMoodMeta?.color || 'var(--gold)'}
            />
            <StatCard
              icon={<Sparkles size={18} />}
              value={
                stats.latestAt
                  ? new Date(stats.latestAt).toLocaleDateString('zh-CN', {
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—'
              }
              label="最近"
              accent="var(--aurora-2)"
            />
          </motion.section>
        )}

        {/* 心情分布 */}
        {stats && stats.total > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: showCover ? 0 : 1, y: showCover ? 30 : 0 }}
            transition={{ duration: 1.0, delay: 1.7 }}
            className="mb-28"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-12 bg-gold" />
              <h2 className="font-mono text-xs text-gold uppercase tracking-[0.4em]">
                ✦ 心情光谱 · Mood Spectrum
              </h2>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {MOOD_LIST.map((m) => {
                const count = stats.moodCount[m.key] || 0;
                const total = Math.max(stats.total, 1);
                const pct = (count / total) * 100;
                return (
                  <div
                    key={m.key}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div
                      className="mood-bubble relative w-full aspect-square rounded-xl glass flex items-center justify-center overflow-hidden"
                      style={{ color: m.color }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 transition-all duration-1000"
                        style={{
                          height: `${pct}%`,
                          background: `linear-gradient(180deg, ${m.color}50 0%, ${m.color}00 100%)`,
                        }}
                      />
                      <span className="relative text-3xl">{m.emoji}</span>
                    </div>
                    <div className="text-[10px] font-mono text-cream/60 uppercase tracking-wider text-center">
                      {m.label} · {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* 最近记忆 */}
        <section className="mb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-12 bg-gold" />
                <h2 className="font-mono text-xs text-gold uppercase tracking-[0.4em]">
                  ✦ 最近收藏 · Latest
                </h2>
              </div>
              <h3 className="font-display text-4xl text-cream font-semibold">时光相册</h3>
            </div>
            <button
              onClick={() => navigate('/gallery')}
              className="font-mono text-xs text-gold hover:text-cream uppercase tracking-widest transition-colors"
            >
              View all →
            </button>
          </div>

          {recent.length === 0 ? (
            <EmptyState
              title="星图还是空的"
              hint="点击右下角「New Memory」开始记录第一段回忆。"
              cta={{ to: '/add', label: '✦ 记录第一段记忆' }}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
              {recent.map((m, i) => (
                <PolaroidCard key={m.id} memory={m} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* 底部装饰 */}
        <div className="text-center pt-6 pb-6">
          <div className="inline-flex items-center gap-4 text-cream/25 font-mono text-[10px] uppercase tracking-[0.4em]">
            <span className="h-px w-12 bg-cream/15" />
            ✦ Memory Atlas ✦
            <span className="h-px w-12 bg-cream/15" />
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  accent: string;
}) {
  return (
    <div className="stat-card-3d relative glass rounded-2xl p-5 overflow-hidden group">
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-30 blur-3xl group-hover:opacity-60 transition-opacity duration-700"
        style={{ background: accent }}
      />
      <div className="relative">
        <div style={{ color: accent }} className="mb-3 opacity-80">
          {icon}
        </div>
        <div className="font-display text-3xl md:text-4xl text-cream font-bold leading-none mb-2">
          {value}
        </div>
        <div className="font-mono text-[10px] text-cream/50 uppercase tracking-widest">
          {label}
        </div>
      </div>
    </div>
  );
}

/** 今日星 - 电影感横版大图卡片 */
function FeaturedStar({ memory, onClick }: { memory: Memory; onClick: () => void }) {
  const mood = MOODS[memory.mood];
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="group relative w-full text-left rounded-3xl overflow-hidden glass cursor-pointer"
      style={{
        boxShadow: `0 0 0 1px ${mood.color}40, 0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${mood.glow}`,
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* 图片 */}
        <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
          <img
            src={photoUrl(memory.photo_url)}
            alt={memory.title}
            className="w-full h-full object-cover transition-transform duration-[1800ms] ease-out group-hover:scale-110 group-hover:saturate-110"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${mood.color}10 70%, rgba(10,6,18,0.85) 100%)`,
            }}
          />
          {/* 心情光晕 */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-screen"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${mood.color}25 0%, transparent 60%)`,
            }}
          />
          {/* 心情角标 */}
          <div
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md"
            style={{
              background: `radial-gradient(circle, ${mood.color}60 0%, ${mood.color}20 100%)`,
              color: mood.color,
              border: `1px solid ${mood.color}80`,
              boxShadow: `0 0 16px ${mood.glow}`,
            }}
          >
            <span className="text-base leading-none">{mood.emoji}</span>
            {mood.label}
          </div>
        </div>

        {/* 文字 */}
        <div className="relative p-6 md:p-10 flex flex-col justify-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-cream/40 mb-3">
            ✦ {new Date(memory.taken_at).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {memory.location_name && (
              <span className="ml-3 inline-flex items-center gap-1 text-gold/70">
                <MapPin size={10} /> {memory.location_name}
              </span>
            )}
          </div>
          <h3 className="font-display text-3xl md:text-5xl text-cream font-bold leading-tight mb-3">
            {memory.title}
          </h3>
          {memory.story && (
            <p className="font-display italic text-base md:text-lg text-cream/65 leading-relaxed line-clamp-3 mb-5">
              {memory.story}
            </p>
          )}
          <div
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.4em] group-hover:gap-3 transition-all"
            style={{ color: mood.color }}
          >
            <span>view memory</span>
            <ArrowUpRight size={13} className="group-hover:rotate-45 transition-transform duration-500" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
