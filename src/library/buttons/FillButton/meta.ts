import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Fill Button',
  slug: 'fill-button',
  description: 'An outline button that fills with colour starting from where the cursor enters.',
  usage: `<FillButton>View portfolio</FillButton>`,
  controls: [{ prop: 'children', label: 'Label', type: 'text', default: 'Hover me' }],
  props: [
    { name: 'children', type: 'ReactNode', default: "'Hover me'", description: 'Button label.' },
    { name: '...rest', type: 'ButtonHTMLAttributes', default: '-', description: 'Any normal button prop.' },
  ],
};
