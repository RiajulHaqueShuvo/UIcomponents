import { useEffect, useMemo, useState } from 'react';
import { useSiteData } from '../data/context';
import type { SiteSettings } from '../data/siteDefaults';
import { adminApi } from './adminApi';
import { Field, useSaveShortcut, useToast, useUnsavedChanges } from './ui';

export default function SettingsPage() {
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState<SiteSettings | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const { categories, reload } = useSiteData();

  useEffect(() => {
    adminApi
      .settings()
      .then((s) => {
        setForm(s);
        setSaved(s);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
  useUnsavedChanges(dirty && !busy);

  const save = async () => {
    if (!form || busy) return;
    setBusy(true);
    try {
      const s = await adminApi.saveSettings({
        ...form,
        pro: { ...form.pro, features: form.pro.features.map((f) => f.trim()).filter(Boolean) },
      });
      setForm(s);
      setSaved(s);
      reload();
      toast('ok', 'Settings saved');
    } catch (e) {
      toast('error', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  useSaveShortcut(save);

  if (error) return <p className="ad-error">{error}</p>;
  if (!form) return <p className="muted">Loading…</p>;

  const hero = (k: keyof SiteSettings['hero'], v: string) => setForm({ ...form, hero: { ...form.hero, [k]: v } });
  const pro = <K extends keyof SiteSettings['pro']>(k: K, v: SiteSettings['pro'][K]) => setForm({ ...form, pro: { ...form.pro, [k]: v } });
  const cat = (id: string, k: 'label' | 'description', v: string) =>
    setForm({ ...form, categories: { ...form.categories, [id]: { ...form.categories[id], [k]: v } } });

  return (
    <div className="ad-page">
      <header className="ad-head">
        <div>
          <h1>Settings {dirty && <span className="ad-dirty">Unsaved changes</span>}</h1>
          <p className="muted">Text and options shown across the public site.</p>
        </div>
        <button className="ad-btn ad-btn--primary" onClick={save} disabled={busy || !dirty}>
          {busy ? 'Saving…' : 'Save'} <kbd>Ctrl S</kbd>
        </button>
      </header>

      <section className="ad-card ad-grid-form">
        <h2 className="ad-grid-form__title">General</h2>
        <Field label="Site name" hint="Shown in the header and browser tab">
          <input value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
        </Field>
      </section>

      <section className="ad-card ad-grid-form">
        <h2 className="ad-grid-form__title">Home page hero</h2>
        <Field label="Badge" hint="Leave empty to show the component count automatically">
          <input value={form.hero.eyebrow} onChange={(e) => hero('eyebrow', e.target.value)} />
        </Field>
        <Field label="Title (line 1)">
          <input value={form.hero.title} onChange={(e) => hero('title', e.target.value)} />
        </Field>
        <Field label="Title (line 2, gradient)">
          <input value={form.hero.accent} onChange={(e) => hero('accent', e.target.value)} />
        </Field>
        <Field label="Intro text">
          <textarea rows={3} value={form.hero.lead} onChange={(e) => hero('lead', e.target.value)} />
        </Field>
      </section>

      <section className="ad-card ad-grid-form">
        <h2 className="ad-grid-form__title">Pro plan</h2>
        <Field label="Plan name">
          <input value={form.pro.name} onChange={(e) => pro('name', e.target.value)} />
        </Field>
        <Field label="Price" hint="Any currency, e.g. $19 or ৳1,999">
          <input value={form.pro.price} onChange={(e) => pro('price', e.target.value)} />
        </Field>
        <Field label="Period" hint="e.g. one-time, /month">
          <input value={form.pro.period} onChange={(e) => pro('period', e.target.value)} />
        </Field>
        <Field label="Payment link" hint="https://… (Stripe, LemonSqueezy, SSLCommerz…). Empty = “coming soon”.">
          <input value={form.pro.checkoutUrl} onChange={(e) => pro('checkoutUrl', e.target.value)} placeholder="https://" />
        </Field>
        <Field label="Features (one per line)">
          <textarea rows={5} value={form.pro.features.join('\n')} onChange={(e) => pro('features', e.target.value.split('\n'))} />
        </Field>
      </section>

      <section className="ad-card ad-grid-form">
        <h2 className="ad-grid-form__title">Categories</h2>
        {categories.map((c) => (
          <div key={c.id} className="ad-cat">
            <code>{c.id}</code>
            <input value={form.categories[c.id]?.label ?? ''} onChange={(e) => cat(c.id, 'label', e.target.value)} aria-label={`${c.id} name`} />
            <input value={form.categories[c.id]?.description ?? ''} onChange={(e) => cat(c.id, 'description', e.target.value)} aria-label={`${c.id} description`} placeholder="Description" />
          </div>
        ))}
      </section>
    </div>
  );
}
