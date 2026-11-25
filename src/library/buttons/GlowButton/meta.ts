import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Glow Button',
  slug: 'glow-button',
  description: 'A rainbow border that spins around the button, with a glow that brightens on hover.',
  usage: `<GlowButton onClick={() => alert('Hi!')}>Start free trial</GlowButton>`,
  controls: [{ prop: 'children', label: 'Label', type: 'text', default: 'Get started' }],
  props: [
    { name: 'children', type: 'ReactNode', default: "'Get started'", description: 'Button label.' },
    { name: '...rest', type: 'ButtonHTMLAttributes', default: '-', description: 'Any normal button prop (onClick, type, disabled…).' },
  ],
};
