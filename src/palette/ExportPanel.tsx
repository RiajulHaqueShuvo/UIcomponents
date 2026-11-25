import { useState } from 'react';
import CodeBlock from '../site/CodeBlock';
import CopyButton from '../site/CopyButton';
import { ranked, roleOf, type Palette, type Theme } from './model';

type Format = 'css' | 'tailwind' | 'json';

export default function ExportPanel({ palette, theme, shareUrl }: { palette: Palette; theme: Theme; shareUrl: string }) {
  const [format, setFormat] = useState<Format>('css');
  const list = ranked(palette.swatches);
  const name = (id: string) => roleOf(palette.swatches, id).toLowerCase();

  const code: Record<Format, string> = {
    css: `:root {
${list.map((s) => `  --color-${name(s.id)}: ${s.hex}; /* ${s.percent}% */`).join('\n')}
  --color-text: ${theme.text};
  --color-text-muted: ${theme.textMuted};
  --color-on-primary: ${theme.onPrimary};
}`,
    tailwind: `// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
${list.map((s) => `        ${name(s.id)}: '${s.hex}', // ${s.percent}%`).join('\n')}
        ink: '${theme.text}',
        'on-primary': '${theme.onPrimary}',
      },
    },
  },
};`,
    json: JSON.stringify(
      {
        colors: list.map((s) => ({ role: name(s.id), hex: s.hex, percent: s.percent })),
        text: theme.text,
      },
      null,
      2
    ),
  };

  return (
    <section className="pal-export">
      <div className="pal-export__head">
        <h3 className="pal-h3">Use this palette</h3>
        <div className="pal-share">
          <input readOnly value={shareUrl} aria-label="Share link" onFocus={(e) => e.target.select()} />
          <CopyButton text={shareUrl} />
        </div>
      </div>
      <div className="tabs">
        {(['css', 'tailwind', 'json'] as const).map((f) => (
          <button key={f} className={`tabs__btn ${format === f ? 'tabs__btn--active' : ''}`} onClick={() => setFormat(f)}>
            {f === 'css' ? 'CSS variables' : f === 'tailwind' ? 'Tailwind' : 'JSON'}
          </button>
        ))}
      </div>
      <CodeBlock code={code[format]} title={format === 'css' ? 'colors.css' : format === 'tailwind' ? 'tailwind.config.js' : 'palette.json'} />
    </section>
  );
}
