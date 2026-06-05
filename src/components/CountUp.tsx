import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function CountUp({
  to,
  duration = 1.6,
  delay = 0,
  className = '',
}: {
  to: number;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let start: number | null = null;
    let raf = 0;
    const step = (t: number) => {
      if (cancelled) return;
      if (start === null) start = t;
      const elapsed = (t - start) / 1000;
      if (elapsed < delay) {
        raf = requestAnimationFrame(step);
        return;
      }
      const p = Math.min(1, (elapsed - delay) / duration);
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setVal(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [to, duration, delay]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
    >
      {val}
    </motion.span>
  );
}
