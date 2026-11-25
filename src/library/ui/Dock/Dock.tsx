import { useState, type MouseEvent } from 'react';
import './Dock.css';

interface DockItem {
  label: string;
  icon: string;
  onClick?: () => void;
}

interface DockProps {
  items?: DockItem[];
  /** Icon size at rest, in px. */
  baseSize?: number;
  /** Icon size right under the cursor, in px. */
  maxSize?: number;
  /** How far (px) the magnification spreads. */
  range?: number;
}

const DEFAULT_ITEMS: DockItem[] = [
  { label: 'Home', icon: '🏠' },
  { label: 'Search', icon: '🔍' },
  { label: 'Music', icon: '🎵' },
  { label: 'Photos', icon: '📷' },
  { label: 'Messages', icon: '💬' },
  { label: 'Settings', icon: '⚙️' },
];

export default function Dock({
  items = DEFAULT_ITEMS,
  baseSize = 48,
  maxSize = 80,
  range = 140,
}: DockProps) {
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [centers, setCenters] = useState<number[]>([]);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    // Measure icon centres once per hover, then reuse them.
    if (centers.length === 0) {
      const icons = e.currentTarget.querySelectorAll<HTMLElement>('.dock__item');
      setCenters([...icons].map((el) => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2;
      }));
    }
    setMouseX(e.clientX);
  };

  const onLeave = () => {
    setMouseX(null);
    setCenters([]);
  };

  const sizeFor = (i: number) => {
    if (mouseX === null || centers[i] === undefined) return baseSize;
    const dist = Math.abs(mouseX - centers[i]);
    const t = Math.max(0, 1 - dist / range);
    // Smooth cosine falloff.
    return baseSize + (maxSize - baseSize) * (0.5 - 0.5 * Math.cos(Math.PI * t));
  };

  return (
    <nav className="dock" onMouseMove={onMove} onMouseLeave={onLeave} aria-label="Dock">
      {items.map((item, i) => {
        const size = sizeFor(i);
        return (
          <button
            key={item.label}
            className="dock__item"
            style={{ width: size, height: size, fontSize: size * 0.5 }}
            onClick={item.onClick}
            aria-label={item.label}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span className="dock__tooltip">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
