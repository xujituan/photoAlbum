import type { Memory, MemoryStats, Mood } from './moods';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || '请求失败');
  }
  return res.json();
}

export const api = {
  list(params?: { mood?: Mood; year?: string; q?: string }) {
    const qs = new URLSearchParams();
    if (params?.mood) qs.append('mood', params.mood);
    if (params?.year) qs.append('year', params.year);
    if (params?.q) qs.append('q', params.q);
    const q = qs.toString();
    return request<Memory[]>(`/memories${q ? `?${q}` : ''}`);
  },
  get: (id: string) => request<Memory>(`/memories/${id}`),
  stats: () => request<MemoryStats>('/memories/stats'),
  create(formData: FormData) {
    return request<Memory>('/memories', { method: 'POST', body: formData });
  },
  update: (id: string, data: Partial<Memory>) =>
    request<Memory>(`/memories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    request<{ ok: true }>(`/memories/${id}`, { method: 'DELETE' }),
};

// 完整 URL 用于照片（dev 走 vite proxy，prod 直接拼）
export const photoUrl = (path: string | null | undefined) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return path;
};
