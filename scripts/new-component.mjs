#!/usr/bin/env node
/*
 * Creates the folder and starter files for a new component.
 *
 *   npm run new -- <category> <ComponentName> [--react] [--html]
 *
 * Examples:
 *   npm run new -- cards NeonCard            (React + HTML versions)
 *   npm run new -- buttons PulseButton --html (HTML / CSS / JS only)
 *   npm run new -- text WaveText --react      (React only)
 *
 * Categories: text, animations, backgrounds, buttons, cards, ui
 * Then replace the starter code with your own and it appears on the site.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CATEGORIES = ['text', 'animations', 'backgrounds', 'buttons', 'cards', 'ui'];
const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'library');

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const [category, name] = args.filter((a) => !a.startsWith('--'));

const fail = (msg) => {
  console.error(`\n  ✗ ${msg}\n\n  Usage: npm run new -- <category> <ComponentName> [--react] [--html]\n`);
  process.exit(1);
};

if (!CATEGORIES.includes(category)) fail(`Category must be one of: ${CATEGORIES.join(', ')}`);
if (!/^[A-Z][A-Za-z0-9]*$/.test(name ?? '')) fail('ComponentName must be PascalCase, e.g. NeonCard');

const withReact = flags.has('--react') || !flags.has('--html');
const withHtml = flags.has('--html') || !flags.has('--react');

const dir = join(root, category, name);
if (existsSync(dir)) fail(`${category}/${name} already exists`);

const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const title = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

const files = {};

files['meta.ts'] = `import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: '${title}',
  slug: '${kebab}',
  description: 'TODO: one sentence about what it does.',
  isNew: true,${withReact ? `
  usage: \`<${name} text="Hello" />\`,
  props: [
    { name: 'text', type: 'string', default: "'${title}'", description: 'Text to show.' },
  ],
  controls: [
    { prop: 'text', label: 'Text', type: 'text', default: '${title}' },
  ],` : ''}
};
`;

if (withReact) {
  files[`${name}.tsx`] = `import './${name}.css';

interface ${name}Props {
  text?: string;
}

export default function ${name}({ text = '${title}' }: ${name}Props) {
  return <div className="${kebab}">{text}</div>;
}
`;
  files[`${name}.css`] = `.${kebab} {
  padding: 20px 28px;
  border-radius: 14px;
  background: #18181b;
  color: #fff;
  font-weight: 600;
}
`;
}

if (withHtml) {
  files['html/index.html'] = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="${kebab}">${title}</div>

    <script src="script.js"></script>
  </body>
</html>
`;
  files['html/style.css'] = `.${kebab} {
  padding: 20px 28px;
  border-radius: 14px;
  background: #18181b;
  color: #fff;
  font-weight: 600;
}
`;
  files['html/script.js'] = `// Delete this file if the component needs no JavaScript
// (and remove the <script> tag from index.html).
document.querySelectorAll('.${kebab}').forEach((el) => {
  el.addEventListener('click', () => el.classList.toggle('is-active'));
});
`;
}

for (const [rel, content] of Object.entries(files)) {
  const path = join(dir, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

console.log(`\n  ✓ Created src/library/${category}/${name}/`);
for (const rel of Object.keys(files)) console.log(`      ${rel}`);
console.log(`\n  Open http://localhost:5620/components/${kebab}\n`);
