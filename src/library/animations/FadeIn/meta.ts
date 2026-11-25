import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Fade In',
  slug: 'fade-in',
  description: 'Fades and slides content in when it scrolls into view. Stagger several with delay.',
  usage: `{features.map((f, i) => (
  <FadeIn key={f.id} delay={i * 120} direction="up">
    <FeatureCard {...f} />
  </FadeIn>
))}`,
  controls: [
    { prop: 'direction', label: 'Direction', type: 'select', default: 'up', options: ['up', 'down', 'left', 'right', 'none'] },
    { prop: 'distance', label: 'Distance', type: 'number', default: 40, min: 0, max: 200, step: 5, unit: 'px' },
    { prop: 'delay', label: 'Delay', type: 'number', default: 0, min: 0, max: 2000, step: 50, unit: 'ms' },
    { prop: 'duration', label: 'Duration', type: 'number', default: 700, min: 100, max: 3000, step: 50, unit: 'ms' },
    { prop: 'once', label: 'Only once', type: 'boolean', default: true },
  ],
  props: [
    { name: 'children', type: 'ReactNode', default: 'demo card', description: 'Content to reveal.' },
    { name: 'direction', type: "'up' | 'down' | 'left' | 'right' | 'none'", default: "'up'", description: 'Where it comes from.' },
    { name: 'distance', type: 'number', default: '40', description: 'Travel distance in px.' },
    { name: 'delay', type: 'number', default: '0', description: 'Delay in ms.' },
    { name: 'duration', type: 'number', default: '700', description: 'Length in ms.' },
    { name: 'once', type: 'boolean', default: 'true', description: 'If false, it fades out again when it leaves the screen.' },
  ],
};
