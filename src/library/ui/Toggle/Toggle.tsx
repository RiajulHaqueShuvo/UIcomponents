import { useId, useState } from 'react';
import './Toggle.css';

interface ToggleProps {
  label?: string;
  /** Controlled value. Leave undefined to let the toggle manage itself. */
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export default function Toggle({
  label = 'Dark mode',
  checked,
  defaultChecked = true,
  onChange,
  disabled = false,
}: ToggleProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const isOn = checked ?? internal;
  const id = useId();

  const flip = () => {
    if (checked === undefined) setInternal(!isOn);
    onChange?.(!isOn);
  };

  return (
    <div className={`toggle ${disabled ? 'toggle--disabled' : ''}`}>
      <button
        id={id}
        role="switch"
        aria-checked={isOn}
        disabled={disabled}
        className={`toggle__track ${isOn ? 'toggle__track--on' : ''}`}
        onClick={flip}
      >
        <span className="toggle__thumb" />
      </button>
      {label && <label htmlFor={id} className="toggle__label">{label}</label>}
    </div>
  );
}
