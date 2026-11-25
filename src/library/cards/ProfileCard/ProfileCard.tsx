import { useState } from 'react';
import './ProfileCard.css';

interface Stat {
  label: string;
  value: string;
}

interface ProfileCardProps {
  name?: string;
  role?: string;
  /** Image URL. Without one, the initials are shown on a gradient. */
  avatar?: string;
  stats?: Stat[];
  onFollowChange?: (following: boolean) => void;
}

const DEFAULT_STATS: Stat[] = [
  { label: 'Projects', value: '48' },
  { label: 'Followers', value: '12.4k' },
  { label: 'Likes', value: '96k' },
];

const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function ProfileCard({
  name = 'Nadia Rahman',
  role = 'Product Designer',
  avatar,
  stats = DEFAULT_STATS,
  onFollowChange,
}: ProfileCardProps) {
  const [following, setFollowing] = useState(false);

  const toggle = () => {
    const next = !following;
    setFollowing(next);
    onFollowChange?.(next);
  };

  return (
    <div className="profile-card">
      <div className="profile-card__cover" aria-hidden="true" />
      <div className="profile-card__avatar">
        {avatar ? <img src={avatar} alt={name} /> : <span>{initials(name)}</span>}
      </div>
      <h3 className="profile-card__name">{name}</h3>
      <p className="profile-card__role">{role}</p>
      <dl className="profile-card__stats">
        {stats.map((s) => (
          <div key={s.label}>
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>
      <button
        className={`profile-card__follow ${following ? 'profile-card__follow--on' : ''}`}
        onClick={toggle}
        aria-pressed={following}
      >
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}
