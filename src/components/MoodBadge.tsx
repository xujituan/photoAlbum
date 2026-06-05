import { MOODS } from '@/utils/moods';
import type { Mood } from '@/utils/moods';

interface MoodBadgeProps {
  mood: Mood;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function MoodBadge({ mood, size = 'sm', showLabel = true }: MoodBadgeProps) {
  const meta = MOODS[mood];
  const sizes = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono uppercase tracking-wider ${sizes[size]}`}
      style={{
        color: meta.color,
        background: `linear-gradient(135deg, ${meta.color}20, ${meta.color}05)`,
        border: `1px solid ${meta.color}60`,
        boxShadow: `0 0 12px ${meta.glow}`,
      }}
    >
      <span className="text-base leading-none">{meta.emoji}</span>
      {showLabel && <span>{meta.label}</span>}
    </span>
  );
}
