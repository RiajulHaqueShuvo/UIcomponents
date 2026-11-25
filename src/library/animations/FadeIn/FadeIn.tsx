import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import './FadeIn.css';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface FadeInProps {
  children?: ReactNode;
  direction?: Direction;
  /** Travel distance in px. */
  distance?: number;
  /** Delay in ms (use it to stagger several FadeIns). */
  delay?: number;
  duration?: number;
  /** Fade in only the first time it becomes visible. */
  once?: boolean;
}

const OFFSETS: Record<Direction, [number, number]> = {
  up: [0, 1],
  down: [0, -1],
  left: [1, 0],
  right: [-1, 0],
  none: [0, 0],
};

export default function FadeIn({
  children = (
    <div className="fade-in__demo">
      <strong>Scroll reveal</strong>
      <span>I fade in when I enter the screen.</span>
    </div>
  ),
  direction = 'up',
  distance = 40,
  delay = 0,
  duration = 700,
  once = true,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) io.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  const [x, y] = OFFSETS[direction];
  const style = {
    '--fade-x': `${x * distance}px`,
    '--fade-y': `${y * distance}px`,
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
  } as CSSProperties;

  return (
    <div ref={ref} className={`fade-in ${visible ? 'fade-in--visible' : ''}`} style={style}>
      {children}
    </div>
  );
}
