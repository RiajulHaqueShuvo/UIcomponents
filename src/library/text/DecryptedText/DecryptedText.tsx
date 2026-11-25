import { useCallback, useEffect, useRef, useState } from 'react';
import './DecryptedText.css';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';

interface DecryptedTextProps {
  text?: string;
  /** Milliseconds per scramble frame. */
  speed?: number;
}

export default function DecryptedText({ text = 'Hover to decrypt', speed = 35 }: DecryptedTextProps) {
  const [display, setDisplay] = useState(text);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);

  const run = useCallback(() => {
    let frame = 0;
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      frame += 1;
      const revealed = Math.floor(frame / 2);
      setDisplay(
        [...text]
          .map((ch, i) =>
            ch === ' ' || i < revealed ? ch : CHARS[Math.floor(Math.random() * CHARS.length)]
          )
          .join('')
      );
      if (revealed >= text.length) clearInterval(timer.current);
    }, speed);
  }, [text, speed]);

  useEffect(() => {
    run();
    return () => clearInterval(timer.current);
  }, [run]);

  return (
    <span className="decrypted-text" onMouseEnter={run} aria-label={text}>
      {display}
    </span>
  );
}
