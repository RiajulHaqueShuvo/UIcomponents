import { useRef, useState, type ButtonHTMLAttributes, type MouseEvent } from 'react';
import './RippleButton.css';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

type RippleButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function RippleButton({
  children = 'Click me',
  className = '',
  onClick,
  ...rest
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2;
    const id = nextId.current++;
    setRipples((list) => [...list, { id, size, x: e.clientX - r.left - size / 2, y: e.clientY - r.top - size / 2 }]);
    setTimeout(() => setRipples((list) => list.filter((rp) => rp.id !== id)), 650);
    onClick?.(e);
  };

  return (
    <button className={`ripple-button ${className}`} onClick={handleClick} {...rest}>
      {children}
      {ripples.map((rp) => (
        <span
          key={rp.id}
          className="ripple-button__ripple"
          style={{ left: rp.x, top: rp.y, width: rp.size, height: rp.size }}
          aria-hidden="true"
        />
      ))}
    </button>
  );
}
