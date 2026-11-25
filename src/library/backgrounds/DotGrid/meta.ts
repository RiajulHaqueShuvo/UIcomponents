import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Dot Grid',
  slug: 'dot-grid',
  description: 'A quiet grid of dots that lights up in a glowing circle around the cursor.',
  stage: 'fill',
  usage: `<DotGrid glowColor="#34d399" gap={18} radius={220}>
  <YourHero />
</DotGrid>`,
  controls: [
    { prop: 'gap', label: 'Dot spacing', type: 'number', default: 22, min: 8, max: 60, unit: 'px' },
    { prop: 'dotColor', label: 'Dot colour', type: 'text', default: 'rgba(255, 255, 255, 0.12)' },
    { prop: 'glowColor', label: 'Glow colour', type: 'color', default: '#a78bfa' },
    { prop: 'radius', label: 'Spotlight size', type: 'number', default: 180, min: 50, max: 400, step: 10, unit: 'px' },
  ],
  props: [
    { name: 'children', type: 'ReactNode', default: 'hint text', description: 'Content shown on top.' },
    { name: 'gap', type: 'number', default: '22', description: 'Space between dots in px.' },
    { name: 'dotColor', type: 'string', default: "'rgba(255,255,255,0.12)'", description: 'Resting dot colour.' },
    { name: 'glowColor', type: 'string', default: "'#a78bfa'", description: 'Dot colour under the spotlight.' },
    { name: 'radius', type: 'number', default: '180', description: 'Spotlight radius in px.' },
  ],
};
