export type Mood =
  | 'joyful'
  | 'nostalgic'
  | 'peaceful'
  | 'exciting'
  | 'melancholy'
  | 'romantic'
  | 'adventurous'
  | 'contemplative';

export interface Memory {
  id: string;
  title: string;
  photo_url: string;
  taken_at: string;
  location_name: string | null;
  lat: number | null;
  lng: number | null;
  mood: Mood;
  story: string | null;
  created_at: string;
}

export interface MemoryStats {
  total: number;
  years: string[];
  moodCount: Record<string, number>;
  latestAt: string | null;
}

export interface MoodMeta {
  key: Mood;
  label: string;
  emoji: string;
  color: string;       // hex 主色
  glow: string;        // rgba glow
  description: string;
}

export const MOODS: Record<Mood, MoodMeta> = {
  joyful: {
    key: 'joyful',
    label: '欢欣',
    emoji: '🌟',
    color: '#00ffa3',
    glow: 'rgba(0, 255, 163, 0.5)',
    description: '那一刻的喜悦像星光一样闪耀',
  },
  nostalgic: {
    key: 'nostalgic',
    label: '怀旧',
    emoji: '🌙',
    color: '#d4af37',
    glow: 'rgba(212, 175, 55, 0.5)',
    description: '时间在这里留下了鎏金的痕迹',
  },
  peaceful: {
    key: 'peaceful',
    label: '宁静',
    emoji: '🌊',
    color: '#00d4ff',
    glow: 'rgba(0, 212, 255, 0.5)',
    description: '心湖如镜，万物安眠',
  },
  exciting: {
    key: 'exciting',
    label: '兴奋',
    emoji: '⚡',
    color: '#ff006e',
    glow: 'rgba(255, 0, 110, 0.5)',
    description: '肾上腺素在血管里跳舞',
  },
  melancholy: {
    key: 'melancholy',
    label: '忧伤',
    emoji: '🍂',
    color: '#9d7bb0',
    glow: 'rgba(157, 123, 176, 0.5)',
    description: '有些美只属于雨天',
  },
  romantic: {
    key: 'romantic',
    label: '浪漫',
    emoji: '🌹',
    color: '#ff5e8a',
    glow: 'rgba(255, 94, 138, 0.5)',
    description: '时间想停下来，又舍不得',
  },
  adventurous: {
    key: 'adventurous',
    label: '冒险',
    emoji: '🗻',
    color: '#ff8c42',
    glow: 'rgba(255, 140, 66, 0.5)',
    description: '把足迹留在地图上没有的地方',
  },
  contemplative: {
    key: 'contemplative',
    label: '沉思',
    emoji: '💭',
    color: '#7fa6c2',
    glow: 'rgba(127, 166, 194, 0.5)',
    description: '和世界隔着一层薄雾对话',
  },
};

export const MOOD_LIST: MoodMeta[] = Object.values(MOODS);
