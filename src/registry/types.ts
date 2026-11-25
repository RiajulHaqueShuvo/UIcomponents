import type { ComponentType } from 'react';

export type CategoryId = 'text' | 'animations' | 'backgrounds' | 'buttons' | 'cards' | 'ui';

export interface Category {
  id: CategoryId;
  label: string;
  description: string;
}

export interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** One editable option in the (Pro) Customize playground. */
export type Control = { prop: string; label: string } & (
  | { type: 'text'; default: string }
  | { type: 'number'; default: number; min: number; max: number; step?: number; unit?: string }
  | { type: 'color'; default: string }
  | { type: 'boolean'; default: boolean }
  | { type: 'select'; default: string; options: string[] }
  | { type: 'colorList'; default: string[]; min?: number; max?: number }
  | { type: 'textList'; default: string[] }
);

/** What every library/<category>/<Name>/meta.ts exports as `meta`. */
export interface ComponentMeta {
  name: string;
  slug: string;
  description: string;
  /** React props table (React version only). */
  props?: PropDoc[];
  /** React copy-paste example shown under "Usage". */
  usage?: string;
  isNew?: boolean;
  /** 'fill' lets backgrounds take the whole preview box; default is centred. */
  stage?: 'center' | 'fill';
  /** Options shown in the Customize tab (React version). Defaults must match the component's own defaults. */
  controls?: Control[];
}

/** The languages a component can be written in. */
export type Language = 'react' | 'html';

export const LANGUAGE_LABELS: Record<Language, string> = {
  react: 'React',
  html: 'HTML / CSS / JS',
};

export interface SourceFile {
  filename: string;
  language: 'tsx' | 'css' | 'html' | 'js';
  code: string;
}

export interface Variant {
  language: Language;
  files: SourceFile[];
}

export interface RegistryEntry extends ComponentMeta {
  category: CategoryId;
  /** Folder name, also the React component name: "SplitText". */
  id: string;
  /** Present when the component has a React version. */
  Component?: ComponentType<Record<string, unknown>>;
  /** Present when the component has an HTML version: a ready-to-run page for the sandboxed preview. */
  srcdoc?: string;
  /** Uploaded React components: server-compiled preview page (runs in a sandboxed iframe). */
  previewUrl?: string;
  /** 'builtin' = files in src/library; 'server' = added in the admin panel. */
  source: 'builtin' | 'server';
  /** Available versions, React first. */
  variants: Variant[];
}
