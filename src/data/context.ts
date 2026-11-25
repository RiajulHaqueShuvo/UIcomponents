import { createContext, useContext } from 'react';
import type { Category, CategoryId, RegistryEntry } from '../registry/types';
import type { SiteSettings } from './siteDefaults';

export interface SiteData {
  /** 'offline' = the API couldn't be reached; the built-in library still works. */
  status: 'loading' | 'ready' | 'offline';
  settings: SiteSettings;
  categories: Category[];
  /** Built-in + published server components, in sidebar order. */
  entries: RegistryEntry[];
  documents: { slug: string; title: string }[];
  getEntry: (slug: string) => RegistryEntry | undefined;
  entriesByCategory: (id: CategoryId) => RegistryEntry[];
  /** Re-fetch after the admin changes something. */
  reload: () => void;
}

export const SiteDataContext = createContext<SiteData | null>(null);

export function useSiteData(): SiteData {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error('useSiteData must be used inside <SiteDataProvider>');
  return ctx;
}
