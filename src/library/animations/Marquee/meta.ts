import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Marquee',
  slug: 'marquee',
  description: 'An endless, seamless scrolling row. Good for logos, tags or testimonials.',
  usage: `const BRANDS = ['Acme', 'Globex', 'Initech', 'Umbrella'];

<Marquee items={BRANDS} speed={20} reverse />`,
  controls: [
    { prop: 'items', label: 'Items', type: 'textList', default: ['React', 'TypeScript', 'Vite', 'CSS', 'Motion', 'Figma', 'Next.js', 'Tailwind'] },
    { prop: 'speed', label: 'Loop time', type: 'number', default: 25, min: 5, max: 80, unit: 's' },
    { prop: 'reverse', label: 'Reverse direction', type: 'boolean', default: false },
    { prop: 'pauseOnHover', label: 'Pause on hover', type: 'boolean', default: true },
  ],
  props: [
    { name: 'items', type: 'string[]', default: 'tech names', description: 'Items to scroll.' },
    { name: 'speed', type: 'number', default: '25', description: 'Seconds for one loop (lower = faster).' },
    { name: 'reverse', type: 'boolean', default: 'false', description: 'Scroll left-to-right instead.' },
    { name: 'pauseOnHover', type: 'boolean', default: 'true', description: 'Pause while hovered.' },
  ],
};
