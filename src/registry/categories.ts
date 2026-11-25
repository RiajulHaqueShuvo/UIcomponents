import type { Category } from './types';

/** Order here is the order in the sidebar and on the home page. */
export const CATEGORIES: Category[] = [
  { id: 'text', label: 'Text Animations', description: 'Headlines and words that move.' },
  { id: 'animations', label: 'Animations', description: 'Wrappers that add motion to anything.' },
  { id: 'backgrounds', label: 'Backgrounds', description: 'Animated full-section backdrops.' },
  { id: 'buttons', label: 'Buttons', description: 'Buttons with hover and click effects.' },
  { id: 'cards', label: 'Cards', description: 'Interactive and styled card layouts.' },
  { id: 'galleries', label: 'Sliders & Galleries', description: 'Image sliders, carousels and photo galleries.' },
  { id: 'ui', label: 'UI Components', description: 'Everyday widgets with polished motion.' },
];
