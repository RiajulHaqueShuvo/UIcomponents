import './ShinyText.css';

interface ShinyTextProps {
  text?: string;
  /** Seconds for one sweep of the shine. */
  speed?: number;
  className?: string;
}

export default function ShinyText({ text = 'Shiny text effect', speed = 3, className = '' }: ShinyTextProps) {
  return (
    <span className={`shiny-text ${className}`} style={{ animationDuration: `${speed}s` }}>
      {text}
    </span>
  );
}
