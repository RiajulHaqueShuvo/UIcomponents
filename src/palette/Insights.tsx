import type { Insight } from './model';

const ICON = { good: '✓', warn: '!', bad: '✕' } as const;

export default function Insights({ insights, mood }: { insights: Insight[]; mood: string }) {
  const bad = insights.filter((i) => i.level === 'bad').length;
  const warn = insights.filter((i) => i.level === 'warn').length;
  const verdict =
    bad > 0 ? 'Needs work' : warn > 1 ? 'Good, with a few tweaks' : warn === 1 ? 'Very good' : 'Excellent';

  return (
    <section className="pal-insights" aria-label="How will it look">
      <div className="pal-insights__head">
        <div>
          <h3 className="pal-h3">How will it look?</h3>
          <p className="pal-mood">{mood}</p>
        </div>
        <span className={`pal-verdict pal-verdict--${bad ? 'bad' : warn > 1 ? 'warn' : 'good'}`}>{verdict}</span>
      </div>
      <ul className="pal-insights__list">
        {insights.map((i) => (
          <li key={i.title} className={`pal-insight pal-insight--${i.level}`}>
            <span className="pal-insight__icon" aria-hidden="true">{ICON[i.level]}</span>
            <div>
              <strong>{i.title}</strong>
              <p>{i.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
