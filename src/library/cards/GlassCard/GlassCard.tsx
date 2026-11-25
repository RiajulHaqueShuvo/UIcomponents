import type { ReactNode } from 'react';
import './GlassCard.css';

interface GlassCardProps {
  children?: ReactNode;
  /** Render colourful shapes behind the card so the glass effect is visible. */
  backdrop?: boolean;
}

export default function GlassCard({
  children = (
    <>
      <p className="glass-card__eyebrow">Weather · Dhaka</p>
      <p className="glass-card__temp">29°</p>
      <p className="glass-card__desc">Partly cloudy · Humidity 74%</p>
    </>
  ),
  backdrop = true,
}: GlassCardProps) {
  return (
    <div className="glass-card__wrap">
      {backdrop && (
        <div className="glass-card__backdrop" aria-hidden="true">
          <span />
          <span />
        </div>
      )}
      <div className="glass-card">{children}</div>
    </div>
  );
}
