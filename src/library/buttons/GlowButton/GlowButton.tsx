import type { ButtonHTMLAttributes } from 'react';
import './GlowButton.css';

type GlowButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function GlowButton({
  children = 'Get started',
  className = '',
  ...rest
}: GlowButtonProps) {
  return (
    <button className={`glow-button ${className}`} {...rest}>
      <span className="glow-button__label">{children}</span>
    </button>
  );
}
