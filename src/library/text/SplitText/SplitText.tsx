import './SplitText.css';

interface SplitTextProps {
  text?: string;
  /** Delay between letters, in ms. */
  delay?: number;
  className?: string;
}

export default function SplitText({
  text = 'Hello, UIComponents!',
  delay = 40,
  className = '',
}: SplitTextProps) {
  return (
    <h2 className={`split-text ${className}`} aria-label={text}>
      {[...text].map((ch, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="split-text__char"
          style={{ animationDelay: `${i * delay}ms` }}
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </h2>
  );
}
