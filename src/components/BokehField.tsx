import { useMemo } from 'react';

/**
 * 飘动的 bokeh 散景粒子
 * - 多个柔光球体缓慢上升
 * - 性能：使用 CSS animation 而非 requestAnimationFrame
 */
export function BokehField() {
  const dots = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => {
      const size = 30 + Math.random() * 110;
      const x = (i * 67 + 13) % 100;
      const yStart = 100 + Math.random() * 30;
      const dur = 18 + (i % 7) * 4;
      const delay = -(i * 1.7);
      const hue =
        i % 4 === 0
          ? 'rgba(212, 175, 55,' // gold
          : i % 4 === 1
          ? 'rgba(255, 0, 110,' // aurora-2
          : i % 4 === 2
          ? 'rgba(0, 212, 255,' // aurora-3
          : 'rgba(0, 255, 163,'; // aurora-1
      const opacity = 0.04 + (i % 3) * 0.02;
      return { i, size, x, yStart, dur, delay, hue, opacity };
    });
  }, []);

  return (
    <div className="bokeh-field" aria-hidden>
      {dots.map((d) => (
        <div
          key={d.i}
          className="bokeh-dot"
          style={{
            width: `${d.size}px`,
            height: `${d.size}px`,
            left: `${d.x}%`,
            top: `${d.yStart}%`,
            background: `radial-gradient(circle, ${d.hue}${d.opacity}) 0%, transparent 65%)`,
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
