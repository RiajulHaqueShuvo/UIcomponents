import { useState, type ComponentType } from 'react';
import HtmlFrame from './HtmlFrame';

interface PreviewStageProps {
  /** React version to render… */
  Component?: ComponentType<Record<string, unknown>>;
  /** …or an HTML version to run in a sandboxed iframe… */
  srcdoc?: string;
  /** …or a server-compiled preview page (also sandboxed). */
  src?: string;
  stage?: 'center' | 'fill';
  /** Props to render the React component with (Customize tab). */
  props?: Record<string, unknown>;
  /** Changing this remounts the component. */
  remountKey?: string;
  title?: string;
  /** Built-in library code (see HtmlFrame). */
  trusted?: boolean;
}

export default function PreviewStage({
  Component,
  srcdoc,
  src,
  stage = 'center',
  props,
  remountKey = '',
  title = 'Component preview',
  trusted = false,
}: PreviewStageProps) {
  // Changing the key remounts the component, which replays its intro animation.
  const [runId, setRunId] = useState(0);
  const key = `${runId}|${remountKey}`;

  let body;
  if (Component) {
    body = (
      <div className={`stage__inner stage__inner--${stage}`} key={key}>
        <Component {...props} />
      </div>
    );
  } else if (srcdoc !== undefined || src) {
    body = (
      <div className="stage__inner stage__inner--frame" key={key}>
        <HtmlFrame srcdoc={srcdoc} src={src} title={title} props={props} trusted={trusted} />
      </div>
    );
  } else {
    body = (
      <div className="stage__inner stage__inner--center">
        <p className="muted">Preview isn't available for this version yet.</p>
      </div>
    );
  }

  return (
    <div className="stage">
      <button className="stage__replay" onClick={() => setRunId((n) => n + 1)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Replay
      </button>
      {body}
    </div>
  );
}
