import type { Control } from '../../registry/types';

export type Values = Record<string, unknown>;

export const defaultsOf = (controls: Control[]): Values =>
  Object.fromEntries(controls.map((c) => [c.prop, c.default]));

const quote = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

function literal(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(literal).join(', ')}]`;
  if (typeof v === 'string') return quote(v);
  return String(v);
}

function attribute(prop: string, v: unknown): string {
  if (typeof v === 'boolean') return v ? prop : `${prop}={false}`;
  // Plain strings read best as prop="text"; anything tricky goes in braces.
  if (typeof v === 'string' && !/["{}<>\n\\]/.test(v)) return `${prop}="${v}"`;
  return `${prop}={${literal(v)}}`;
}

function childText(v: unknown): string {
  const s = String(v);
  return /[{}<>]/.test(s) ? `{${quote(s)}}` : s;
}

/** JSX for one component with the chosen values, e.g. <SplitText text="Hi" delay={60} />. */
export function toJsx(name: string, controls: Control[], values: Values): string {
  const attrs = controls
    .filter((c) => c.prop !== 'children')
    .map((c) => attribute(c.prop, values[c.prop]));
  const hasChildren = controls.some((c) => c.prop === 'children');

  const inline = attrs.length <= 1 && attrs.join('').length <= 40;
  const open = inline
    ? `<${name}${attrs.length ? ` ${attrs[0]}` : ''}`
    : `<${name}\n${attrs.map((a) => `  ${a}`).join('\n')}\n`;

  if (!hasChildren) return `${open}${inline ? ' ' : ''}/>`;
  return `${open}>\n  ${childText(values.children)}\n</${name}>`;
}

/** A complete, ready-to-paste file that renders the customized component. */
export function toDemoFile(name: string, controls: Control[], values: Values): string {
  const jsx = toJsx(name, controls, values)
    .split('\n')
    .map((line) => `    ${line}`)
    .join('\n');
  return `import ${name} from './${name}';

export default function ${name}Demo() {
  return (
${jsx}
  );
}
`;
}
