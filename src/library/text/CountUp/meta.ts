import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Count Up',
  slug: 'count-up',
  description: 'A number that counts up with easing when it scrolls into view. Great for stats.',
  usage: `<CountUp to={98} suffix="%" label="Customer satisfaction" />`,
  controls: [
    { prop: 'to', label: 'Final number', type: 'number', default: 12480, min: 0, max: 1000000, step: 1 },
    { prop: 'duration', label: 'Duration', type: 'number', default: 2000, min: 300, max: 6000, step: 100, unit: 'ms' },
    { prop: 'prefix', label: 'Prefix', type: 'text', default: '' },
    { prop: 'suffix', label: 'Suffix', type: 'text', default: '+' },
    { prop: 'label', label: 'Caption', type: 'text', default: 'Happy customers' },
  ],
  props: [
    { name: 'to', type: 'number', default: '12480', description: 'Final value.' },
    { name: 'duration', type: 'number', default: '2000', description: 'Animation length in ms.' },
    { name: 'prefix', type: 'string', default: "''", description: 'Text before the number, e.g. "$".' },
    { name: 'suffix', type: 'string', default: "'+'", description: 'Text after the number, e.g. "%".' },
    { name: 'label', type: 'string', default: "'Happy customers'", description: 'Caption under the number. Empty string hides it.' },
  ],
};
