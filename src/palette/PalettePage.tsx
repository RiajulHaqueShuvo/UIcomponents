import { BASE } from '../app/env';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ExportPanel from './ExportPanel';
import Insights from './Insights';
import PaletteEditor from './PaletteEditor';
import { BannerDemo, Mosaic, ShareBar, WebsiteDemo, type DemoText } from './demos';
import { decodePalette, encodePalette, insightsOf, moodOf, newId, themeOf, type Palette } from './model';
import { PRESETS } from './presets';
import { useSeo } from '../site/useSeo';
import './palette.css';

type View = 'banner' | 'website' | 'shares';

const VIEW_LABELS: Record<View, string> = {
  banner: 'Banner',
  website: 'Website',
  shares: 'Proportions',
};

const fromPreset = (i: number): Palette => ({
  swatches: PRESETS[i].colors.map(([hex, percent]) => ({ id: newId(), hex, percent })),
  text: null,
});

export default function PalettePage() {
  const [params, setParams] = useSearchParams();
  // Start from a shared link if there is one, otherwise from the first preset.
  const [palette, setPalette] = useState<Palette>(() => decodePalette(params) ?? fromPreset(0));
  const [view, setView] = useState<View>('banner');
  const [text, setText] = useState<DemoText>({ brand: 'Your Brand', headline: 'Summer Sale — up to 40% off' });

  // The canonical link drops ?c=… so every palette variation counts as one page.
  useSeo({
    title: 'Color Palette Studio',
    description:
      'Pick colours, set how much each one is used (60-30-10), and preview them on a banner and a website, with contrast checks and CSS/Tailwind export.',
    path: '/palette',
  });

  // Keep the URL in sync so the current palette can be shared or bookmarked.
  const encoded = encodePalette(palette).toString();
  useEffect(() => {
    if (params.toString() !== encoded) setParams(new URLSearchParams(encoded), { replace: true });
  }, [encoded, params, setParams]);

  const theme = useMemo(() => themeOf(palette), [palette]);
  const autoText = useMemo(() => themeOf({ ...palette, text: null }).text, [palette]);
  const insights = useMemo(() => insightsOf(palette, theme), [palette, theme]);
  const shareUrl = `${window.location.origin}${BASE}/palette?${encoded}`;

  return (
    <div className="pal">
      <header className="pal__intro">
        <p className="page__crumb">Tools</p>
        <h1 className="page__title">Color Palette Studio</h1>
        <p className="page__lead">
          Choose your colours and how much of the design each one gets. See it straight away on a
          banner and a website, with readability checks and code to copy.
        </p>
      </header>

      <div className="pal__grid">
        <aside className="pal__side">
          <PaletteEditor palette={palette} autoText={autoText} onChange={setPalette} />
        </aside>

        <div className="pal__main">
          <ShareBar swatches={palette.swatches} />

          <div className="pal__toolbar">
            <div className="tabs" role="tablist">
              {(['banner', 'website', 'shares'] as const).map((v) => (
                <button
                  key={v}
                  role="tab"
                  aria-selected={view === v}
                  className={`tabs__btn ${view === v ? 'tabs__btn--active' : ''}`}
                  onClick={() => setView(v)}
                >
                  {VIEW_LABELS[v]}
                </button>
              ))}
            </div>
            {view !== 'shares' && (
              <div className="pal__texts">
                <input
                  value={text.brand}
                  onChange={(e) => setText((t) => ({ ...t, brand: e.target.value }))}
                  aria-label="Brand name"
                  placeholder="Brand name"
                />
                <input
                  value={text.headline}
                  onChange={(e) => setText((t) => ({ ...t, headline: e.target.value }))}
                  aria-label="Headline"
                  placeholder="Headline"
                />
              </div>
            )}
          </div>

          <div className="pal__demo">
            {view === 'banner' && <BannerDemo theme={theme} text={text} />}
            {view === 'website' && <WebsiteDemo theme={theme} text={text} />}
            {view === 'shares' && <Mosaic swatches={palette.swatches} />}
          </div>

          <Insights insights={insights} mood={moodOf(theme)} />
          <ExportPanel palette={palette} theme={theme} shareUrl={shareUrl} />
        </div>
      </div>
    </div>
  );
}
