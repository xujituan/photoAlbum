import { MOOD_LIST } from '@/utils/moods';
import type { Mood } from '@/utils/moods';

interface MoodPickerProps {
  value: Mood | null;
  onChange: (m: Mood) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div>
      <label className="block text-gold font-mono text-xs uppercase tracking-widest mb-3">
        当时心情 · Mood
      </label>
      <div className="grid grid-cols-4 gap-3">
        {MOOD_LIST.map((m) => {
          const active = value === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => onChange(m.key)}
              className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 ${
                active ? 'scale-105' : 'hover:scale-105 opacity-70 hover:opacity-100'
              }`}
              style={{
                background: active
                  ? `linear-gradient(135deg, ${m.color}30, ${m.color}10)`
                  : 'rgba(26, 15, 46, 0.4)',
                border: active ? `1px solid ${m.color}` : '1px solid rgba(212, 175, 55, 0.15)',
                boxShadow: active
                  ? `0 0 20px ${m.glow}, inset 0 0 12px ${m.glow}`
                  : 'none',
              }}
            >
              <span
                className="text-3xl transition-transform group-hover:scale-110"
                style={{ filter: active ? `drop-shadow(0 0 8px ${m.color})` : 'none' }}
              >
                {m.emoji}
              </span>
              <span
                className="font-mono text-[10px] uppercase tracking-wider"
                style={{ color: active ? m.color : '#f5e6d3' }}
              >
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
