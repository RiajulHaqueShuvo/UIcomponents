import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Ripple Button',
  slug: 'ripple-button',
  description: 'A ripple spreads out from the exact spot you click, like a drop in water.',
  usage: `<RippleButton onClick={save}>Save changes</RippleButton>`,
  controls: [{ prop: 'children', label: 'Label', type: 'text', default: 'Click me' }],
  props: [
    { name: 'children', type: 'ReactNode', default: "'Click me'", description: 'Button label.' },
    { name: 'onClick', type: '(e) => void', default: '-', description: 'Still called after the ripple starts.' },
    { name: '...rest', type: 'ButtonHTMLAttributes', default: '-', description: 'Any normal button prop.' },
  ],
};
