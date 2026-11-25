import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Tilt Card',
  slug: 'tilt-card',
  description: 'The card tilts in 3D toward the cursor, with a moving light reflection.',
  usage: `<TiltCard maxTilt={10}>
  <img src="/product.jpg" alt="Product" />
</TiltCard>`,
  controls: [
    { prop: 'maxTilt', label: 'Max tilt', type: 'number', default: 14, min: 0, max: 40, unit: '°' },
    { prop: 'glare', label: 'Light reflection', type: 'boolean', default: true },
  ],
  props: [
    { name: 'children', type: 'ReactNode', default: 'credit card demo', description: 'Card content.' },
    { name: 'maxTilt', type: 'number', default: '14', description: 'Maximum tilt in degrees.' },
    { name: 'glare', type: 'boolean', default: 'true', description: 'Show the light reflection.' },
  ],
};
