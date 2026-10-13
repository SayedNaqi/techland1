/**
 * Games store catalog — Admin → Games (PostgreSQL) with mock fallback.
 *
 * When VITE_API_URL is set, the catalog comes from the server: admin-uploaded
 * posters (thumbnail_url) and new games appear instantly with a NEW badge.
 * Otherwise it falls back to the static mock samples (browse-only).
 */
import { useEffect, useState } from 'react';
import { GAMES } from '@/constants/mockData';
import type { Game } from '@/types';
import { API_BASE, isBackendEnabled, mediaUrl, type ApiGame } from './api';

export interface GameRecord {
  id: string;
  slug: string;
  title: { en: string; fa: string };
  description: { en: string; fa: string };
  /** Resolved (absolute) poster URL for <img>. */
  thumbnailUrl?: string;
  screenshots: string[];
  genre: string[];
  platform: string[];
  price?: number;
  currency: string;
  accessType: 'free' | 'paid' | 'vip';
  rating?: number;
  releaseYear?: number;
  developer?: string;
  publisher?: string;
  size?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isActive?: boolean;
}

function apiToRecord(g: ApiGame): GameRecord {
  return {
    id: g.slug,
    slug: g.slug,
    title: g.title,
    description: g.description,
    thumbnailUrl: g.thumbnailUrl ? mediaUrl(g.thumbnailUrl) : undefined,
    screenshots: (g.screenshots || []).map((s) => mediaUrl(s)),
    genre: g.genre || [],
    platform: g.platform || [],
    price: g.price,
    currency: g.currency || 'USD',
    accessType: g.accessType,
    rating: g.rating,
    releaseYear: g.releaseYear,
    developer: g.developer,
    publisher: g.publisher,
    size: g.size,
    isFeatured: g.isFeatured,
    isNew: g.isNew,
    isActive: g.isActive,
  };
}

function mockToRecord(m: Game): GameRecord {
  return {
    id: m.id,
    slug: m.id,
    title: { en: m.title, fa: m.titleFa },
    description: { en: m.description, fa: m.descriptionFa },
    thumbnailUrl: m.thumbnail || undefined,
    screenshots: m.screenshots || [],
    genre: m.genre || [],
    platform: m.platform || [],
    price: m.price,
    currency: m.currency || 'USD',
    accessType: m.accessType,
    rating: m.rating,
    releaseYear: m.releaseYear,
    developer: m.developer,
    publisher: m.publisher,
    size: m.size,
    isFeatured: false,
    isNew: false,
    isActive: true,
  };
}

export const MOCK_GAME_FALLBACK: GameRecord[] = GAMES.map(mockToRecord);

async function fetchGames(): Promise<GameRecord[] | null> {
  if (!isBackendEnabled) return null;
  try {
    const res = await fetch(`${API_BASE}/api/public/games`);
    if (!res.ok) return null;
    const data = (await res.json()) as { games?: ApiGame[] };
    return (data.games ?? []).map(apiToRecord);
  } catch {
    return null;
  }
}

export function useGames(): { games: GameRecord[]; backend: boolean; live: boolean } {
  const [games, setGames] = useState<GameRecord[]>(() => MOCK_GAME_FALLBACK);
  // live === true only when the list actually came from the server catalog.
  const [live, setLive] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void fetchGames().then((list) => {
      if (!cancelled && list) {
        setGames(list);
        setLive(true);
      }
    });
    return () => { cancelled = true; };
  }, []);
  return { games, backend: isBackendEnabled, live };
}
