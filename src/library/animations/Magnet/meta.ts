import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Magnet',
  slug: 'magnet',
  description: 'Wrap anything and it gets pulled toward the cursor when the cursor comes close.',
  usage: `<Magnet strength={4} padding={80}>
  <button className="cta">Get started</button>
</Magnet>`,
  controls: [
    { prop: 'strength', label: 'Weakness (higher = less pull)', type: 'number', default: 3, min: 1, max: 10, step: 0.5 },
    { prop: 'padding', label: 'Reach', type: 'number', default: 100, min: 0, max: 300, step: 10, unit: 'px' },
  ],
  props: [
    { name: 'children', type: 'ReactNode', default: 'demo box', description: 'The element to attract.' },
    { name: 'strength', type: 'number', default: '3', description: 'Higher number = weaker pull.' },
    { name: 'padding', type: 'number', default: '100', description: 'Distance (px) outside the element where the pull starts.' },
  ],
};
