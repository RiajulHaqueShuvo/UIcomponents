import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import './DotGrid.css';

interface DotGridProps {
  children?: ReactNode;
  /** Distance between dots in px. */
  gap?: number;
  dotColor?: string;
  glowColor?: string;
  /** Spotlight radius in px. */
  radius?: number;
}

export default function DotGrid({
  children = <p className="dot-grid__hint">Move your cursor around</p>,
  gap = 22,
  dotColor = 'rgba(255, 255, 255, 0.12)',
  glowColor = '#a78bfa',
  radius = 180,
}: DotGridProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Write the cursor position to CSS variables; no React re-render needed.
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--dot-x', `${e.clientX - r.left}px`);
    el.style.setProperty('--dot-y', `${e.clientY - r.top}px`);
  };

  const vars = {
    '--dot-gap': `${gap}px`,
    '--dot-color': dotColor,
    '--dot-glow': glowColor,
    '--dot-radius': `${radius}px`,
  } as CSSProperties;

  return (
    <div ref={ref} className="dot-grid" style={vars} onMouseMove={onMove}>
      <div className="dot-grid__layer dot-grid__layer--base" aria-hidden="true" />
      <div className="dot-grid__layer dot-grid__layer--glow" aria-hidden="true" />
      <div className="dot-grid__content">{children}</div>
    </div>
  );
}
