import { useEffect, useState } from 'react';

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard can be blocked (e.g. insecure origin); fail quietly.
    }
  };

  return (
    <button className={`copy-btn ${copied ? 'copy-btn--done' : ''}`} onClick={copy}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
