import { useEffect, useState } from 'react';
import { useMemoryStore } from '@/store/useMemoryStore';
import { MOODS } from '@/utils/moods';

/**
 * 底部 "Now Showing" 字幕条
 * - 类似电影滚动字幕
 * - 显示最近 12 段记忆的标题 + 心情 + 日期
 * - 持续循环滚动
 */
export function NowShowingTicker() {
  const { memories, fetchAll } = useMemoryStore();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (memories.length === 0) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = memories.slice(0, 12);
  if (items.length < 2) return null;

  return (
    <div
      className="now-showing-bar"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center gap-3 px-4 py-2 border-t border-b border-gold/15 bg-ink/60 backdrop-blur-md">
        {/* LIVE 标签 */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-aurora2 animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-aurora2">
            now showing
          </span>
        </div>
        <div className="h-3 w-px bg-gold/20 flex-shrink-0" />
        {/* 滚动内容 */}
        <div className="flex-1 overflow-hidden relative h-5">
          <div
            className="ticker-track flex items-center gap-8 whitespace-nowrap absolute top-0"
            style={{ animationPlayState: paused ? 'paused' : 'running' }}
          >
            {[...items, ...items].map((m, i) => {
              const mood = MOODS[m.mood];
              return (
                <span
                  key={`${m.id}-${i}`}
                  className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-cream/60"
                >
                  <span style={{ color: mood.color }}>{mood.emoji}</span>
                  <span className="text-cream/80">{m.title}</span>
                  {m.location_name && (
                    <span className="text-cream/40">· {m.location_name}</span>
                  )}
                  <span className="text-cream/30">·</span>
                  <span className="text-cream/40">
                    {new Date(m.taken_at).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-gold/30">✦</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
