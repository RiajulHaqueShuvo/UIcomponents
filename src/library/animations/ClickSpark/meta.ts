import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Click Spark',
  slug: 'click-spark',
  description: 'A small burst of sparks appears wherever you click inside the area.',
  stage: 'fill',
  usage: `<ClickSpark color="#fbbf24" count={10}>
  <YourSection />
</ClickSpark>`,
  controls: [
    { prop: 'color', label: 'Colour', type: 'color', default: '#c4b5fd' },
    { prop: 'count', label: 'Lines', type: 'number', default: 8, min: 3, max: 20 },
    { prop: 'size', label: 'Line length', type: 'number', default: 14, min: 4, max: 40, unit: 'px' },
    { prop: 'duration', label: 'Duration', type: 'number', default: 500, min: 200, max: 1500, step: 50, unit: 'ms' },
  ],
  props: [
    { name: 'children', type: 'ReactNode', default: 'hint text', description: 'Content inside the clickable area.' },
    { name: 'color', type: 'string', default: "'#c4b5fd'", description: 'Spark colour.' },
    { name: 'count', type: 'number', default: '8', description: 'Lines per burst.' },
    { name: 'size', type: 'number', default: '14', description: 'Line length in px.' },
    { name: 'duration', type: 'number', default: '500', description: 'Burst length in ms.' },
  ],
};
