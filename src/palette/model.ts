import { contrast, hexToHsl, hslToHex, mix, normalizeHex, readableOn } from './color';

export interface Swatch {
  id: string;
  hex: string;
  /** Share of the design, 0-100. */
  percent: number;
}

export interface Palette {
  swatches: Swatch[];
  /** Text colour, or null to pick the most readable one automatically. */
  text: string | null;
}

export const MIN_SWATCHES = 2;
export const MAX_SWATCHES = 6;

let counter = 0;
export const newId = () => `s${Date.now().toString(36)}${(counter++).toString(36)}`;

export const ROLE_NAMES = ['Background', 'Surface', 'Primary', 'Accent', 'Highlight', 'Detail'];

/** Colours ordered by share: biggest first. Ties keep their list order. */
export const ranked = (swatches: Swatch[]) =>
  [...swatches].sort((a, b) => b.percent - a.percent);

export const roleOf = (swatches: Swatch[], id: string) =>
  ROLE_NAMES[ranked(swatches).findIndex((s) => s.id === id)] ?? 'Detail';

export const totalPercent = (swatches: Swatch[]) => swatches.reduce((n, s) => n + s.percent, 0);

/** Scale every share so they add up to exactly 100 (largest-remainder rounding). */
export function balance(swatches: Swatch[]): Swatch[] {
  const total = totalPercent(swatches);
  if (total === 0) {
    const even = Math.floor(100 / swatches.length);
    return swatches.map((s, i) => ({ ...s, percent: even + (i < 100 - even * swatches.length ? 1 : 0) }));
  }
  const exact = swatches.map((s) => (s.percent / total) * 100);
  const floors = exact.map(Math.floor);
  let rest = 100 - floors.reduce((a, b) => a + b, 0);
  const order = exact.map((v, i) => [v - floors[i], i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (rest-- <= 0) break;
    floors[i] += 1;
  }
  return swatches.map((s, i) => ({ ...s, percent: floors[i] }));
}

/** The colours each part of the demos uses, worked out from the shares. */
export interface Theme {
  bg: string;
  surface: string;
  primary: string;
  accent: string;
  text: string;
  textMuted: string;
  onSurface: string;
  onPrimary: string;
  onAccent: string;
  border: string;
}

export function themeOf({ swatches, text }: Palette): Theme {
  const r = ranked(swatches).map((s) => s.hex);
  const bg = r[0];
  const surface = r[1] ?? mix(bg, readableOn(bg), 0.08);
  const primary = r[2] ?? r[1] ?? readableOn(bg);
  const accent = r[3] ?? primary;
  // Body text should be calm: only near-neutral palette colours (low saturation)
  // compete with white / near-black. A bright accent never becomes paragraph text.
  const neutrals = swatches.map((s) => s.hex).filter((h) => hexToHsl(h)[1] < 25);
  const mainText = text ?? readableOn(bg, neutrals);
  const forText = text ? [text, ...neutrals] : neutrals;
  return {
    bg,
    surface,
    primary,
    accent,
    text: mainText,
    textMuted: mix(mainText, bg, 0.35),
    onSurface: readableOn(surface, forText),
    onPrimary: readableOn(primary, forText),
    onAccent: readableOn(accent, forText),
    border: mix(mainText, bg, 0.85),
  };
}

/* ---------- Share links: /palette?c=0b0b12-60_1e1b4b-30_a78bfa-10&t=ffffff ---------- */
// "_" between colours: unlike "," it isn't %-encoded, so links stay readable.

export function encodePalette({ swatches, text }: Palette): URLSearchParams {
  const p = new URLSearchParams();
  p.set('c', swatches.map((s) => `${s.hex.slice(1)}-${s.percent}`).join('_'));
  if (text) p.set('t', text.slice(1));
  return p;
}

export function decodePalette(params: URLSearchParams): Palette | null {
  const raw = params.get('c');
  if (!raw) return null;
  const swatches: Swatch[] = [];
  for (const part of raw.split(/[_,]/).slice(0, MAX_SWATCHES)) {
    const [h, pct] = part.split('-');
    const hex = normalizeHex(h ?? '');
    const percent = Math.round(Number(pct));
    if (!hex || !Number.isFinite(percent)) return null;
    swatches.push({ id: newId(), hex, percent: Math.min(100, Math.max(0, percent)) });
  }
  if (swatches.length < MIN_SWATCHES) return null;
  const t = params.get('t');
  return { swatches, text: t ? normalizeHex(t) : null };
}

/* ---------- Random harmonious palette ---------- */

export function randomPalette(): Palette {
  const hue = Math.random() * 360;
  const dark = Math.random() < 0.5;
  const accentHue = (hue + (Math.random() < 0.5 ? 150 : 30) + Math.random() * 40) % 360;
  const colors = dark
    ? [hslToHex(hue, 25, 7), hslToHex(hue, 30, 16), hslToHex(hue, 75, 62), hslToHex(accentHue, 85, 60)]
    : [hslToHex(hue, 40, 97), hslToHex(hue, 35, 88), hslToHex(hue, 70, 42), hslToHex(accentHue, 85, 52)];
  const shares = [60, 25, 10, 5];
  return { swatches: colors.map((hex, i) => ({ id: newId(), hex, percent: shares[i] })), text: null };
}

/* ---------- "How will it look?" ---------- */

export type Level = 'good' | 'warn' | 'bad';

export interface Insight {
  level: Level;
  title: string;
  detail: string;
}

const ratio = (n: number) => `${n.toFixed(1)}:1`;

function contrastInsight(label: string, fg: string, bg: string): Insight {
  const c = contrast(fg, bg);
  if (c >= 4.5) return { level: 'good', title: `${label}: easy to read`, detail: `Contrast ${ratio(c)} passes WCAG AA (4.5:1).` };
  if (c >= 3) return { level: 'warn', title: `${label}: OK for big text only`, detail: `Contrast ${ratio(c)}. Fine for headings, too weak for small text.` };
  return { level: 'bad', title: `${label}: hard to read`, detail: `Contrast ${ratio(c)}. Pick a darker or lighter colour.` };
}

export function insightsOf(palette: Palette, theme: Theme): Insight[] {
  const out: Insight[] = [];
  const shares = ranked(palette.swatches).map((s) => s.percent);
  const total = totalPercent(palette.swatches);

  if (total !== 100) {
    out.push({ level: 'warn', title: `Shares add up to ${total}%`, detail: 'Press "Balance to 100%" so the numbers match the design.' });
  }

  // 60-30-10: one colour leads, one supports, one pops.
  const [a = 0, b = 0, c = 0] = shares;
  if (a >= 50 && a <= 75 && b >= 15 && b <= 40 && (palette.swatches.length < 3 || (c >= 4 && c <= 20))) {
    out.push({ level: 'good', title: 'Balanced proportions', detail: `${a} / ${b}${palette.swatches.length > 2 ? ` / ${c}` : ''} is close to the classic 60 / 30 / 10 rule.` });
  } else if (a < 40) {
    out.push({ level: 'warn', title: 'No clear main colour', detail: `The biggest colour is only ${a}%. Designs feel calmer when one colour takes 50-70%.` });
  } else if (a > 85) {
    out.push({ level: 'warn', title: 'Very one-colour', detail: `${a}% for one colour can look flat. Give the others more room.` });
  } else {
    out.push({ level: 'warn', title: 'Proportions are off the usual rule', detail: `Try about 60% main, 30% support, 10% accent (now ${shares.join(' / ')}).` });
  }

  if (palette.swatches.length >= 3 && c > 25) {
    out.push({ level: 'warn', title: 'Accent may shout', detail: `The 3rd colour has ${c}%. Accents work best at 5-15% so buttons stand out.` });
  }
  if (palette.swatches.length > 5) {
    out.push({ level: 'warn', title: 'Many colours', detail: 'More than 5 colours can look busy. Most brands use 3-4.' });
  }

  out.push(contrastInsight('Text on background', theme.text, theme.bg));
  out.push(contrastInsight('Text on surface', theme.onSurface, theme.surface));
  out.push(contrastInsight('Button text', theme.onPrimary, theme.primary));

  const pc = contrast(theme.primary, theme.bg);
  out.push(
    pc >= 3
      ? { level: 'good', title: 'Buttons stand out', detail: `Primary vs background ${ratio(pc)}.` }
      : { level: 'warn', title: 'Buttons blend in', detail: `Primary vs background only ${ratio(pc)}. Make the primary colour stronger.` }
  );
  return out;
}

/** A one-line description of the overall feel. */
export function moodOf(theme: Theme): string {
  const [, bgSat, bgLight] = hexToHsl(theme.bg);
  const [pHue, pSat] = hexToHsl(theme.primary);
  const tone = bgLight < 22 ? 'Dark & premium' : bgLight > 85 ? 'Light & clean' : bgSat > 55 ? 'Bold & colourful' : 'Soft & balanced';
  const warm = pSat > 15 && (pHue < 70 || pHue > 300);
  const feel = pSat < 15 ? 'neutral, minimal' : warm ? 'warm, energetic, friendly' : 'cool, calm, trustworthy';
  return `${tone}, ${feel}`;
}
