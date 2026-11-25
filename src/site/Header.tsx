import { Link } from 'react-router-dom';
import { useSiteData } from '../data/context';
import { usePremium } from '../premium/context';

interface HeaderProps {
  onMenu: () => void;
}

export default function Header({ onMenu }: HeaderProps) {
  const { isPro, isDemo, openUpgrade } = usePremium();
  const { settings, entries } = useSiteData();

  return (
    <header className="header">
      <button className="header__menu" aria-label="Open menu" onClick={onMenu}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <Link to="/" className="header__brand">
        <span className="header__logo" aria-hidden="true" />
        {settings.siteName}
      </Link>
      <span className="header__badge">{entries.length} components</span>
      <span className="header__spacer" />
      <Link to="/palette" className="header__link">Color Palette</Link>
      <kbd className="header__kbd" title="Focus search">Ctrl K</kbd>
      {isPro ? (
        <button className="header__pro header__pro--active" onClick={openUpgrade}>
          PRO{isDemo && ' · demo'}
        </button>
      ) : (
        <button className="header__pro" onClick={openUpgrade}>
          Go Pro
        </button>
      )}
    </header>
  );
}
