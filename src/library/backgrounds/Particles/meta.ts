import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Particles',
  slug: 'particles',
  description: 'Floating dots that link up with lines when close, and reach toward the cursor. Canvas based.',
  stage: 'fill',
  isNew: true,
  usage: `<div style={{ position: 'relative', height: 500 }}>
  <div style={{ position: 'absolute', inset: 0 }}>
    <Particles count={90} color="56, 189, 248" />
  </div>
  <h1 style={{ position: 'relative' }}>Content on top</h1>
</div>`,
  controls: [
    { prop: 'count', label: 'Dots', type: 'number', default: 70, min: 10, max: 200, step: 5 },
    { prop: 'color', label: 'Colour (R, G, B)', type: 'text', default: '167, 139, 250' },
    { prop: 'linkDistance', label: 'Link distance', type: 'number', default: 120, min: 40, max: 250, step: 5, unit: 'px' },
    { prop: 'speed', label: 'Speed', type: 'number', default: 0.4, min: 0.1, max: 3, step: 0.1 },
  ],
  props: [
    { name: 'count', type: 'number', default: '70', description: 'Number of dots.' },
    { name: 'color', type: 'string', default: "'167, 139, 250'", description: 'RGB values, comma separated (alpha is added for you).' },
    { name: 'linkDistance', type: 'number', default: '120', description: 'Max px distance for a linking line.' },
    { name: 'speed', type: 'number', default: '0.4', description: 'Movement speed.' },
  ],
};
