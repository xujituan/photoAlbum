import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Trash2, MapPin, Calendar, Hash, Compass, Edit3, X, Save, Type } from 'lucide-react';
import { api, photoUrl } from '@/utils/api';
import type { Memory, Mood } from '@/utils/moods';
import { MOODS } from '@/utils/moods';
import { useMemoryStore } from '@/store/useMemoryStore';
import { toast } from '@/store/useToastStore';
import { DetailSkeleton } from '@/components/Skeleton';
import { MoodPicker } from '@/components/MoodPicker';

export function MemoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const { update, remove, memories, fetchAll } = useMemoryStore();

  // 拉全部用于前后导航
  useEffect(() => {
    if (memories.length === 0) fetchAll();
  }, [memories.length, fetchAll]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(id)
      .then((m) => setMemory(m))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!memory) return;
    const title = memory.title;
    try {
      await remove(memory.id);
      toast.success(`「${title}」已从星图移除`, '✦ Deleted');
      navigate('/');
    } catch (e: any) {
      toast.error(e.message || '删除失败');
    }
  };

  // 找前一个/后一个
  const sorted = [...memories].sort(
    (a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime()
  );
  const idx = memory ? sorted.findIndex((m) => m.id === memory.id) : -1;
  const prev = idx > 0 ? sorted[idx - 1] : sorted[sorted.length - 1] || null;
  const next = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : sorted[0] || null;

  // 键盘导航
  useEffect(() => {
    if (!memory) return;
    const onKey = (e: KeyboardEvent) => {
      // 输入框中不响应
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowLeft' && prev) navigate(`/memory/${prev.id}`);
      else if (e.key === 'ArrowRight' && next) navigate(`/memory/${next.id}`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [memory, prev, next, navigate]);

  if (loading) {
    return (
      <div className="relative z-10 min-h-screen px-6 md:px-12 py-24 max-w-6xl mx-auto">
        <DetailSkeleton />
      </div>
    );
  }

  if (!memory) return null;

  const mood = MOODS[memory.mood];

  return (
    <div className="relative z-10 min-h-screen">
      {/* 顶部导航行 */}
      <div className="fixed top-20 left-6 md:left-12 z-30 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-cream hover:text-gold transition-colors"
          title="返回"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="font-mono text-xs text-cream/40 uppercase tracking-widest">
          Back
        </span>
      </div>

      <div className="fixed top-20 right-6 md:right-12 z-30 flex items-center gap-3">
        {memory.lat != null && memory.lng != null && (
          <Link
            to="/map"
            className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-cream/60 hover:text-gold transition-colors"
            title="在地图查看"
          >
            <Compass size={16} />
          </Link>
        )}
        <button
          onClick={() => setEditing(true)}
          className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-cream/60 hover:text-gold transition-colors"
          title="编辑"
        >
          <Edit3 size={16} />
        </button>
        <AnimatePresence mode="wait">
          {!confirmDelete ? (
            <motion.button
              key="trash"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setConfirmDelete(true)}
              className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-cream/60 hover:text-aurora2 transition-colors"
            >
              <Trash2 size={16} />
            </motion.button>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 glass-strong rounded-full p-1 pl-4"
            >
              <span className="text-xs text-cream/70">确定删除？</span>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-full bg-aurora2/80 text-void text-xs font-mono hover:bg-aurora2 transition-colors"
              >
                是
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-full bg-cream/10 text-cream text-xs hover:bg-cream/20 transition-colors"
              >
                否
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hero 大图 */}
      <motion.div
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative w-full h-[75vh] overflow-hidden"
      >
        <img
          src={photoUrl(memory.photo_url)}
          alt={memory.title}
          className="w-full h-full object-cover"
          style={{ transformOrigin: 'center center' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,6,18,0.4) 0%, rgba(10,6,18,0) 30%, rgba(10,6,18,0.5) 70%, var(--void) 100%)',
          }}
        />

        {/* 标题浮层 */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-5xl mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-4xl"
                style={{ filter: `drop-shadow(0 0 16px ${mood.color})` }}
              >
                {mood.emoji}
              </span>
              <span
                className="font-mono text-xs uppercase tracking-[0.4em]"
                style={{ color: mood.color }}
              >
                {mood.label}
              </span>
            </div>
            <h1
              className="font-display text-5xl md:text-7xl font-bold text-cream leading-[0.95] tracking-tight"
              style={{ textShadow: '0 4px 24px rgba(0,0,0,0.8)' }}
            >
              {memory.title}
            </h1>
          </motion.div>
        </div>
      </motion.div>

      {/* 信息区 */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-0 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          <MetaItem
            icon={<Calendar size={16} />}
            label="拍摄于"
            value={new Date(memory.taken_at).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          />
          {memory.location_name && (
            <MetaItem
              icon={<MapPin size={16} />}
              label="地点"
              value={memory.location_name}
            />
          )}
          <MetaItem
            icon={<Hash size={16} />}
            label="心情"
            value={mood.label}
            accent={mood.color}
          />
        </motion.div>

        {memory.story && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-gold" />
              <span className="font-mono text-xs text-gold uppercase tracking-[0.4em]">
                Story
              </span>
            </div>
            <p className="font-display text-2xl text-cream/85 leading-relaxed italic">
              {memory.story}
            </p>
          </motion.div>
        )}

        {memory.lat != null && memory.lng != null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="font-mono text-xs text-cream/40 uppercase tracking-widest text-right"
          >
            ✦ {memory.lat.toFixed(4)}° {memory.lat >= 0 ? 'N' : 'S'} ·{' '}
            {memory.lng.toFixed(4)}° {memory.lng >= 0 ? 'E' : 'W'}
          </motion.div>
        )}
      </div>

      {/* 上一段 / 下一段 */}
      {(prev || next) && (
        <nav className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pb-24 grid grid-cols-1 md:grid-cols-2 gap-4">
          {prev ? (
            <NavCard
              direction="prev"
              memory={prev}
              onClick={() => navigate(`/memory/${prev.id}`)}
            />
          ) : (
            <div />
          )}
          {next ? (
            <NavCard
              direction="next"
              memory={next}
              onClick={() => navigate(`/memory/${next.id}`)}
            />
          ) : (
            <div />
          )}
        </nav>
      )}

      {/* 进度 + 键盘提示 */}
      {sorted.length > 1 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 glass-strong rounded-full px-4 py-2 pointer-events-none">
          <span className="font-mono text-[10px] text-cream/40 uppercase tracking-widest">
            {String(idx + 1).padStart(2, '0')} / {String(sorted.length).padStart(2, '0')}
          </span>
          <div className="h-3 w-px bg-cream/20" />
          <span className="font-mono text-[10px] text-cream/40 uppercase tracking-widest hidden sm:flex items-center gap-1.5">
            ← → 切换
          </span>
        </div>
      )}

      {/* 编辑模态框 */}
      <AnimatePresence>
        {editing && (
          <EditMemoryModal
            memory={memory}
            onClose={() => setEditing(false)}
            onSaved={(m) => setMemory(m)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MetaItem({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2 text-cream/50">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <div
        className="font-display text-xl font-semibold"
        style={{ color: accent || 'var(--cream)' }}
      >
        {value}
      </div>
    </div>
  );
}

function NavCard({
  direction,
  memory,
  onClick,
}: {
  direction: 'prev' | 'next';
  memory: Memory;
  onClick: () => void;
}) {
  const mood = MOODS[memory.mood];
  const isNext = direction === 'next';
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.4 }}
      className={`group relative glass rounded-2xl overflow-hidden flex items-stretch ${
        isNext ? 'md:flex-row-reverse text-right' : 'md:flex-row text-left'
      }`}
      style={{ boxShadow: `0 0 0 1px ${mood.color}25` }}
    >
      {/* 缩略图 */}
      <div className="w-28 h-28 flex-shrink-0 overflow-hidden">
        <img
          src={photoUrl(memory.photo_url)}
          alt={memory.title}
          className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
          style={{ transformOrigin: 'center center' }}
        />
      </div>

      {/* 文案 */}
      <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
        <div
          className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] mb-1 ${
            isNext ? 'md:justify-end' : ''
          }`}
          style={{ color: mood.color }}
        >
          {isNext ? (
            <>
              Next <ArrowRight size={10} />
            </>
          ) : (
            <>
              <ArrowLeft size={10} /> Previous
            </>
          )}
        </div>
        <div
          className={`font-display text-lg text-cream font-semibold leading-tight truncate ${
            isNext ? 'md:text-right' : ''
          }`}
        >
          {mood.emoji} {memory.title}
        </div>
        <div
          className={`font-mono text-[10px] text-cream/40 mt-1 ${
            isNext ? 'md:text-right' : ''
          }`}
        >
          {new Date(memory.taken_at).toLocaleDateString('zh-CN')}
        </div>
      </div>
    </motion.button>
  );
}

/* ----------------- 编辑模态框 ----------------- */

function EditMemoryModal({
  memory,
  onClose,
  onSaved,
}: {
  memory: Memory;
  onClose: () => void;
  onSaved: (m: Memory) => void;
}) {
  const { update } = useMemoryStore();
  const [title, setTitle] = useState(memory.title);
  const [mood, setMood] = useState<Mood>(memory.mood);
  const [takenAt, setTakenAt] = useState(memory.taken_at.slice(0, 10));
  const [locationName, setLocationName] = useState(memory.location_name ?? '');
  const [story, setStory] = useState(memory.story ?? '');
  const [saving, setSaving] = useState(false);

  // Esc 关闭
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('请给这段记忆起个名字');
      return;
    }
    setSaving(true);
    try {
      await update(memory.id, {
        title: title.trim(),
        mood,
        taken_at: takenAt,
        location_name: locationName.trim() || null,
        story: story.trim() || null,
        lat: memory.lat,
        lng: memory.lng,
      } as Partial<Memory>);
      const updated: Memory = {
        ...memory,
        title: title.trim(),
        mood,
        taken_at: takenAt,
        location_name: locationName.trim() || null,
        story: story.trim() || null,
      };
      onSaved(updated);
      toast.success('记忆已更新', '✦ Updated');
    } catch (e: any) {
      toast.error(e.message || '更新失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8"
      onClick={onClose}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(10,6,18,0.88) 0%, rgba(0,0,0,0.97) 100%)',
          backdropFilter: 'blur(16px)',
        }}
      />

      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-[1] glass-strong rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: `0 0 0 1px ${MOODS[mood].color}40, 0 30px 80px rgba(0,0,0,0.6), 0 0 60px ${MOODS[mood].glow}`,
        }}
      >
        <div className="sticky top-0 z-10 glass-strong border-b border-gold/10 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] text-gold uppercase tracking-[0.4em]">
              ✦ Edit Memory
            </div>
            <h2 className="font-display text-2xl text-cream font-semibold mt-1">
              修改记忆
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full glass flex items-center justify-center text-cream/60 hover:text-cream"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="relative aspect-video rounded-2xl overflow-hidden">
            <img
              src={photoUrl(memory.photo_url)}
              alt={memory.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
            <div className="absolute bottom-3 left-3 font-mono text-[10px] text-cream/60 uppercase tracking-widest">
              ✦ 当前照片 · 不可更改
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gold font-mono text-[10px] uppercase tracking-widest mb-2">
                标题 · Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="给这段记忆起个名字…"
              />
            </div>
            <div>
              <label className="block text-gold font-mono text-[10px] uppercase tracking-widest mb-2">
                日期 · Date
              </label>
              <input
                type="date"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
              />
            </div>
          </div>

          <MoodPicker value={mood} onChange={setMood} />

          <div>
            <label className="block text-gold font-mono text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
              <MapPin size={11} /> 地点 · Location
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="如：东京涩谷、咖啡店窗边…"
            />
            {memory.lat != null && memory.lng != null && (
              <div className="mt-2 font-mono text-[10px] text-cream/40 uppercase tracking-widest">
                ✦ 已定位 · {memory.lat.toFixed(4)}, {memory.lng.toFixed(4)}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gold font-mono text-[10px] uppercase tracking-widest">
                故事 · Story
              </label>
              <span className="font-mono text-[10px] text-cream/30">
                {story.length} / 1000
              </span>
            </div>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value.slice(0, 1000))}
              placeholder="当时发生了什么？"
              rows={6}
              className="resize-none"
            />
          </div>
        </div>

        <div className="sticky bottom-0 glass-strong border-t border-gold/10 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-cream/60 hover:text-cream font-mono text-xs uppercase tracking-widest transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg btn-gold text-xs disabled:opacity-50"
          >
            <Save size={13} />
            {saving ? '正在保存…' : '保存修改'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
