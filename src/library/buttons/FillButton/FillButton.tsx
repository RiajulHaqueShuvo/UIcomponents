import type { ButtonHTMLAttributes, MouseEvent } from 'react';
import './FillButton.css';

type FillButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function FillButton({
  children = 'Hover me',
  className = '',
  onMouseEnter,
  onMouseLeave,
  ...rest
}: FillButtonProps) {
  // The fill grows from wherever the cursor enters, and shrinks to where it leaves.
  const setOrigin = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--fill-x', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--fill-y', `${e.clientY - r.top}px`);
  };

  return (
    <button
      className={`fill-button ${className}`}
      onMouseEnter={(e) => {
        setOrigin(e);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setOrigin(e);
        onMouseLeave?.(e);
      }}
      {...rest}
    >
      <span className="fill-button__label">{children}</span>
    </button>
  );
}
