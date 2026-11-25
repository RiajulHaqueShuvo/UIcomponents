import type { ReactNode } from 'react';
import './GradientText.css';

interface GradientTextProps {
  children?: ReactNode;
  colors?: string[];
  /** Seconds for one full loop of the gradient. */
  speed?: number;
  className?: string;
}

export default function GradientText({
  children = 'Gradient Magic',
  colors = ['#a78bfa', '#38bdf8', '#34d399', '#a78bfa'],
  speed = 6,
  className = '',
}: GradientTextProps) {
  return (
    <span
      className={`gradient-text ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
        animationDuration: `${speed}s`,
      }}
    >
      {children}
    </span>
  );
}
