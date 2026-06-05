import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TextReveal } from '@/components/TextReveal';

interface BookCoverProps {
  onOpen: () => void;
}

export function BookCover({ onOpen }: BookCoverProps) {
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpening(true), 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ perspective: 2000 }}
    >
      {/* 3D 翻书容器 */}
      <motion.div
        initial={{ rotateY: 0 }}
        animate={{ rotateY: opening ? -160 : 0 }}
        transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1], delay: 0.4 }}
        onAnimationComplete={() => {
          if (opening) setTimeout(onOpen, 600);
        }}
        className="relative w-[420px] h-[560px]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 封面 */}
        <div
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #1a0f2e 0%, #0a0612 100%)',
            boxShadow:
              '0 30px 80px rgba(0, 0, 0, 0.7), 0 0 60px rgba(212, 175, 55, 0.15), inset 0 0 0 1px rgba(212, 175, 55, 0.3)',
          }}
        >
          {/* 鎏金边框装饰 */}
          <div className="absolute inset-4 border border-gold/30 rounded" />
          <div className="absolute inset-6 border border-gold/15 rounded" />

          {/* 中央 Logo */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="font-display text-6xl text-gold-shine font-bold tracking-wider leading-none"
            >
              ✦
            </motion.div>

            <h1
              className="mt-6 font-display text-5xl font-semibold tracking-wider leading-[1.05]"
              style={{ lineHeight: 1.05 }}
            >
              <div className="block text-gold-shine">
                <TextReveal text="Memory" delay={0.5} />
              </div>
              <div className="block text-gold-shine italic font-light mt-1">
                <TextReveal text="Atlas" delay={1.0} />
              </div>
            </h1>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ duration: 1, delay: 1.6 }}
              className="h-px bg-gold mt-6"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.8 }}
              className="mt-6 font-body text-cream/70 text-sm tracking-[0.3em] uppercase"
            >
              记 忆 星 图
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 2.0 }}
              className="mt-2 font-display italic text-cream/40 text-xs"
            >
              a celestial archive of moments
            </motion.p>
          </div>

          {/* 底部装饰：开放按钮提示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.2 }}
            className="absolute bottom-8 left-0 right-0 text-center"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpening(true);
              }}
              className="font-mono text-[10px] text-gold uppercase tracking-[0.4em] hover:text-cream transition-colors"
            >
              — Click to open —
            </button>
          </motion.div>
        </div>

        {/* 内页（翻开后看到的） */}
        <div
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #2a1f3e 0%, #1a0f2e 100%)',
            boxShadow: 'inset 0 0 60px rgba(0, 0, 0, 0.8)',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: opening ? 1 : 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="font-display italic text-cream/40 text-2xl"
            >
              ✦ a journey begins ✦
            </motion.div>
          </div>
        </div>

        {/* 书脊阴影 */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.6), transparent)',
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      {/* 底部引导 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="absolute bottom-12 left-0 right-0 text-center"
      >
        <p className="font-mono text-[10px] text-cream/40 uppercase tracking-[0.3em]">
          翻开 · 看见你的星图
        </p>
      </motion.div>
    </motion.div>
  );
}
