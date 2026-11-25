import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Gradient Text',
  slug: 'gradient-text',
  description: 'Text filled with a colour gradient that flows across it in a loop.',
  usage: `<GradientText colors={['#f472b6', '#fb923c', '#f472b6']} speed={4}>
  Launch week
</GradientText>`,
  controls: [
    { prop: 'children', label: 'Text', type: 'text', default: 'Gradient Magic' },
    { prop: 'colors', label: 'Colours', type: 'colorList', default: ['#a78bfa', '#38bdf8', '#34d399', '#a78bfa'], min: 2, max: 6 },
    { prop: 'speed', label: 'Loop time', type: 'number', default: 6, min: 1, max: 20, step: 0.5, unit: 's' },
  ],
  props: [
    { name: 'children', type: 'ReactNode', default: "'Gradient Magic'", description: 'The text to colour.' },
    { name: 'colors', type: 'string[]', default: '[violet, sky, green, violet]', description: 'Gradient stops. Repeat the first colour at the end for a seamless loop.' },
    { name: 'speed', type: 'number', default: '6', description: 'Seconds for one loop.' },
    { name: 'className', type: 'string', default: "''", description: 'Extra class.' },
  ],
};
