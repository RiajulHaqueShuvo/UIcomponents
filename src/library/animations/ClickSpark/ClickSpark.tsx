import { useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import './ClickSpark.css';

interface ClickSparkProps {
  children?: ReactNode;
  color?: string;
  /** Number of lines in each burst. */
  count?: number;
  /** Line length in px. */
  size?: number;
  /** Burst length in ms. */
  duration?: number;
}

interface Spark {
  id: number;
  x: number;
  y: number;
}

export default function ClickSpark({
  children = <p className="click-spark__hint">Click anywhere in this box</p>,
  color = '#c4b5fd',
  count = 8,
  size = 14,
  duration = 500,
}: ClickSparkProps) {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const nextId = useRef(0);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = nextId.current++;
    setSparks((s) => [...s, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setSparks((s) => s.filter((sp) => sp.id !== id)), duration);
  };

  const vars = {
    '--spark-color': color,
    '--spark-size': `${size}px`,
    '--spark-duration': `${duration}ms`,
  } as CSSProperties;

  return (
    <div className="click-spark" style={vars} onClick={handleClick}>
      {children}
      {sparks.map((sp) => (
        <span key={sp.id} className="click-spark__burst" style={{ left: sp.x, top: sp.y }} aria-hidden="true">
          {Array.from({ length: count }, (_, i) => (
            <i key={i} style={{ transform: `rotate(${(360 / count) * i}deg)` }} />
          ))}
        </span>
      ))}
    </div>
  );
}
