import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Pricing Card',
  slug: 'pricing-card',
  description: 'A pricing plan card with feature list and a light beam running around the featured plan.',
  isNew: true,
  usage: `<PricingCard
  plan="Starter"
  price="৳499"
  period="/month"
  features={['5 projects', 'Email support']}
  featured={false}
  onSelect={() => checkout('starter')}
/>`,
  controls: [
    { prop: 'plan', label: 'Plan name', type: 'text', default: 'Pro' },
    { prop: 'price', label: 'Price', type: 'text', default: '$29' },
    { prop: 'period', label: 'Period', type: 'text', default: '/month' },
    { prop: 'description', label: 'Description', type: 'text', default: 'For growing teams that want to ship polished UI fast.' },
    { prop: 'features', label: 'Features', type: 'textList', default: ['Unlimited projects', 'All 26 components', 'Priority support', 'Lifetime updates'] },
    { prop: 'cta', label: 'Button text', type: 'text', default: 'Upgrade to Pro' },
    { prop: 'featured', label: 'Featured (animated border)', type: 'boolean', default: true },
    { prop: 'badge', label: 'Badge', type: 'text', default: 'Most popular' },
  ],
  props: [
    { name: 'plan', type: 'string', default: "'Pro'", description: 'Plan name.' },
    { name: 'price', type: 'string', default: "'$29'", description: 'Price text (any currency).' },
    { name: 'period', type: 'string', default: "'/month'", description: 'Text after the price.' },
    { name: 'description', type: 'string', default: 'short text', description: 'One-line summary.' },
    { name: 'features', type: 'string[]', default: '4 features', description: 'Feature list with check marks.' },
    { name: 'cta', type: 'string', default: "'Upgrade to Pro'", description: 'Button text.' },
    { name: 'featured', type: 'boolean', default: 'true', description: 'Animated border and badge.' },
    { name: 'badge', type: 'string', default: "'Most popular'", description: 'Badge text (featured only).' },
    { name: 'onSelect', type: '() => void', default: '-', description: 'Called when the button is clicked.' },
  ],
};
