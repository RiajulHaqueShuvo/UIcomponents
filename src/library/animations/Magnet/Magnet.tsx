import { useEffect, useRef, useState, type ReactNode } from 'react';
import './Magnet.css';

interface MagnetProps {
  children?: ReactNode;
  /** Higher = weaker pull. The element moves (distance / strength) px. */
  strength?: number;
  /** How far outside the element (px) the pull starts. */
  padding?: number;
}

export default function Magnet({
  children = <div className="magnet__demo">Move your cursor near me</div>,
  strength = 3,
  padding = 100,
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const inside =
        Math.abs(dx) < r.width / 2 + padding && Math.abs(dy) < r.height / 2 + padding;
      setActive(inside);
      setOffset(inside ? { x: dx / strength, y: dy / strength } : { x: 0, y: 0 });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [strength, padding]);

  return (
    <div
      ref={ref}
      className={`magnet ${active ? 'magnet--active' : ''}`}
      style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
    >
      {children}
    </div>
  );
}
