import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import './SpotlightCard.css';

interface SpotlightCardProps {
  children?: ReactNode;
  spotlightColor?: string;
  className?: string;
}

export default function SpotlightCard({
  children = (
    <>
      <span className="spotlight-card__icon">⚡</span>
      <h3 className="spotlight-card__title">Lightning fast</h3>
      <p className="spotlight-card__text">
        Move your cursor over the card. A soft light follows it and the border glows.
      </p>
    </>
  ),
  spotlightColor = 'rgba(167, 139, 250, 0.22)',
  className = '',
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${e.clientX - r.left}px`);
    el.style.setProperty('--spot-y', `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      className={`spotlight-card ${className}`}
      style={{ '--spot-color': spotlightColor } as CSSProperties}
      onMouseMove={onMove}
    >
      {children}
    </div>
  );
}
