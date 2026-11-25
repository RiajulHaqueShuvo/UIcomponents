import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { useBlocker } from 'react-router-dom';

/* ---------- Toasts ---------- */

type Toast = { id: number; kind: 'ok' | 'error'; text: string };
const ToastContext = createContext<(kind: Toast['kind'], text: string) => void>(() => undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const push = useCallback((kind: Toast['kind'], text: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'error' ? 6000 : 2800);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="ad-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`ad-toast ad-toast--${t.kind}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/* ---------- Unsaved changes guard ---------- */

/** Warns before leaving (in-app navigation or closing the tab) while there are unsaved changes. */
export function useUnsavedChanges(dirty: boolean) {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('You have unsaved changes. Leave without saving?')) blocker.proceed();
    else blocker.reset();
  }, [blocker]);

  useEffect(() => {
    if (!dirty) return;
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [dirty]);
}

/** Ctrl/Cmd+S runs the callback. */
export function useSaveShortcut(onSave: () => void) {
  const ref = useRef(onSave);
  ref.current = onSave;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        ref.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

/* ---------- Form bits ---------- */

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="ad-field">
      <span className="ad-field__label">{label}</span>
      {children}
      {hint && <span className="ad-field__hint">{hint}</span>}
    </label>
  );
}

/** Textarea for code: Tab inserts two spaces instead of leaving the field. */
export function CodeArea(props: ComponentProps<'textarea'> & { onValue: (v: string) => void }) {
  const { onValue, className = '', ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`ad-code ${className}`}
      spellCheck={false}
      autoCapitalize="off"
      autoComplete="off"
      onChange={(e) => onValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key !== 'Tab' || e.shiftKey) return;
        e.preventDefault();
        const el = e.currentTarget;
        const { selectionStart: s, selectionEnd: end, value } = el;
        const next = `${value.slice(0, s)}  ${value.slice(end)}`;
        onValue(next);
        requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
      }}
    />
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`ad-badge ad-badge--${status}`}>{status === 'published' ? 'Published' : 'Draft'}</span>;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="ad-empty">
      <strong>{title}</strong>
      {children}
    </div>
  );
}

/** Read a local file as text (for "upload code" buttons). */
export const readText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsText(file);
  });
