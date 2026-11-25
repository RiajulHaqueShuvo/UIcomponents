import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSiteData } from '../data/context';
import { LANGUAGE_LABELS, type Language, type RegistryEntry } from '../registry/types';
import CodeBlock from './CodeBlock';
import PreviewStage from './PreviewStage';
import PropsTable from './PropsTable';
import NotFound from './NotFound';
import Playground from './playground/Playground';
import { usePreferredLanguage } from './usePreferredLanguage';
import { useSeo } from './useSeo';

type Tab = 'preview' | 'code' | 'customize';

const TAB_LABELS: Record<Tab, string> = {
  preview: 'Preview',
  code: 'Code',
  customize: 'Customize',
};

export default function ComponentPage() {
  const { slug = '' } = useParams();
  const { entries, categories, getEntry, settings, status } = useSiteData();
  const entry = getEntry(slug);
  const [tab, setTab] = useState<Tab>('preview');
  const [fileIndex, setFileIndex] = useState(0);
  const [preferred, setPreferred] = usePreferredLanguage();

  // Each component opens on its preview and first file.
  useEffect(() => {
    setTab('preview');
    setFileIndex(0);
  }, [slug]);

  const categoryLabel = categories.find((c) => c.id === entry?.category)?.label;
  useSeo({
    title: entry ? `${entry.name} — ${categoryLabel ?? 'Component'}` : status === 'loading' ? settings.siteName : 'Not found',
    description: entry
      ? `${entry.description} Live preview and copy-ready ${entry.variants.map((v) => (v.language === 'react' ? 'React' : 'HTML/CSS/JS')).join(' and ')} code.`
      : undefined,
    path: `/components/${slug}`,
    noindex: !entry && status !== 'loading',
  });

  // Uploaded components arrive from the server a moment after the page loads.
  if (!entry && status === 'loading') return <p className="muted">Loading…</p>;
  if (!entry) return <NotFound />;

  const languages = entry.variants.map((v) => v.language);
  // Use the visitor's preferred language when this component has it.
  const lang: Language = languages.includes(preferred) ? preferred : languages[0];
  const variant = entry.variants.find((v) => v.language === lang)!;
  const file = variant.files[fileIndex] ?? variant.files[0];

  const category = categories.find((c) => c.id === entry.category)!;
  const index = entries.indexOf(entry);
  const prev = entries[index - 1];
  const next = entries[index + 1];

  const switchLanguage = (l: Language) => {
    setPreferred(l);
    setFileIndex(0);
  };

  return (
    <article className="page">
      <p className="page__crumb">
        <Link to="/">Components</Link> / <span>{category.label}</span>
      </p>
      <h1 className="page__title">
        {entry.name}
        {entry.isNew && <span className="tag-new">New</span>}
      </h1>
      <p className="page__lead">{entry.description}</p>
      <div className="lang-chips" aria-label="Available in">
        {languages.map((l) => (
          <span key={l} className={`lang-chip lang-chip--${l}`}>{LANGUAGE_LABELS[l]}</span>
        ))}
      </div>

      <div className="page__toolbar">
        <div className="tabs" role="tablist">
          {(['preview', 'code', 'customize'] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={`tabs__btn ${tab === t ? 'tabs__btn--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {TAB_LABELS[t]}
              {t === 'customize' && <span className="pro-pill pro-pill--sm">PRO</span>}
            </button>
          ))}
        </div>

        {languages.length > 1 && tab !== 'customize' && (
          <div className="tabs lang-switch" role="radiogroup" aria-label="Code language">
            {languages.map((l) => (
              <button
                key={l}
                role="radio"
                aria-checked={lang === l}
                className={`tabs__btn ${lang === l ? 'tabs__btn--active' : ''}`}
                onClick={() => switchLanguage(l)}
              >
                {LANGUAGE_LABELS[l]}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === 'preview' && (
        <PreviewStage
          key={`${entry.slug}-${lang}`}
          Component={lang === 'react' ? entry.Component : undefined}
          srcdoc={lang === 'html' ? entry.srcdoc : undefined}
          src={lang === 'react' && !entry.Component ? entry.previewUrl : undefined}
          stage={entry.stage}
          title={`${entry.name} preview`}
        />
      )}

      {tab === 'customize' &&
        (entry.Component || entry.previewUrl ? (
          <Playground key={entry.slug} entry={entry} />
        ) : (
          <p className="muted">
            {languages.includes('react')
              ? "Customize needs a working React version. This component's React code doesn't compile yet."
              : 'Customize works with the React version. This component is only available in HTML / CSS / JS for now.'}
          </p>
        ))}

      {tab === 'code' && (
        <div className="files">
          <div className="files__tabs">
            {variant.files.map((f, i) => (
              <button
                key={f.filename}
                className={`files__tab ${f === file ? 'files__tab--active' : ''}`}
                onClick={() => setFileIndex(i)}
              >
                {f.filename}
              </button>
            ))}
          </div>
          <CodeBlock code={file.code} title={file.filename} />
        </div>
      )}

      <UsageSection entry={entry} lang={lang} />

      <nav className="pager">
        {prev ? (
          <Link to={`/components/${prev.slug}`} className="pager__link">
            <small>Previous</small>
            {prev.name}
          </Link>
        ) : <span />}
        {next && (
          <Link to={`/components/${next.slug}`} className="pager__link pager__link--next">
            <small>Next</small>
            {next.name}
          </Link>
        )}
      </nav>
    </article>
  );
}

function UsageSection({ entry, lang }: { entry: RegistryEntry; lang: Language }) {
  if (lang === 'html') {
    const files = entry.variants.find((v) => v.language === 'html')!.files.map((f) => f.filename);
    const hasCss = files.includes('style.css');
    const hasJs = files.includes('script.js');
    const lines = [
      '<!-- Copy the markup from index.html into your page. -->',
      '<!-- Keep style.css and script.js next to it and link them: -->',
      '',
      '<head>',
      ...(hasCss ? ['  <link rel="stylesheet" href="style.css" />'] : []),
      '</head>',
      '<body>',
      '  <!-- …component markup… -->',
      ...(hasJs ? ['  <script src="script.js"></script>'] : []),
      '</body>',
    ];
    return (
      <>
        <h2 className="page__h2">Usage</h2>
        <CodeBlock title="your-page.html" code={lines.join('\n')} />
        <h2 className="page__h2">Installation</h2>
        <p className="muted">
          No framework or build step. Copy {files.map((f, i) => (
            <span key={f}>{i > 0 && (i === files.length - 1 ? ' and ' : ', ')}<code>{f}</code></span>
          ))} and open the page in any browser.
        </p>
      </>
    );
  }

  const reactFiles = entry.variants.find((v) => v.language === 'react')!.files;
  return (
    <>
      {entry.usage && (
        <>
          <h2 className="page__h2">Usage</h2>
          <CodeBlock title="App.tsx" code={`import ${entry.id} from './${entry.id}';\n\n${entry.usage}`} />
        </>
      )}
      {entry.props && (
        <>
          <h2 className="page__h2">Props</h2>
          <PropsTable props={entry.props} />
        </>
      )}
      <h2 className="page__h2">Installation</h2>
      <p className="muted">
        No extra packages. Copy <code>{entry.id}.tsx</code>
        {reactFiles.length > 1 && <> and <code>{entry.id}.css</code></>} into your project (React
        18+). Works in plain JavaScript too: just remove the type annotations.
      </p>
    </>
  );
}
