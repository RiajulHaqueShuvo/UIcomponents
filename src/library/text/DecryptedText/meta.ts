import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Decrypted Text',
  slug: 'decrypted-text',
  description: 'Random characters settle into the real text, left to right. Hover to run it again.',
  usage: `<DecryptedText text="ACCESS GRANTED" speed={30} />`,
  controls: [
    { prop: 'text', label: 'Text', type: 'text', default: 'Hover to decrypt' },
    { prop: 'speed', label: 'Frame speed', type: 'number', default: 35, min: 10, max: 150, step: 5, unit: 'ms' },
  ],
  props: [
    { name: 'text', type: 'string', default: "'Hover to decrypt'", description: 'The final text.' },
    { name: 'speed', type: 'number', default: '35', description: 'Milliseconds per scramble frame.' },
  ],
};
