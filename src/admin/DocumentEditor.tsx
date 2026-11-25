import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSiteData } from '../data/context';
import Markdown from '../site/Markdown';
import { adminApi, slugify, type Doc, type DocInput, type MediaItem } from './adminApi';
import { CodeArea, Field, StatusBadge, readText, useSaveShortcut, useToast, useUnsavedChanges } from './ui';

const EMPTY: DocInput = { title: '', slug: '', body: '', status: 'draft', sort: 0 };
const pick = (d: Doc): DocInput => ({ title: d.title, slug: d.slug, body: d.body, status: d.status, sort: d.sort });

export default function DocumentEditor() {
  const params = useParams();
  const isNew = !params.id;
  const id = Number(params.id);
  const navigate = useNavigate();
  const toast = useToast();
  const { reload } = useSiteData();

  const [form, setForm] = useState<DocInput>(EMPTY);
  const [saved, setSaved] = useState<DocInput>(EMPTY);
  const [loaded, setLoaded] = useState(isNew);
  const [loadError, setLoadError] = useState('');
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [media, setMedia] = useState<MediaItem[] | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isNew) return;
    adminApi
      .document(id)
      .then((d) => {
        setForm(pick(d));
        setSaved(pick(d));
        setLoaded(true);
      })
      .catch((e: Error) => setLoadError(e.message));
  }, [id, isNew]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
  useUnsavedChanges(dirty && !busy);
  const set = <K extends keyof DocInput>(k: K, v: DocInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const d = isNew ? await adminApi.createDocument(form) : await adminApi.updateDocument(id, form);
      setForm(pick(d));
      setSaved(pick(d));
      reload();
      toast('ok', 'Saved');
      if (isNew) navigate(`/admin/documents/${d.id}`, { replace: true });
    } catch (e) {
      toast('error', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  useSaveShortcut(save);

  const remove = async () => {
    if (!window.confirm(`Delete "${form.title}" permanently? This can't be undone.`)) return;
    try {
      await adminApi.deleteDocument(id);
      setSaved(form);
      reload();
      toast('ok', 'Deleted');
      navigate('/admin/documents');
    } catch (e) {
      toast('error', (e as Error).message);
    }
  };

  const uploadMd = async (file: File | undefined) => {
    if (!file) return;
    const text = await readText(file);
    const heading = /^#\s+(.+)$/m.exec(text)?.[1]?.trim();
    setForm((f) => ({
      ...f,
      body: text,
      title: f.title || heading || file.name.replace(/\.(md|markdown|txt)$/i, ''),
      slug: slugTouched ? f.slug : slugify(f.title || heading || file.name.replace(/\.\w+$/, '')),
    }));
    toast('ok', `Loaded ${file.name}. Remember to save.`);
    if (fileInput.current) fileInput.current.value = '';
  };

  /** Insert a media file at the cursor (images as ![](), others as links). */
  const insertMedia = (m: MediaItem) => {
    const snippet = m.mime.startsWith('image/') ? `![${m.filename}](${m.url})` : `[${m.filename}](${m.url})`;
    const el = textRef.current;
    const pos = el ? el.selectionStart : form.body.length;
    set('body', `${form.body.slice(0, pos)}${snippet}${form.body.slice(pos)}`);
    setMedia(null);
  };

  if (loadError) return <p className="ad-error">{loadError}</p>;
  if (!loaded) return <p className="muted">Loading…</p>;

  return (
    <div className="ad-page ad-editor">
      <header className="ad-head">
        <div>
          <p className="ad-crumb"><Link to="/admin/documents">Documents</Link> /</p>
          <h1>
            {isNew ? 'New document' : form.title || 'Untitled'}
            {!isNew && <StatusBadge status={saved.status} />}
            {dirty && <span className="ad-dirty">Unsaved changes</span>}
          </h1>
        </div>
        <div className="ad-head__actions">
          {!isNew && saved.status === 'published' && (
            <a className="ad-btn" href={`/docs/${saved.slug}`} target="_blank" rel="noreferrer">View on site ↗</a>
          )}
          {!isNew && <button className="ad-btn ad-btn--danger" onClick={remove}>Delete</button>}
          <button className="ad-btn ad-btn--primary" onClick={save} disabled={busy || (!dirty && !isNew)}>
            {busy ? 'Saving…' : 'Save'} <kbd>Ctrl S</kbd>
          </button>
        </div>
      </header>

      <section className="ad-card ad-grid-form">
        <Field label="Title">
          <input
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
            }}
            placeholder="Getting started"
          />
        </Field>
        <Field label="Slug (URL)" hint={`/docs/${form.slug || 'your-slug'}`}>
          <input value={form.slug} onChange={(e) => { setSlugTouched(true); set('slug', e.target.value.toLowerCase()); }} />
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={(e) => set('status', e.target.value as DocInput['status'])}>
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published (visible)</option>
          </select>
        </Field>
        <Field label="Menu order" hint="Lower numbers come first">
          <input type="number" value={form.sort} onChange={(e) => set('sort', Math.round(Number(e.target.value) || 0))} />
        </Field>
      </section>

      <div className="ad-split">
        <section className="ad-card ad-codecard">
          <div className="ad-codebar">
            <button className="ad-btn ad-btn--small" onClick={() => fileInput.current?.click()}>⬆ Upload .md file</button>
            <input ref={fileInput} type="file" hidden accept=".md,.markdown,.txt" onChange={(e) => uploadMd(e.target.files?.[0])} />
            <button className="ad-btn ad-btn--small" onClick={async () => setMedia(media ? null : await adminApi.media().catch(() => []))}>
              🖼 Insert media
            </button>
            <span className="muted ad-codebar__hint">Markdown: # Heading, **bold**, - list, [link](url), ```code```</span>
          </div>
          {media && (
            <div className="ad-media-pick">
              {media.length === 0 ? (
                <p className="muted">No media yet. Upload files in Media first.</p>
              ) : (
                media.map((m) => (
                  <button key={m.id} className="ad-media-pick__item" onClick={() => insertMedia(m)} title={m.filename}>
                    {m.mime.startsWith('image/') ? <img src={m.url} alt="" /> : <span>📄</span>}
                    <small>{m.filename}</small>
                  </button>
                ))
              )}
            </div>
          )}
          <CodeArea
            ref={textRef}
            className="ad-code--big ad-code--prose"
            value={form.body}
            onValue={(v) => set('body', v)}
            placeholder="# Title&#10;&#10;Write here…"
          />
        </section>
        <section className="ad-card ad-preview">
          <div className="ad-preview__bar"><strong>Preview</strong></div>
          <div className="ad-doc-preview">
            {form.body.trim() ? <Markdown source={form.body} /> : <p className="muted">Preview appears here.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
