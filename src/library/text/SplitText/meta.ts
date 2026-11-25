import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Split Text',
  slug: 'split-text',
  description: 'Each letter rises and rotates into place, one after another.',
  usage: `<SplitText text="Welcome aboard" delay={50} />`,
  controls: [
    { prop: 'text', label: 'Text', type: 'text', default: 'Hello, UIComponents!' },
    { prop: 'delay', label: 'Delay per letter', type: 'number', default: 40, min: 0, max: 200, step: 5, unit: 'ms' },
  ],
  props: [
    { name: 'text', type: 'string', default: "'Hello, UIComponents!'", description: 'The text to animate.' },
    { name: 'delay', type: 'number', default: '40', description: 'Delay between letters in milliseconds.' },
    { name: 'className', type: 'string', default: "''", description: 'Extra class for the heading.' },
  ],
};
