import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const GLYPHS = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJ';

// 解码式文字：先显示乱码字符，逐个解码回真实字符
export function TextScramble({
  text,
  className = '',
  delay = 0,
  duration = 1.2,
}: {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const [out, setOut] = useState(() =>
    text.split('').map(() => GLYPHS[Math.floor(Math.random() * GLYPHS.length)])
  );

  useEffect(() => {
    let cancelled = false;
    const queue: Array<{ i: number; start: number; end: number; char: string }> = [];
    text.split('').forEach((ch, i) => {
      if (ch === ' ') return;
      const from = delay + i * 0.04;
      const to = from + duration * 0.5;
      queue.push({ i, start: from, end: to, char: ch });
    });

    const raf = (t: number) => {
      if (cancelled) return;
      setOut((prev) => {
        const next = [...prev];
        queue.forEach((q) => {
          if (t / 1000 >= q.start && t / 1000 <= q.end) {
            next[q.i] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          } else if (t / 1000 > q.end) {
            next[q.i] = q.char;
          }
        });
        return next;
      });
      if (t / 1000 < delay + text.length * 0.04 + duration + 0.1) {
        requestAnimationFrame(raf);
      }
    };
    const id = requestAnimationFrame(raf);
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [text, delay, duration]);

  return (
    <span className={className}>
      {text.split('').map((ch, i) => (
        <span key={i} className="inline-block whitespace-pre">
          {ch === ' ' ? '\u00A0' : out[i] || ch}
        </span>
      ))}
    </span>
  );
}

// 字符逐个淡入上滑
export function TextReveal({
  text,
  className = '',
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <span className={className}>
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            delay: delay + i * 0.035,
            duration: 0.7,
            ease: [0.2, 0.8, 0.2, 1],
          }}
          className="inline-block whitespace-pre"
        >
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </span>
  );
}
