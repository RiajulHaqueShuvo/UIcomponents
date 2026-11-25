/*
 * Turns an HTML version (index.html + style.css + script.js) into one
 * self-contained page for the preview <iframe srcdoc>.
 *
 * The files the user copies stay untouched; only the preview inlines them,
 * because relative links like href="style.css" can't load inside srcdoc.
 */

// Applied first, so the component's own CSS can override any of it.
// (Also used by the server for compiled React previews.)
export const BASE_STYLE = `<style>
  /* Must match the iframe's color-scheme, or the browser paints it white. */
  :root { color-scheme: dark; }
  html, body { margin: 0; min-height: 100%; }
  body {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: transparent;
    color: #e4e4e7;
    font-family: Inter, system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
</style>`;

const LINK_CSS = /<link\b[^>]*href=["'](?:\.\/)?style\.css["'][^>]*>/i;
const SCRIPT_JS = /<script\b[^>]*src=["'](?:\.\/)?script\.js["'][^>]*>\s*<\/script>/i;

// "</script>" inside inlined code would end the tag early.
const safeJs = (js: string) => js.replace(/<\/script/gi, '<\\/script');

// "assets/x.jpg", './assets/', `assets/${name}`, url(assets/x.png): anything that starts a path with assets/.
const ASSET_PATH = /(["'`(])(?:\.\/)?assets\//g;

// Full-size sections (stage 'fill') lay out like a normal page: a centring grid would
// shrink a section without its own width to 0 px. (place-items is reset too: newer browsers
// apply justify-items to normal block layout as well.)
const FILL_STYLE = `<style>body { display: block; place-items: normal; }</style>`;

export interface SrcdocOptions {
  /**
   * Where this component's assets/ folder is served (e.g. /showcase/pegline/). The preview
   * can't resolve relative paths (srcdoc has no folder of its own), so `assets/…` is pointed
   * there. The copied code keeps the plain relative paths.
   */
  assetBase?: string;
  /** Full-size section: normal page flow instead of a centred box. */
  fill?: boolean;
}

export function buildSrcdoc(html: string, css = '', js = '', { assetBase, fill }: SrcdocOptions = {}): string {
  let doc = html;

  // Inline style.css where it is linked, otherwise add it to <head>.
  const style = `<style>\n${css}\n</style>`;
  if (LINK_CSS.test(doc)) doc = doc.replace(LINK_CSS, () => style);
  else if (css) doc = insertInHead(doc, style);

  // Inline script.js where it is referenced, otherwise add it before </body>.
  const script = `<script>\n${safeJs(js)}\n</script>`;
  if (SCRIPT_JS.test(doc)) doc = doc.replace(SCRIPT_JS, () => script);
  else if (js) doc = /<\/body>/i.test(doc) ? doc.replace(/<\/body>/i, () => `${script}\n</body>`) : `${doc}\n${script}`;

  if (assetBase) doc = doc.replace(ASSET_PATH, (_m, quote: string) => `${quote}${assetBase}assets/`);

  // BASE_STYLE goes first; the fill rule right after it, still before the component's own CSS.
  return insertInHead(doc, fill ? `${BASE_STYLE}
${FILL_STYLE}` : BASE_STYLE, true);
}

function insertInHead(doc: string, tag: string, first = false): string {
  const head = /<head[^>]*>/i.exec(doc);
  if (head) {
    if (first) return doc.replace(head[0], () => `${head[0]}\n${tag}`);
    return /<\/head>/i.test(doc) ? doc.replace(/<\/head>/i, () => `${tag}\n</head>`) : doc.replace(head[0], () => `${head[0]}\n${tag}`);
  }
  // A body fragment (no <head>): put the tag at the top.
  return `${tag}\n${doc}`;
}
