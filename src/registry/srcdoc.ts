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

export function buildSrcdoc(html: string, css = '', js = ''): string {
  let doc = html;

  // Inline style.css where it is linked, otherwise add it to <head>.
  const style = `<style>\n${css}\n</style>`;
  if (LINK_CSS.test(doc)) doc = doc.replace(LINK_CSS, () => style);
  else if (css) doc = insertInHead(doc, style);

  // Inline script.js where it is referenced, otherwise add it before </body>.
  const script = `<script>\n${safeJs(js)}\n</script>`;
  if (SCRIPT_JS.test(doc)) doc = doc.replace(SCRIPT_JS, () => script);
  else if (js) doc = /<\/body>/i.test(doc) ? doc.replace(/<\/body>/i, () => `${script}\n</body>`) : `${doc}\n${script}`;

  return insertInHead(doc, BASE_STYLE, true);
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
