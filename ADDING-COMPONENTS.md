# Adding (uploading) components

> **Easiest: use the admin panel** (`/admin` → Components → New). Paste or upload your
> files there, preview live and publish, without touching the code. See [ADMIN.md](ADMIN.md).
> The rest of this guide is for adding *built-in* components to the code itself.

Each component is one folder. It can have a **React** version, an **HTML / CSS / JS**
version, or **both**. The site finds it on its own; there's no list to edit.

```
src/library/<category>/<ComponentName>/
├── meta.ts                 ← name, description (always needed)
├── ComponentName.tsx       ← React version (optional)
├── ComponentName.css       ← React styles (optional)
└── html/                   ← HTML / CSS / JS version (optional)
    ├── index.html
    ├── style.css
    └── script.js
```

Categories: `text`, `animations`, `backgrounds`, `buttons`, `cards`, `ui`.

## Fastest way: the scaffold command

```
cd uicomponents
npm run new -- cards NeonCard              # React + HTML
npm run new -- buttons PulseButton --html  # HTML / CSS / JS only
npm run new -- text WaveText --react       # React only
```

This creates the folder with working starter files. Paste your code over them and refresh.

## Uploading HTML / CSS / JS code

1. Put your files in `html/` with exactly these names: `index.html`, `style.css`, `script.js`
   (`style.css` and `script.js` are optional).
2. In `index.html`, link them the normal way:
   `<link rel="stylesheet" href="style.css" />` and `<script src="script.js"></script>`.
3. The preview runs your page inside a **sandboxed iframe**: your JavaScript runs, but it
   can't touch the main site. It also gets a dark, centred page by default; your CSS can
   override that.
4. Visitors see your three files exactly as you wrote them in the Code tab.

## Uploading React code

1. `ComponentName.tsx` with a **default export**. Give every prop a default, so
   `<ComponentName />` alone shows a good demo.
2. `ComponentName.css`, imported at the top of the .tsx (`import './ComponentName.css';`).
   Prefix class names with the component name (`.neon-card__title`) to avoid clashes.
3. Plain `.jsx` isn't picked up. Rename it to `.tsx` (adding types is optional; `npm run build` will
   point out anything it needs).

## meta.ts

```ts
import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Neon Card',
  slug: 'neon-card',                 // URL: /components/neon-card
  description: 'One sentence.',
  isNew: true,                       // optional "New" badge
  stage: 'fill',                     // optional: for full-size backgrounds
  // React only (all optional):
  usage: `<NeonCard color="#f0f" />`,
  props: [{ name: 'color', type: 'string', default: "'#f0f'", description: 'Glow colour.' }],
  controls: [{ prop: 'color', label: 'Glow', type: 'color', default: '#ff00ff' }], // Pro Customize
};
```

## Check before publishing

```
npm run build
```

If it passes, the component is ready.
