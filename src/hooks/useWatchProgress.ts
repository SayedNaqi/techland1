import { useCallback } from 'react';

const KEY = 'techland_watch_progress';

interface ProgressEntry {
  id: string;
  type: 'movie' | 'series';
  progress: number; // 0-100
  currentTime?: number; // seconds
  season?: number;
  episode?: number;
  updatedAt: string;
}

function loadAll(): Record<string, ProgressEntry> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, ProgressEntry>) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function useWatchProgress() {
  const saveProgress = useCallback((entry: Omit<ProgressEntry, 'updatedAt'>) => {
    const all = loadAll();
    all[entry.id] = { ...entry, updatedAt: new Date().toISOString() };
    saveAll(all);
  }, []);

  const getProgress = useCallback((id: string): ProgressEntry | null => {
    const all = loadAll();
    return all[id] || null;
  }, []);

  const getAllProgress = useCallback((): ProgressEntry[] => {
    return Object.values(loadAll()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, []);

  const clearProgress = useCallback((id: string) => {
    const all = loadAll();
    delete all[id];
    saveAll(all);
  }, []);

  return { saveProgress, getProgress, getAllProgress, clearProgress };
}
