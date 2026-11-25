interface ViewTransition {
  ready: Promise<void>;
  finished: Promise<void>;
  skipTransition?: () => void;
}

type DocumentWithViewTransition = Document & {
  startViewTransition?: (updateCallback: () => void | Promise<void>) => ViewTransition;
};

const TRANSITION_DURATION_MS = 740;
const RAPID_CLICK_COOLDOWN_MS = 650;
const SOLID_STOP_RATIO = 0.66;

let activeTransition: ViewTransition | null = null;
let lastTransitionAt = 0;

/**
 * Toggles theme with a soft feathered circular ripple originating from the trigger button.
 * Combines a `closest-side` radial mask with a matching circular `clipPath` so the feathered
 * edge stays strictly circular, while throttling rapid clicks and freeing animations on finish
 * so continuous toggling cannot exhaust GPU compositor memory.
 */
export function toggleThemeWithRipple(
  event: React.MouseEvent<HTMLElement>,
  currentTheme: string | undefined,
  setTheme: (theme: string) => void,
): void {
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  const doc = document as DocumentWithViewTransition;
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();

  if (activeTransition || now - lastTransitionAt < RAPID_CLICK_COOLDOWN_MS) {
    try {
      activeTransition?.skipTransition?.();
    } catch {
      // Ignore if already finished
    }
    activeTransition = null;
    lastTransitionAt = now;
    setTheme(nextTheme);
    return;
  }

  if (!doc.startViewTransition || prefersReduced) {
    lastTransitionAt = now;
    setTheme(nextTheme);
    return;
  }

  const rect = event.currentTarget.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;
  const maxRadius = Math.hypot(
    Math.max(originX, window.innerWidth - originX),
    Math.max(originY, window.innerHeight - originY),
  );

  // Solid mask stop sits at 66% of closest-side radius (d / 2), so d = (maxRadius * 2) / 0.66
  const startSize = 0;
  const endSize = Math.ceil((maxRadius * 2) / SOLID_STOP_RATIO);
  const easing = "cubic-bezier(0.22, 1, 0.36, 1)";

  const rootEl = document.documentElement;
  rootEl.style.setProperty("--theme-ripple-x", `${originX}px`);
  rootEl.style.setProperty("--theme-ripple-y", `${originY}px`);

  lastTransitionAt = now;

  let transition: ViewTransition;
  try {
    transition = doc.startViewTransition(() => {
      rootEl.classList.remove("light", "dark");
      rootEl.classList.add(nextTheme);
      rootEl.style.colorScheme = nextTheme;
      setTheme(nextTheme);
    });
  } catch {
    rootEl.style.removeProperty("--theme-ripple-x");
    rootEl.style.removeProperty("--theme-ripple-y");
    setTheme(nextTheme);
    return;
  }

  activeTransition = transition;
  const runningAnimations: Animation[] = [];

  const cleanup = () => {
    for (const anim of runningAnimations) {
      try {
        anim.cancel();
      } catch {
        // Ignore already-finished animations
      }
    }
    rootEl.style.removeProperty("--theme-ripple-x");
    rootEl.style.removeProperty("--theme-ripple-y");
    if (activeTransition === transition) {
      activeTransition = null;
    }
  };

  transition.finished.catch(() => {}).finally(cleanup);

  transition.ready
    .then(() => {
      if (activeTransition !== transition) return;

      const oldAnim = rootEl.animate(
        [{ opacity: 1 }, { opacity: 0.88 }],
        {
          duration: TRANSITION_DURATION_MS,
          easing,
          pseudoElement: "::view-transition-old(root)",
          fill: "both",
        },
      );

      const maskAnim = rootEl.animate(
        [
          {
            clipPath: `circle(${startSize / 2}px at ${originX}px ${originY}px)`,
            maskSize: `${startSize}px ${startSize}px`,
            maskPosition: `${originX - startSize / 2}px ${originY - startSize / 2}px`,
          },
          {
            clipPath: `circle(${endSize / 2}px at ${originX}px ${originY}px)`,
            maskSize: `${endSize}px ${endSize}px`,
            maskPosition: `${originX - endSize / 2}px ${originY - endSize / 2}px`,
          },
        ],
        {
          duration: TRANSITION_DURATION_MS,
          easing,
          pseudoElement: "::view-transition-new(root)",
          fill: "both",
        },
      );

      const fadeAnim = rootEl.animate(
        [
          { opacity: 0.15, offset: 0 },
          { opacity: 0.94, offset: 0.36 },
          { opacity: 1, offset: 1 },
        ],
        {
          duration: TRANSITION_DURATION_MS,
          easing,
          pseudoElement: "::view-transition-new(root)",
          fill: "both",
        },
      );

      runningAnimations.push(oldAnim, maskAnim, fadeAnim);
    })
    .catch(() => {
      // Ignore transition interruption errors when rapidly toggling
    });
}
