import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { ServerComponent } from '../data/api';
import { useSiteData } from '../data/context';
import { buildSrcdoc } from '../registry/srcdoc';
import HtmlFrame from '../site/HtmlFrame';
import { adminApi, formatDate, slugify, type ComponentInput, type Revision } from './adminApi';
import { CodeArea, Field, StatusBadge, readText, useSaveShortcut, useToast, useUnsavedChanges } from './ui';

type CodeTab = 'reactTsx' | 'reactCss' | 'html' | 'htmlCss' | 'htmlJs' | 'docs';

const TABS: { id: CodeTab; label: string; group: 'React' | 'HTML' | 'Docs' }[] = [
  { id: 'reactTsx', label: 'Component.tsx', group: 'React' },
  { id: 'reactCss', label: 'Component.css', group: 'React' },
  { id: 'html', label: 'index.html', group: 'HTML' },
  { id: 'htmlCss', label: 'style.css', group: 'HTML' },
  { id: 'htmlJs', label: 'script.js', group: 'HTML' },
  { id: 'docs', label: 'Usage & props', group: 'Docs' },
];

interface Form extends Omit<ComponentInput, 'props' | 'controls'> {
  propsText: string;
  controlsText: string;
}

const EMPTY: Form = {
  name: '', slug: '', category: 'cards', description: '', status: 'draft', isNew: true, stage: 'center',
  reactTsx: '', reactCss: '', html: '', htmlCss: '', htmlJs: '', usage: '', propsText: '', controlsText: '',
};

const REACT_STARTER = (name: string) => `import { useState } from 'react';
import './${name}.css';

interface ${name}Props {
  label?: string;
}

export default function ${name}({ label = 'Click me' }: ${name}Props) {
  const [count, setCount] = useState(0);
  return (
    <button className="my-component" onClick={() => setCount(count + 1)}>
      {label} · {count}
    </button>
  );
}
`;
const REACT_CSS_STARTER = `.my-component {
  padding: 14px 28px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
`;
const HTML_STARTER = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <button class="my-component">Click me</button>
    <script src="script.js"></script>
  </body>
</html>
`;

const toForm = (c: ServerComponent): Form => ({
  name: c.name,
  slug: c.slug,
  category: c.category,
  description: c.description,
  status: c.status,
  isNew: c.isNew,
  stage: c.stage,
  reactTsx: c.react?.tsx ?? '',
  reactCss: c.react?.css ?? '',
  html: c.html?.html ?? '',
  htmlCss: c.html?.css ?? '',
  htmlJs: c.html?.js ?? '',
  usage: c.usage ?? '',
  propsText: c.props ? JSON.stringify(c.props, null, 2) : '',
  controlsText: c.controls ? JSON.stringify(c.controls, null, 2) : '',
});

const pascal = (slug: string) => slug.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('') || 'MyComponent';

function parseList(text: string, field: string): unknown[] | null {
  if (!text.trim()) return null;
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error(`${field} isn't valid JSON`);
  }
  if (!Array.isArray(value)) throw new Error(`${field} must be a JSON list: [ … ]`);
  return value;
}

export default function ComponentEditor() {
  const params = useParams();
  const isNew = !params.id;
  const id = Number(params.id);
  const navigate = useNavigate();
  const toast = useToast();
  const { categories, entries, reload } = useSiteData();

  const [form, setForm] = useState<Form>(EMPTY);
  const [saved, setSaved] = useState<Form>(EMPTY);
  const [server, setServer] = useState<ServerComponent | null>(null);
  const [loadError, setLoadError] = useState('');
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [tab, setTab] = useState<CodeTab>('reactTsx');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<Revision[] | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Preview
  const [previewLang, setPreviewLang] = useState<'react' | 'html'>('react');
  const [preview, setPreview] = useState<{ srcdoc?: string; error?: string; loading?: boolean }>({});
  const [previewRun, setPreviewRun] = useState(0);

  useEffect(() => {
    if (isNew) return;
    adminApi
      .component(id)
      .then((c) => {
        const f = toForm(c);
        setServer(c);
        setForm(f);
        setSaved(f);
        setTab(c.react ? 'reactTsx' : 'html');
        setPreviewLang(c.react ? 'react' : 'html');
      })
      .catch((e: Error) => setLoadError(e.message));
  }, [id, isNew]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
  useUnsavedChanges(dirty && !busy);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const builtinClash = entries.some((e) => e.source === 'builtin' && e.slug === form.slug);

  /* ---------- Preview ---------- */
  const runPreview = useCallback(async () => {
    if (previewLang === 'html') {
      setPreview(form.html.trim() ? { srcdoc: buildSrcdoc(form.html, form.htmlCss, form.htmlJs) } : { error: 'Add HTML in index.html to preview it.' });
      return;
    }
    if (!form.reactTsx.trim()) {
      setPreview({ error: 'Add React code in Component.tsx to preview it.' });
      return;
    }
    setPreview((p) => ({ ...p, loading: true }));
    try {
      const res = await adminApi.compile(form.reactTsx, form.reactCss, form.stage);
      setPreview(res.ok ? { srcdoc: res.html } : { error: res.error });
    } catch (e) {
      setPreview({ error: (e as Error).message });
    }
  }, [form.html, form.htmlCss, form.htmlJs, form.reactTsx, form.reactCss, form.stage, previewLang]);

  // Auto-refresh the preview shortly after typing stops.
  useEffect(() => {
    const t = setTimeout(runPreview, previewLang === 'react' ? 700 : 250);
    return () => clearTimeout(t);
  }, [runPreview, previewLang, previewRun]);

  /* ---------- Upload code files ---------- */
  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const updates: Partial<Form> = {};
    const skipped: string[] = [];
    for (const file of Array.from(files)) {
      const name = file.name.toLowerCase();
      const text = await readText(file);
      if (/\.(tsx|jsx)$/.test(name)) updates.reactTsx = text;
      else if (/\.html?$/.test(name)) updates.html = text;
      else if (name.endsWith('.js')) updates.htmlJs = text;
      else if (name === 'style.css') updates.htmlCss = text;
      else if (name.endsWith('.css')) updates.reactCss = text;
      else if (name.endsWith('.md')) updates.usage = text;
      else skipped.push(file.name);
    }
    setForm((f) => ({ ...f, ...updates }));
    const loaded = Object.keys(updates).length;
    if (loaded) toast('ok', `Loaded ${loaded} file${loaded > 1 ? 's' : ''}. Remember to save.`);
    if (skipped.length) toast('error', `Skipped: ${skipped.join(', ')} (use .tsx, .jsx, .css, .html, .js or .md)`);
    if (updates.reactTsx) setTab('reactTsx');
    else if (updates.html) setTab('html');
    if (fileInput.current) fileInput.current.value = '';
  };

  /* ---------- Save / delete / history ---------- */
  const save = async () => {
    if (busy) return;
    let input: ComponentInput;
    try {
      const { propsText, controlsText, ...rest } = form;
      input = { ...rest, props: parseList(propsText, 'Props'), controls: parseList(controlsText, 'Controls') };
    } catch (e) {
      toast('error', (e as Error).message);
      setTab('docs');
      return;
    }
    setBusy(true);
    try {
      const result = isNew ? await adminApi.createComponent(input) : await adminApi.updateComponent(id, input);
      const f = toForm(result);
      setServer(result);
      setForm(f);
      setSaved(f);
      reload();
      if (result.compileError) toast('error', 'Saved, but the React code has an error (see preview).');
      else toast('ok', 'Saved');
      if (isNew) navigate(`/admin/components/${result.id}`, { replace: true });
      if (history) adminApi.revisions(result.id).then(setHistory);
    } catch (e) {
      toast('error', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  useSaveShortcut(save);

  const remove = async () => {
    if (!window.confirm(`Delete "${form.name}" permanently? This can't be undone.`)) return;
    setBusy(true);
    try {
      await adminApi.deleteComponent(id);
      setSaved(form); // nothing left to "lose"
      reload();
      toast('ok', 'Deleted');
      navigate('/admin/components');
    } catch (e) {
      toast('error', (e as Error).message);
      setBusy(false);
    }
  };

  const toggleHistory = async () => {
    if (history) return setHistory(null);
    setHistory(await adminApi.revisions(id).catch(() => []));
  };

  const restore = async (rev: Revision) => {
    if (!window.confirm(`Restore the version from ${formatDate(rev.createdAt)}? The current version is kept in history.`)) return;
    try {
      // The server keeps the current version in history before restoring.
      const result = await adminApi.restoreRevision(id, rev.id);
      const f = toForm(result);
      setServer(result);
      setForm(f);
      setSaved(f);
      reload();
      toast('ok', 'Version restored');
      setHistory(await adminApi.revisions(id));
    } catch (e) {
      toast('error', (e as Error).message);
    }
  };

  if (loadError) return <p className="ad-error">{loadError}</p>;
  if (!isNew && !server) return <p className="muted">Loading…</p>;

  const fileName = pascal(form.slug);
  const tabLabel = (t: (typeof TABS)[number]) => t.label.replace('Component', fileName);
  const filled = (t: CodeTab) => (t === 'docs' ? Boolean(form.usage || form.propsText) : Boolean(form[t].trim()));

  return (
    <div className="ad-page ad-editor">
      <header className="ad-head">
        <div>
          <p className="ad-crumb"><Link to="/admin/components">Components</Link> /</p>
          <h1>
            {isNew ? 'New component' : form.name || 'Untitled'}
            {!isNew && <StatusBadge status={saved.status} />}
            {dirty && <span className="ad-dirty">Unsaved changes</span>}
          </h1>
        </div>
        <div className="ad-head__actions">
          {!isNew && saved.status === 'published' && (
            <a className="ad-btn" href={`/components/${saved.slug}`} target="_blank" rel="noreferrer">View on site ↗</a>
          )}
          {!isNew && <button className="ad-btn" onClick={toggleHistory}>{history ? 'Hide history' : 'History'}</button>}
          {!isNew && <button className="ad-btn ad-btn--danger" onClick={remove} disabled={busy}>Delete</button>}
          <button className="ad-btn ad-btn--primary" onClick={save} disabled={busy || (!dirty && !isNew)}>
            {busy ? 'Saving…' : 'Save'} <kbd>Ctrl S</kbd>
          </button>
        </div>
      </header>

      {history && (
        <section className="ad-card ad-history">
          <h2>Version history</h2>
          {history.length === 0 ? (
            <p className="muted">No earlier versions yet. Each save keeps the previous version here (last 30).</p>
          ) : (
            <ul>
              {history.map((r) => (
                <li key={r.id}>
                  <span>{formatDate(r.createdAt)}</span>
                  <span className="muted">by {r.author}</span>
                  <button className="ad-btn ad-btn--small" onClick={() => restore(r)}>Restore</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="ad-card ad-grid-form">
        <Field label="Name">
          <input
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
            }}
            placeholder="Neon Card"
          />
        </Field>
        <Field label="Slug (URL)" hint={builtinClash ? '⚠ A built-in component uses this slug; the built-in one will be shown.' : `/components/${form.slug || 'your-slug'}`}>
          <input
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set('slug', e.target.value.toLowerCase());
            }}
            placeholder="neon-card"
          />
        </Field>
        <Field label="Category">
          <select value={form.category} onChange={(e) => set('category', e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={(e) => set('status', e.target.value as Form['status'])}>
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published (visible)</option>
          </select>
        </Field>
        <Field label="Description">
          <input value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="One sentence about what it does." />
        </Field>
        <div className="ad-inline">
          <label className="ad-check">
            <input type="checkbox" checked={form.isNew} onChange={(e) => set('isNew', e.target.checked)} /> "New" badge
          </label>
          <label className="ad-check">
            <input type="checkbox" checked={form.stage === 'fill'} onChange={(e) => set('stage', e.target.checked ? 'fill' : 'center')} /> Full-size preview (backgrounds)
          </label>
        </div>
      </section>

      <div className="ad-split">
        <section className="ad-card ad-codecard">
          <div className="ad-codetabs" role="tablist">
            {TABS.map((t, i) => (
              <span key={t.id} className="ad-codetabs__item">
                {(i === 0 || TABS[i - 1].group !== t.group) && <span className="ad-codetabs__group">{t.group}</span>}
                <button
                  role="tab"
                  aria-selected={tab === t.id}
                  className={`ad-codetab ${tab === t.id ? 'ad-codetab--active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {tabLabel(t)}
                  {filled(t.id) && <i className="ad-codetab__dot" aria-label="has content" />}
                </button>
              </span>
            ))}
          </div>

          <div className="ad-codebar">
            <button className="ad-btn ad-btn--small" onClick={() => fileInput.current?.click()}>⬆ Upload code files</button>
            <input
              ref={fileInput}
              type="file"
              multiple
              hidden
              accept=".tsx,.jsx,.css,.html,.htm,.js,.md"
              onChange={(e) => onFiles(e.target.files)}
            />
            {tab === 'reactTsx' && !form.reactTsx && (
              <button className="ad-btn ad-btn--small" onClick={() => setForm((f) => ({ ...f, reactTsx: REACT_STARTER(fileName), reactCss: f.reactCss || REACT_CSS_STARTER }))}>
                Insert React starter
              </button>
            )}
            {tab === 'html' && !form.html && (
              <button className="ad-btn ad-btn--small" onClick={() => setForm((f) => ({ ...f, html: HTML_STARTER, htmlCss: f.htmlCss || REACT_CSS_STARTER }))}>
                Insert HTML starter
              </button>
            )}
            <span className="muted ad-codebar__hint">
              .tsx/.jsx → React · .css → React CSS · style.css → HTML CSS · .html · .js · .md → usage
            </span>
          </div>

          {tab === 'docs' ? (
            <div className="ad-docs">
              <Field label="Usage example (React)" hint="Shown under “Usage” on the component page.">
                <CodeArea rows={4} value={form.usage} onValue={(v) => set('usage', v)} placeholder={`<${fileName} label="Hello" />`} />
              </Field>
              <Field label="Props table (JSON list)" hint={`[{ "name": "label", "type": "string", "default": "'Click me'", "description": "Button text" }]`}>
                <CodeArea rows={7} value={form.propsText} onValue={(v) => set('propsText', v)} />
              </Field>
              <Field label="Customize options (JSON list, for Pro)" hint={`[{ "prop": "label", "label": "Label", "type": "text", "default": "Click me" }]`}>
                <CodeArea rows={5} value={form.controlsText} onValue={(v) => set('controlsText', v)} />
              </Field>
            </div>
          ) : (
            <CodeArea
              key={tab}
              className="ad-code--big"
              value={form[tab]}
              onValue={(v) => set(tab, v)}
              placeholder={tab === 'reactTsx' ? 'export default function MyComponent() { … }' : ''}
            />
          )}
        </section>

        <section className="ad-card ad-preview">
          <div className="ad-preview__bar">
            <div className="tabs">
              {(['react', 'html'] as const).map((l) => (
                <button key={l} className={`tabs__btn ${previewLang === l ? 'tabs__btn--active' : ''}`} onClick={() => setPreviewLang(l)}>
                  {l === 'react' ? 'React' : 'HTML / CSS / JS'}
                </button>
              ))}
            </div>
            <button className="ad-btn ad-btn--small" onClick={() => setPreviewRun((n) => n + 1)}>
              {preview.loading ? 'Building…' : '↻ Refresh'}
            </button>
          </div>
          <div className={`ad-preview__frame ${preview.loading ? 'ad-preview__frame--loading' : ''}`}>
            {preview.error ? (
              <pre className="ad-compile-error">{preview.error}</pre>
            ) : preview.srcdoc !== undefined ? (
              <HtmlFrame key={preview.srcdoc.length + previewRun} srcdoc={preview.srcdoc} title="Live preview" />
            ) : (
              <p className="muted">Preview appears here.</p>
            )}
          </div>
          <p className="muted ad-preview__note">
            Runs sandboxed. React code may import only <code>react</code>, <code>react-dom</code> and its CSS file.
            {server?.compileError && <><br /><strong className="ad-error-inline">Saved version has a code error, so its React preview is hidden on the site.</strong></>}
          </p>
        </section>
      </div>
    </div>
  );
}
