import { useEffect, useState } from "react";

/**
 * Typewriter hook with same feel
 * @param texts -- texts to be typed
 * @param init  --  initial text to be typed
 * @param duration --  duration of each character
 * @param delay -- delay before next text
 * @returns --  typed text
 */
export function useTypewriter<T extends readonly [string, ...string[]]>(
  texts: T,
  init?: T[number],
  duration = 120,
  delay = 50
) {
  const [text, setText] = useState(init ?? texts[0]);

  useEffect(() => {
    let index = 0;
    let charIndex = 0;

    const roleIntervalId = setInterval(() => {
      const text = texts[index % texts.length];

      if (charIndex < text.length) {
        setText(text.slice(0, charIndex + 1));
      }

      if (++charIndex === text.length + delay) {
        charIndex = 0;
        index = ++index % texts.length;
      }
    }, duration);

    return () => clearInterval(roleIntervalId);
  }, [delay, duration, texts]);

  return text;
}
