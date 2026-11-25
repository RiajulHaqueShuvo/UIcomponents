import { useState, type ReactNode } from 'react';
import './FlipCard.css';

interface FlipCardProps {
  front?: ReactNode;
  back?: ReactNode;
  /** 'hover' flips on mouse over, 'click' flips on click/tap. */
  trigger?: 'hover' | 'click';
}

export default function FlipCard({
  front = (
    <>
      <span className="flip-card__emoji">🎁</span>
      <h3>Mystery reward</h3>
      <p>Click to reveal</p>
    </>
  ),
  back = (
    <>
      <h3>20% OFF</h3>
      <p>Use code</p>
      <code className="flip-card__code">FLIP20</code>
    </>
  ),
  trigger = 'click',
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const isClick = trigger === 'click';

  return (
    <div
      className={`flip-card flip-card--${trigger} ${flipped ? 'flip-card--flipped' : ''}`}
      onClick={isClick ? () => setFlipped((f) => !f) : undefined}
      onKeyDown={
        isClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setFlipped((f) => !f);
              }
            }
          : undefined
      }
      role={isClick ? 'button' : undefined}
      tabIndex={isClick ? 0 : undefined}
      aria-pressed={isClick ? flipped : undefined}
    >
      <div className="flip-card__inner">
        <div className="flip-card__face flip-card__face--front">{front}</div>
        <div className="flip-card__face flip-card__face--back">{back}</div>
      </div>
    </div>
  );
}
