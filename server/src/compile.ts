import { build, type Plugin } from 'esbuild';
import { BASE_STYLE } from '../../src/registry/srcdoc.ts';
import { ROOT } from './config.ts';

/*
 * Uploaded React code → one self-contained script (component + React) that
 * renders into #root. It only ever runs inside a sandboxed iframe.
 *
 * The preview listens for postMessage({ type: 'uic:props', props }) so the
 * site can re-render it with different props later (Customize).
 */

const ENTRY = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import Component from 'uic:component';

const root = createRoot(document.getElementById('root'));
let props = {};
let run = 0;
// A new key remounts the component, so props it only reads once (start
// values, default tab…) take effect, the same as the site's own playground.
const render = () => root.render(React.createElement(Component, { ...props, key: run++ }));
window.addEventListener('message', (e) => {
  // Only the page that embeds this preview may set props.
  if (e.source !== window.parent) return;
  const d = e.data;
  if (d && d.type === 'uic:props' && d.props && typeof d.props === 'object') {
    props = d.props;
    render();
  }
});
render();
`;

// Uploaded code may import only these exact modules (bundled from our node_modules).
// An exact list, so paths like "react/../../server/data/x" can't pull other files in.
const ALLOWED = new Set(['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom', 'react-dom/client']);

function componentPlugin(tsx: string): Plugin {
  return {
    name: 'uic-component',
    setup(b) {
      b.onResolve({ filter: /^uic:component$/ }, () => ({ path: 'component.tsx', namespace: 'uic' }));
      b.onLoad({ filter: /.*/, namespace: 'uic' }, () => ({ contents: tsx, loader: 'tsx', resolveDir: ROOT }));

      // The component's own CSS import becomes a no-op: the stored CSS is inlined
      // in the preview page. Nothing is read from disk.
      b.onResolve({ filter: /\.css$/ }, (args) =>
        args.importer === 'component.tsx' ? { path: args.path, namespace: 'uic-css' } : undefined
      );
      b.onLoad({ filter: /.*/, namespace: 'uic-css' }, () => ({ contents: '', loader: 'js' }));

      b.onResolve({ filter: /.*/ }, (args) => {
        if (args.importer !== 'component.tsx') return undefined; // React's own imports
        if (ALLOWED.has(args.path)) return undefined;
        return {
          errors: [
            {
              text: `"${args.path}" can't be imported. Uploaded components may only import react and react-dom (and their CSS file).`,
            },
          ],
        };
      });
    },
  };
}

export interface CompileResult {
  bundle: string | null;
  error: string | null;
}

export async function compileReact(tsx: string): Promise<CompileResult> {
  try {
    const out = await build({
      stdin: { contents: ENTRY, loader: 'js', resolveDir: ROOT, sourcefile: 'preview-entry.js' },
      bundle: true,
      write: false,
      format: 'iife',
      minify: true,
      target: 'es2020',
      jsx: 'automatic',
      define: { 'process.env.NODE_ENV': '"production"' },
      logLevel: 'silent',
      plugins: [componentPlugin(tsx)],
    });
    return { bundle: out.outputFiles[0].text, error: null };
  } catch (err) {
    const errors = (err as { errors?: { text: string; location?: { line: number; column: number } | null }[] }).errors;
    const message = errors?.length
      ? errors
          .map((e) => (e.location ? `Line ${e.location.line}:${e.location.column + 1} — ${e.text}` : e.text))
          .join('\n')
      : String(err);
    return { bundle: null, error: message };
  }
}

/** The full HTML page for a compiled React preview. */
export function reactPreviewPage(bundle: string, css: string | null, stage: 'center' | 'fill'): string {
  const fill = stage === 'fill' ? '<style>#root { position: fixed; inset: 0; }</style>' : '';
  const safe = bundle.replace(/<\/script/gi, '<\\/script');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
${BASE_STYLE}
${fill}
<style>
${css ?? ''}
</style>
</head>
<body>
<div id="root"></div>
<script>${safe}</script>
</body>
</html>`;
}
