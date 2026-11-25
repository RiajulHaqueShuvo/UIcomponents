import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Typewriter',
  slug: 'typewriter',
  description: 'Types a word, pauses, deletes it and moves to the next one, with a blinking cursor.',
  usage: `const WORDS = ['faster.', 'cleaner.', 'with style.'];

<Typewriter prefix="Build " words={WORDS} />`,
  controls: [
    { prop: 'prefix', label: 'Fixed text', type: 'text', default: 'We help you ' },
    { prop: 'words', label: 'Words', type: 'textList', default: ['Design.', 'Animate.', 'Ship faster.'] },
    { prop: 'typeSpeed', label: 'Typing speed', type: 'number', default: 90, min: 20, max: 300, step: 5, unit: 'ms' },
    { prop: 'deleteSpeed', label: 'Delete speed', type: 'number', default: 45, min: 10, max: 200, step: 5, unit: 'ms' },
    { prop: 'pause', label: 'Pause', type: 'number', default: 1400, min: 200, max: 5000, step: 100, unit: 'ms' },
  ],
  props: [
    { name: 'words', type: 'string[]', default: "['Design.', 'Animate.', 'Ship faster.']", description: 'Words to cycle through. Keep the array stable (define it outside the component).' },
    { name: 'prefix', type: 'string', default: "'We help you '", description: 'Fixed text before the typed word.' },
    { name: 'typeSpeed', type: 'number', default: '90', description: 'Milliseconds per typed letter.' },
    { name: 'deleteSpeed', type: 'number', default: '45', description: 'Milliseconds per deleted letter.' },
    { name: 'pause', type: 'number', default: '1400', description: 'How long a full word stays, in ms.' },
  ],
};
