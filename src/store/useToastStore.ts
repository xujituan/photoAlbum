import { create } from 'zustand';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}

let _id = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = ++_id;
    const toast: Toast = { id, duration: 3200, ...t };
    set((s) => ({ toasts: [...s.toasts, toast] }));
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
      }, toast.duration);
    }
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

// 便捷 API
export const toast = {
  success: (message: string, title?: string) =>
    useToastStore.getState().push({ kind: 'success', message, title }),
  error: (message: string, title?: string) =>
    useToastStore.getState().push({ kind: 'error', message, title, duration: 4800 }),
  info: (message: string, title?: string) =>
    useToastStore.getState().push({ kind: 'info', message, title }),
};
