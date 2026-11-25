import { useEffect, useRef } from 'react';
import { useSiteData } from '../data/context';
import { usePremium } from './context';

export default function UpgradeModal({ onClose }: { onClose: () => void }) {
  const { isPro, unlockDemo, signOut } = usePremium();
  // Price, features and payment link are edited in Admin → Settings.
  const PRO_PLAN = useSiteData().settings.pro;
  const dialogRef = useRef<HTMLDivElement>(null);

  // Escape closes; focus moves into the dialog.
  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const canBuy = PRO_PLAN.checkoutUrl !== '';

  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className="modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
        tabIndex={-1}
      >
        <button className="modal__close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <span className="pro-pill">PRO</span>
        <h2 id="upgrade-title" className="modal__title">
          {isPro ? 'You have Pro' : 'Unlock Customize'}
        </h2>

        {isPro ? (
          <>
            <p className="modal__lead">
              Pro is active in <strong>demo mode</strong> on this browser. No payment was made.
            </p>
            <button className="btn btn--ghost modal__full" onClick={signOut}>
              Turn off demo Pro
            </button>
          </>
        ) : (
          <>
            <p className="modal__lead">
              Change colours, text, speed and more with live controls, then copy code made from your
              settings.
            </p>
            <p className="modal__price">
              {PRO_PLAN.price}
              <span> {PRO_PLAN.period}</span>
            </p>
            <ul className="modal__features">
              {PRO_PLAN.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            {canBuy ? (
              <a className="btn btn--primary modal__full" href={PRO_PLAN.checkoutUrl} target="_blank" rel="noreferrer">
                Buy {PRO_PLAN.name}
              </a>
            ) : (
              <button className="btn btn--primary modal__full" disabled>
                Buy Pro: payments coming soon
              </button>
            )}
            <button className="btn btn--ghost modal__full" onClick={unlockDemo}>
              Try Pro free (demo mode)
            </button>
          </>
        )}
      </div>
    </div>
  );
}
