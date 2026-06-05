import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, MapPin, Save, X, ChevronLeft, ChevronRight, Camera, Type, BookOpen } from 'lucide-react';
import { MoodPicker } from '@/components/MoodPicker';
import { MemoryMap } from '@/components/MemoryMap';
import { useMemoryStore } from '@/store/useMemoryStore';
import { toast } from '@/store/useToastStore';
import type { Mood } from '@/utils/moods';
import { MOODS } from '@/utils/moods';

type Step = 0 | 1 | 2;
const STEP_META = [
  { key: 0, label: '照片', icon: Camera, hint: '上传一张照片作为回忆的载体' },
  { key: 1, label: '元信息', icon: Type, hint: '为它定个时间、地点与心情' },
  { key: 2, label: '故事', icon: BookOpen, hint: '写下当时发生了什么' },
] as const;

export function AddMemory() {
  const navigate = useNavigate();
  const { add } = useMemoryStore();

  const [step, setStep] = useState<Step>(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [title, setTitle] = useState('');
  const [mood, setMood] = useState<Mood>('peaceful');
  const [story, setStory] = useState('');
  const [takenAt, setTakenAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [locationName, setLocationName] = useState('');
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) handleFile(f);
  };

  // 步骤校验
  const canGoNext = (s: Step) => {
    if (s === 0) return !!file;
    if (s === 1) return title.trim().length > 0;
    return true;
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('请先上传一张照片');
      return;
    }
    if (!title.trim()) {
      setError('请给这段记忆起个名字');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      fd.append(
        'metadata',
        JSON.stringify({
          title: title.trim(),
          mood,
          taken_at: takenAt,
          lat: picked?.lat ?? null,
          lng: picked?.lng ?? null,
          location_name: locationName.trim() || null,
          story: story.trim() || null,
        })
      );
      const memory = await add(fd);
      toast.success('记忆已保存', '✦ New Memory');
      navigate(`/memory/${memory.id}`);
    } catch (e: any) {
      const msg = e.message || '保存失败';
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
    }
  };

  const meta = STEP_META[step];
  const m = MOODS[mood];

  return (
    <div className="relative z-10 min-h-screen px-6 md:px-12 py-24 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-12 bg-gold" />
          <span className="font-mono text-xs text-gold uppercase tracking-[0.4em]">
            New Memory
          </span>
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-cream leading-[0.95] tracking-tight">
          记录一段回忆
        </h1>
        <p className="mt-3 font-display italic text-lg text-cream/55">
          当时的光、当时的人、当时的心情
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* 左侧：步骤 */}
        <div>
          {/* 步骤指示 */}
          <div className="flex items-center gap-2 mb-6">
            {STEP_META.map((s, i) => {
              const Icon = s.icon;
              const active = step === i;
              const done = step > i;
              return (
                <button
                  key={i}
                  onClick={() => i < step && setStep(i as Step)}
                  disabled={i > step}
                  className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                    active
                      ? 'glass-strong'
                      : done
                      ? 'glass cursor-pointer hover:border-gold/30'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono ${
                      active
                        ? 'bg-gold text-void'
                        : done
                        ? 'bg-gold/30 text-gold'
                        : 'bg-cream/10 text-cream/50'
                    }`}
                  >
                    {done ? '✓' : <Icon size={12} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-cream/40">
                      step {i + 1}
                    </div>
                    <div
                      className={`text-sm ${
                        active ? 'text-cream' : 'text-cream/60'
                      }`}
                    >
                      {s.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 当前步骤内容 */}
          <div className="glass rounded-2xl p-6 md:p-8 min-h-[480px]">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-12 bg-gold" />
              <span className="font-mono text-xs text-gold uppercase tracking-[0.4em]">
                ✦ {meta.label}
              </span>
            </div>
            <p className="text-cream/50 text-sm mb-6 -mt-4">{meta.hint}</p>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`relative rounded-2xl overflow-hidden transition-all ${
                      dragOver ? 'ring-2 ring-gold scale-[1.01]' : 'ring-1 ring-gold/30'
                    }`}
                    style={{
                      border: '1px dashed rgba(212, 175, 55, 0.4)',
                      background: dragOver
                        ? 'rgba(212, 175, 55, 0.08)'
                        : 'rgba(26, 15, 46, 0.4)',
                    }}
                  >
                    {preview ? (
                      <div className="relative aspect-video">
                        <img src={preview} alt="预览" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            setPreview(null);
                          }}
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-void/80 backdrop-blur flex items-center justify-center text-cream hover:bg-aurora2/80 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer py-16 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFile(f);
                          }}
                        />
                        <div className="inline-flex w-16 h-16 rounded-full glass items-center justify-center mb-4">
                          <Upload size={24} className="text-gold" />
                        </div>
                        <p className="font-display text-xl text-cream mb-2">
                          拖拽照片到这里
                        </p>
                        <p className="text-cream/50 text-sm">
                          或点击选择文件 · 支持 jpg / png / webp
                        </p>
                      </label>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gold font-mono text-xs uppercase tracking-widest mb-3">
                        标题 · Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="给这段记忆起个名字…"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-gold font-mono text-xs uppercase tracking-widest mb-3">
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
                    <label className="block text-gold font-mono text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                      <MapPin size={12} /> 地点 · Location（可选）
                    </label>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="如：东京涩谷、咖啡店窗边…"
                      className="mb-4"
                    />
                    <MemoryMap
                      memories={[]}
                      center={picked ? [picked.lat, picked.lng] : [20, 0]}
                      zoom={picked ? 6 : 2}
                      height="280px"
                      pickMode
                      onPick={(lat, lng) => setPicked({ lat, lng })}
                      pickedLocation={picked}
                    />
                    {picked && (
                      <div className="mt-3 font-mono text-[10px] text-gold uppercase tracking-widest">
                        ✦ 已选 · {picked.lat.toFixed(4)}, {picked.lng.toFixed(4)}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-gold font-mono text-xs uppercase tracking-widest">
                        故事 · Story
                      </label>
                      <span className="font-mono text-[10px] text-cream/30">
                        {story.length} / 1000
                      </span>
                    </div>
                    <textarea
                      value={story}
                      onChange={(e) => setStory(e.target.value.slice(0, 1000))}
                      placeholder="当时发生了什么？想到了什么？有什么味道、声音、温度？"
                      rows={10}
                      className="resize-none"
                      autoFocus
                    />
                    <p className="text-cream/40 text-xs mt-3">
                      ✦ 这一段将和照片、时间、心情一起成为你星图中的一颗星
                    </p>
                  </div>

                  {error && (
                    <div className="glass rounded-lg p-4 border border-aurora2/40 text-aurora2 text-sm">
                      {error}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 步骤操作 */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gold/10">
              <button
                type="button"
                onClick={() => (step === 0 ? navigate(-1) : setStep((step - 1) as Step))}
                className="flex items-center gap-2 px-4 py-2 text-cream/60 hover:text-cream font-mono text-xs uppercase tracking-widest transition-colors"
              >
                <ChevronLeft size={14} />
                {step === 0 ? '取消' : '上一步'}
              </button>

              {step < 2 ? (
                <button
                  type="button"
                  onClick={() => canGoNext(step) && setStep((step + 1) as Step)}
                  disabled={!canGoNext(step)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg btn-gold text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  下一步
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg btn-gold text-xs disabled:opacity-50"
                >
                  <Save size={14} />
                  {submitting ? '正在保存…' : '保存这段记忆'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：实时预览 */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-cream/40 flex items-center gap-2">
              <div className="h-px w-8 bg-cream/30" />
              实时预览
            </div>

            <motion.div
              layout
              className="polaroid relative"
              style={{
                boxShadow: `0 0 0 1px ${m.color}40, 0 12px 40px rgba(0,0,0,0.5), 0 0 32px ${m.glow}`,
                animation: 'none',
              }}
            >
              <div
                className="relative aspect-square overflow-hidden rounded-sm"
                style={{ boxShadow: `inset 0 0 0 2px ${m.color}30` }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-ink/50 text-cream/30">
                    <Camera size={32} />
                    <span className="mt-2 font-mono text-[10px] uppercase tracking-widest">
                      等待照片
                    </span>
                  </div>
                )}
                <div
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm backdrop-blur-md"
                  style={{
                    background: `radial-gradient(circle, ${m.color}80, ${m.color}30)`,
                    boxShadow: `0 0 12px ${m.glow}`,
                  }}
                >
                  {m.emoji}
                </div>
              </div>
              <div className="pt-3 px-1">
                <div className="font-display text-ink text-lg font-semibold leading-tight line-clamp-1">
                  {title.trim() || '未命名记忆'}
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-ink/60">
                  <span>
                    {new Date(takenAt).toLocaleDateString('zh-CN')}
                  </span>
                  {locationName && (
                    <span className="max-w-[60%] truncate flex items-center gap-1">
                      <MapPin size={9} />
                      {locationName}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* 故事预览 */}
            {story.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-4"
              >
                <div className="font-mono text-[10px] uppercase tracking-widest text-gold/70 mb-2">
                  ✦ story
                </div>
                <p className="text-cream/70 text-xs leading-relaxed italic line-clamp-6">
                  {story}
                </p>
              </motion.div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
