import { motion } from 'framer-motion';

const shimmer = {
  initial: { opacity: 0.4 },
  animate: { opacity: [0.4, 0.7, 0.4] },
};

interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  delay?: number;
}

export function Skeleton({ className = '', rounded = 'lg', delay = 0 }: SkeletonProps) {
  const r =
    rounded === 'full' ? 'rounded-full' : `rounded-${rounded}`;
  return (
    <motion.div
      {...shimmer}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay }}
      className={`bg-gradient-to-r from-cream/5 via-cream/10 to-cream/5 ${r} ${className}`}
    />
  );
}

/** 拍立得骨架 */
export function PolaroidSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div className="polaroid" style={{ animation: 'none' }}>
      <Skeleton className="aspect-square w-full" rounded="sm" delay={delay} />
      <div className="pt-3 px-1 space-y-2">
        <Skeleton className="h-4 w-3/4" delay={delay + 0.05} />
        <Skeleton className="h-3 w-1/2" delay={delay + 0.1} />
      </div>
    </div>
  );
}

/** 拍立得墙骨架 */
export function PolaroidGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
      {Array.from({ length: count }).map((_, i) => (
        <PolaroidSkeleton key={i} delay={i * 0.04} />
      ))}
    </div>
  );
}

/** 时间线节点骨架 */
export function TimelineSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-8">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}
        >
          <div className="md:w-[calc(50%-3.5rem)] w-full">
            <div className="glass rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-12">
                <div className="sm:col-span-3 p-6 border-r border-gold/10">
                  <Skeleton className="h-12 w-16" delay={i * 0.05} />
                </div>
                <div className="sm:col-span-9 p-6 space-y-3">
                  <Skeleton className="aspect-[16/10] w-full" delay={i * 0.05 + 0.05} />
                  <Skeleton className="h-5 w-2/3" delay={i * 0.05 + 0.1} />
                  <Skeleton className="h-3 w-full" delay={i * 0.05 + 0.12} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** 详情页骨架 */
export function DetailSkeleton() {
  return (
    <div className="space-y-12">
      <Skeleton className="w-full h-[70vh]" rounded="xl" />
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" delay={0.05} />
          <Skeleton className="h-20" delay={0.1} />
        </div>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}
