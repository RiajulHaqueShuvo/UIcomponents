import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Shiny Text',
  slug: 'shiny-text',
  description: 'A soft band of light sweeps across muted text, like polished metal.',
  usage: `<ShinyText text="New collection" speed={2.5} />`,
  controls: [
    { prop: 'text', label: 'Text', type: 'text', default: 'Shiny text effect' },
    { prop: 'speed', label: 'Sweep time', type: 'number', default: 3, min: 0.5, max: 10, step: 0.5, unit: 's' },
  ],
  props: [
    { name: 'text', type: 'string', default: "'Shiny text effect'", description: 'The text to show.' },
    { name: 'speed', type: 'number', default: '3', description: 'Seconds for one sweep.' },
    { name: 'className', type: 'string', default: "''", description: 'Extra class.' },
  ],
};
