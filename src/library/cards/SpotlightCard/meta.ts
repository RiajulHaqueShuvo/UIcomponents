import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Spotlight Card',
  slug: 'spotlight-card',
  description: 'A soft light follows the cursor inside the card and makes the nearby border glow.',
  usage: `<SpotlightCard spotlightColor="rgba(52, 211, 153, 0.2)">
  <h3>Secure by default</h3>
  <p>End-to-end encrypted.</p>
</SpotlightCard>`,
  controls: [
    { prop: 'spotlightColor', label: 'Light colour (rgba)', type: 'text', default: 'rgba(167, 139, 250, 0.22)' },
  ],
  props: [
    { name: 'children', type: 'ReactNode', default: 'feature demo', description: 'Card content.' },
    { name: 'spotlightColor', type: 'string', default: "'rgba(167,139,250,0.22)'", description: 'Light colour (use some transparency).' },
    { name: 'className', type: 'string', default: "''", description: 'Extra class, e.g. to change width.' },
  ],
};
