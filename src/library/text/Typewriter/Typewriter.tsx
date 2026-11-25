import { useEffect, useState } from 'react';
import './Typewriter.css';

interface TypewriterProps {
  words?: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  /** How long a finished word stays, in ms. */
  pause?: number;
  prefix?: string;
}

const DEFAULT_WORDS = ['Design.', 'Animate.', 'Ship faster.'];

export default function Typewriter({
  words = DEFAULT_WORDS,
  typeSpeed = 90,
  deleteSpeed = 45,
  pause = 1400,
  prefix = 'We help you ',
}: TypewriterProps) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[index % words.length];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && text === word) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text === '') {
      timeout = setTimeout(() => {
        setDeleting(false);
        setIndex((i) => i + 1);
      }, typeSpeed);
    } else {
      timeout = setTimeout(
        () => setText(word.slice(0, text.length + (deleting ? -1 : 1))),
        deleting ? deleteSpeed : typeSpeed
      );
    }
    return () => clearTimeout(timeout);
  }, [text, deleting, index, words, typeSpeed, deleteSpeed, pause]);

  return (
    <p className="typewriter">
      {prefix}
      <span className="typewriter__word">{text}</span>
      <span className="typewriter__cursor" aria-hidden="true" />
    </p>
  );
}
