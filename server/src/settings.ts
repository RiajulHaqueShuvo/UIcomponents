import { DEFAULT_SETTINGS, type SiteSettings } from '../../src/data/siteDefaults.ts';
import { db } from './db.ts';
import { HttpError } from './http.ts';
import { CATEGORY_IDS } from './validate.ts';

export { DEFAULT_SETTINGS, type SiteSettings };

export function getSettings(): SiteSettings {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'site'").get() as { value: string } | undefined;
  if (!row) return DEFAULT_SETTINGS;
  const saved = JSON.parse(row.value) as Partial<SiteSettings>;
  // Merge so settings added in later versions get their defaults.
  return {
    siteName: saved.siteName ?? DEFAULT_SETTINGS.siteName,
    hero: { ...DEFAULT_SETTINGS.hero, ...saved.hero },
    pro: { ...DEFAULT_SETTINGS.pro, ...saved.pro },
    categories: { ...DEFAULT_SETTINGS.categories, ...saved.categories },
  };
}

const str = (v: unknown, field: string, max: number, allowEmpty = false): string => {
  if (typeof v !== 'string') throw new HttpError(400, `${field} must be text`);
  const s = v.trim();
  if (!allowEmpty && !s) throw new HttpError(400, `${field} is required`);
  if (s.length > max) throw new HttpError(400, `${field} is too long (max ${max})`);
  return s;
};

export function validateSettings(input: Record<string, unknown>): SiteSettings {
  const hero = (input.hero ?? {}) as Record<string, unknown>;
  const pro = (input.pro ?? {}) as Record<string, unknown>;
  const cats = (input.categories ?? {}) as Record<string, Record<string, unknown>>;

  const checkoutUrl = str(pro.checkoutUrl ?? '', 'Payment link', 500, true);
  if (checkoutUrl && !/^https:\/\//.test(checkoutUrl)) {
    throw new HttpError(400, 'Payment link must start with https://');
  }
  if (!Array.isArray(pro.features)) throw new HttpError(400, 'Pro features must be a list');

  return {
    siteName: str(input.siteName, 'Site name', 60),
    hero: {
      eyebrow: str(hero.eyebrow ?? '', 'Hero badge', 80, true),
      title: str(hero.title, 'Hero title', 120),
      accent: str(hero.accent ?? '', 'Hero accent', 120, true),
      lead: str(hero.lead, 'Hero text', 400),
    },
    pro: {
      name: str(pro.name, 'Pro name', 60),
      price: str(pro.price, 'Price', 30),
      period: str(pro.period ?? '', 'Period', 30, true),
      checkoutUrl,
      features: pro.features.slice(0, 12).map((f, i) => str(f, `Feature ${i + 1}`, 120)),
    },
    categories: Object.fromEntries(
      CATEGORY_IDS.map((id) => [
        id,
        {
          label: str(cats[id]?.label ?? DEFAULT_SETTINGS.categories[id].label, `${id} label`, 40),
          description: str(cats[id]?.description ?? '', `${id} description`, 160, true),
        },
      ])
    ),
  };
}

export function saveSettings(s: SiteSettings) {
  db.prepare(
    "INSERT INTO settings (key, value) VALUES ('site', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(JSON.stringify(s));
}
