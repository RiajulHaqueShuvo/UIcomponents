import './Marquee.css';

interface MarqueeProps {
  items?: string[];
  /** Seconds for one full loop. */
  speed?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
}

const DEFAULT_ITEMS = ['React', 'TypeScript', 'Vite', 'CSS', 'Motion', 'Figma', 'Next.js', 'Tailwind'];

export default function Marquee({
  items = DEFAULT_ITEMS,
  speed = 25,
  reverse = false,
  pauseOnHover = true,
}: MarqueeProps) {
  // The list is rendered twice; moving the track by -50% loops seamlessly.
  const loop = [...items, ...items];

  return (
    <div className={`marquee ${pauseOnHover ? 'marquee--pausable' : ''}`}>
      <div
        className="marquee__track"
        style={{
          animationDuration: `${speed}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {loop.map((item, i) => (
          <span key={i} className="marquee__item" aria-hidden={i >= items.length}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
