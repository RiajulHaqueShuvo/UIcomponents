import type { CSSProperties, ReactNode } from 'react';
import './Aurora.css';

interface AuroraProps {
  children?: ReactNode;
  /** Three blob colours. */
  colors?: [string, string, string];
  /** Seconds for one drift cycle. */
  speed?: number;
  /** Blur radius in px. */
  blur?: number;
}

export default function Aurora({
  children = <h2 className="aurora__title">Northern lights</h2>,
  colors = ['#7c3aed', '#0ea5e9', '#10b981'],
  speed = 14,
  blur = 70,
}: AuroraProps) {
  const vars = {
    '--aurora-1': colors[0],
    '--aurora-2': colors[1],
    '--aurora-3': colors[2],
    '--aurora-speed': `${speed}s`,
    '--aurora-blur': `${blur}px`,
  } as CSSProperties;

  return (
    <div className="aurora" style={vars}>
      <div className="aurora__blobs" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="aurora__content">{children}</div>
    </div>
  );
}
