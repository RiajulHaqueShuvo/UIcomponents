import { useId, useState } from 'react';
import './Accordion.css';

interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionProps {
  items?: AccordionItem[];
  /** Allow more than one panel open at once. */
  multiple?: boolean;
  defaultOpen?: number[];
}

const DEFAULT_ITEMS: AccordionItem[] = [
  { title: 'Do I need to install anything?', content: 'No. Each component is a single React file plus a CSS file. Copy them into your project and import.' },
  { title: 'Can I use it in a commercial project?', content: 'Yes. Use the components in personal and client work.' },
  { title: 'Does it work without TypeScript?', content: 'Yes. Remove the type annotations and rename the file to .jsx.' },
];

export default function Accordion({ items = DEFAULT_ITEMS, multiple = false, defaultOpen = [0] }: AccordionProps) {
  const [open, setOpen] = useState<number[]>(defaultOpen);
  const baseId = useId();

  const toggle = (i: number) => {
    setOpen((cur) =>
      cur.includes(i) ? cur.filter((x) => x !== i) : multiple ? [...cur, i] : [i]
    );
  };

  return (
    <div className="accordion">
      {items.map((item, i) => {
        const isOpen = open.includes(i);
        const panelId = `${baseId}-panel-${i}`;
        return (
          <div key={item.title} className={`accordion__item ${isOpen ? 'accordion__item--open' : ''}`}>
            <h3 className="accordion__heading">
              <button
                className="accordion__trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
              >
                {item.title}
                <span className="accordion__icon" aria-hidden="true" />
              </button>
            </h3>
            <div id={panelId} className="accordion__panel" role="region">
              <div className="accordion__panel-inner">
                <p>{item.content}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
