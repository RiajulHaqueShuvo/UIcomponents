import { createContext, useContext } from 'react';

export interface PremiumState {
  isPro: boolean;
  /** True while Pro was unlocked with the demo button (no payment). */
  isDemo: boolean;
  unlockDemo: () => void;
  signOut: () => void;
  openUpgrade: () => void;
}

export const PremiumContext = createContext<PremiumState | null>(null);

export function usePremium(): PremiumState {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium must be used inside <PremiumProvider>');
  return ctx;
}
