import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { availableOpportunityIds } from '@/data/opportunities';

interface SavedOpportunityContextValue {
  savedIds: string[];
  comparedIds: string[];
  toggleSaved: (id: string) => void;
  toggleCompared: (id: string) => void;
  clearCompared: () => void;
}

const SavedOpportunityContext = createContext<SavedOpportunityContextValue | null>(null);
const SAVED_KEY = 'techland_pathways_saved_v1';
const COMPARE_KEY = 'techland_pathways_compare_v1';

function readIds(key: string): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(key) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((value): value is string => typeof value === 'string' && availableOpportunityIds.has(value)))];
  } catch {
    return [];
  }
}

export function SavedOpportunityProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSavedIds(readIds(SAVED_KEY));
    setComparedIds(readIds(COMPARE_KEY));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds));
      window.localStorage.setItem(COMPARE_KEY, JSON.stringify(comparedIds));
    } catch {
      // The lists still work in memory when browser storage is unavailable.
    }
  }, [hydrated, savedIds, comparedIds]);

  const toggleSaved = useCallback((id: string) => {
    if (!availableOpportunityIds.has(id)) return;
    setSavedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }, []);
  const toggleCompared = useCallback((id: string) => {
    if (!availableOpportunityIds.has(id)) return;
    setComparedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length >= 4 ? current : [...current, id]);
  }, []);
  const clearCompared = useCallback(() => setComparedIds([]), []);
  const value = useMemo(() => ({ savedIds, comparedIds, toggleSaved, toggleCompared, clearCompared }), [savedIds, comparedIds, toggleSaved, toggleCompared, clearCompared]);
  return <SavedOpportunityContext.Provider value={value}>{children}</SavedOpportunityContext.Provider>;
}

export function useSavedOpportunities() {
  const context = useContext(SavedOpportunityContext);
  if (!context) throw new Error('useSavedOpportunities must be used inside SavedOpportunityProvider.');
  return context;
}
