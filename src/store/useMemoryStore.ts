import { create } from 'zustand';
import type { Memory, Mood } from '@/utils/moods';
import { api } from '@/utils/api';

interface MemoryState {
  memories: Memory[];
  stats: { total: number; years: string[]; moodCount: Record<string, number>; latestAt: string | null } | null;
  loading: boolean;
  error: string | null;
  filterMood: Mood | null;
  filterYear: string | null;
  searchQ: string;

  setFilterMood: (m: Mood | null) => void;
  setFilterYear: (y: string | null) => void;
  setSearchQ: (q: string) => void;

  fetchAll: () => Promise<void>;
  fetchStats: () => Promise<void>;
  add: (formData: FormData) => Promise<Memory>;
  remove: (id: string) => Promise<void>;
  update: (id: string, data: Partial<Memory>) => Promise<void>;
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: [],
  stats: null,
  loading: false,
  error: null,
  filterMood: null,
  filterYear: null,
  searchQ: '',

  setFilterMood: (m) => set({ filterMood: m }),
  setFilterYear: (y) => set({ filterYear: y }),
  setSearchQ: (q) => set({ searchQ: q }),

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const { filterMood, filterYear, searchQ } = get();
      const list = await api.list({
        mood: filterMood || undefined,
        year: filterYear || undefined,
        q: searchQ || undefined,
      });
      set({ memories: list, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e.message });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await api.stats();
      set({ stats });
    } catch (e) {
      // 静默
    }
  },

  add: async (formData: FormData) => {
    const memory = await api.create(formData);
    set((s) => ({ memories: [memory, ...s.memories] }));
    get().fetchStats();
    return memory;
  },

  remove: async (id: string) => {
    await api.remove(id);
    set((s) => ({ memories: s.memories.filter((m) => m.id !== id) }));
    get().fetchStats();
  },

  update: async (id, data) => {
    const updated = await api.update(id, data);
    set((s) => ({ memories: s.memories.map((m) => (m.id === id ? updated : m)) }));
  },
}));
