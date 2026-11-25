import type { CSSProperties } from 'react';
import { readableOn } from './color';
import { ranked, roleOf, type Swatch, type Theme } from './model';

/** CSS variables every demo reads, so one palette paints all of them. */
export const themeVars = (t: Theme) =>
  ({
    '--p-bg': t.bg,
    '--p-surface': t.surface,
    '--p-primary': t.primary,
    '--p-accent': t.accent,
    '--p-text': t.text,
    '--p-muted': t.textMuted,
    '--p-on-surface': t.onSurface,
    '--p-on-primary': t.onPrimary,
    '--p-on-accent': t.onAccent,
    '--p-border': t.border,
  }) as CSSProperties;

/* ---------- Share bar + area mosaic ---------- */

export function ShareBar({ swatches }: { swatches: Swatch[] }) {
  return (
    <div className="pal-sharebar" role="img" aria-label="Colour shares">
      {ranked(swatches)
        .filter((s) => s.percent > 0)
        .map((s) => (
          <span key={s.id} style={{ flexGrow: s.percent, background: s.hex, color: readableOn(s.hex) }}>
            {s.percent >= 6 && `${s.percent}%`}
          </span>
        ))}
    </div>
  );
}

/** Blocks whose areas match the shares, so you can "see" 60 / 30 / 10. */
export function Mosaic({ swatches }: { swatches: Swatch[] }) {
  const items = ranked(swatches).filter((s) => s.percent > 0);
  return (
    <div className="pal-mosaic">
      <MosaicPart items={items} all={swatches} row />
    </div>
  );
}

function MosaicPart({ items, all, row }: { items: Swatch[]; all: Swatch[]; row: boolean }) {
  const [first, ...rest] = items;
  if (!first) return null;
  const restShare = rest.reduce((n, s) => n + s.percent, 0);
  return (
    <div className="pal-mosaic__part" style={{ flexDirection: row ? 'row' : 'column' }}>
      <div
        className="pal-mosaic__block"
        style={{ flexGrow: first.percent, background: first.hex, color: readableOn(first.hex) }}
      >
        <strong>{first.percent}%</strong>
        <span>{roleOf(all, first.id)}</span>
        <code>{first.hex}</code>
      </div>
      {rest.length > 0 && (
        <div className="pal-mosaic__rest" style={{ flexGrow: restShare }}>
          <MosaicPart items={rest} all={all} row={!row} />
        </div>
      )}
    </div>
  );
}

/* ---------- Sale banner ---------- */

export interface DemoText {
  brand: string;
  headline: string;
}

export function BannerDemo({ theme, text }: { theme: Theme; text: DemoText }) {
  return (
    <div className="pal-banner" style={themeVars(theme)}>
      <span className="pal-banner__blob pal-banner__blob--1" aria-hidden="true" />
      <span className="pal-banner__blob pal-banner__blob--2" aria-hidden="true" />
      <div className="pal-banner__copy">
        <span className="pal-banner__badge">Limited offer</span>
        <p className="pal-banner__brand">{text.brand}</p>
        <h2 className="pal-banner__title">{text.headline}</h2>
        <p className="pal-banner__sub">Free delivery on orders over ৳1,500 · Ends Sunday</p>
        <div className="pal-banner__ctas">
          <span className="pal-banner__cta">Shop now</span>
          <span className="pal-banner__ghost">View lookbook</span>
        </div>
      </div>
      <div className="pal-banner__art" aria-hidden="true">
        <div className="pal-banner__card">
          <span className="pal-banner__discount">
            -40<small>%</small>
          </span>
          <span className="pal-banner__card-line" />
          <span className="pal-banner__card-line pal-banner__card-line--short" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Website landing page ---------- */

const FEATURES = [
  { icon: '✦', title: 'Handpicked quality', text: 'Every piece is checked before it ships.' },
  { icon: '⚡', title: 'Fast delivery', text: 'Inside the city in 24 hours, nationwide in 3 days.' },
  { icon: '↺', title: 'Easy returns', text: 'Changed your mind? Return within 7 days.' },
];

export function WebsiteDemo({ theme, text }: { theme: Theme; text: DemoText }) {
  return (
    <div className="pal-site" style={themeVars(theme)}>
      <div className="pal-site__chrome" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>{text.brand.toLowerCase().replace(/\s+/g, '')}.com</span>
      </div>

      <nav className="pal-site__nav">
        <strong>{text.brand}</strong>
        <span className="pal-site__links">
          <span>Shop</span>
          <span>New in</span>
          <span>About</span>
        </span>
        <span className="pal-site__nav-cta">Sign in</span>
      </nav>

      <header className="pal-site__hero">
        <span className="pal-site__pill">New season</span>
        <h2>{text.headline}</h2>
        <p>Pieces made to be worn every day and kept for years.</p>
        <div className="pal-site__hero-ctas">
          <span className="pal-site__btn">Shop the collection</span>
          <span className="pal-site__btn pal-site__btn--ghost">Learn more</span>
        </div>
      </header>

      <section className="pal-site__features">
        {FEATURES.map((f) => (
          <div key={f.title} className="pal-site__card">
            <span className="pal-site__icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </section>

      <section className="pal-site__stats">
        <div><strong>12k+</strong><span>Happy customers</span></div>
        <div><strong>4.9★</strong><span>Average rating</span></div>
        <div><strong>64</strong><span>Districts served</span></div>
      </section>

      <footer className="pal-site__footer">
        <span>© {text.brand}</span>
        <span className="pal-site__accent-link">Join the newsletter →</span>
      </footer>
    </div>
  );
}
