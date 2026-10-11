import { useCallback, useEffect, useState } from 'react';
import type { GuideRecord, OpportunityRecord, VisaTopic } from '@/types/opportunity';
import { opportunityRecords as seedOpportunities } from '@/data/opportunities';
import { guides as seedGuides } from '@/data/guides';
import { visaTopics as seedVisaTopics } from '@/data/visaTopics';

export type AdminSection = 'opportunities' | 'guides' | 'visa' | 'payments' | 'settings';

export interface SiteSettings {
  siteNameEn: string;
  siteNameFa: string;
  taglineEn: string;
  taglineFa: string;
  contactNoteEn: string;
  contactNoteFa: string;
  maintenanceMode: boolean;
  testMode: boolean;
  /** HesabPay QR image as data-URL (uploaded via Admin → Settings). Falls back to /assets/hesabpay-qr.png */
  hesabpayQrImage: string;
  hesabpayAccountLabel: string;
}

const OPP_KEY = 'techland_admin_opportunities';
const GUIDE_KEY = 'techland_admin_guides';
const VISA_KEY = 'techland_admin_visa';
const SETTINGS_KEY = 'techland_admin_settings';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* session-only */
  }
}

export const defaultSettings: SiteSettings = {
  siteNameEn: 'TechLand',
  siteNameFa: 'تک‌لند',
  taglineEn: 'Technology · Digital services · Opportunity information',
  taglineFa: 'تکنالوژی · خدمات دیجیتال · اطلاعات فرصت‌ها',
  contactNoteEn: 'Contact channels will be listed when confirmed.',
  contactNoteFa: 'اطلاعات تماس پس از تأیید افزوده می‌شود.',
  maintenanceMode: false,
  testMode: true,
  hesabpayQrImage: '',
  hesabpayAccountLabel: 'HesabPay',
};

export function useAdminCollection<T extends { id?: string; slug: string }>(
  storageKey: string,
  seed: T[],
) {
  const [items, setItems] = useState<T[]>(() => load<T[]>(storageKey, seed));
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    save(storageKey, items);
  }, [items, storageKey]);

  const toggleSelect = useCallback((slug: string) => {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }, []);

  const selectAll = useCallback(() => {
    setSelected(items.map((i) => i.slug));
  }, [items]);

  const clearSelection = useCallback(() => setSelected([]), []);

  const removeMany = useCallback(
    (slugs: string[]) => {
      setItems((prev) => prev.filter((i) => !slugs.includes(i.slug)));
      setSelected((prev) => prev.filter((s) => !slugs.includes(s)));
    },
    [],
  );

  const upsert = useCallback((item: T) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.slug === item.slug);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = item;
        return next;
      }
      return [item, ...prev];
    });
  }, []);

  return { items, setItems, selected, toggleSelect, selectAll, clearSelection, removeMany, upsert };
}

export function useOpportunitiesAdmin() {
  return useAdminCollection<OpportunityRecord>(OPP_KEY, seedOpportunities);
}

export function useGuidesAdmin() {
  return useAdminCollection<GuideRecord>(GUIDE_KEY, seedGuides);
}

export function useVisaAdmin() {
  return useAdminCollection<VisaTopic>(VISA_KEY, seedVisaTopics);
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(() => load<SiteSettings>(SETTINGS_KEY, defaultSettings));
  useEffect(() => {
    save(SETTINGS_KEY, settings);
  }, [settings]);
  return { settings, setSettings };
}

export function exportJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
