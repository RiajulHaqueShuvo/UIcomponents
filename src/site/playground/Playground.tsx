import { useMemo, useState } from 'react';
import type { RegistryEntry } from '../../registry/types';
import { usePremium } from '../../premium/context';
import CodeBlock from '../CodeBlock';
import PreviewStage from '../PreviewStage';
import ControlField from './ControlField';
import { defaultsOf, toDemoFile, type Values } from './codegen';

/** Pro feature: live controls + code generated from the chosen values. */
export default function Playground({ entry }: { entry: RegistryEntry }) {
  const { isPro, openUpgrade } = usePremium();
  const controls = useMemo(() => entry.controls ?? [], [entry]);
  const defaults = useMemo(() => defaultsOf(controls), [controls]);
  const [values, setValues] = useState<Values>(defaults);
  // Bumped on reset so text fields drop their typed-in state.
  const [resetId, setResetId] = useState(0);

  const code = useMemo(() => toDemoFile(entry.id, controls, values), [entry.id, controls, values]);
  const changed = JSON.stringify(values) !== JSON.stringify(defaults);
  const hasCss = entry.variants.some((v) => v.language === 'react' && v.files.some((f) => f.language === 'css'));

  if (controls.length === 0) {
    return <p className="muted">This component has nothing to customize yet.</p>;
  }

  return (
    <div className={`playground ${isPro ? '' : 'playground--locked'}`}>
      <div className="playground__grid">
        <PreviewStage
          Component={entry.Component}
          // Uploaded components run in a sandboxed frame; options are sent to it as messages.
          src={entry.Component ? undefined : entry.previewUrl}
          stage={entry.stage}
          props={values}
          // Remount on change so components that read props only once
          // (default tab, start value…) show the new value right away.
          // (The sandboxed preview remounts itself on every message.)
          remountKey={entry.Component ? JSON.stringify(values) : ''}
          title={`${entry.name} customize preview`}
        />

        <aside className="playground__panel" aria-label="Customize options">
          <div className="playground__head">
            <h3>Options</h3>
            <button
              className="playground__reset"
              disabled={!isPro || !changed}
              onClick={() => {
                setValues(defaults);
                setResetId((n) => n + 1);
              }}
            >
              Reset
            </button>
          </div>
          <div className="playground__fields" inert={!isPro}>
            {controls.map((c) => (
              <ControlField
                key={`${c.prop}-${resetId}`}
                control={c}
                value={values[c.prop]}
                disabled={!isPro}
                onChange={(v) => setValues((cur) => ({ ...cur, [c.prop]: v }))}
              />
            ))}
          </div>

          {!isPro && (
            <div className="playground__lock">
              <span className="pro-pill">PRO</span>
              <p>Customize is a Pro feature.</p>
              <button className="btn btn--primary" onClick={openUpgrade}>
                Unlock Customize
              </button>
            </div>
          )}
        </aside>
      </div>

      <h2 className="page__h2">Your code</h2>
      {isPro ? (
        <>
          <p className="muted playground__note">
            Updates as you change options. Use it with <code>{entry.id}.tsx</code>
            {hasCss && <> and <code>{entry.id}.css</code></>} from the Code tab (React).
          </p>
          <CodeBlock title={`${entry.id}Demo.tsx`} code={code} />
        </>
      ) : (
        <div className="playground__teaser">
          <p>Your customized code appears here with Pro.</p>
          <button className="btn btn--ghost" onClick={openUpgrade}>See Pro</button>
        </div>
      )}
    </div>
  );
}
