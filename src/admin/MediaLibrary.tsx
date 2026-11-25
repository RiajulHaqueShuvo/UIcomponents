import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import CopyButton from '../site/CopyButton';
import { adminApi, formatDate, formatSize, type MediaItem } from './adminApi';
import { EmptyState, useToast } from './ui';

const ACCEPT = '.png,.jpg,.jpeg,.gif,.webp,.avif,.svg,.pdf,.md,.txt,.woff,.woff2,.mp4';

export default function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<string[]>([]);
  const [drag, setDrag] = useState(false);
  const [query, setQuery] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    adminApi.media().then(setItems).catch((e: Error) => setError(e.message));
  }, []);

  const upload = async (files: FileList | File[] | null) => {
    const list = Array.from(files ?? []);
    if (!list.length) return;
    setUploading(list.map((f) => f.name));
    let ok = 0;
    for (const file of list) {
      try {
        const item = await adminApi.upload(file);
        setItems((cur) => [item, ...(cur ?? [])]);
        ok++;
      } catch (e) {
        toast('error', `${file.name}: ${(e as Error).message}`);
      }
      setUploading((u) => u.filter((n) => n !== file.name));
    }
    if (ok) toast('ok', `Uploaded ${ok} file${ok > 1 ? 's' : ''}`);
    if (input.current) input.current.value = '';
  };

  const remove = async (m: MediaItem) => {
    if (!window.confirm(`Delete "${m.filename}" permanently? Pages that use it will show a broken link.`)) return;
    try {
      await adminApi.deleteMedia(m.id);
      setItems((cur) => (cur ?? []).filter((x) => x.id !== m.id));
      toast('ok', 'Deleted');
    } catch (e) {
      toast('error', (e as Error).message);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    upload(e.dataTransfer.files);
  };

  const filtered = useMemo(
    () => (items ?? []).filter((m) => !query.trim() || m.filename.toLowerCase().includes(query.trim().toLowerCase())),
    [items, query]
  );

  return (
    <div className="ad-page">
      <header className="ad-head">
        <div>
          <h1>Media</h1>
          <p className="muted">Images and files for components and documents. Max 15 MB each.</p>
        </div>
        <button className="ad-btn ad-btn--primary" onClick={() => input.current?.click()}>⬆ Upload files</button>
        <input ref={input} type="file" multiple hidden accept={ACCEPT} onChange={(e) => upload(e.target.files)} />
      </header>

      <div
        className={`ad-drop ${drag ? 'ad-drop--active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => input.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
      >
        {uploading.length ? `Uploading ${uploading.join(', ')}…` : 'Drop files here, or click to choose'}
        <small>PNG, JPG, GIF, WebP, AVIF, SVG, PDF, MD, TXT, WOFF/WOFF2, MP4</small>
      </div>

      {items && items.length > 0 && (
        <input className="ad-search" placeholder="Search files…" value={query} onChange={(e) => setQuery(e.target.value)} />
      )}

      {error && <p className="ad-error">{error}</p>}
      {!items && !error && <p className="muted">Loading…</p>}
      {items && items.length === 0 && <EmptyState title="No files yet"><p className="muted">Upload logos, images or PDFs.</p></EmptyState>}

      <div className="ad-media">
        {filtered.map((m) => {
          const absolute = `${window.location.origin}${m.url}`;
          return (
            <figure key={m.id} className="ad-media__item">
              <a href={m.url} target="_blank" rel="noreferrer" className="ad-media__thumb">
                {m.mime.startsWith('image/') ? <img src={m.url} alt={m.filename} loading="lazy" /> : <span>{m.mime.split('/')[1].toUpperCase()}</span>}
              </a>
              <figcaption>
                <strong title={m.filename}>{m.filename}</strong>
                <span className="muted">{formatSize(m.size)} · {formatDate(m.createdAt)}</span>
                <div className="ad-media__actions">
                  <CopyButton text={absolute} />
                  <button className="ad-btn ad-btn--small ad-btn--danger" onClick={() => remove(m)}>Delete</button>
                </div>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
