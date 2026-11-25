/*
 * Site settings shape + defaults. Shared by the website and the server
 * (server/src/settings.ts imports this file), so they can't disagree.
 */
export interface SiteSettings {
  siteName: string;
  hero: { eyebrow: string; title: string; accent: string; lead: string };
  pro: { name: string; price: string; period: string; checkoutUrl: string; features: string[] };
  categories: Record<string, { label: string; description: string }>;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'UIComponents',
  hero: {
    eyebrow: '',
    title: 'Animated UI pieces,',
    accent: 'ready to copy.',
    lead: 'Text effects, backgrounds, buttons, cards and widgets in React and plain HTML / CSS / JS. Every one has a live preview and its full source code, with no extra packages to install.',
  },
  pro: {
    name: 'UIComponents Pro',
    price: '$19',
    period: 'one-time',
    checkoutUrl: '',
    features: [
      'Customize every component with live controls',
      'Copy code generated from your settings',
      'All future Pro components and categories',
      'Lifetime updates',
    ],
  },
  categories: {
    text: { label: 'Text Animations', description: 'Headlines and words that move.' },
    animations: { label: 'Animations', description: 'Wrappers that add motion to anything.' },
    backgrounds: { label: 'Backgrounds', description: 'Animated full-section backdrops.' },
    buttons: { label: 'Buttons', description: 'Buttons with hover and click effects.' },
    cards: { label: 'Cards', description: 'Interactive and styled card layouts.' },
    ui: { label: 'UI Components', description: 'Everyday widgets with polished motion.' },
  },
};
