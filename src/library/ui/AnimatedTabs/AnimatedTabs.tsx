import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import './AnimatedTabs.css';

interface Tab {
  id: string;
  label: string;
}

interface AnimatedTabsProps {
  tabs?: Tab[];
  defaultTab?: string;
  onChange?: (id: string) => void;
}

const DEFAULT_TABS: Tab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
];

export default function AnimatedTabs({ tabs = DEFAULT_TABS, defaultTab, onChange }: AnimatedTabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Move the pill under the active tab (also after fonts load / resize).
  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[active];
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener('resize', measure);
  }, [active, tabs]);

  const select = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = tabs.findIndex((t) => t.id === active);
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    select(next.id);
    refs.current[next.id]?.focus();
  };

  return (
    <div className="animated-tabs" role="tablist" onKeyDown={onKeyDown}>
      <span
        className="animated-tabs__pill"
        style={{ transform: `translateX(${pill.left}px)`, width: pill.width }}
        aria-hidden="true"
      />
      {tabs.map((t) => (
        <button
          key={t.id}
          ref={(el) => {
            refs.current[t.id] = el;
          }}
          role="tab"
          aria-selected={active === t.id}
          tabIndex={active === t.id ? 0 : -1}
          className={`animated-tabs__tab ${active === t.id ? 'animated-tabs__tab--active' : ''}`}
          onClick={() => select(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
