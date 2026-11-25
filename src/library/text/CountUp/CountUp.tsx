import { useEffect, useRef, useState } from 'react';
import './CountUp.css';

interface CountUpProps {
  to?: number;
  /** Duration in ms. */
  duration?: number;
  prefix?: string;
  suffix?: string;
  label?: string;
}

export default function CountUp({
  to = 12480,
  duration = 2000,
  prefix = '',
  suffix = '+',
  label = 'Happy customers',
}: CountUpProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;

    const start = () => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        setValue(Math.round(to * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    // Only count once the number scrolls into view.
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        start();
        io.disconnect();
      }
    });
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return (
    <div className="count-up" ref={ref}>
      <span className="count-up__value">
        {prefix}
        {value.toLocaleString()}
        {suffix}
      </span>
      {label && <span className="count-up__label">{label}</span>}
    </div>
  );
}
