import './PricingCard.css';

interface PricingCardProps {
  plan?: string;
  price?: string;
  period?: string;
  description?: string;
  features?: string[];
  cta?: string;
  /** Highlights the card with an animated border and a badge. */
  featured?: boolean;
  badge?: string;
  onSelect?: () => void;
}

const DEFAULT_FEATURES = [
  'Unlimited projects',
  'All 26 components',
  'Priority support',
  'Lifetime updates',
];

export default function PricingCard({
  plan = 'Pro',
  price = '$29',
  period = '/month',
  description = 'For growing teams that want to ship polished UI fast.',
  features = DEFAULT_FEATURES,
  cta = 'Upgrade to Pro',
  featured = true,
  badge = 'Most popular',
  onSelect,
}: PricingCardProps) {
  return (
    <div className={`pricing-card ${featured ? 'pricing-card--featured' : ''}`}>
      <div className="pricing-card__body">
        <div className="pricing-card__top">
          <h3 className="pricing-card__plan">{plan}</h3>
          {featured && badge && <span className="pricing-card__badge">{badge}</span>}
        </div>
        <p className="pricing-card__price">
          {price}
          <span>{period}</span>
        </p>
        <p className="pricing-card__desc">{description}</p>
        <ul className="pricing-card__features">
          {features.map((f) => (
            <li key={f}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                <path d="m5 12 5 5L20 7" />
              </svg>
              {f}
            </li>
          ))}
        </ul>
        <button className="pricing-card__cta" onClick={onSelect}>
          {cta}
        </button>
      </div>
    </div>
  );
}
