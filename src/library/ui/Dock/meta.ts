import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Dock',
  slug: 'dock',
  description: 'An app dock where icons grow smoothly as the cursor passes over them.',
  isNew: true,
  usage: `<Dock
  items={[
    { label: 'Home', icon: '🏠', onClick: () => navigate('/') },
    { label: 'Cart', icon: '🛒', onClick: openCart },
  ]}
  maxSize={72}
/>`,
  controls: [
    { prop: 'baseSize', label: 'Icon size', type: 'number', default: 48, min: 24, max: 80, unit: 'px' },
    { prop: 'maxSize', label: 'Hover size', type: 'number', default: 80, min: 40, max: 140, unit: 'px' },
    { prop: 'range', label: 'Spread', type: 'number', default: 140, min: 40, max: 400, step: 10, unit: 'px' },
  ],
  props: [
    { name: 'items', type: '{ label; icon; onClick? }[]', default: '6 demo apps', description: 'Dock entries. icon can be an emoji or text.' },
    { name: 'baseSize', type: 'number', default: '48', description: 'Icon size at rest (px).' },
    { name: 'maxSize', type: 'number', default: '80', description: 'Icon size under the cursor (px).' },
    { name: 'range', type: 'number', default: '140', description: 'How far the growth spreads (px).' },
  ],
};
