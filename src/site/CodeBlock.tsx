import { useMemo } from 'react';
import { highlight } from 'sugar-high';
import CopyButton from './CopyButton';

interface CodeBlockProps {
  code: string;
  /** Optional label shown in the top bar, e.g. a file name. */
  title?: string;
}

export default function CodeBlock({ code, title }: CodeBlockProps) {
  const html = useMemo(() => highlight(code.trimEnd()), [code]);

  return (
    <div className="code">
      <div className="code__bar">
        <span className="code__title">{title}</span>
        <CopyButton text={code} />
      </div>
      <pre className="code__pre">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
