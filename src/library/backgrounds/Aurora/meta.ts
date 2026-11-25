import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Aurora',
  slug: 'aurora',
  description: 'Soft coloured light that slowly drifts and blends behind your content. Pure CSS.',
  stage: 'fill',
  usage: `<section style={{ height: 600 }}>
  <Aurora colors={['#db2777', '#f59e0b', '#8b5cf6']}>
    <h1>Your hero headline</h1>
  </Aurora>
</section>`,
  controls: [
    { prop: 'colors', label: 'Colours (3)', type: 'colorList', default: ['#7c3aed', '#0ea5e9', '#10b981'], min: 3, max: 3 },
    { prop: 'speed', label: 'Drift time', type: 'number', default: 14, min: 2, max: 40, unit: 's' },
    { prop: 'blur', label: 'Softness', type: 'number', default: 70, min: 0, max: 150, step: 5, unit: 'px' },
  ],
  props: [
    { name: 'children', type: 'ReactNode', default: 'title', description: 'Content shown on top.' },
    { name: 'colors', type: '[string, string, string]', default: '[violet, sky, green]', description: 'The three light colours.' },
    { name: 'speed', type: 'number', default: '14', description: 'Seconds per drift cycle.' },
    { name: 'blur', type: 'number', default: '70', description: 'Softness in px.' },
  ],
};
