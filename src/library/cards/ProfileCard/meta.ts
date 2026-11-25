import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Profile Card',
  slug: 'profile-card',
  description: 'A user profile card with cover, avatar, stats and a follow toggle.',
  usage: `<ProfileCard
  name="Rafi Ahmed"
  role="Frontend Engineer"
  avatar="/avatars/rafi.jpg"
  stats={[{ label: 'Repos', value: '32' }, { label: 'Stars', value: '1.2k' }, { label: 'PRs', value: '410' }]}
  onFollowChange={(on) => console.log(on)}
/>`,
  controls: [
    { prop: 'name', label: 'Name', type: 'text', default: 'Nadia Rahman' },
    { prop: 'role', label: 'Role', type: 'text', default: 'Product Designer' },
  ],
  props: [
    { name: 'name', type: 'string', default: "'Nadia Rahman'", description: 'Display name.' },
    { name: 'role', type: 'string', default: "'Product Designer'", description: 'Title under the name.' },
    { name: 'avatar', type: 'string', default: 'undefined', description: 'Image URL. Without it, initials are shown.' },
    { name: 'stats', type: '{ label: string; value: string }[]', default: '3 stats', description: 'Numbers row (3 fit best).' },
    { name: 'onFollowChange', type: '(following: boolean) => void', default: '-', description: 'Called when Follow is toggled.' },
  ],
};
