import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Glass Card',
  slug: 'glass-card',
  description: 'Frosted-glass card (glassmorphism) that blurs whatever is behind it.',
  usage: `{/* Put it over a colourful image or gradient, then turn off the demo shapes */}
<GlassCard backdrop={false}>
  <h3>Pro plan</h3>
  <p>Everything in Free, plus more.</p>
</GlassCard>`,
  controls: [
    { prop: 'backdrop', label: 'Demo shapes behind', type: 'boolean', default: true },
  ],
  props: [
    { name: 'children', type: 'ReactNode', default: 'weather demo', description: 'Card content.' },
    { name: 'backdrop', type: 'boolean', default: 'true', description: 'Draw floating colour shapes behind the card.' },
  ],
};
