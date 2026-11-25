import { cn } from "@/lib/utils";

interface LaurelBadgeProps {
  years?: string;
  label?: string;
  subtitle?: string;
  className?: string;
}

/**
 * Gold/amber laurel wreath badge showcasing total years of professional experience.
 */
export function LaurelBadge({
  years = "6+",
  label = "6+ Years of Experience",
  subtitle,
  className,
}: Readonly<LaurelBadgeProps>) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center text-amber-500 dark:text-amber-400">
        <svg viewBox="0 0 48 48" fill="none" className="h-full w-full" aria-hidden="true">
          <path
            d="M15 37C9.5 32.5 7 25.5 8.5 18.5C9.5 14 12 10.5 15 8.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M33 37C38.5 32.5 41 25.5 39.5 18.5C38.5 14 36 10.5 33 8.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M11 30L7 27M9.5 23L6 20M11.5 16L9 12.5M37 30L41 27M38.5 23L42 20M36.5 16L39 12.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M19 39.5C22 41 26 41 29 39.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute font-mono text-xs font-bold tabular-nums text-foreground">
          {years}
        </span>
      </div>

      <div className="text-left">
        <p className="text-sm font-semibold tracking-tight text-foreground">{label}</p>
        {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
    </div>
  );
}
