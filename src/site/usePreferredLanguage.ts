import { useCallback, useSyncExternalStore } from 'react';
import type { Language } from '../registry/types';

/*
 * The visitor's preferred code language (React or HTML/CSS/JS), remembered
 * across pages and visits. When a component doesn't have that version,
 * the page falls back to the one it does have.
 */
const KEY = 'uic:language';
const listeners = new Set<() => void>();

const read = (): Language => (localStorage.getItem(KEY) === 'html' ? 'html' : 'react');

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function usePreferredLanguage(): [Language, (l: Language) => void] {
  const lang = useSyncExternalStore(subscribe, read, () => 'react' as Language);
  const set = useCallback((l: Language) => {
    localStorage.setItem(KEY, l);
    listeners.forEach((fn) => fn());
  }, []);
  return [lang, set];
}
