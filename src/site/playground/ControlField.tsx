import { useId, useState } from 'react';
import type { Control } from '../../registry/types';

interface ControlFieldProps {
  control: Control;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}

export default function ControlField({ control, value, onChange, disabled }: ControlFieldProps) {
  const id = useId();

  return (
    <div className={`field field--${control.type}`}>
      <label className="field__label" htmlFor={id}>
        {control.label}
        {control.type === 'number' && (
          <span className="field__value">
            {String(value)}
            {control.unit}
          </span>
        )}
      </label>
      <Input id={id} control={control} value={value} onChange={onChange} disabled={disabled} />
    </div>
  );
}

function Input({ id, control, value, onChange, disabled }: ControlFieldProps & { id: string }) {
  switch (control.type) {
    case 'text':
      return (
        <input id={id} className="field__input" type="text" value={value as string} disabled={disabled}
          onChange={(e) => onChange(e.target.value)} />
      );

    case 'number':
      return (
        <div className="field__row">
          <input id={id} className="field__range" type="range" min={control.min} max={control.max}
            step={control.step ?? 1} value={value as number} disabled={disabled}
            onChange={(e) => onChange(Number(e.target.value))} />
          <input className="field__input field__input--num" type="number" min={control.min} max={control.max}
            step={control.step ?? 1} value={value as number} disabled={disabled} aria-label={`${control.label} value`}
            onChange={(e) => e.target.value !== '' && onChange(Number(e.target.value))} />
        </div>
      );

    case 'color':
      return (
        <div className="field__row">
          <input id={id} className="field__color" type="color" value={value as string} disabled={disabled}
            onChange={(e) => onChange(e.target.value)} />
          <input className="field__input" type="text" value={value as string} disabled={disabled}
            aria-label={`${control.label} hex`} onChange={(e) => onChange(e.target.value)} />
        </div>
      );

    case 'boolean':
      return (
        <button id={id} role="switch" aria-checked={value as boolean} disabled={disabled}
          className={`field__switch ${value ? 'field__switch--on' : ''}`} onClick={() => onChange(!value)}>
          <span />
        </button>
      );

    case 'select':
      return (
        <select id={id} className="field__input" value={value as string} disabled={disabled}
          onChange={(e) => onChange(e.target.value)}>
          {control.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      );

    case 'colorList': {
      const list = value as string[];
      const min = control.min ?? 2;
      const max = control.max ?? 6;
      const set = (i: number, c: string) => onChange(list.map((x, j) => (j === i ? c : x)));
      return (
        <div className="field__swatches" id={id}>
          {list.map((c, i) => (
            <span key={i} className="field__swatch">
              <input type="color" value={c} disabled={disabled} aria-label={`Colour ${i + 1}`}
                onChange={(e) => set(i, e.target.value)} />
              {list.length > min && !disabled && (
                <button className="field__swatch-x" aria-label={`Remove colour ${i + 1}`}
                  onClick={() => onChange(list.filter((_, j) => j !== i))}>×</button>
              )}
            </span>
          ))}
          {list.length < max && !disabled && (
            <button className="field__swatch-add" aria-label="Add colour"
              onClick={() => onChange([...list, list[list.length - 1] ?? '#ffffff'])}>+</button>
          )}
        </div>
      );
    }

    case 'textList':
      return <TextListInput id={id} value={value as string[]} onChange={onChange} disabled={disabled} />;
  }
}

/** Comma-separated words. Keeps the raw text so typing "a, " doesn't jump. */
function TextListInput({ id, value, onChange, disabled }: {
  id: string; value: string[]; onChange: (v: unknown) => void; disabled?: boolean;
}) {
  const [raw, setRaw] = useState(value.join(', '));
  return (
    <>
      <input id={id} className="field__input" type="text" value={raw} disabled={disabled}
        onChange={(e) => {
          setRaw(e.target.value);
          const items = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
          if (items.length) onChange(items);
        }} />
      <small className="field__hint">Separate items with commas</small>
    </>
  );
}
