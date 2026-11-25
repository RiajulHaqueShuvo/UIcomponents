import { useEffect, useState } from 'react';
import { normalizeHex } from './color';
import {
  MAX_SWATCHES,
  MIN_SWATCHES,
  balance,
  newId,
  randomPalette,
  roleOf,
  totalPercent,
  type Palette,
  type Swatch,
} from './model';
import { PRESETS } from './presets';

interface PaletteEditorProps {
  palette: Palette;
  autoText: string;
  onChange: (p: Palette) => void;
}

export default function PaletteEditor({ palette, autoText, onChange }: PaletteEditorProps) {
  const { swatches } = palette;
  const total = totalPercent(swatches);

  const update = (id: string, patch: Partial<Swatch>) =>
    onChange({ ...palette, swatches: swatches.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  const remove = (id: string) =>
    onChange({ ...palette, swatches: swatches.filter((s) => s.id !== id) });

  const add = () =>
    onChange({
      ...palette,
      swatches: [...swatches, { id: newId(), hex: '#f472b6', percent: 5 }],
    });

  return (
    <div className="pal-editor">
      <section>
        <h3 className="pal-h3">Presets</h3>
        <div className="pal-presets">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              className="pal-preset"
              onClick={() =>
                onChange({
                  swatches: p.colors.map(([hex, percent]) => ({ id: newId(), hex, percent })),
                  text: null,
                })
              }
            >
              <span className="pal-preset__bar" aria-hidden="true">
                {p.colors.map(([hex, pct]) => (
                  <i key={hex} style={{ background: hex, flexGrow: pct }} />
                ))}
              </span>
              {p.name}
            </button>
          ))}
          <button className="pal-preset pal-preset--shuffle" onClick={() => onChange(randomPalette())}>
            🎲 Random
          </button>
        </div>
      </section>

      <section>
        <h3 className="pal-h3">
          Colours & share
          <span className={`pal-total ${total === 100 ? 'pal-total--ok' : ''}`}>{total}%</span>
        </h3>
        <ul className="pal-swatches">
          {swatches.map((s) => (
            <li key={s.id} className="pal-swatch">
              <div className="pal-swatch__top">
                <input
                  type="color"
                  className="pal-swatch__picker"
                  value={s.hex}
                  onChange={(e) => update(s.id, { hex: e.target.value })}
                  aria-label="Pick colour"
                />
                <HexInput value={s.hex} onCommit={(hex) => update(s.id, { hex })} />
                <span className="pal-role">{roleOf(swatches, s.id)}</span>
                {swatches.length > MIN_SWATCHES && (
                  <button className="pal-swatch__remove" onClick={() => remove(s.id)} aria-label={`Remove ${s.hex}`}>
                    ×
                  </button>
                )}
              </div>
              <div className="pal-swatch__share">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={s.percent}
                  style={{ accentColor: s.hex }}
                  onChange={(e) => update(s.id, { percent: Number(e.target.value) })}
                  aria-label={`Share of ${s.hex}`}
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="pal-swatch__pct"
                  value={s.percent}
                  onChange={(e) =>
                    e.target.value !== '' &&
                    update(s.id, { percent: Math.min(100, Math.max(0, Math.round(Number(e.target.value)))) })
                  }
                  aria-label={`Percent of ${s.hex}`}
                />
                <span className="pal-swatch__unit">%</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="pal-actions">
          <button className="pal-btn" onClick={add} disabled={swatches.length >= MAX_SWATCHES}>
            + Add colour
          </button>
          <button
            className="pal-btn pal-btn--primary"
            onClick={() => onChange({ ...palette, swatches: balance(swatches) })}
            disabled={total === 100}
          >
            Balance to 100%
          </button>
        </div>
        <p className="pal-hint">
          The biggest share becomes the background, then surface, primary (buttons) and accent.
        </p>
      </section>

      <section>
        <h3 className="pal-h3">Text colour</h3>
        <div className="pal-text">
          <label className="pal-check">
            <input
              type="checkbox"
              checked={palette.text === null}
              onChange={(e) => onChange({ ...palette, text: e.target.checked ? null : autoText })}
            />
            Pick automatically (most readable)
          </label>
          {palette.text !== null && (
            <div className="pal-swatch__top">
              <input
                type="color"
                className="pal-swatch__picker"
                value={palette.text}
                onChange={(e) => onChange({ ...palette, text: e.target.value })}
                aria-label="Text colour"
              />
              <HexInput value={palette.text} onCommit={(text) => onChange({ ...palette, text })} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/** Hex text box that only applies valid colours, so half-typed values don't break things. */
function HexInput({ value, onCommit }: { value: string; onCommit: (hex: string) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  return (
    <input
      className={`pal-hex ${normalizeHex(draft) ? '' : 'pal-hex--bad'}`}
      value={draft}
      spellCheck={false}
      aria-label="Hex code"
      onChange={(e) => {
        setDraft(e.target.value);
        const hex = normalizeHex(e.target.value);
        if (hex) onCommit(hex);
      }}
      onBlur={() => setDraft(value)}
    />
  );
}
