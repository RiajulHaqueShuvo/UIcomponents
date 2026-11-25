import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useMemo } from 'react';

marked.setOptions({ gfm: true, breaks: false });

/** Renders Markdown safely: the HTML is sanitized before it reaches the page. */
export default function Markdown({ source, className = '' }: { source: string; className?: string }) {
  const html = useMemo(
    () => DOMPurify.sanitize(marked.parse(source, { async: false }), { USE_PROFILES: { html: true } }),
    [source]
  );
  return <div className={`markdown ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
