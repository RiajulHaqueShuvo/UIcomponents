import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Flip Card',
  slug: 'flip-card',
  description: 'A two-sided card that flips in 3D on click (or hover) to show its back.',
  usage: `<FlipCard
  trigger="hover"
  front={<img src="/team/sara.jpg" alt="Sara" />}
  back={<p>Sara leads our design team.</p>}
/>`,
  controls: [
    { prop: 'trigger', label: 'Flip on', type: 'select', default: 'click', options: ['click', 'hover'] },
  ],
  props: [
    { name: 'front', type: 'ReactNode', default: 'gift demo', description: 'Front side content.' },
    { name: 'back', type: 'ReactNode', default: 'coupon demo', description: 'Back side content.' },
    { name: 'trigger', type: "'hover' | 'click'", default: "'click'", description: 'What flips the card. Click also works with Enter/Space.' },
  ],
};
