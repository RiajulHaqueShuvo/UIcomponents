import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Animated Tabs',
  slug: 'animated-tabs',
  description: 'Segmented tabs where a coloured pill glides to the selected tab. Arrow keys work.',
  usage: `<AnimatedTabs
  tabs={[{ id: 'day', label: 'Daily' }, { id: 'week', label: 'Weekly' }]}
  defaultTab="week"
  onChange={(id) => setRange(id)}
/>`,
  controls: [
    { prop: 'defaultTab', label: 'Selected at start', type: 'select', default: 'overview', options: ['overview', 'analytics', 'reports', 'settings'] },
  ],
  props: [
    { name: 'tabs', type: '{ id: string; label: string }[]', default: '4 demo tabs', description: 'Tabs to show.' },
    { name: 'defaultTab', type: 'string', default: 'first tab', description: 'Initially selected tab id.' },
    { name: 'onChange', type: '(id: string) => void', default: '-', description: 'Called with the new tab id.' },
  ],
};
