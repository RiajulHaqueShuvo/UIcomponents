import { useRef, type MouseEvent, type ReactNode } from 'react';
import './TiltCard.css';

interface TiltCardProps {
  children?: ReactNode;
  /** Maximum tilt in degrees. */
  maxTilt?: number;
  /** Show a light reflection that follows the cursor. */
  glare?: boolean;
}

export default function TiltCard({
  children = (
    <div className="tilt-card__demo">
      <span className="tilt-card__chip" />
      <div>
        <p className="tilt-card__label">Card holder</p>
        <p className="tilt-card__name">Alex Morgan</p>
      </div>
      <p className="tilt-card__number">4821 •••• •••• 0392</p>
    </div>
  ),
  maxTilt = 14,
  glare = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0 → 1
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--tilt-x', `${(0.5 - py) * maxTilt * 2}deg`);
    el.style.setProperty('--tilt-y', `${(px - 0.5) * maxTilt * 2}deg`);
    el.style.setProperty('--glare-x', `${px * 100}%`);
    el.style.setProperty('--glare-y', `${py * 100}%`);
  };

  const onLeave = () => {
    ref.current?.style.setProperty('--tilt-x', '0deg');
    ref.current?.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <div className="tilt-card__scene">
      <div ref={ref} className="tilt-card" onMouseMove={onMove} onMouseLeave={onLeave}>
        {children}
        {glare && <span className="tilt-card__glare" aria-hidden="true" />}
      </div>
    </div>
  );
}
