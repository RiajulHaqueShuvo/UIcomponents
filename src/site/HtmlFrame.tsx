import { useEffect, useRef, useState } from 'react';

interface HtmlFrameProps {
  /** Inline page (HTML versions)… */
  srcdoc?: string;
  /** …or a page URL (server-compiled React previews). */
  src?: string;
  title: string;
  lazy?: boolean;
  /**
   * Props for a compiled React preview. They're sent into the frame with
   * postMessage({ type: 'uic:props', props }) on load and whenever they change.
   */
  props?: Record<string, unknown>;
  /**
   * Our own built-in library code (from src/library, reviewed and shipped with the site).
   * Only then the frame also gets allow-same-origin, so it can load its images and
   * videos: some browsers block every request from a fully sandboxed frame.
   * Never set this for uploaded code.
   */
  trusted?: boolean;
}

/**
 * Runs component code in a sandboxed iframe.
 * sandbox="allow-scripts" (without allow-same-origin) lets the code run but
 * blocks it from reading this site, its storage or cookies, so uploaded code
 * stays isolated.
 *
 * URL previews are fetched and shown through srcdoc too: some browsers and
 * embedded webviews refuse to navigate sandboxed frames, and this way the
 * result is the same everywhere.
 */
export default function HtmlFrame({ srcdoc, src, title, lazy = false, props, trusted = false }: HtmlFrameProps) {
  const [fetched, setFetched] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (srcdoc !== undefined || !src) return;
    let cancelled = false;
    setFetched(null);
    setFailed(false);
    fetch(src)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((html) => !cancelled && setFetched(html))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [src, srcdoc]);

  const doc = srcdoc ?? fetched;

  // A new document means the frame has to load again before it can receive props.
  useEffect(() => setLoaded(false), [doc]);

  useEffect(() => {
    if (!props || !loaded) return;
    // '*' is required: a sandboxed frame has an opaque origin. Only plain
    // option values are sent, nothing private.
    frameRef.current?.contentWindow?.postMessage({ type: 'uic:props', props }, '*');
  }, [props, loaded]);

  if (doc === null || doc === undefined) {
    return <div className="html-frame html-frame--placeholder">{failed ? "Preview couldn't load." : ''}</div>;
  }

  return (
    <iframe
      ref={frameRef}
      className="html-frame"
      title={title}
      srcDoc={doc}
      sandbox={trusted && srcdoc !== undefined ? 'allow-scripts allow-same-origin' : 'allow-scripts'}
      loading={lazy ? 'lazy' : 'eager'}
      onLoad={() => setLoaded(true)}
    />
  );
}
