import type { ComponentMeta } from '../../../registry/types';

export const meta: ComponentMeta = {
  name: 'Toggle',
  slug: 'toggle',
  description: 'An accessible on/off switch with a springy thumb. Works controlled or uncontrolled.',
  usage: `const [notify, setNotify] = useState(false);

<Toggle label="Email notifications" checked={notify} onChange={setNotify} />`,
  controls: [
    { prop: 'label', label: 'Label', type: 'text', default: 'Dark mode' },
    { prop: 'defaultChecked', label: 'On at start', type: 'boolean', default: true },
    { prop: 'disabled', label: 'Disabled', type: 'boolean', default: false },
  ],
  props: [
    { name: 'label', type: 'string', default: "'Dark mode'", description: 'Text next to the switch. Empty string hides it.' },
    { name: 'checked', type: 'boolean', default: 'undefined', description: 'Controlled value.' },
    { name: 'defaultChecked', type: 'boolean', default: 'true', description: 'Start value when uncontrolled.' },
    { name: 'onChange', type: '(checked: boolean) => void', default: '-', description: 'Called with the new value.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the switch.' },
  ],
};
