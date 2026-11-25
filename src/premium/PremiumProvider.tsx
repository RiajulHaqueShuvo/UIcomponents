import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { PremiumContext, type PremiumState } from './context';
import UpgradeModal from './UpgradeModal';

/*
 * Who is Pro?
 *
 * IMPORTANT: today this is decided in the browser (localStorage), so it is a
 * demo gate, not real protection. Anyone with dev tools can unlock it.
 * For real sales: verify the purchase on a server (after the payment
 * webhook) and have the site ask the server "is this user Pro?". Only this
 * file needs to change; the rest of the site just calls usePremium().
 */
const STORAGE_KEY = 'uic:pro-demo';

export default function PremiumProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(() => localStorage.getItem(STORAGE_KEY) === '1');
  const [modalOpen, setModalOpen] = useState(false);

  const unlockDemo = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, '1');
    setIsDemo(true);
    setModalOpen(false);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsDemo(false);
    setModalOpen(false);
  }, []);

  const value = useMemo<PremiumState>(
    () => ({
      isPro: isDemo,
      isDemo,
      unlockDemo,
      signOut,
      openUpgrade: () => setModalOpen(true),
    }),
    [isDemo, unlockDemo, signOut]
  );

  return (
    <PremiumContext.Provider value={value}>
      {children}
      {modalOpen && <UpgradeModal onClose={() => setModalOpen(false)} />}
    </PremiumContext.Provider>
  );
}
