import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Accordion',
  slug: 'accordion',
  description: 'FAQ-style panels that open and close with a smooth height animation. Accessible.',
  usage: `<Accordion
  multiple
  defaultOpen={[]}
  items={[
    { title: 'Delivery time?', content: '2–4 days inside Dhaka.' },
    { title: 'Return policy?', content: '7 days, no questions asked.' },
  ]}
/>`,
  controls: [
    { prop: 'multiple', label: 'Allow several open', type: 'boolean', default: false },
  ],
  props: [
    { name: 'items', type: '{ title: string; content: string }[]', default: '3 FAQ items', description: 'Panels to show.' },
    { name: 'multiple', type: 'boolean', default: 'false', description: 'Allow several panels open at once.' },
    { name: 'defaultOpen', type: 'number[]', default: '[0]', description: 'Indexes open at start.' },
  ],
};
